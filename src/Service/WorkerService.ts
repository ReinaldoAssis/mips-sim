import MonoMIPS from "../Hardware/Mono Mips/MonoMIPS";
import Logger from "./Logger";
import { WorkCpuMessage } from "./MIPSWorker";
import SharedData, { IProcessor } from "./SharedData";

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

    public runCode(instructions: Array<string>){
        if(this.cpuWorker == null) return;

        let processor = this.shared.currentProcessor ?? new MonoMIPS();
        
        this.cpuWorker.postMessage({
            command: "run",
            instructions: instructions,
            processorref: processor.refname,
            processorFrequency: processor.frequency,
            useDebug: processor.useDebug,
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
            if (e.data.command == "halted"){
              console.log(`Worker ended processing: ${e.data.value}`)
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