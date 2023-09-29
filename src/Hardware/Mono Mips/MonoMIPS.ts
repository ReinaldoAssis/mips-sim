import TemplateProcessor from "../TemplatePorcessor";

export default class MonoMIPS extends TemplateProcessor {

  public refname : string = "mono"


  // push and pop are not added because they are pseudo instructions
  // the assembler converts them to addi and sw/lw
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

}