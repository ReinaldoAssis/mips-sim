import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
} from "@chakra-ui/react";
import {
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/table";
import React from "react";
import SISTable from "./SISTable";
import MonoTable from "./MonoTable";

export type InstructionDescription = {
  name: string;
  operation: string;
  description: string;
  level: number; // 0 = SIS, 1 = Mono
}

export default class InstructionSetPage extends React.Component<{}> {

  public static readonly Descriptions : InstructionDescription[] = [
    {name: "ADD", operation: "Rd = Rs + Rt", description: "Addition", level: 0},
    {name: "ADDI", operation: "Rd = Rs + Imm", description: "Addition with Immediate", level: 0},
    {name: "OR", operation: "Rd = Rs | Rt", description: "Bitwise OR", level: 0},
    {name: "AND", operation: "Rd = Rs & Rt", description: "Bitwise AND", level: 0},
    {name: "SUB", operation: "Rd = Rs - Rt", description: "Subtraction", level: 0},
    {name: "SLT", operation: "Rd = Rs < Rt", description: "Set Less Than", level: 0},
    {name: "SLTI", operation: "Rd = Rs < Imm", description: "Set Less Than Immediate", level: 0},
    {name: "BEQ", operation: "if (Rs == Rt) PC = PC + Imm", description: "Branch if Equal", level: 0},
    {name: "BNE", operation: "if (Rs != Rt) PC = PC + Imm", description: "Branch if Not Equal", level: 0},
    {name: "LW", operation: "Rd = Memory[Rs + Imm]", description: "Load Word", level: 0},
    {name: "SW", operation: "Memory[Rs + Imm] = Rt", description: "Store Word", level: 0},
    {name: "J", operation: "PC = Imm", description: "Jump", level: 0},
    {name: "JR", operation: "PC = Rs", description: "Jump Register", level: 0},
    {name: "JAL", operation: "RA = PC + 4; PC = Imm", description: "Jump and Link", level: 0},
    {name: "CALL 0", operation: "Halt", description: "Halt the program", level: 0},
    {name: "CALL 1", operation: "Print integer Rs", description: "Print the value in Rs as an integer", level: 0},
    {name: "CALL 2", operation: "Print character Rs", description: "Print the value in Rs as a ASCII character", level: 0},
    {name: "CALL 3", operation: "Print integer Rs w/o newline", description: "Print the value in Rs as an integer without a newline", level: 1},
    {name: "CALL 42", operation: "$v0 = Random($a0,$a1)", description: "Random value between $a0 and $a1 in $v0", level: 1},
    {name: "CALL 40", operation: "Screen update", description: "Updates the simulator's screen", level: 1},
    {name: "MUL", operation: "LO = 0:31(Rs * Rt) | HI = 32:64(Rs * Rt)", description: "Multiplication", level: 1},
    {name: "DIV", operation: "HI = Rs / Rt | LO = Rs % Rt", description: "Integer Division", level: 1},
    {name: "MFHI", operation: "Rd = HI", description: "Move from high register", level: 1},
    {name: "MFLO", operation: "Rd = LO", description: "Move from low register", level: 1},
    {name: "SLL", operation: "Rd = Rs << Shamt", description: "Shift Left Logical", level: 1},
    {name: "SRL", operation: "Rd = Rs >> Shamt", description: "Shift Right Logical", level: 1},
    // {name: "SRL", operation: "Rd = Rs >> Shamt", description: "Shift Right Logical", level: 1},
    // {name: "SLI", operation: "Rd = Rs << Imm", description: "Shift Left Immediate", level: 1},
    {name: "PUSH", operation: "Memory[SP] = Rs; SP = SP - 4", description: "Push onto the stack", level: 1},
    {name: "POP", operation: "Rd = Memory[SP]; SP = SP + 4", description: "Pop from the stack", level: 1},



  ];

  render() {
    return (
      <>
        {/* <SISTable/> */}
      <div style={{ marginTop: 20 }}/>
      <MonoTable/>
      </>
    );
  }
}
