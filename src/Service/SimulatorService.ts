import BinaryNumber from "../Hardware/BinaryNumber";
import Logger, { ErrorType } from "./Logger";
import SharedData from "./SharedData";

// Label type
type Label = {
  name: string;
  address: string;
};

export default class SimulatorService {
  public editorValue: string = "";
  public assembledCode: string = "";
  private log: Logger = Logger.instance;
  private share: SharedData = SharedData.instance;

  public currentAddr = new BinaryNumber(this.share.pcStart + "");
  public currentCodeInstruction: string = "";

  // an array containing all the instructions names
  private instruction_set = [
    "add",
    "addi",
    "addiu",
    "addu",
    "and",
    "andi",
    "beq",
    "bne",
    "lui",
    "lw",
    "nor",
    "or",
    "ori",
    "slt",
    "slti",
    "sltiu",
    "sltu",
    "sw",
    "sub",
    "subu",
    "xor",
    "xori",
    "j",
    "jal",
    "jr",
    "sll",
    "sllv",
    "sra",
    "srav",
    "srl",
    "srlv",
    "div",
    "divu",
    "mult",
    "multu",
    "mfhi",
    "mflo",
    "mthi",
    "call",
  ];

  public register_prefix = "$";

  private static instance: SimulatorService;
  private constructor() {
    // ...
  }

  // Singleton pattern to avoid multiple instances of the service
  // @returns {SimulatorService} The instance of the service
  public static getInstance(): SimulatorService {
    if (!SimulatorService.instance) {
      SimulatorService.instance = new SimulatorService();
    }
    return SimulatorService.instance;
  }

  // clear all comments from the code
  // @param {string} code - The code to be cleaned
  public clearComments(code: string): string {
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

  // clear all special characters from the code
  public clearSpecialChars(code: string): string {
    let temp = code
      .replaceAll("\t", "")
      .replaceAll("    ", "")
      .replaceAll(",", " ");

    return temp.replaceAll("  ", " ");
  }

  // treat the offsets in the code, like "4 (label)"
  // @param {string} code - The code to be treated
  public treatLabelOffsets(code: string): string {
    // regex to find offsets such as "4 (label)" and "4(label)"
    let offsets = Array.from(code.matchAll(/\d+\s?\([a-z]+\d*\)/g))[0];

    if (!offsets) return code; // if there are no offsets, return the code

    offsets.forEach((x) => {
      // treat the offset to separate the value from the label
      let offset = x.toString().replaceAll(" ", "");
      let value = offset.substring(0, offset.indexOf("("));
      let label = offset.substring(
        offset.indexOf("(") + 1,
        offset.indexOf(")")
      );

      // replace the offset with the value and the label
      // this is what instructions expect to find
      code = code.replaceAll(x.toString(), value + " " + label);
    });

    return code;
  }

  // treat the offsets in the code, like "4 ($t0)"
  // @param {string} code - The code to be treated
  public treatOffsets(code: string): string {
    let offsets = Array.from(code.matchAll(/\d+\s?\(\$\w+\d*\)/g));
    if (!offsets) return code;

    offsets.forEach((x) => {
      // treat the offset to separate the value from the register
      let offset = x.toString().replaceAll(" ", "");
      let value = offset.substring(0, offset.indexOf("("));
      let reg = offset.substring(offset.indexOf("(") + 1, offset.indexOf(")"));

      // replace the offset with the value and the label
      // this is what instructions expect to find
      code = code.replaceAll(x.toString(), value + " " + reg);
    });

    return code;
  }

  /* TODO: DESCRIPTION */
  public treatLabels(code: string): string {
    // regex to find labels such as "label:"
    let labels = code.match(/^\w+:/gm);

    if (!labels) return code; // if there are no labels, return the code

    // array to store the labels and their addresses
    let addrlabels: Array<Label> = new Array<Label>();

    // add all existing labels to the array with an initial addr of -1
    labels.forEach((x) => {
      //separate the value from the label
      addrlabels.push({ name: x.toString().replace(":", ""), address: "-1" });
    });

    code = this.clearComments(code);
    code = this.clearSpecialChars(code);

    let lines = code.split("\n");
    let PC: BinaryNumber = new BinaryNumber("0x00400000"); //TODO: verify this value (PC starts at 0x00400000)?

    // for each line, check if it's an instruction or a label
    for (let i = 0; i < lines.length; i++) {
      let tokens = lines[i].split(" ");

      // if the line is empty, skip it
      if (tokens[0] === "") continue;

      // if it's an instruction, add 4 to the PC
      if (this.instruction_set.includes(tokens[0].toLowerCase())) {
        PC.addNumber(4);
      }
      // if it's a label, save the PC value
      else {
        let islabel = addrlabels.find(
          (x) => x.name === tokens[0].replace(":", "")
        );

        if (islabel !== undefined) {
          islabel.address = PC.getBinaryValue(26); //sets the address of the label with a padding of 26 bits
        }
      }
    }

    //removes the labels definitions from the code (such as "label:")
    labels.forEach((x) => (code = code.replaceAll(x.toString(), "")));
    //replaces the labels with their addresses
    addrlabels.forEach(
      (x) =>
        (code = code.replaceAll(
          new RegExp("\\b" + x.name + "\\b", "gm"),
          x.address
        ))
    );

    // this.found_labels = addrlabels;

    return code;
  }

  private computeBrenchOffset(token: string, pc: BinaryNumber): string {
    let instruction = "";
    if (!token.toLowerCase().includes("0x")) {
      let offset = new BinaryNumber("0b" + token); //the label is already in binary

      offset = BinaryNumber.sub(offset.value, pc.value + 4);
      //offset.value = offset.value / 4;

      console.log(
        `beq offset: ${offset.getBinaryValue(16)} decimal: ${offset.value}`
      );

      instruction += offset.getBinaryValue(16);
    } else {
      //if it's not a label, parse it as a number
      //the number is treated as already the offset, so the calculation is not necessary
      let offset = new BinaryNumber(token);

      instruction += offset.getBinaryValue(16);
    }

    return instruction;
  }

  private checkInvalidLabel(label: string) {
    if (new RegExp("/[a-zA-Z]/g").test(label)) {
      this.log.error(
        `Couldn't find label ${label}`,
        this.currentCodeInstruction,
        0,
        this.currentAddr.value,
        -1,
        ErrorType.InvalidLabel
      );
    }
  }

  // assemble the code to machine code
  // @param {string} code - The code to be assembled
  // @returns {string} The machine code
  public assemble(code: string): string {
    // treats the code to be assembled
    code = this.clearComments(code);
    code = this.clearSpecialChars(code);
    code = this.treatLabelOffsets(code);
    code = this.treatOffsets(code);

    code = this.treatLabels(code);

    console.log(code);
    console.log("========");
    console.log(JSON.stringify(code));
    console.log("========");

    // split the code into lines
    let lines = code.split("\n");

    // final machine code
    let machineCode = "";
    // let PC: BinaryNumber = new BinaryNumber("0x00400000");

    // one line is converted at a time
    for (let i = 0; i < lines.length; i++) {
      this.currentCodeInstruction = lines[i];

      // split the line into tokens (arguments)
      let tokens = lines[i].split(" ");
      tokens = tokens.filter((x) => x !== "" && x.startsWith("#") == false);
      if (tokens.length == 0) continue;

      // result of the assembly of the line
      let instruction: string = "";

      // if the line is empty, skip it
      if (tokens[0] === "") continue;

      //console.log(`PC = ${PC.toHex()}`);

      // all instructions are dealt with here
      switch (tokens[0].toLowerCase()) {
        case "add":
          if (tokens.length < 4)
            this.log.error(
              "Invalid number of arguments for ADD instruction",
              tokens.join(" "),
              0,
              this.currentAddr.value,
              -1,
              ErrorType.InvalidNumberOfArguments
            );

          instruction = "000000"; //opcode
          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100000"; //function code funct

          break;

        case "addi":
          instruction = "001000";

          if (tokens.length < 4 || tokens.length > 4)
            this.log.error(
              `Invalid number of arguments for ADDI instruction (expected 3, got ${
                tokens.length - 1
              })`,
              tokens.join(" "),
              0,
              this.currentAddr.value,
              -1,
              ErrorType.InvalidNumberOfArguments
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary
          

          break;

        case "addiu":
          instruction = "001001";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for addiu instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "addu":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for addu instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100001"; //function code funct

          break;

        case "mult":
          instruction = "000000";
          instruction += this.assembleRegister(tokens[1]); //source register rs
          instruction += this.assembleRegister(tokens[2]); //source register rt
          instruction += "0000000000"; //shift amount and rd are 0
          instruction += "011000"; //function code funct

        break;

        case "mfhi":
          instruction = "000000";
          instruction += "00000000000"; //rs, rt are 0
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000";
          instruction += "010000"; //function code funct

        break;

        case "mflo":
          instruction = "000000";
          instruction += "00000000000"; //rs, rt are 0
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000";
          instruction += "010010"; //function code funct

        break;

        case "and":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for and instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100100"; //function code funct

          break;

        case "andi":
          instruction = "001100";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for andi instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "beq":
          instruction = "000100";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for beq instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[1]); //source register rs
          instruction += this.assembleRegister(tokens[2]); //source register rt

          //calculate the offset
          //the treatlabels function already converted the label to its address
          //so we just need to calculate the offset

          //but first we need to make some checks
          //check if its number or label, only hex are allowed as numbers

          instruction += this.computeBrenchOffset(tokens[3], this.currentAddr);

          break;

        case "bne":
          instruction = "000101";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for bne instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[1]); //source register rs
          instruction += this.assembleRegister(tokens[2]); //source register rt

          instruction += this.computeBrenchOffset(tokens[3], this.currentAddr);

          break;

        case "j":
          instruction = "000010";

          // if (tokens.length < 2)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for j instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          this.checkInvalidLabel(tokens[1]);

          instruction += tokens[1]; // the value tokens[1] is the label already in binary

          break;

        case "jal":
          instruction = "000011";

          // if (tokens.length < 2)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for jal instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += new BinaryNumber("0b" + tokens[1]).getBinaryValue(26); //immediate value in binary

          break;

        case "jr":
          instruction = "000000";

          // if (tokens.length < 2)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for jr instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[1]); //source register rs
          instruction += "000000000000000"; //shift amount shamt
          instruction += "001000"; //function code funct

          break;

        case "lui":
          instruction = "001111";

          // if (tokens.length < 3)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for lui instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += "00000"; //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[2]).getBinaryValue(16); //immediate value in binary

          break;

        case "nor":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for nor instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100111"; //function code funct

          break;

        case "or":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for or instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100101"; //function code funct

          break;

        case "lw":
          instruction = "100011";

          // if (tokens.length < 3)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for lw instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[3]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[2]).getBinaryValue(16); //offset value

          break;

        case "sw":
          instruction = "101011";

          // if (tokens.length < 3)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for sw instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[3]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[2]).getBinaryValue(16); //offset value

          break;

        case "ori":
          instruction = "001101";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for ori instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "sll":
          instruction = "000000";
            instruction += "00000"; //source register rs
            instruction += this.assembleRegister(tokens[2]); //destination register rt
            instruction += this.assembleRegister(tokens[1]); //destination register rd
            instruction += new BinaryNumber(tokens[3]).getBinaryValue(5); //shift amount shamt
            instruction += "000000"; //function code funct

        break;

        case "srl":
          instruction = "000000";
            instruction += "00000"; //source register rs
            instruction += this.assembleRegister(tokens[2]); //destination register rt
            instruction += this.assembleRegister(tokens[1]); //destination register rd
            instruction += new BinaryNumber(tokens[3]).getBinaryValue(5); //shift amount shamt
            instruction += "000010"; //function code funct
          break;

        case "slt":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for slt instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "101010"; //function code funct

          break;

        case "slti":
          instruction = "001010";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for slti instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "sltiu":
          instruction = "001011";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for sltiu instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "sltu":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for sltu instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "101011"; //function code funct

          break;

        case "sub":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for sub instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100010"; //function code funct

          break;

        case "subu":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for subu instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100011"; //function code funct

          break;

        case "xor":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for xor instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100110"; //function code funct

          break;

        case "xori":
          instruction = "001110";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for xori instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += new BinaryNumber(tokens[3]).getBinaryValue(16); //immediate value in binary

          break;

        case "call":
          instruction = "111111";

          // if (tokens.length < 2)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for call instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += new BinaryNumber(tokens[1]).getBinaryValue(26); //immediate value in binary

          break;
      }

      // Saves the state so we can look up the instruction later in a readable format
      this.share.program.push({
        humanCode: lines[i],
        index: i,
        machineCode: new BinaryNumber("0b" + instruction),
        memAddress: new BinaryNumber(this.currentAddr.value + ""),
      });

      this.currentAddr.addNumber(4); //increment PC by 4
      machineCode += new BinaryNumber("0b" + instruction).toHex(8) + " ";
      console.log(
        `[Assembler] Assembled instruction ${this.currentCodeInstruction} to ${new BinaryNumber(
          "0b" + instruction
        ).toHex(8)}!`
      );
    }

    this.currentAddr = new BinaryNumber(this.share.pcStart + "");
    return machineCode;
  }

  //assembles a register into a 5-bit binary string
  //@param {register} - the register to assemble
  //@returns {string} - the 5-bit binary string
  private assembleRegister(register: string): string {
    //check if register is a number, if so, return the binary value, otherwise, return the register value
    // if (register.includes("$") === false) {
    let p = this.register_prefix;
    switch (register.toLowerCase()) {
      case p + "zero":
        return "00000";

      case p + "at":
        return "00001";

      case p + "v0":
        return "00010";

      case p + "v1":
        return "00011";

      case p + "a0":
        return "00100";

      case p + "a1":
        return "00101";

      case p + "a2":
        return "00110";

      case p + "a3":
        return "00111";

      case p + "t0":
        return "01000";

      case p + "t1":
        return "01001";

      case p + "t2":
        return "01010";

      case p + "t3":
        return "01011";

      case p + "t4":
        return "01100";

      case p + "t5":
        return "01101";

      case p + "t6":
        return "01110";

      case p + "t7":
        return "01111";

      case p + "ra":
        return "11111";
    }
    // }

    let reg = register.replace("$", "");
    let regNumber = Number.parseInt(reg);
    if (regNumber < 0 || regNumber > 31) {
      this.log.error(
        "Invalid register number",
        register,
        0,
        -1,
        -1,
        ErrorType.InvalidRegister,
        1
      );
    }
    return regNumber.toString(2).padStart(5, "0");
  }

  public instruction_to_binary(str: string): string {
    let b = "";
    let strarr = str.split(" ");
    for (let i = 0; i < strarr.length; i++)
      b += BinaryNumber.parse(strarr[i]).getBinaryValue();

    return b;
  }
}
