import Logger, { ErrorType, InfoType } from "../../Service/Logger";
import SharedData, { processor } from "../../Service/SharedData";
import BinaryNumber from "../BinaryNumber";
import { ALU, Clock } from "../Descriptor";

//simplified instruction set mips
//compatible instructions:
//arithmetics: add, addi, sub, and, or, slt, call 0, call 1
//memory: lw, sw
//branch: beq, bne

//registers: v0,v1, a0,a1, t0,t1,t2,t3, ra, pc, zero

type addr = {
  address: BinaryNumber;
  value: BinaryNumber; //value of the address in binary
};

export default class SISMIPS implements processor {
  public share: SharedData = SharedData.instance;

  public frequency: number = 0; //frequency
  public memory: Array<addr> = new Array<addr>(); //memory
  public pc: BinaryNumber = new BinaryNumber(); //program counter
  public regbank: Array<BinaryNumber> = []; //register bank

  public log: Logger = Logger.instance;

  public PCStart: number = this.share.PcStart;

  public constructor() {
    this.frequency = 1;
    for (let i = 0; i < 10; i++) {
      if (i == 0) this.regbank.push(new BinaryNumber("0"));
      else
        this.regbank.push(
          new BinaryNumber((Math.random() * 100000).toString())
        );
    }

    this.pc = new BinaryNumber(this.PCStart.toString());
  }

  public executeStep(): number {
    let instruction: BinaryNumber =
      this.fetch() ?? new BinaryNumber("0xfc000000");
    if (instruction.toHex(8) == "0xfc000000") {
      //call 0
      console.log("call 0");
      return -1;
    }
    this.executeCycle(instruction);
    return 0;
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
    console.log(
      `PC value: ${
        this.pc.value - this.PCStart
      } instruction: ${instruction?.getBinaryValue(32)}`
    );
    this.pc.addNumber(1);
    this.share.currentPc = this.pc.value;
    return instruction ?? new BinaryNumber("0xfc000000"); //call 0 if the instruction is not found
  }

  public execute(): void {
    //while (true) {
    for (let i = 0; i < 1000; i++) {
      if (this.executeStep() == -1) break;
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

        this.log.debug(
          `ADDI a: ${a.value} b: ${b.value} result: ${result.value}`
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

        this.log.debug(
          `LW base: ${base.value} address: ${address.value} result: ${result.value}`
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

        this.log.debug(`SW address: ${address.value} result: ${result.value}`);

        break;

      case "000100": //beq
        rs = instruction.getBinaryValue(32).slice(6, 11);
        rt = instruction.getBinaryValue(32).slice(11, 16);
        imm = instruction.getBinaryValue(32).slice(16, 32); //offset

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

        a = this.regbank[this.mapRegister(rs)];
        b = this.regbank[this.mapRegister(rt)];

        if (a.value != b.value)
          this.pc.add(BinaryNumber.parse("0b" + imm, true));

        this.share.currentPc = this.pc.value;

        this.log.debug(`BNE a: ${a.value} b: ${b.value} offset: ${imm}`);

        break;

      case "111111": //call
        let call = instruction.getBinaryValue(32).slice(6, 32);
        let n = BinaryNumber.parse("0b" + call, true).value;
        if (n == 1) {
          a = this.regbank[this.mapRegister("00010")]; //v0
          this.log.info(`${a.value}`, InfoType.OUTPUT);
        }
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
        throw new Error("Invalid register");
    }
  }
}
