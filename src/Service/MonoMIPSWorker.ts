import SharedData from "./SharedData"
import MonoMIPS from "../Hardware/Mono Mips/MonoMIPS";
import Logger from "./Logger";


const share = SharedData.instance;

export type WorkCpuMessage = {
    command: string,
    instructions: Array<string>,
}



self.onmessage = function (e: MessageEvent<WorkCpuMessage>) {
    
    if (e.data.command == "run"){
        let cpu = share.currentProcessor ?? new MonoMIPS();

        cpu.workerPostMessage = (channel:string, message: any) => {
            self.postMessage({command: channel, value: message});
        }
        
        cpu.reset();
        cpu.loadProgram(e.data.instructions);
        share.debugInstructions = true;
        cpu.execute();
        
    }
}


export {}