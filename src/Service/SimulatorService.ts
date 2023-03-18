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

  public assemble(code: string): string {
    //stringify the code, remove comments, remove new lines, split by spaces
    let tokens = this.cleanComments(code)
      .replace(/\r?\n|\r/g, "")
      .split(" ");

    for (let i = 0; i < tokens.length; i++) {
      console.log(JSON.stringify(tokens[i].toLowerCase()));
      switch (tokens[i].toLowerCase()) {
        case "add":
          tokens[i] = "100000";
          break;

        case "addu":
          tokens[i] = "100001";
          break;

        case "addi":
          tokens[i] = "001000";
          break;

        case "addiu":
          tokens[i] = "001001";
          break;

        case "and":
          tokens[i] = "100100";
          break;

        case "andi":
          tokens[i] = "001100";
          break;

        case "div":
          tokens[i] = "011010";
          break;

        case "divu":
          tokens[i] = "011011";
          break;

        case "mult":
          tokens[i] = "011000";
          break;

        case "multu":
          tokens[i] = "011001";
          break;

        case "nor":
          tokens[i] = "100111";
          break;

        case "or":
          tokens[i] = "100101";
          break;

        case "ori":
          tokens[i] = "001101";
          break;

        case "sll":
          tokens[i] = "000000";
          break;

        case "sllv":
          tokens[i] = "000100";
          break;

        case "sra":
          tokens[i] = "000011";
          break;

        case "srav":
          tokens[i] = "000111";
          break;

        case "srl":
          tokens[i] = "000010";
          break;

        case "srlv":
          tokens[i] = "000110";
          break;

        case "sub":
          tokens[i] = "100010";
          break;

        case "subu":
          tokens[i] = "100011";
          break;

        case "xor":
          tokens[i] = "100110";
          break;

        case "xori":
          tokens[i] = "001110";
          break;

        case "lhi":
          tokens[i] = "011001";
          break;

        case "llo":
          tokens[i] = "011000";
          break;

        case "slt":
          tokens[i] = "101010";
          break;

        case "sltu":
          tokens[i] = "101001";
          break;

        case "slti":
          tokens[i] = "001010";
          break;

        case "sltiu":
          tokens[i] = "001001";
          break;

        case "beq":
          tokens[i] = "000100";
          break;

        case "bgtz":
          tokens[i] = "000111";
          break;

        case "blez":
          tokens[i] = "000110";
          break;

        case "bne":
          tokens[i] = "000101";
          break;

        case "j":
          tokens[i] = "000010";
          break;

        case "jal":
          tokens[i] = "000011";
          break;

        case "jalr":
          tokens[i] = "001001";
          break;

        case "jr":
          tokens[i] = "001000";
          break;

        case "lb":
          tokens[i] = "100000";
          break;

        case "lbu":
          tokens[i] = "100100";
          break;

        case "lh":
          tokens[i] = "100001";
          break;

        case "lhu":
          tokens[i] = "100101";
          break;

        case "lw":
          tokens[i] = "100011";
          break;

        case "sb":
          tokens[i] = "101000";
          break;

        case "sh":
          tokens[i] = "101001";
          break;

        case "sw":
          tokens[i] = "101011";
          break;

        case "mfhi":
          tokens[i] = "010000";
          break;

        case "mflo":
          tokens[i] = "010010";
          break;

        case "mthi":
          tokens[i] = "010001";
          break;

        case "mtlo":
          tokens[i] = "010011";
          break;

        default:
          // handle invalid input
          break;

        // register

        case "$zero":
          tokens[i] = "00000";
          break;

        case "$at":
          tokens[i] = "00001";
          break;

        case "$v0":
          tokens[i] = "00010";
          break;

        case "$v1":
          tokens[i] = "00011";
          break;

        case "$a0":
          tokens[i] = "00100";
          break;

        case "$a1":
          tokens[i] = "00101";
          break;

        case "$a2":
          tokens[i] = "00110";
          break;

        case "$a3":
          tokens[i] = "00111";
          break;

        case "$t0":
          tokens[i] = "01000";
          break;

        case "$t1":
          tokens[i] = "01001";
          break;

        case "$t2":
          tokens[i] = "01010";
          break;

        case "$t3":
          tokens[i] = "01011";
          break;

        case "$t4":
          tokens[i] = "01100";
          break;

        case "$t5":
          tokens[i] = "01101";
          break;

        case "$t6":
          tokens[i] = "01110";
          break;

        case "$t7":
          tokens[i] = "01111";
          break;
      }
    }

    code = tokens.join(" ");

    return code;
  }
}
