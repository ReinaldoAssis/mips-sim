import {
    Badge,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    useColorModeValue,
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

export default function MonoTable()
{
    return (
        <>
          <Heading style={{ marginTop: 10, marginBottom: 20 }} size="md">
            Monocycle Instruction Set
          </Heading>
  
          <Flex gap={2} style={{ marginBottom: 10 }}>
            <Heading size="sm">Registers:</Heading>
            <Badge>ZERO</Badge>
            <Badge>PC</Badge>
            <Badge>HIGH</Badge>
            <Badge>LOW</Badge>
            <Badge colorScheme="green">T0</Badge>
            <Badge colorScheme="green">T1</Badge>
            <Badge colorScheme="green">T2</Badge>
            <Badge colorScheme="green">T3</Badge>
            <Badge colorScheme="green">T4</Badge>
            <Badge colorScheme="green">T5</Badge>
            <Badge colorScheme="green">T6</Badge>
            <Badge colorScheme="red">A0</Badge>
            <Badge colorScheme="red">A1</Badge>
            <Badge colorScheme="red">A2</Badge>
            <Badge colorScheme="red">A3</Badge>
            <Badge colorScheme="cyan">S0</Badge>
            <Badge colorScheme="cyan">S1</Badge>
            <Badge colorScheme="cyan">S2</Badge>
            <Badge colorScheme="cyan">S3</Badge>
            <Badge colorScheme="cyan">S4</Badge>
            <Badge colorScheme="cyan">S5</Badge>
            <Badge colorScheme="cyan">S6</Badge>
            <Badge colorScheme="red">RA</Badge>
            <Badge colorScheme="red">SP</Badge>
            <Badge colorScheme="purple">V0</Badge>
            <Badge colorScheme="purple">V1</Badge>
            {/* v0,v1,a0,a1,t0,t1,t2,t3,ra,pc,zero */}
          </Flex>
          <TableContainer>
            <Table
              variant="simple"
              style={{
                backgroundColor: useColorModeValue("white", "gray.900"),
                borderRadius: 10,
                boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.1)",
              }}
            >
              <TableCaption>Instructions for the Monocycle Model</TableCaption>
              <Thead>
                <Tr>
                  <Th>Instruction</Th>
                  <Th>Operation</Th>
                  <Th>Description</Th>
                </Tr>
              </Thead>
              <Tbody>
              {InstructionSetPage.Descriptions.filter(x => x.level <= 1).map(x => {
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