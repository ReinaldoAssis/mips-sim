import Logger, { ErrorType } from "../../Service/Logger";
import SharedData, { IProcessor } from "../../Service/SharedData";
import BinaryNumber from "../BinaryNumber";

//simplified instruction set mips
//compatible instructions:
//arithmetics: add, addi, sub, and, or, slt, call 0, call 1, call 2, sll
//memory: lw, sw
//branch: beq, bne, j, jal, jr

//registers: v0,v1, a0,a1, t0,t1,t2,t3, ra, pc, zero

type addr = {
  address: BinaryNumber;
  value: BinaryNumber; //value of the address in binary
};

export default class MonoMIPS implements IProcessor {
  public share: SharedData = SharedData.instance;
  public refname: string = "mono";
  public halted = false;

  public frequency: number = 100; //frequency
  public memory: Array<addr> = new Array<addr>(); //memory
  public pc: BinaryNumber = new BinaryNumber(); //program counter
  public cycle: number = 0; //number of cycles executed
  public regbank: Array<BinaryNumber> = []; //register bank
  public initializedRegs: Array<boolean> = []; //initialized registers

  public currentInstruction: string = ""; //current instruction being executed

  public workerPostMessage: ((channel:string, message: any) => void) = (channel:string, message: any) => {};
  private stdoutBatch : Array<string> = []; // batch that stores the stdout messages

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
    "call 0",
    "call 1",
    "call 2",
    "call 3",
    "call 42"
  ];

  public log: Logger = Logger.instance;

  public PCStart: number = this.share.pcStart;

  public initialize(): void {
    for (let i = 0; i < 10; i++) {
      if (i == 0) {
        this.regbank.push(new BinaryNumber("0"));
        this.initializedRegs.push(true);
      } else {
        this.regbank.push(
          new BinaryNumber((Math.random() * 10000000).toString())
        );
        this.initializedRegs.push(false);
      }
    }

    this.regbank[9] = new BinaryNumber(this.PCStart);
    this.regbank[16] = new BinaryNumber(this.share.stackStart);
    this.initializedRegs[9] = true;
    this.initializedRegs[16] = true;

    this.pc = new BinaryNumber(this.PCStart.toString());
  }

  public constructor() {
    this.initialize();
  }

  public stdout (value:string, linebreak=true, forceBatch=false) {
    if(forceBatch || this.stdoutBatch.length > 100){
      this.workerPostMessage("console", {log: this.stdoutBatch.join(""), linebreak: true});
      this.stdoutBatch = [];
      return;
    }

    if(linebreak) this.stdoutBatch.push(value+"\n");
    else this.stdoutBatch.push(value);

  }

  public reset(): void {
    this.memory = [];
    this.halted = false;
    this.pc = new BinaryNumber(this.PCStart);
    this.cycle = 0;
    this.regbank = [];
    this.initializedRegs = [];
    this.initialize();
  }

  public isRegisterInitialized(reg: string): boolean {
    return this.initializedRegs[this.mapRegister(reg)];
  }

  public warnRegisterNotInitialized(regs: string[]): void {
    //TODO: fix this
   
  }

  /* 
    Executes a single step of the processor by fetching and calling executeCycle
    Returns -1 if the instruction is call 0
  */
  public executeStep(): number {
    let programInstruction = this.share.program.find(
      (x) => x.memAddress.getBinaryValue(32) == this.pc.getBinaryValue(32)
    );

    //if the instruction is not found, call 0 to stop the execution
    let instruction: BinaryNumber =
      this.fetch() ?? new BinaryNumber("0xfc000000");

    this.currentInstruction = programInstruction?.humanCode ?? "call 0";
    
    //update the current step line
    if (this.share.processorFrequency < 90)
      this.share.currentStepLine = programInstruction?.index ?? 0;

    if (instruction.toHex(8) == "0xfc000000") {
      //call 0
      this.halted = true;
      this.stdout("", true, true);
      this.workerPostMessage("halted", true)
      return -1;
    }

    //execute the instruction
    this.executeCycle(instruction);
    return 0;
  }

  /* 
    Writes a value in the memory address
    If the address is not initialized, it creates a new address
    @param address: address to write to
    @param value: value to write
  */
  public writeMemory(address: BinaryNumber, value: BinaryNumber): void {
    let addr = this.memory.find((x) => x.address.value == address.value);
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
  public readMemory(address: BinaryNumber): BinaryNumber {
    let addr = this.memory.find((x) => x.address.value == address.value);
    if (addr == undefined) {
      this.log.error(
        "Memory location not initialized",
        this.currentInstruction,
        this.cycle,
        this.pc.value,
        -1,
        ErrorType.Warning,
        0
      );
      //this.log.warning("Memory location not initialized", ErrorType.SIMULATOR);
      return new BinaryNumber((Math.random() * 100000).toString());
    }
    return addr.value;
  }

  private getHumanInstruction(instruction: BinaryNumber): string {
    return (
      this.share.program.find(
        (x) =>
          x.machineCode.getBinaryValue(32) == instruction.getBinaryValue(32)
      )?.humanCode ?? "Undefined"
    );
  }

  /*
    Loads a program into the memory
    @param program: array of instructions in hex
  */
  public loadProgram(program: Array<string>): void {
    program.map((inst, i) => {
      if (inst != " " && inst != "") {
        let instruction = new BinaryNumber("0x" + inst);
        this.memory.push({
          address: new BinaryNumber((this.PCStart + i * 4).toString()),
          value: instruction,
        });
      }
    });
  }

  /*
    Fetches the instruction at the current pc
    @returns: instruction at the current pc
  */
  public fetch(): BinaryNumber {
    let instruction = this.memory.find(
      (x) => x.address.value == this.pc.value
    )?.value;
    this.pc.addNumber(4); //increment pc
    this.share.currentPc = this.pc.value;
    return instruction ?? new BinaryNumber("0xfc000000"); //call 0 if the instruction is not found
  }

  /*
    Tells the processor to execute the program
  */
    public async execute() {
      //caped for loop to prevent infinite loops
      
      const stepper = () => {
        let i = 0;
      let interval : NodeJS.Timeout = setInterval(() => {
        if (this.executeStep() == -1) {
          i = 99999999;
          clearInterval(interval);
        }
        i++;
        if (i > 2000) clearInterval(interval);

      }, 1000/this.frequency);
      
      this.share.interval = interval;
      }
  
      const continuous = () => 
      {
        for(let i=0; i<this.share.cycles_cap; i++)
          if(this.executeStep() == -1) break;
      }
  
      if(this.frequency > 90) continuous();
      else stepper();
  
    }

    public writeDebug(msg:string){
      if(this.share.debugInstructions) this.log.debug(msg);
    }

  /*
    Executes a single cycle of the processor
    @param instruction: instruction to execute
  */
  public executeCycle(instruction: BinaryNumber): void {
    // console.log("Executing instruction: " + instruction.getBinaryValue(32));
    let op = instruction.getBinaryValue(32).slice(0, 6);
    // console.log("op: " + op);

    let rs, rt, rd, funct, imm, aux : string;
    let shift: number;
    let a, b, result, base, address: BinaryNumber;

    switch (op) {
      case "000000": //R-type
        funct = instruction.getBinaryValue(32).slice(26, 32);
        rd = instruction.getBinaryValue(32).slice(16, 21);
        rs = instruction.getBinaryValue(32).slice(6, 11);
        rt = instruction.getBinaryValue(32).slice(11, 16);


        // Write to the debug log a warning if the register has not been initialized
        // and set the register as initialized
        this.warnRegisterNotInitialized([rs, rt]);

        switch (funct) {
            case "000000": //sll
            a = this.regbank[this.mapRegister(rt)];
            shift = instruction.slice(21, 26).value;
            result = BinaryNumber.shiftLeft(a, shift);
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(`${this.getHumanInstruction(instruction)} a: ${a.value} shift: ${shift} result: ${result.value}`);
            break;

          case "000010": //srl
            a = this.regbank[this.mapRegister(rt)];
            shift = instruction.slice(21, 26).value;
            result = BinaryNumber.shiftRight(a, shift);
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(`${this.getHumanInstruction(instruction)} a: ${a.value} shift: ${shift} result: ${result.value}`);
            break;

          case "011000": //mult
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];

            aux = BinaryNumber.parse(a.value * b.value,true).getBinaryValue(64);
            this.regbank[10] = BinaryNumber.parse("0b"+aux.slice(0, 32), true); //hi
            this.regbank[11] = BinaryNumber.parse("0b"+aux.slice(32, 64), true); //lo

            this.writeDebug(`${this.getHumanInstruction(instruction)} a: ${a.value} b: ${b.value} result: ${BinaryNumber.parse("0b"+aux).value}`);
            
          break;

          case "011010": //div
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];

            this.regbank[10] = BinaryNumber.parse(Math.floor(a.value / b.value).toString()); //hi
            this.regbank[11] = BinaryNumber.parse((a.value % b.value).toString()); //lo

            this.writeDebug(`${this.getHumanInstruction(instruction)} a: ${a.value} b: ${b.value} result: ${Math.floor(a.value / b.value)}`);

            break;

          case "010000": //mfhi
            this.regbank[this.mapRegister(rd)] = this.regbank[10]; //hi

            this.writeDebug(`${this.getHumanInstruction(instruction)} result: ${this.regbank[10].value}`);
            break;

          case "010010": //mflo
            this.regbank[this.mapRegister(rd)] = this.regbank[11]; //lo

            this.writeDebug(`${this.getHumanInstruction(instruction)} result: ${this.regbank[11].value}`);
            break;

          case "100000": //add
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result = BinaryNumber.add(a.value, b.value);
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(
              `${this.getHumanInstruction(instruction)} a: ${a.value} b: ${
                b.value
              } result: ${result.value}`
            );

            break;

          case "100010": //sub
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result = BinaryNumber.sub(a.value, b.value);
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(
              `${this.getHumanInstruction(instruction)} a: ${a.value} b: ${
                b.value
              } result: ${result.value}`
            );
            break;

          case "100100": //and
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result = BinaryNumber.and(a.value, b.value);
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(
              `${this.getHumanInstruction(instruction)} a: ${a.value} b: ${
                b.value
              } result: ${result.value}`
            );
            break;

          case "100101": //or
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result = BinaryNumber.or(a.value, b.value);
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(
              `${this.getHumanInstruction(instruction)} a: ${a.value} b: ${
                b.value
              } result: ${result.value}`
            );
            break;

          case "101010": //slt
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result =
              a.value < b.value
                ? new BinaryNumber("0b1")
                : new BinaryNumber("0b0");
            this.regbank[this.mapRegister(rd)] = result;

            this.writeDebug(
              `${this.getHumanInstruction(instruction)} a: ${a.value} b: ${
                b.value
              } result: ${result.value}`
            );
            break;

          case "001000": //jr
            rs = instruction.getBinaryValue(32).slice(6, 11);
            this.warnRegisterNotInitialized([rs]);
            this.pc = this.regbank[this.mapRegister(rs)];
            this.share.currentPc = this.pc.value;

            this.writeDebug(
              `${this.getHumanInstruction(
                instruction
              )} address: ${new BinaryNumber(
                "0b" + rs
              ).toHex()} result: ${this.pc.toHex()}`
            );

            break;
        }

        break;

      case "001010": //slti
        rs = instruction.getBinaryValue(32).slice(6, 11);
        rt = instruction.getBinaryValue(32).slice(11, 16);
        imm = instruction.getBinaryValue(32).slice(16, 32);

        //this.warnRegisterNotInitialized([rs]);

        a = this.regbank[this.mapRegister(rs)];
        b = BinaryNumber.parse("0b" + imm, true);
        result =
          a.value < b.value
            ? new BinaryNumber(1)
            : new BinaryNumber(0);
        this.regbank[this.mapRegister(rt)] = result;

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} a: ${a.value} b: ${
            b.value
          } result: ${result.value}`
        );

        break;

      case "001000": //addi
        rs = instruction.getBinaryValue(32).slice(6, 11);
        rt = instruction.getBinaryValue(32).slice(11, 16);
        imm = instruction.getBinaryValue(32).slice(16, 32);

        this.warnRegisterNotInitialized([rs]);

        a = this.regbank[this.mapRegister(rs)];
        b = BinaryNumber.parse("0b" + imm, true);
        result = BinaryNumber.add(a.value, b.value);
        this.regbank[this.mapRegister(rt)] = result;

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} a: ${a.value} b: ${
            b.value
          } result: ${result.value}`
        );

        break;

      case "100011": //lw
        rs = instruction.getBinaryValue(32).slice(6, 11);
        rt = instruction.getBinaryValue(32).slice(11, 16);
        imm = instruction.getBinaryValue(32).slice(16, 32); //offset

        this.warnRegisterNotInitialized([rs, rt]);

        base = this.regbank[this.mapRegister(rs)];
        address = BinaryNumber.add(
          base.value,
          BinaryNumber.parse("0b" + imm, true).value
        );

        result = this.readMemory(address);

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} base: ${
            base.value
          } address: ${address.value} result: ${result.value}`
        );

        this.regbank[this.mapRegister(rt)] = result;

        break;

      case "101011": //sw
        rs = instruction.getBinaryValue(32).slice(6, 11);
        rt = instruction.getBinaryValue(32).slice(11, 16);
        imm = instruction.getBinaryValue(32).slice(16, 32); //offset

        this.warnRegisterNotInitialized([rs, rt]);

        base = this.regbank[this.mapRegister(rs)];
        address = BinaryNumber.add(
          base.value,
          BinaryNumber.parse("0b" + imm, true).value
        );

        result = this.regbank[this.mapRegister(rt)];
        this.writeMemory(address, result);

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} address: ${
            address.value
          } result: ${result.value}`
        );

        break;

      case "000100": //beq
        rs = instruction.getBinaryValue(32).slice(6, 11);
        rt = instruction.getBinaryValue(32).slice(11, 16);
        imm = instruction.getBinaryValue(32).slice(16, 32); //offset

        this.warnRegisterNotInitialized([rs, rt]);

        a = this.regbank[this.mapRegister(rs)];
        b = this.regbank[this.mapRegister(rt)];

        if (a.value == b.value)
          this.pc.add(BinaryNumber.parse("0b" + imm, true));

        this.share.currentPc = this.pc.value;

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} a: ${a.value} b: ${
            b.value
          } [${b.getBinaryValue()}] offset: ${imm}`
        );

        break;

      case "000101": //bne
        rs = instruction.getBinaryValue(32).slice(6, 11);
        rt = instruction.getBinaryValue(32).slice(11, 16);
        imm = instruction.getBinaryValue(32).slice(16, 32); //offset

        this.warnRegisterNotInitialized([rs, rt]);

        a = this.regbank[this.mapRegister(rs)];
        b = this.regbank[this.mapRegister(rt)];

        if (a.value != b.value)
          this.pc.add(BinaryNumber.parse("0b" + imm, true));

        this.share.currentPc = this.pc.value;

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} a: ${a.value} b: ${
            b.value
          } offset: ${imm}`
        );

        break;

      case "000011": //jal
        // get the 26 address bits
        imm = instruction.getBinaryValue(32).slice(6, 32);
        // save the return address in register 9 (ra)
        this.regbank[9] = this.pc;

        // console.log("------ JAL Debug ------");
        // console.log("Instruction", instruction.getBinaryValue(32));
        // console.log("imm value", imm);
        // console.log("pc value", this.pc.getBinaryValue(32));
        // console.log("0b" + this.pc.getBinaryValue(32).slice(0, 6) + imm);

        this.pc = new BinaryNumber(
          "0b" + this.pc.getBinaryValue(32).slice(0, 6) + imm
        );

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} address: ${new BinaryNumber(
            "0b" + imm
          ).toHex()} result: ${this.pc.toHex()}`
        );

        break;

      case "000010": //j
        // get the 26 address bits
        imm = instruction.getBinaryValue(32).slice(6, 32);
        this.pc = new BinaryNumber(
          "0b" + this.pc.getBinaryValue(32).slice(0, 6) + imm
        );

        this.writeDebug(
          `${this.getHumanInstruction(instruction)} address: ${new BinaryNumber(
            "0b" + imm
          ).toHex()} result: ${this.pc.toHex()}`
        );

        break;

      case "111111": //call
        let call = instruction.getBinaryValue(32).slice(6, 32);
        let n = BinaryNumber.parse("0b" + call, true).value;


        if (n == 1) {
          a = this.regbank[this.mapRegister("00010")]; //v0
          // this.workerPostMessage("console", {log: a.value, linebreak: true});
          this.stdout(a.value.toString(), true, false);
          
          this.writeDebug(`CALL 1 a: ${a.value}`);
        } //print char
        else if (n == 2) {
          a = this.regbank[this.mapRegister("00010")]; //v0
          let char = String.fromCharCode(a.value);
          // this.log.console(`${char}`, false);
          this.stdout(char, false, false);

          this.writeDebug(`CALL 2 a: ${a.value} char: ${char}`);
        } 
        //dump integer without newline
        else if(n == 3){
          a = this.regbank[this.mapRegister("00010")]; //v0
          // this.log.console(`${a.value}`, false);
          // this.workerPostMessage("console", {log: a.value, linebreak: false});
          this.stdout(a.value.toString(), false, false);

          this.writeDebug(`CALL 3 a: ${a.value}`);
        }
        //random int from a0 to a1
        else if (n == 42) {
          a = this.regbank[this.mapRegister("00100")]; //a0
          b = this.regbank[this.mapRegister("00101")]; //a1
          result = BinaryNumber.parse(
            Math.floor(Math.random() * (b.value - a.value) + a.value)
          );
          this.regbank[this.mapRegister("00010")] = result; //v0
          this.writeDebug(
            `CALL 42 a: ${a.value} b: ${b.value} result: ${result.value}`
          );
        }
        break;

      default:
        this.log.error(
          "Couldn't process instruction",
          this.currentInstruction,
          this.cycle,
          this.pc.value,
          -1,
          ErrorType.InvalidInstruction,
          1
        );
        // this.log.error("Invalid instruction", ErrorType.SIMULATOR);
        break;
    }
  }

  public mapRegister(reg: string): number {
    switch (reg) {
      case "00000": //zero
        return 0;
      case "00010": //v0
        return 1;
      case "00011": //v1
        return 2;
      case "00100": //a0
        return 3;
      case "00101": //a1
        return 4;
      case "00110": //a2
        return 12;
      case "00111": //a3
        return 17;
      case "01000": //t0
        return 5;
      case "01001": //t1
        return 6;
      case "01010": //t2
        return 7;
      case "01011": //t3
        return 8;
      case "01100": //t4
        return 13;
      case "01101": //t5
        return 14;
      case "01110": //t6
        return 15;
      case "11101": //sp
        return 16;
      case "11111": //ra
        return 9;
      case "hi":
        return 10;
      case "lo":
        return 11;
      default:
        this.log.error(
          "Couldn't process register",
          this.currentInstruction,
          this.cycle,
          this.pc.value,
          -1,
          ErrorType.InvalidRegister,
          1
        );
        return 0;
      // throw new Error("Invalid register");
    }
  }
}
