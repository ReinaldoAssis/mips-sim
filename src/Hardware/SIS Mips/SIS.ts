import Logger, { ErrorType } from "../../Service/Logger";
import SharedData, { Processor } from "../../Service/SharedData";
import BinaryNumber from "../BinaryNumber";
import { ALU, Clock } from "../Descriptor";

//simplified instruction set mips
//compatible instructions:
//arithmetics: add, addi, sub, and, or, slt, call 0, call 1, call 2
//memory: lw, sw
//branch: beq, bne, j, jal, jr

//registers: v0,v1, a0,a1, t0,t1,t2,t3, ra, pc, zero

type addr = {
  address: BinaryNumber;
  value: BinaryNumber; //value of the address in binary
};

export default class SISMIPS implements Processor {
  public share: SharedData = SharedData.instance;

  public frequency: number = 0; //frequency
  public memory: Array<addr> = new Array<addr>(); //memory
  public pc: BinaryNumber = new BinaryNumber(); //program counter
  public cycle: number = 0; //number of cycles executed
  public regbank: Array<BinaryNumber> = []; //register bank
  public initializedRegs: Array<boolean> = []; //initialized registers

  public currentInstruction: string = ""; //current instruction being executed

  public instructionSet: Array<string> = [
    "add",
    "addi",
    "sub",
    "and",
    "or",
    "slt",
    "lw",
    "sw",
    "beq",
    "bne",
    "call 0",
    "call 1",
  ];

  public log: Logger = Logger.instance;

  public PCStart: number = this.share.pcStart;

  public constructor() {
    this.frequency = 1;
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

    this.pc = new BinaryNumber(this.PCStart.toString());
  }

  public isRegisterInitialized(reg: string): boolean {
    return this.initializedRegs[this.mapRegister(reg)];
  }

  public warnRegisterNotInitialized(regs: string[]): void {
    //TODO: fix this
    // regs.map((reg) => {
    //   if (!this.isRegisterInitialized(reg)) {
    //     this.log.warning(
    //       "Acessing register not initialized.",
    //       ErrorType.SIMULATOR
    //     );
    //     this.initializedRegs[this.mapRegister(reg)] = true;
    //   }
    // });
  }

  /* 
    Executes a single step of the processor by fetching and calling executeCycle
    Returns -1 if the instruction is call 0
  */
  public executeStep(): number {
    let instruction: BinaryNumber =
      this.fetch() ?? new BinaryNumber("0xfc000000");

    this.currentInstruction = instruction.toHex(8); //TODO: change instruction representation to assembly code not hex

    if (instruction.toHex(8) == "0xfc000000") {
      //call 0
      console.log("call 0");
      return -1;
    }
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
  public execute(): void {
    //caped for loop to prevent infinite loops
    for (let i = 0; i < 1000; i++) {
      if (this.executeStep() == -1) break;
    }
  }

  /*
    Executes a single cycle of the processor
    @param instruction: instruction to execute
  */
  public executeCycle(instruction: BinaryNumber): void {
    // console.log("Executing instruction: " + instruction.getBinaryValue(32));
    let op = instruction.getBinaryValue(32).slice(0, 6);
    // console.log("op: " + op);

    let rs, rt, rd, funct, imm: string;
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
          case "100000": //add
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result = BinaryNumber.add(a.value, b.value);
            this.regbank[this.mapRegister(rd)] = result;

            this.log.debug(
              `ADD a: ${a.value} b: ${b.value} result: ${result.value}`
            );

            break;

          case "100010": //sub
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result = BinaryNumber.sub(a.value, b.value);
            this.regbank[this.mapRegister(rd)] = result;

            this.log.debug(
              `SUB a: ${a.value} b: ${b.value} result: ${result.value}`
            );
            break;

          case "100100": //and
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result = BinaryNumber.and(a.value, b.value);
            this.regbank[this.mapRegister(rd)] = result;

            this.log.debug(
              `AND a: ${a.value} b: ${b.value} result: ${result.value}`
            );
            break;

          case "100101": //or
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result = BinaryNumber.or(a.value, b.value);
            this.regbank[this.mapRegister(rd)] = result;

            this.log.debug(
              `OR a: ${a.value} b: ${b.value} result: ${result.value}`
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

            this.log.debug(
              `SLT a: ${a.value} b: ${b.value} result: ${result.value}`
            );
            break;

          case "001000": //jr
            rs = instruction.getBinaryValue(32).slice(6, 11);
            this.warnRegisterNotInitialized([rs]);
            this.pc = this.regbank[this.mapRegister(rs)];
            console.log("JR PC ", this.pc.getBinaryValue(32));
            this.share.currentPc = this.pc.value;

            this.log.debug(
              `JR address: ${new BinaryNumber(
                "0b" + rs
              ).toHex()} result: ${this.pc.toHex()}`
            );

            break;
        }

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

        this.log.debug(
          `ADDI a: ${a.value} b: ${b.value} result: ${result.value}`
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

        this.log.debug(
          `LW base: ${base.value} address: ${address.value} result: ${result.value}`
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

        this.log.debug(`SW address: ${address.value} result: ${result.value}`);

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

        this.log.debug(
          `BEQ a: ${a.value} b: ${
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

        this.log.debug(`BNE a: ${a.value} b: ${b.value} offset: ${imm}`);

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
        console.log("SIS new pc", this.pc.getBinaryValue(32));

        this.log.debug(
          `JAL address: ${new BinaryNumber(
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

        this.log.debug(
          `J address: ${new BinaryNumber(
            "0b" + imm
          ).toHex()} result: ${this.pc.toHex()}`
        );

        break;

      case "111111": //call
        let call = instruction.getBinaryValue(32).slice(6, 32);
        let n = BinaryNumber.parse("0b" + call, true).value;

        console.log("call number ", n);

        if (n == 1) {
          a = this.regbank[this.mapRegister("00010")]; //v0
          this.log.console(`${a.value}`);
          this.log.debug(`CALL 1 a: ${a.value}`);
        } else if (n == 2) {
          a = this.regbank[this.mapRegister("00010")]; //v0
          let char = String.fromCharCode(a.value);
          this.log.console(`${char}`, false);
          this.log.debug(`CALL 2 a: ${a.value} char: ${char}`);
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
      case "01000": //t0
        return 5;
      case "01001": //t1
        return 6;
      case "01010": //t2
        return 7;
      case "01011": //t3
        return 8;
      case "11111": //ra
        return 9;
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
