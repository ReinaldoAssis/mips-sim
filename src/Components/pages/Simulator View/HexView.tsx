import { Grid, GridItem, Text } from "@chakra-ui/react";
import React from "react";
import { useEffect } from "react";
import { Instruction } from "../../../Service/SharedData";
import SimulatorService from "../../../Service/SimulatorService";

function HexView({program} : {program : Array<Instruction>}){
    let simservice = SimulatorService.getInstance();

    // useEffect(()=>{
    //     program.forEach(i=>{
    //         console.log(i.memAddress,"0x"+i.machineCode.toString(16).padStart(8,"0"),i.humanCode);
    //         let n = (i.machineCode & 0xff000000) >> 24
    //         console.log(i.memAddress,"13x"+n.toString(16).padStart(2,"0"),i.humanCode)
    //     })
    // }, [program])

    return <Grid templateColumns='repeat(17, 40px)' gap={2} style={{marginTop:15}} >
       {program.map((i,n) => {
         return (<>
         <GridItem w='100%' h='10' colSpan={1}><Text color={"blue.500"} as="b">{n}</Text></GridItem>
         <GridItem w='100%' h='10' colSpan={3}><Text color={"pink.400"} as="b" marginLeft={10}>{i.memAddress}</Text></GridItem>
         <GridItem w='100%' h='10' colSpan={2}><Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0xff000000) >> 24 & 0xff).toString(16).padStart(2,"0")}</Text></GridItem>
         <GridItem w='100%' h='10' colSpan={2}><Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x00ff0000) >> 16 & 0xff).toString(16).padStart(2,"0")}</Text></GridItem>
         <GridItem w='100%' h='10' colSpan={2}><Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x0000ff00) >> 8 & 0xff).toString(16).padStart(2,"0")}</Text></GridItem>
         <GridItem w='100%' h='10' colSpan={2}><Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x000000ff) & 0xff).toString(16).padStart(2,"0")}</Text></GridItem>
         <GridItem w='100%' h='10' colSpan={5}><Text color={"purple.500"} as="b" marginLeft={10}>{i.humanCode}</Text></GridItem>
     </>)
       })}
    </Grid>
}

export default React.memo(HexView);

{/* <div style={{display:"flex"}}>
         <Text as="b">{n}</Text>
         <Text as="b" marginLeft={10}>{i.memAddress}</Text>
         <Text as="b" marginLeft={10}>0x{((i.machineCode & 0xff000000) >> 24 & 0xff).toString(16).padStart(2,"0")}</Text>
         <Text as="b" marginLeft={10}>0x{((i.machineCode & 0x00ff0000) >> 16 & 0xff).toString(16).padStart(2,"0")}</Text>
         <Text as="b" marginLeft={10}>0x{((i.machineCode & 0x0000ff00) >> 8 & 0xff).toString(16).padStart(2,"0")}</Text>
         <Text as="b" marginLeft={10}>0x{((i.machineCode & 0x000000ff) & 0xff).toString(16).padStart(2,"0")}</Text>
         <Text as="b" marginLeft={10}>{i.humanCode}</Text>
     </div> */}