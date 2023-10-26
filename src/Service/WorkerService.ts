import { ScreenRenderer } from "../Components/pages/Simulator View/Editor Tab/Screen";
import BinaryNumber from "../Hardware/BinaryNumber";
import MonoMIPS from "../Hardware/Mono Mips/MonoMIPS";
import SISMIPS from "../Hardware/SIS Mips/SIS";
import Logger from "./Logger";
import { WorkCpuMessage } from "./MIPSWorker";
import SharedData, { Instruction, IProcessor } from "./SharedData";

export default class WorkerService {
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
  public handleCom() {
    if (this.cpuWorker == null) return;
    if (this.defined == false) {
      this.cpuWorker.onmessage = (e) => {

        // used to transmit console logs
        if (e.data.command == "console") {
          this.log.console(e.data.value.log, e.data.value.linebreak);
        }

        // used to transmit debug logs
        if (e.data.command == "debug") {
          this.log.debug(e.data.value.log);
        }

        // used to transmit errors, like invalid instructions
        if (e.data.command == "error") {
          let packet = e.data.value as { msg: string, instruction: string, cycle: number, pc: number };

          this.log.pushAppError(`Error: ${packet.msg} at ${packet.instruction} at cycle ${packet.cycle} pc ${packet.pc}`)
          console.log(`Error: ${packet.msg} at cycle ${packet.cycle} pc ${packet.pc}`)
        }

        // handles screen writes
        if (e.data.command == "screen") {
          let packet = e.data.value as Array<{ address: number, value: number }>;

          //packet.forEach(x => {
          //  Object.setPrototypeOf(x.address, BinaryNumber.prototype);
          //  Object.setPrototypeOf(x.value, BinaryNumber.prototype);

          //  ScreenRenderer.instance.drawPixel(x);
          //})

          for (let i = 0; i < packet.length; i++) {
            let v = BinaryNumber.parse(packet[i].value);
            let addr = BinaryNumber.parse(packet[i].address);
            ScreenRenderer.instance.drawPixel({ address: addr, value: v })
            // console.log(`pixel addr ${addr.value} value ${v.value}`);
          }




          // ScreenRenderer.instance.write(packet.address, packet.value);
          // ScreenRenderer.instance.drawPixel({address: packet.address, value: packet.value})
        }

        // As I've explained in the processor class, we need this check to avoid infinite loops since
        // the worker can't receive messages while executing
        if (e.data.command == "halt check") {
          if (this.shared.currentProcessor?.halted == false)
            this.cpuWorker?.postMessage({ command: "halt check answer", value: "continue" })
        }

        // TOOD: comment this
        if (e.data.command == "instruction") {
          let packet = e.data.value as Instruction;
          Object.setPrototypeOf(packet.machineCode, BinaryNumber.prototype);
          Object.setPrototypeOf(packet.memAddress, BinaryNumber.prototype);

          let lineIndex = packet.index + 1;
          this.shared.currentStepLine = lineIndex;
          console.log(`Instruction: ${packet.humanCode} pc ${packet.memAddress.toHex()}`)
        }

        // receives batch of console logs
        if (e.data.command == "batch console") {
          console.log(`Received from worker: ${e.data.value}`);
          (e.data.value as Array<{ log: string, linebreak: boolean }>).forEach(v => {
            this.log.console(v.log, v.linebreak);
          });
        }
      };
      this.defined = true;
    }
  }

  public runCode(instructions: Array<Instruction>) {
    if (this.cpuWorker == null) return;

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
  public stepCode() {
    if (this.cpuWorker == null) return;

    if (this.shared.currentProcessor == null) this.shared.currentProcessor = new MonoMIPS();
    if (this.shared.processorFrequency > 90 || this.shared.currentProcessor.frequency > 90) {
      this.shared.processorFrequency = 80;
      this.shared.currentProcessor.frequency = 80;
    }

    const stepMessage = (cpuworker: any) => {
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

    if (this.shared.currentProcessor.halted == false) {

      stepMessage(this.cpuWorker);

    }

    else {
      if (this.shared.currentProcessor.refname == "mono") this.shared.currentProcessor = new MonoMIPS();
      else if (this.shared.currentProcessor.refname == "sis") this.shared.currentProcessor = new SISMIPS();

      stepMessage(this.cpuWorker);

    }

    this.handleCom();


  }

  public terminate() {
    if (this.cpuWorker == null) return;
    this.cpuWorker.terminate();
  }

  public resetCpu() {
    if (this.cpuWorker == null) return;
    this.cpuWorker.postMessage({ command: "reset" })
  }
}
