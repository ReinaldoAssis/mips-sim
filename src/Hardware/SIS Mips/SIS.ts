import TemplateProcessor from "../TemplatePorcessor";

export default class SISMIPS extends TemplateProcessor {

  public refname : string = "sis"

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
    "j",
    "jal",
    "jr",
    "call",
  ];

  public availableRegisters: Array<string> = [
    "00000", // $zero
    "00010", // $v0
    "00011", // $v1
    "00100", // $a0
    "00101", // $a1
    "01000", // $t0
    "01001", // $t1
    "01010", // $t2
    "01011", // $t3
    "11111" // $ra
  ]

}