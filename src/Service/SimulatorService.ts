import BinaryNumber from "../Hardware/BinaryNumber";

export default class SimulatorService {
  public editorValue: string = "";
  public assemblyCode: string = "";

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

  private convertBinaryToHex(value: string): string {
    let hex = Number.parseInt(value, 2).toString(16);
    return "0x" + (hex.length === 1 ? "0" + hex : hex);
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

    code = this.cleanComments(code).replaceAll(",", " ");
    let lines = code.split("\n");

    let machineCode = "";

    for (let i = 0; i < lines.length; i++) {
      let tokens = lines[i].split(" ");
      let instruction: string = "";
      if (tokens[0] === "") continue;

      switch (tokens[0].toLowerCase()) {
        case "add":
          if (tokens.length < 4)
            throw new Error(
              `[Assembler] Invalid number of arguments for add instruction!`
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
            throw new Error(
              `[Assembler] Invalid number of arguments for addi instruction!`
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "addiu":
          instruction = "001001";
          break;

        case "addu":
          instruction = "000000";
          break;

        case "and":
          instruction = "000000";
          break;

        case "andi":
          instruction = "001100";
          break;

        case "lui":
          instruction = "001111";
          break;

        case "nor":
          instruction = "000000";
          break;

        case "or":
          instruction = "000000";
          break;

        case "ori":
          instruction = "001101";
          break;

        case "slt":
          instruction = "000000";
          break;

        case "slti":
          instruction = "001010";
          break;

        case "sltiu":
          instruction = "001011";
          break;

        case "sltu":
          instruction = "000000";
          break;

        case "sub":
          instruction = "000000";
          break;

        case "subu":
          instruction = "000000";
          break;

        case "xor":
          instruction = "000000";
          break;

        case "xori":
          instruction = "001110";
          break;
      }

      machineCode += new BinaryNumber("0b" + instruction).toHex(8) + " ";
    }
    // let code2 = code.split(" ");
    // for (let i = 0; i < code2.length; i++) {
    //   code2[i] = this.convertBinaryToHex(code2[i]);
    // }

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
