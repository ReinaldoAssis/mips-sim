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

export default class InstructionSetPage extends React.Component<{}> {
  render() {
    return (
      <>
        <Heading style={{ marginTop: 10, marginBottom: 20 }} size="md">
          Simplified Instruction Set
        </Heading>

        <Flex gap={2} style={{ marginBottom: 10 }}>
          <Heading size="sm">Registers:</Heading>
          <Badge>ZERO</Badge>
          <Badge>PC</Badge>
          <Badge colorScheme="green">T0</Badge>
          <Badge colorScheme="green">T1</Badge>
          <Badge colorScheme="green">T2</Badge>
          <Badge colorScheme="green">T3</Badge>
          <Badge colorScheme="red">A0</Badge>
          <Badge colorScheme="red">A1</Badge>
          <Badge colorScheme="red">RA</Badge>
          <Badge colorScheme="purple">V0</Badge>
          <Badge colorScheme="purple">V1</Badge>
          {/* v0,v1,a0,a1,t0,t1,t2,t3,ra,pc,zero */}
        </Flex>
        <TableContainer>
          <Table
            variant="simple"
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.1)",
            }}
          >
            <TableCaption>Instructions for the SIS Model</TableCaption>
            <Thead>
              <Tr>
                <Th>Instruction</Th>
                <Th>Operation</Th>
                <Th>Description</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>ADD</Td>
                <Td>A = B + C</Td>
                <Td>
                  The result of the operation B + C is stored in the register A
                </Td>
              </Tr>
              <Tr>
                <Td>ADDI</Td>
                <Td>A = B + Imm</Td>
                <Td>
                  Sum between B register and the immediate value is stored in
                  the A register
                </Td>
              </Tr>
              <Tr>
                <Td>SUB</Td>
                <Td>A = B - C</Td>
                <Td>
                  The result of the operation B - C is stored in the register A
                </Td>
              </Tr>
              <Tr>
                <Td>AND</Td>
                <Td>A = B ^ C</Td>
                <Td>
                  AND bitwise operation between B and C is stored in the A
                  register
                </Td>
              </Tr>
              <Tr>
                <Td>OR</Td>
                <Td>A = B v C</Td>
                <Td>
                  OR bitwise operation between B and C is stored in the A
                  register
                </Td>
              </Tr>
              <Tr>
                <Td>SLT</Td>
                <Td>A = B ^ C</Td>
                <Td>
                  Set Less Than (SLT) sets the A register to 1 if B is less than
                  C, otherwise it sets A to 0
                </Td>
              </Tr>
              <Tr>
                <Td>CALL 0</Td>
                <Td>Halt</Td>
                <Td>
                  Tells the processor to stop executing instructions and halt
                </Td>
              </Tr>
              <Tr>
                <Td>CALL 1</Td>
                <Td>print $v0</Td>
                <Td>Dumps the value of the $v0 register to the console</Td>
              </Tr>
              <Tr>
                <Td>LW</Td>
                <Td>A = offset(B)</Td>
                <Td>
                  Loads the value of the memory address stored in the B register
                  + the offset into the A register
                </Td>
              </Tr>
              <Tr>
                <Td>ST</Td>
                <Td>offset(B) = A</Td>
                <Td>
                  Stores the value of the A register into the memory address
                  present in the B register + the offset
                </Td>
              </Tr>
              <Tr>
                <Td>BEQ</Td>
                <Td>If A == B goto C</Td>
                <Td>
                  Branches to the label C if the value of the A register is
                  equal to the value of the B register
                </Td>
              </Tr>
              <Tr>
                <Td>BNE</Td>
                <Td>If A != B goto C</Td>
                <Td>
                  Branches to the label C if the value of the A register is
                  different to the value of the B register
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </>
    );
  }
}
