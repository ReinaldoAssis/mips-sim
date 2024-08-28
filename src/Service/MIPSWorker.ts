import SharedData, { Instruction, IProcessor } from "./SharedData"
import MonoMIPS from "../Hardware/Mono Mips/MonoMIPS";
import Logger from "./Logger";
import SISMIPS from "../Hardware/SIS Mips/SIS";
import { addr, INPUT_BUFFER_ADDR } from "../Hardware/TemplatePorcessor";
// import BinaryNumber from "../Hardware/BinaryNumber";

/*
    IMPORTANT: this is a worker, so the shared data is not the same as the main thread
    the shared data here is used only to store the current worker cpu
*/

const share = SharedData.instance;

export type WorkCpuMessage = {
    command: string,
    value: string,
    ibuffer? : number,
    instructions: Array<Instruction>,
    processorref: string,
    processorFrequency: number,
    useDebug: boolean,
    program: Array<Instruction>,
    startMem : Array<addr>
}



let cpu: IProcessor = new MonoMIPS();
self.onmessage = function (e: MessageEvent<WorkCpuMessage>) {

    // console.log(`RECEBEU O COMANDO ${e.data.command}`)
    
    const setup = () => {
        // console.log(`Worker processor: ${share.currentProcessor?.refname}`)
        cpu = e.data.processorref == "mono" ? new MonoMIPS() : new SISMIPS();
        cpu.frequency = e.data.processorFrequency;
        share.processorFrequency = e.data.processorFrequency;
        share.startMemory = e.data.startMem;
        cpu.useDebug = e.data.useDebug;
        
        // When passing objects to the worker, any functions are lost, so we need to re-define them
        // e.data.program.forEach(x => {
        //     Object.setPrototypeOf(x.machineCode, BinaryNumber.prototype);
        //     Object.setPrototypeOf(x.memAddress, BinaryNumber.prototype);
        // })

        console.log(`SETUP !`)
        console.log(e.data.startMem)

        share.program = e.data.program;

        cpu.workerPostMessage = (channel:string, message: any) => {
            self.postMessage({command: channel, value: message});
        }

        share.currentProcessor = cpu;
    }

    if (e.data.command == "run"){
        setup();
        cpu.reset();
        if(e.data.startMem)
            e.data.startMem.forEach(x => cpu.memory.push(x))
        cpu.loadProgram(e.data.instructions);
        share.debugInstructions = e.data.useDebug;
        cpu.execute();
    }
    else if (e.data.command == "step"){
        if (share.currentProcessor) cpu = share.currentProcessor;
        if (cpu.halted == true){
            setup();
            cpu.reset();
            if(e.data.startMem)
                e.data.startMem.forEach(x => cpu.memory.push(x))
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
        // console.log("RECEBEU O COMANDO DE RESET")
        if (share.currentProcessor) cpu = share.currentProcessor;
        cpu.reset();
        share.currentProcessor = cpu;
        cpu.frequency = 1000;
    
    }

    if (e.data.command == "halt check answer" && e.data.value == "continue"){
        
        if (e.data.ibuffer)
        {
            const i = cpu.memory.findIndex(x => x.address == INPUT_BUFFER_ADDR);

            if (i == -1) cpu.memory.push({address: INPUT_BUFFER_ADDR, value: e.data.ibuffer});
            else cpu.memory[i] = {address: INPUT_BUFFER_ADDR, value: e.data.ibuffer};

            
            // console.log(`wrote ibuffer (index ${i}) ${cpu.memory[i].value} and recieved ${e.data.ibuffer}`);
        }

        cpu.halted = false;
        cpu.execute();
    }

    // Receives the command to tell the current state of memory and regs
    if (e.data.command == "mem terminal"){
        self.postMessage({command:"mem terminal data", value: [cpu.memory, cpu.regbank]})
    }

    // if (e.data.command == "mem terminal set data")
    // {
    //  ...
    // }

}


export {}