import Logger, { ErrorType, InfoType } from "../../Service/Logger";
import BinaryNumber from "../BinaryNumber";
import { ALU, Clock } from "../Descriptor";

//simplified instruction set mips
//compatible instructions:
//arithmetics: add, addi, sub, and, or, slt
//memory: lw, sw
//branch: beq

//registers: v0,v1, a0,a1, t0,t1,t2,t3, ra, pc, zero

type addr = {
  address: BinaryNumber;
  value: BinaryNumber; //value of the address in binary
};

export default class SISMIPS {
  public f: number = 0; //frequency
  public memory: Array<addr> = new Array<addr>(); //memory
  public pc: BinaryNumber = new BinaryNumber(); //program counter
  public regbank: Array<BinaryNumber> = []; //register bank

  public log: Logger = Logger.instance;

  private PCStart: number = 0x00400000;

  public constructor() {
    this.f = 1;
    for (let i = 0; i < 10; i++) {
      this.regbank.push(new BinaryNumber());
    }

    this.pc = new BinaryNumber(this.PCStart.toString());
  }

  public writeMemory(address: BinaryNumber, value: BinaryNumber): void {
    let addr = this.memory.find((x) => x.address.value == address.value);
    if (addr == undefined) {
      this.memory.push({ address: address, value: value });
      return;
    }
    this.memory[this.memory.indexOf(addr)].value = value;
  }

  public readMemory(address: BinaryNumber): BinaryNumber {
    let addr = this.memory.find((x) => x.address.value == address.value);
    if (addr == undefined) {
      this.log.warning("Memory location not initialized", ErrorType.SIMULATOR);
      return new BinaryNumber((Math.random() * 100000).toString());
    }
    return addr.value;
  }

  public loadProgram(program: Array<string>): void {
    program.map((inst, i) => {
      if (inst != " " && inst != "") {
        let instruction = new BinaryNumber("0x" + inst);
        this.memory.push({
          address: new BinaryNumber((this.PCStart + i).toString()),
          value: instruction,
        });
      }
    });
  }

  public fetch(): BinaryNumber {
    let instruction = this.memory.find(
      (x) => x.address.value == this.pc.value
    )?.value;
    this.pc.addNumber(1);
    return instruction ?? new BinaryNumber("0xfc000000"); //call 0 if the instruction is not found
  }

  public execute(): void {
    //while (true) {
    for (let i = 0; i < 100; i++) {
      let instruction: BinaryNumber =
        this.fetch() ?? new BinaryNumber("0xfc000000");
      if (instruction.toHex(8) == "0xfc000000") {
        //call 0
        console.log("call 0");
        break;
      }
      this.executeCycle(instruction);
    }
  }

  public executeCycle(instruction: BinaryNumber): void {
    console.log("Executing instruction: " + instruction.getBinaryValue(32));
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

        // console.log("R-type instruction");
        // console.log("funct: " + funct);
        // console.log("rd: " + rd);
        // console.log("rs: " + rs);
        // console.log("rt: " + rt);

        switch (funct) {
          case "100000": //add
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result = a.add(b);
            this.regbank[this.mapRegister(rd)] = result;

            console.log(
              `ADD a: ${a.value} b: ${b.value} result: ${result.value}`
            );

            break;

          case "100010": //sub
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result = BinaryNumber.sub(a.value, b.value);
            this.regbank[this.mapRegister(rd)] = result;

            console.log(
              `SUB a: ${a.value} b: ${b.value} result: ${result.value}`
            );
            break;

          case "100100": //and
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result = BinaryNumber.and(a.value, b.value);
            this.regbank[this.mapRegister(rd)] = result;

            console.log(
              `AND a: ${a.value} b: ${b.value} result: ${result.value}`
            );
            break;

          case "100101": //or
            a = this.regbank[this.mapRegister(rs)];
            b = this.regbank[this.mapRegister(rt)];
            result = BinaryNumber.or(a.value, b.value);
            this.regbank[this.mapRegister(rd)] = result;

            console.log(
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

            console.log(
              `SLT a: ${a.value} b: ${b.value} result: ${result.value}`
            );
            break;
        }

        break;

      case "001000": //addi
        rs = instruction.getBinaryValue(32).slice(6, 11);
        rt = instruction.getBinaryValue(32).slice(11, 16);
        imm = instruction.getBinaryValue(32).slice(16, 32);

        // console.log("Addi instruction");
        // console.log("rs: " + rs);
        // console.log("rt: " + rt);
        // console.log("imm: " + imm);

        a = this.regbank[this.mapRegister(rs)];
        b = BinaryNumber.parse("0b" + imm, true);
        result = BinaryNumber.add(a.value, b.value);
        this.regbank[this.mapRegister(rt)] = result;

        console.log(
          `ADDI: a: ${a.value} b: ${b.value} result: ${result.value}`
        );

        break;

      case "100011": //lw
        rs = instruction.getBinaryValue(32).slice(6, 11);
        rt = instruction.getBinaryValue(32).slice(11, 16);
        imm = instruction.getBinaryValue(32).slice(16, 32); //offset

        base = this.regbank[this.mapRegister(rs)];
        address = BinaryNumber.add(
          base.value,
          BinaryNumber.parse("0b" + imm, true).value
        );

        result = this.readMemory(address);

        console.log(
          `LW: base: ${base.value} address: ${address.value} result: ${result.value}`
        );

        break;

      case "101011": //sw
        rs = instruction.getBinaryValue(32).slice(6, 11);
        rt = instruction.getBinaryValue(32).slice(11, 16);
        imm = instruction.getBinaryValue(32).slice(16, 32); //offset

        base = this.regbank[this.mapRegister(rs)];
        address = BinaryNumber.add(
          base.value,
          BinaryNumber.parse("0b" + imm, true).value
        );

        result = this.regbank[this.mapRegister(rt)];
        this.writeMemory(address, result);

        console.log(`SW: address: ${address.value} result: ${result.value}`);
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
        throw new Error("Invalid register");
    }
  }
}
