import MonoMIPS from "../Hardware/Mono Mips/MonoMIPS";
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
}