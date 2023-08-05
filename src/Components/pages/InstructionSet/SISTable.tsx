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
import InstructionSetPage from "./InstructionSet";

export default function SISTable()
{
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
                {InstructionSetPage.Descriptions.filter(x => x.level == 0).map(x => {
                    return (<Tr>
                        <Td>{x.name}</Td>
                        <Td>{x.operation}</Td>
                        <Td>
                          {x.description}
                        </Td>
                      </Tr>)
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </>
      );
}