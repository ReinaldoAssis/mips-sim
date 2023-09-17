import Logger from "./Logger";

export default class WorkerService{
    private static _instance: WorkerService;
    public cpuWorker: Worker | null = null;
    private log = Logger.instance;
    private defined = false;

    public static get instance(): WorkerService {
        if (!WorkerService._instance) {
            WorkerService._instance = new WorkerService();
        }

        return WorkerService._instance;
    }

    private constructor() {
        this.cpuWorker = new Worker(new URL('./MonoMIPSWorker.ts', import.meta.url));
    }

    public runCode(instructions: Array<string>){
        if(this.cpuWorker == null) return;
        this.cpuWorker.postMessage({
            command: "run",
            instructions: instructions,
          });

        if (this.defined == false){
          this.cpuWorker.onmessage = (e) => {
            if (e.data.command == "console"){
              //console.log(`Received from worker: ${e.data.value.log}`)
              this.log.console(e.data.value.log, e.data.value.linebreak);
              console.log(`service recebeu resposta ${Date.now()}`)
            }
            if (e.data.command == "halted"){
              console.log(`Worker ended processing: ${e.data.value}`)
            }
            if (e.data.command == "batch console"){
              console.log(`Received from worker: ${e.data.value}`);
              (e.data.value as Array<{log: string, linebreak: boolean}>).forEach(v => {
                this.log.console(v.log, v.linebreak);
              });
              console.log(`service recebeu resposta ${Date.now()}`)
            }
          };
          this.defined = true;
        }
    }
}