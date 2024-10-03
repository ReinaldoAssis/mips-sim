import { warn } from "console";
import Logger, { ErrorType } from "../Service/Logger";
import SharedData, { Instruction, IProcessor } from "../Service/SharedData";

export const SCREEN_MEM_START = 2000;
export const SCREEN_MEM_END = 12000;
export const INPUT_BUFFER_ADDR = 255;

// the masks are counted from left to right
export const MASK_26_32 = 0b00000000000000000000000000111111;
export const MASK_21_26 = 0b00000000000000000000011111000000;
export const MASK_16_21 = 0b00000000000000001111100000000000;
export const MASK_11_16 = 0b00000000000111110000000000000000;
export const MASK_6_11 = 0b00000011111000000000000000000000;
export const MASK_0_6 = 0b11111100000000000000000000000000;

export const MASK_16_32 = 0b00000000000000001111111111111111;
export const MASK_6_32 = 0b00000011111111111111111111111111;

export const MASK_LOWER32BITS = 0b0000000000000000000000000000000011111111111111111111111111111111;
export const MASK_UPPER32BITS = 0b1111111111111111111111111111111100000000000000000000000000000000;

export const MASK_RS = 0b00000011111000000000000000000000;
export const MASK_RT = 0b00000000000111110000000000000000;
export const MASK_LOWHALFW = 0b00000000000000001111111111111111;

export type addr = {
  address: number;
  value: number; //value of the address in binary
};

export default class TemplateProcessor implements IProcessor {
  public share: SharedData = SharedData.instance;
  public log: Logger = Logger.instance;
  public refname: string = "template";
  public halted = true;

  public frequency: number = 100; //frequency
  public memory: Array<addr> = new Array<addr>(); //memory
  public pc: number = 0; //program counter
  public cycle: number = 0; //number of cycles executed
  public regbank: Array<number> = []; //register bank
  public program: Instruction[] = []; //program
  public initializedRegs: Array<boolean> = []; //initialized registers

  public currentInstruction: Instruction = { humanCode: "", machineCode: 0, memAddress: 0, index: -1 }; //current instruction being executed
  public useDebug: boolean = true; //if true, the processor will generate a debug log

  public workerPostMessage: ((channel: string, message: any) => void) = (channel: string, message: any) => { };
  private stdoutBatch: Array<string> = []; // batch that stores the stdout messages
  private debugBatch: Array<string> = []; // batch that stores the debug messages
  private screenWriteBatch: Array<{ address: number, value: number }> = []; // batch that stores the screen write messages

  public instructionSet: Array<string> = [
    "add",
    "addi",
    "sub",
    "mult",
    "div",
    "mfhi",
    "mflo",
    "and",
    "or",
    "slt",
    "slti",
    "lw",
    "sw",
    "beq",
    "bne",
    "j",
    "jal",
    "jr",
    "sll",
    "srl",
    "call",
  ];

  public availableRegisters: Array<string> = ["All"];

  public PCStart: number = this.share.pcStart;

  public initialize(): void {
    for (let i = 0; i < 25; i++) {
      if (i == 0) {
        this.regbank.push(0);
        this.initializedRegs.push(true);
      } else {
        this.regbank.push(
          Math.floor(Math.random()*10000)
        );
        this.initializedRegs.push(false);
      }
    }

    this.regbank[9] = this.PCStart;
    this.regbank[16] = this.share.stackStart;
    this.initializedRegs[9] = true;
    this.initializedRegs[16] = true;

    this.pc = this.PCStart;
  }

  public constructor() {
    this.initialize();
  }

  public stdout(value: string, linebreak = true, forceBatch = false, debug = false) {
    if (forceBatch || this.stdoutBatch.length > 0 || (this.debugBatch.length > 0 && this.useDebug)) {
      this.workerPostMessage("console", { log: this.stdoutBatch.join(""), linebreak: false });
      this.workerPostMessage("debug", { log: this.debugBatch.join(""), linebreak: false });
      this.stdoutBatch = [];
      this.debugBatch = [];
      return;
    }

    if (linebreak) value += "\n";

    if (debug && this.useDebug) this.debugBatch.push(value);
    else if (!debug) this.stdoutBatch.push(value);

  }

  public error(msg: string, instruction: string): void {
    this.workerPostMessage("error", { msg: msg, instruction: instruction, cycle: this.cycle, pc: this.pc, line: -1 });
  }

  public reset(): void {
    this.memory = [];
    this.halted = true;
    this.pc = this.PCStart;
    this.cycle = 0;
    this.regbank = [];
    this.initializedRegs = [];
    this.initialize();
  }

  public isRegisterInitialized(reg: number): boolean {
    return this.initializedRegs[this.mapRegister(reg)];
  }

  public signedToBinary(n : number, pad : number) : string
  {
    let binary = (n >>> 0).toString(2).padStart(pad, "0");
    if (binary.length > pad) {
      return binary.substring(binary.length - pad);
    }
    return binary;
  }

  public signedSum(a: number, b: number, pad: number) : number {
    let astr = a.toString(2).padStart(pad, "0").slice(-pad);
    let bstr = b.toString(2).padStart(pad,"0").slice(-pad);
    return Number(`0b${astr}`)+Number(`0b${bstr}`);
  }

  public signedToDec(n : number, pad: number) {
    const limit = Math.pow(2, pad - 1); // Limite positivo

    if (n >= limit) {
        // Número negativo
        return n - Math.pow(2, pad);
    } else {
        // Número positivo
        return n;
    }
}

  public warnRegisterNotInitialized(regs: string[]): void {
    //TODO: fix this

  }

  /* 
    Writes a value in the memory address
    If the address is not initialized, it creates a new address
    @param address: address to write to
    @param value: value to write
  */
  public writeMemory(address: number, value: number): void {

    // if the address is in the screen memory range, send it to the screen
    if (address >= SCREEN_MEM_START && address <= SCREEN_MEM_END) {

      this.screenWriteBatch.push({ address: address, value: value });

      return;
    }

    // tells the worker that we wrote back into the ibuffer addr
    // if (address == INPUT_BUFFER_ADDR){
    //   this.workerPostMessage("ibuffer", value);
    // }

    let addr = this.memory.find((x) => x.address == address);
    if (addr == undefined) {
      this.memory.push({ address: address, value: value });
      return;
    }
    this.memory[this.memory.indexOf(addr)].value = value;
  }

  /*
    Reads a value from the memory address
    If the address is not initialized, it returns a random value to simulate garbage
    @param address: address to read from
    @returns: value at the address
  */
  public readMemory(address: number): number {
    let addr = this.memory.find((x) => x.address == address);

    if (addr == undefined) {
      this.log.error(
        "Memory location not initialized",
        this.currentInstruction.humanCode,
        this.cycle,
        this.pc,
        -1,
        ErrorType.Warning,
        0
      );

      return Math.floor(Math.random() * 100000);
    }

    // when reading ibuffer, sets the buffer to zero
    // TODO: change this to a shift register
    // if (addr.address == INPUT_BUFFER_ADDR)
    // {
    //   const _ibuffer = addr.value as number;
    //   if (_ibuffer != 0b0) this.workerPostMessage("ibuffer", 0b0);
    //   return _ibuffer;
    // }

    return addr.value;
  }

  private getHumanInstruction(instruction: number): string {
    return (
      this.share.program.find(
        (x) =>
          x.machineCode == instruction
      )?.humanCode ?? "Undefined"
    );
  }

  /*
    Loads a program into the memory
    @param program: array of instructions in hex
  */
  public loadProgram(program: Array<Instruction>): void {

    this.program = program;

    this.program.map(inst => {
      this.memory.push({ address: inst.memAddress, value: inst.machineCode })
    })
  }

  /*
    Fetches the instruction at the current pc
    @returns: instruction at the current pc
  */
  public fetch(): number {
    let instruction = this.memory.find(
      (x) => x.address == this.pc
    );
    this.pc += 4; //increment pc
    this.share.currentPc = this.pc;



    return instruction?.value ?? 4227858432; //call 0 if the instruction is not found
  }


  /* 
    Executes a single step of the processor by fetching and calling executeCycle
    Returns -1 if the instruction is call 0
  */
    public executeStep(): number {

      this.halted = false;
  
      if (this.frequency <= 300) {
        self.postMessage({ command: "instruction", value: this.currentInstruction })
        // console.log("from processor ", this.currentInstruction.humanCode)
      }
  
      let programInstruction = this.program.find(
        (x) => x.memAddress == this.pc
      );
  
      if (programInstruction == undefined || programInstruction == null) console.log('programInstruction undefined')
  
  
      //if the instruction is not found, call 0 to stop the execution
      let instruction: number =
        this.fetch() ?? 0xfc000000;

  
      this.currentInstruction = programInstruction ?? { humanCode: "call 0", machineCode: 0xfc000000, memAddress: 0, index: this.memory.length };
  
      if (instruction == 0xfc000000) {
        //call 0
        this.halted = true;
        this.workerPostMessage("halted", true)
        return -1;
      }
  
      //execute the instruction
      this.executeCycle(instruction);
      return 0;
    }

  /*
    Tells the processor to execute the program
  */
  public execute() {
    //caped for loop to prevent infinite loops

    this.halted = false;

    for (let i = 0; i < this.share.cycles_cap; i++)
      if (this.halted) break;
      else{
        if (this.executeStep() == -1) break;
        else  this.check_halt(); 
      }


  }

  /* Since the webworker can't acess cache nor can it recieve messages when busy
  i was forced into this solution: once in a while the cpu will be halted to check with the
  worker service if there are any messesages to be processed. */
  // also: no, i couldn't simple make the executecycle async, the cpu wouldn't work properly
  private sleep(mili: number) {

    let e = new Date().getTime() + mili;

      

    while (new Date().getTime() <= e) 
    {
      // do nothing
    }

  }

  private check_halt(){
    let r = Math.random() * 100


    if (this.frequency <= 100){
      
      this.sleep(10000/this.frequency);
      this.halted = true;
      this.workerPostMessage("halt check", "");
      
    }

    if (r > 99){
      this.halted = true;
      this.workerPostMessage("halt check", "");
    }
  }

  public writeDebug(msg: string) {
    this.stdout(msg, true, false, true);
  }

  /*
    Executes a single cycle of the processor
    @param instruction: instruction to execute   
  */
  public executeCycle(instruction: number) {
    let op = (instruction&0b11111100000000000000000000000000) >>> 26;

    let rs, rt, rd, funct, imm, aux: number;
    let shift: number;
    let a, b, result, base, address: number;

    // this.sleep(40);
    // console.log(`======= DEBUG ${this.pc} ========`)
    // console.log(`instruction ${instruction.toString(2).padStart(32,"0")}`)
    // console.log(`op ${op.toString(2).padStart(6,"0")}`)

    switch (op) {
      case 0: //R-type
        funct = instruction&MASK_26_32;   //26-32
        rd = (instruction&0b00000000000000001111100000000000) >>> 11 //16-21
        rs = (instruction&0b00000011111000000000000000000000) >>> 21; //6-11
        rt = (instruction&0b00000000000111110000000000000000) >>> 16; //11-16

        // console.log(`func ${funct.toString(2)} rs ${rs.toString(2)} rt ${rt.toString(2)} rd ${rd.toString(2)}`)


        // Write to the debug log a warning if the register has not been initialized
        // and set the register as initialized
        // this.warnRegisterNotInitialized([rs, rt]);

        switch (funct) {
          case 0: //sll
            a = this.regbank[this.mapRegister(rt)];
            shift = (instruction&MASK_21_26) >>> 6; //instruction.slice(21, 26).value;
            result = a << shift;
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(`${this.getHumanInstruction(instruction)} a: ${a} shift: ${shift} result: ${result}`);
            break;

          case 0b000010: //srl
            a = this.regbank[this.mapRegister(rt)];
            shift = (instruction&MASK_21_26) >>> 6; //instruction.slice(21, 26).value;
            result = a >> shift;
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(`${this.getHumanInstruction(instruction)} a: ${a} shift: ${shift} result: ${result}`);
            break;

          case 0b011000: //mult
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];

            aux = a*b;
            this.regbank[10] = aux&MASK_UPPER32BITS; //hi
            this.regbank[11] = aux&MASK_LOWER32BITS; //lo

            this.writeDebug(`${this.getHumanInstruction(instruction)} a: ${a} b: ${b} result: ${aux}`);

            break;

          case 0b011010: //div
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];

            this.regbank[10] = Math.floor(a / b); //hi
            this.regbank[11] = a % b; //lo

            this.writeDebug(`${this.getHumanInstruction(instruction)} a: ${a} b: ${b} result: ${Math.floor(a / b)}`);

            break;

          case 0b010000: //mfhi
            this.regbank[this.mapRegister(rd)] = this.regbank[10]; //hi

            this.writeDebug(`${this.getHumanInstruction(instruction)} result: ${this.regbank[10]}`);
            break;

          case 0b010010: //mflo
            this.regbank[this.mapRegister(rd)] = this.regbank[11]; //lo

            this.writeDebug(`${this.getHumanInstruction(instruction)} result: ${this.regbank[11]}`);
            break;

          case 0b100000: //add
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];

            result = a + b;
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(
              `${this.getHumanInstruction(instruction)} a: ${a} b: ${b} result: ${result}`
            );

            break;

          case 0b100010: //sub
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];

            result = a - b;
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(
              `${this.getHumanInstruction(instruction)} a: ${a} b: ${b
              } result: ${result}`
            );
            break;

          case 0b100100: //and
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];

            result = a&b;
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(
              `${this.getHumanInstruction(instruction)} a: ${a} b: ${b
              } result: ${result}`
            );
            break;

          case 0b100101: //or
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];

            result = a | b;
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(
              `${this.getHumanInstruction(instruction)} a: ${a} b: ${b
              } result: ${result}`
            );
            break;

          case 0b101010: //slt
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];

            result = a < b ? 1 : 0;
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(
              `${this.getHumanInstruction(instruction)} a: ${a} b: ${b
              } result: ${result}`
            );
            break;

          case 0b001000: //jr
            rs = (instruction&MASK_RS) >>> 21;
            // this.warnRegisterNotInitialized([rs]);
            this.pc = this.regbank[this.mapRegister(rs)];
            this.share.currentPc = this.pc;

            this.writeDebug(
              `${this.getHumanInstruction(
                instruction
              )} address: ${rs} result: ${this.pc}`
            );

            break;
        }

        break;

      case 0b001010: //slti
        rs = (instruction&MASK_RS) >>> 21;
        rt = (instruction&MASK_RT) >>> 16;
        imm = instruction&MASK_LOWHALFW;

        //this.warnRegisterNotInitialized([rs]);

        a = this.regbank[this.mapRegister(rs)];
        b = imm;
        result = a < b ? 1 : 0;
        this.regbank[this.mapRegister(rt)] = result;

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} a: ${a} b: ${b
          } result: ${result}`
        );

        break;

      case 0b001000: //addi
        rs = (instruction&MASK_RS) >>> 21;
        rt = (instruction&MASK_RT) >>> 16;
        imm = instruction&MASK_LOWHALFW;

        //TODO: fix warnRegisterNotInitialized
        // this.warnRegisterNotInitialized([rs]);

        a = this.regbank[this.mapRegister(rs)];
        b = this.signedToDec(imm,16);

        
        result = a + b;
        this.regbank[this.mapRegister(rt)] = result;
        
        this.writeDebug(
          `${this.getHumanInstruction(instruction)} a: ${a} b: ${b
          } result: ${result}`
        );

        break;

      case 0b100011: //lw
        rs = (instruction&MASK_RS) >>> 21;
        rt = (instruction&MASK_RT) >>> 16;
        imm = this.signedToDec(instruction&MASK_LOWHALFW,16); //offset

        // this.warnRegisterNotInitialized([rs, rt]);

        // console.log(`rs ${rs.toString(2)} rt ${rt} imm ${imm}`)

        base = this.regbank[this.mapRegister(rs)];

        address = (base + imm);

        result = this.readMemory(address);

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} base: ${base
          } address: ${address} result: ${result}`
        );

        this.regbank[this.mapRegister(rt)] = result;

        break;

      case 0b101011: //sw
        rs = (instruction&MASK_RS) >>> 21;
        rt = (instruction&MASK_RT) >>> 16;
        imm = this.signedToDec(instruction&MASK_LOWHALFW,16); //offset

        // this.warnRegisterNotInitialized([rs, rt]);


        base = this.regbank[this.mapRegister(rs)];
        address = (base + imm);

        result = this.regbank[this.mapRegister(rt)];
        // console.log(`essa foi o valor a ser guardado: ${result}`)

        this.writeMemory(address, result);

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} address: ${address
          } result: ${result}`
        );

        break;

      case 0b000100: //beq
        rs = (instruction&MASK_RS) >>> 21;
        rt = (instruction&MASK_RT) >>> 16;
        imm = instruction&MASK_LOWHALFW; //offset

        // this.warnRegisterNotInitialized([rs, rt]);

        a = this.regbank[this.mapRegister(rs)];
        b = this.regbank[this.mapRegister(rt)];

        if (a == b)
          this.pc += this.signedToDec(imm,16);

        // this.pc &= MASK_LOWER32BITS;

        this.share.currentPc = this.pc;

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} a: ${a} b: ${b
          } [${b}] offset: ${imm}`
        );

        break;

      case 0b000101: //bne
        rs = (instruction&MASK_RS) >>> 21;
        rt = (instruction&MASK_RT) >>> 16;
        imm = instruction&MASK_LOWHALFW; //offset

        // this.warnRegisterNotInitialized([rs, rt]);

        a = this.regbank[this.mapRegister(rs)];
        b = this.regbank[this.mapRegister(rt)];

        if (a != b)
          this.pc += this.signedToDec(imm,16);

        // this.pc &= MASK_LOWER32BITS;

        this.share.currentPc = this.pc;

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} a: ${a} b: ${b
          } offset: ${imm}`
        );

        break;

      case 0b000011: //jal
        // get the 26 address bits
        imm = instruction&MASK_6_32; //&MASK_6_32;
        // save the return address in register 9 (ra)
        this.regbank[9] = this.pc;

        this.pc = (this.pc&MASK_0_6) + imm;
        this.pc &= MASK_LOWER32BITS;

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} address: ${imm} result: ${this.pc}`
        );

        break;

      case 0b000010: //j
        // get the 26 address bits
        imm = instruction&MASK_6_32;
        this.pc = parseInt((this.pc&MASK_0_6).toString(2) + imm.toString(2).padStart(26,"0"),2);

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} address: ${imm} result: ${this.pc}`
        );

        break;

      case 0b111111: //call
        let call = instruction&MASK_6_32;
        // let n = BinaryNumber.parse("0b" + call, true);


        if (call == 1) {
          a = this.regbank[this.mapRegister(0b00010)]; //v0
          // this.workerPostMessage("console", {log: a, linebreak: true});
          this.stdout(a.toString(), true, false);

          this.writeDebug(`CALL 1 a: ${a}`);
        } //print char
        else if (call == 2) {
          a = this.regbank[this.mapRegister(0b00010)]; //v0
          let char = String.fromCharCode(a);
          // this.log.console(`${char}`, false);
          this.stdout(char, false, false);

          this.writeDebug(`CALL 2 a: ${a} char: ${char}`);
        }
        //dump integer without newline
        else if (call == 3) {
          a = this.regbank[this.mapRegister(0b00010)]; //v0
          // this.log.console(`${a}`, false);
          // this.workerPostMessage("console", {log: a, linebreak: false});
          this.stdout(a.toString(), false, false);

          this.writeDebug(`CALL 3 a: ${a}`);
        }
        //random int from a0 to a1
        else if (call == 42) {
          a = this.regbank[this.mapRegister(0b00100)]; //a0
          b = this.regbank[this.mapRegister(0b00101)]; //a1

          result =  Math.floor(Math.random() * (b - a) + a);

          this.regbank[this.mapRegister(0b00010)] = result; //v0
          this.writeDebug(
            `CALL 42 a: ${a} b: ${b} result: ${result}`
          );
        }

        // todo: docs @docs
        else if (call == 40) {
            this.workerPostMessage("screen", this.screenWriteBatch);
            this.screenWriteBatch = [];
          
        }
        // todo: docs @docs
        else if (call == 39){
          a = this.regbank[this.mapRegister(0b00100)]; //a0
          this.sleep(a);
        }

        break;

      default:
        this.error(`Invalid instruction.`, this.currentInstruction.humanCode)
        break;
    }

  }

  public mapRegister(reg: number): number {

    //TODO: FIX THIS
    // if (this.availableRegisters[0] != "All" && this.availableRegisters.indexOf(reg) == -1) {
    //   this.error(`Invalid register ${reg}.`, this.currentInstruction.humanCode)
    //   return 0;
    // }

    switch (reg) {
      case 0: //zero
        return 0;
      case 0b00010: //v0
        return 1;
      case 0b00011: //v1
        return 2;
      case 0b00100: //a0
        return 3;
      case 0b00101: //a1
        return 4;
      case 0b00110: //a2
        return 12;
      case 0b00111: //a3
        return 17;
      case 0b01000: //t0
        return 5;
      case 0b01001: //t1
        return 6;
      case 0b01010: //t2
        return 7;
      case 0b01011: //t3
        return 8;
      case 0b01100: //t4
        return 13;
      case 0b01101: //t5
        return 14;
      case 0b01110: //t6
        return 15;
      case 0b10000: //s0
        return 18;
      case 0b10001: //s1
        return 19;
      case 0b10010: //s2
        return 20;
      case 0b10011: //s3
        return 21;
      case 0b10100: //s4
        return 22;
      case 0b10101: //s5
        return 23;
      case 0b10110: //s6
        return 24;
      case 0b10111: //s6
        return 25;
      case 0b11101: //sp
        return 16;
      case 0b11111: //ra
        return 9;
      default:
        this.error(`Invalid register ${reg}.`, this.currentInstruction.humanCode)
        return 0;
      // throw new Error("Invalid register");
    }
  }
}
