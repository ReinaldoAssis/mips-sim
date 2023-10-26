import SharedData, { Instruction, IProcessor } from "./SharedData"
import MonoMIPS from "../Hardware/Mono Mips/MonoMIPS";
import Logger from "./Logger";
import SISMIPS from "../Hardware/SIS Mips/SIS";
import BinaryNumber from "../Hardware/BinaryNumber";

/*
    IMPORTANT: this is a worker, so the shared data is not the same as the main thread
    the shared data here is used only to store the current worker cpu
*/

const share = SharedData.instance;

export type WorkCpuMessage = {
    command: string,
    value: string,
    instructions: Array<Instruction>,
    processorref: string,
    processorFrequency: number,
    useDebug: boolean,
    program: Array<Instruction>
}



let cpu: IProcessor = new MonoMIPS();
self.onmessage = function (e: MessageEvent<WorkCpuMessage>) {

    // console.log(`RECEBEU O COMANDO ${e.data.command}`)
    
    const setup = () => {
        console.log(`Worker processor: ${share.currentProcessor?.refname}`)
        cpu = e.data.processorref == "mono" ? new MonoMIPS() : new SISMIPS();
        cpu.frequency = e.data.processorFrequency;
        share.processorFrequency = e.data.processorFrequency;
        cpu.useDebug = e.data.useDebug;
        
        // When passing objects to the worker, any functions are lost, so we need to re-define them
        e.data.program.forEach(x => {
            Object.setPrototypeOf(x.machineCode, BinaryNumber.prototype);
            Object.setPrototypeOf(x.memAddress, BinaryNumber.prototype);
        })

        share.program = e.data.program;

        cpu.workerPostMessage = (channel:string, message: any) => {
            self.postMessage({command: channel, value: message});
        }

        share.currentProcessor = cpu;
    }

    if (e.data.command == "run"){
        setup();
        cpu.reset();
        cpu.loadProgram(e.data.instructions);
        share.debugInstructions = e.data.useDebug;
        cpu.execute();
    }
    else if (e.data.command == "step"){
        if (share.currentProcessor) cpu = share.currentProcessor;
        if (cpu.halted == true){
            setup();
            cpu.reset();
            cpu.loadProgram(e.data.instructions);
            share.debugInstructions = e.data.useDebug;
            cpu.executeStep();
            share.currentProcessor = cpu;
        }
        else {
            cpu.executeStep();
            share.currentProcessor = cpu;
        }
    }

    if (e.data.command == "reset"){
        console.log("RECEBEU O COMANDO DE RESET")
        if (share.currentProcessor) cpu = share.currentProcessor;
        cpu.reset();
        share.currentProcessor = cpu;
    
    }

    if (e.data.command == "halt check answer" && e.data.value == "continue"){
        // console.log("RECEBEU O COMANDO DE CONTINUAR")
        cpu.halted = false;
        cpu.execute();
    }

}


export {}