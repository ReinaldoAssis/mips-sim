import { ScreenRenderer } from "../Components/pages/Simulator View/Editor Tab/Screen";
import BinaryNumber from "../Hardware/BinaryNumber";
import MonoMIPS from "../Hardware/Mono Mips/MonoMIPS";
import SISMIPS from "../Hardware/SIS Mips/SIS";
import Logger from "./Logger";
import { WorkCpuMessage } from "./MIPSWorker";
import SharedData, { Instruction, IProcessor } from "./SharedData";

export default class WorkerService{
    private static _instance: WorkerService;
    public cpuWorker: Worker | null = null;
    private log = Logger.instance;
    private defined = false;
    private shared = SharedData.instance;

    public static get instance(): WorkerService {
        if (!WorkerService._instance) {
            WorkerService._instance = new WorkerService();
        }

        return WorkerService._instance;
    }

    private constructor() {
        this.cpuWorker = new Worker(new URL('./MIPSWorker.ts', import.meta.url));
    }

    /*
    Function responsible for handling the communication
    */
    public handleCom(){
      if (this.cpuWorker == null) return;
      if (this.defined == false){
        this.cpuWorker.onmessage = (e) => {
          
          if (e.data.command == "console"){
            //console.log(`Received from worker: ${e.data.value.log}`)
            this.log.console(e.data.value.log, e.data.value.linebreak);
          }
          
          if (e.data.command == "debug"){
            this.log.debug(e.data.value.log);
          }
          
          if (e.data.command == "error"){
            let packet = e.data.value as {msg: string, instruction: string, cycle: number, pc: number};
            // this.log.error(packet.msg, packet.instruction, packet.cycle, packet.pc, -1, "Simulator")
            this.log.pushAppError(`Error: ${packet.msg} at ${packet.instruction} at cycle ${packet.cycle} pc ${packet.pc}`)
            console.log(`Error: ${packet.msg} at cycle ${packet.cycle} pc ${packet.pc}`)
          }

          if (e.data.command == "screen"){
            let packet = e.data.value as {address: BinaryNumber, value: BinaryNumber};
            Object.setPrototypeOf(packet.address, BinaryNumber.prototype);
            Object.setPrototypeOf(packet.value, BinaryNumber.prototype);

            ScreenRenderer.instance.write(packet.address, packet.value);
            console.log(`Wrote to screen at ${packet.address.toHex()} value ${packet.value.toHex()}`)
            ScreenRenderer.instance.drawScreen()
          }

          if (e.data.command == "instruction")
          {
            let packet = e.data.value as Instruction;
            Object.setPrototypeOf(packet.machineCode, BinaryNumber.prototype);
            Object.setPrototypeOf(packet.memAddress, BinaryNumber.prototype);
            
            let lineIndex = packet.index+1;
            this.shared.currentStepLine = lineIndex;
            console.log(`Instruction: ${packet.humanCode} pc ${packet.memAddress.toHex()}`)
          }

          if (e.data.command == "batch console"){
            console.log(`Received from worker: ${e.data.value}`);
            (e.data.value as Array<{log: string, linebreak: boolean}>).forEach(v => {
              this.log.console(v.log, v.linebreak);
            });
          }
        };
        this.defined = true;
      }
    }

    public runCode(instructions: Array<Instruction>){
        if(this.cpuWorker == null) return;

        let processor = this.shared.currentProcessor ?? new MonoMIPS();
        
        this.cpuWorker.postMessage({
            command: "run",
            instructions: instructions,
            processorref: processor.refname,
            processorFrequency: processor.frequency,
            useDebug: this.shared.debugInstructions,
            program: this.shared.program
          });
        
          this.handleCom();

    }

    // all it needs is to have a valid program in shared data
    public stepCode(){
      if(this.cpuWorker == null) return;
      
      if(this.shared.currentProcessor == null) this.shared.currentProcessor = new MonoMIPS();
      if(this.shared.processorFrequency > 90 || this.shared.currentProcessor.frequency > 90){
        this.shared.processorFrequency = 80;
        this.shared.currentProcessor.frequency = 80;
      }

      const stepMessage = (cpuworker:any) => {
        if (this.shared.currentProcessor == null) return;
        cpuworker.postMessage({
          command: "step",
          instructions: this.shared.program,
          processorref: this.shared.currentProcessor.refname,
          processorFrequency: 80,
          useDebug: this.shared.debugInstructions,
          program: this.shared.program
        });
      }
      
      if (this.shared.currentProcessor.halted == false)
      {

        stepMessage(this.cpuWorker);

      }
      
      else
      {
        if (this.shared.currentProcessor.refname == "mono") this.shared.currentProcessor = new MonoMIPS();
        else if (this.shared.currentProcessor.refname == "sis") this.shared.currentProcessor = new SISMIPS();

        stepMessage(this.cpuWorker);

      }
      
        this.handleCom();


    }

    public terminate(){
      if(this.cpuWorker == null) return;
      this.cpuWorker.terminate();
    }

    public resetCpu(){
      if(this.cpuWorker == null) return;
      this.cpuWorker.postMessage({command: "reset"})
    }
}