import TemplateProcessor from "../TemplatePorcessor";

export default class MonoMIPS extends TemplateProcessor {

  public refname : string = "mono"


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