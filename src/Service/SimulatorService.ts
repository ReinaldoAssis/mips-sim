import BinaryNumber from "../Hardware/BinaryNumber";
import Logger, { ErrorType } from "./Logger";

export default class SimulatorService {
  public editorValue: string = "";
  public assemblyCode: string = "";
  private log: Logger = Logger.instance;

  private static instance: SimulatorService;
  private constructor() {
    // ...
  }

  public static getInstance(): SimulatorService {
    if (!SimulatorService.instance) {
      SimulatorService.instance = new SimulatorService();
    }
    return SimulatorService.instance;
  }
  // clear all comments from the code
  public cleanComments(code: string): string {
    let lines = code.split("\n");
    let cleanCode = "";
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.indexOf("#") !== -1) {
        line = line.substring(0, line.indexOf("#"));
      }
      cleanCode += line + "\n";
    }
    return cleanCode;
  }

  public treatOffsets(code: string): string {
    let offsets = Array.from(code.matchAll(/\d+\s?\([a-z]+\d*\)/g))[0];

    if (!offsets) return code;

    offsets.forEach((x) => {
      let offset = x.toString().replaceAll(" ", "");
      let value = offset.substring(0, offset.indexOf("("));
      let label = offset.substring(
        offset.indexOf("(") + 1,
        offset.indexOf(")")
      );
      console.log(`offset: ${x.toString()}, value: ${value}, label: ${label}`);
      code = code.replaceAll(x.toString(), value + " " + label);
    });

    console.log(offsets);
    return code;
  }

  public tokenfyCode(code: string): Array<string> {
    let tokens = new Array<string>();
    code = this.cleanComments(code).replaceAll(",", " ");
    let lines = code.split("\n");

    for (let i = 0; i < lines.length; i++) {
      let linetokens = lines[i].replace(/\r?\n|\r/g, "").split(" ");
      linetokens.find((x) =>
        x === "" ? linetokens.splice(linetokens.indexOf(x), 1) : x
      );
      tokens.push(...linetokens);
    }

    return tokens;
  }

  public assemble(code: string): string {
    //stringify the code, remove comments, remove new lines, split by spaces
    //let tokens = this.tokenfyCode(code);

    code = this.cleanComments(code)
      .replaceAll("\t", "")
      .replaceAll("    ", "")
      .replaceAll(",", " ");
    code = this.treatOffsets(code);
    console.log(JSON.stringify(code));
    let lines = code.split("\n");

    let machineCode = "";
    let PC: BinaryNumber = new BinaryNumber("0x00400000"); //TODO: verify this value (PC starts at 0x00400000)?

    for (let i = 0; i < lines.length; i++) {
      let tokens = lines[i].split(" ");
      let instruction: string = "";
      if (tokens[0] === "") continue;

      switch (tokens[0].toLowerCase()) {
        case "add":
          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for add instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction = "000000";
          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100000"; //function code funct

          break;

        case "addi":
          instruction = "001000";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for addi instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "addiu":
          instruction = "001001";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for addiu instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "addu":
          instruction = "000000";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for addu instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100001"; //function code funct

          break;

        case "and":
          instruction = "000000";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for and instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100100"; //function code funct

          break;

        case "andi":
          instruction = "001100";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for andi instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "beq":
          instruction = "000100";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for beq instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[1]); //source register rs
          instruction += this.assembleRegister(tokens[2]); //source register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "bne":
          instruction = "000101";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for bne instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[1]); //source register rs
          instruction += this.assembleRegister(tokens[2]); //source register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "j":
          instruction = "000010";

          if (tokens.length < 2)
            this.log.error(
              `[Assembler] Invalid number of arguments for j instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += new BinaryNumber(tokens[1]).getBinaryValue(26); //immediate value in binary

          break;

        case "jal":
          instruction = "000011";

          if (tokens.length < 2)
            this.log.error(
              `[Assembler] Invalid number of arguments for jal instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += new BinaryNumber(tokens[1]).getBinaryValue(26); //immediate value in binary

          break;

        case "jr":
          instruction = "000000";

          if (tokens.length < 2)
            this.log.error(
              `[Assembler] Invalid number of arguments for jr instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[1]); //source register rs
          instruction += "000000000000000"; //shift amount shamt
          instruction += "001000"; //function code funct

          break;

        case "lui":
          instruction = "001111";

          if (tokens.length < 3)
            this.log.error(
              `[Assembler] Invalid number of arguments for lui instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += "00000"; //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[2]).getBinaryValue(16); //immediate value in binary

          break;

        case "nor":
          instruction = "000000";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for nor instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100111"; //function code funct

          break;

        case "or":
          instruction = "000000";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for or instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100101"; //function code funct

          break;

        case "lw":
          instruction = "100011";

          if (tokens.length < 3)
            this.log.error(
              `[Assembler] Invalid number of arguments for lw instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[3]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[2]).getBinaryValue(16); //offset value

          break;

        case "sw":
          instruction = "101011";

          if (tokens.length < 3)
            this.log.error(
              `[Assembler] Invalid number of arguments for sw instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[3]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[2]).getBinaryValue(16); //offset value

          break;

        case "ori":
          instruction = "001101";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for ori instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "slt":
          instruction = "000000";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for slt instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "101010"; //function code funct

          break;

        case "slti":
          instruction = "001010";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for slti instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "sltiu":
          instruction = "001011";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for sltiu instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "sltu":
          instruction = "000000";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for sltu instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "101011"; //function code funct

          break;

        case "sub":
          instruction = "000000";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for sub instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100010"; //function code funct

          break;

        case "subu":
          instruction = "000000";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for subu instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100011"; //function code funct

          break;

        case "xor":
          instruction = "000000";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for xor instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100110"; //function code funct

          break;

        case "xori":
          instruction = "001110";

          if (tokens.length < 4)
            this.log.error(
              `[Assembler] Invalid number of arguments for xori instruction!`,
              ErrorType.ASSEMBLER
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;
      }

      PC.addNumber(4); //increment PC by 4 TODO: check if this is correct
      machineCode += new BinaryNumber("0b" + instruction).toHex(8) + " ";
    }

    return machineCode;
  }

  private assembleRegister(register: string): string {
    if (register.includes("$") === false) {
      switch (register.toLowerCase()) {
        case "zero":
          return "00000";

        case "at":
          return "00001";

        case "v0":
          return "00010";

        case "v1":
          return "00011";

        case "a0":
          return "00100";

        case "a1":
          return "00101";

        case "a2":
          return "00110";

        case "a3":
          return "00111";

        case "t0":
          return "01000";

        case "t1":
          return "01001";

        case "t2":
          return "01010";

        case "t3":
          return "01011";

        case "t4":
          return "01100";

        case "t5":
          return "01101";

        case "t6":
          return "01110";

        case "t7":
          return "01111";
      }
    }

    let reg = register.replace("$", "");
    let regNumber = Number.parseInt(reg);
    if (regNumber < 0 || regNumber > 31) {
      throw new Error(`[Assembler] Invalid register number!`);
    }
    return regNumber.toString(2).padStart(5, "0");
  }
}
