import { Button, Grid, GridItem, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { useEffect } from "react";
import { IoIosDownload } from "react-icons/io";
import { Instruction } from "../../../Service/SharedData";
import SimulatorService from "../../../Service/SimulatorService";

export function HexDisplay({n,i}:{n:number,i:Instruction}){
    return (<>
        <GridItem w='100%' h='10' colSpan={1}><Text color={"blue.500"} as="b">{n}</Text></GridItem>
        <GridItem w='100%' h='10' colSpan={3}><Text color={"pink.400"} as="b" marginLeft={10}>0x{i.memAddress.toString(16).padStart(8,"0")}</Text></GridItem>
        <GridItem w='100%' h='10' colSpan={2}><Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0xff000000) >> 24 & 0xff).toString(16).padStart(2,"0")}</Text></GridItem>
        <GridItem w='100%' h='10' colSpan={2}><Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x00ff0000) >> 16 & 0xff).toString(16).padStart(2,"0")}</Text></GridItem>
        <GridItem w='100%' h='10' colSpan={2}><Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x0000ff00) >> 8 & 0xff).toString(16).padStart(2,"0")}</Text></GridItem>
        <GridItem w='100%' h='10' colSpan={2}><Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x000000ff) & 0xff).toString(16).padStart(2,"0")}</Text></GridItem>
        <GridItem w='100%' h='10' colSpan={5}><Text color={"purple.500"} as="b" marginLeft={10}>{i.humanCode}</Text></GridItem>
    </>)
}

function HexView({program} : {program : Array<Instruction>}){
    let simservice = SimulatorService.getInstance();

    function downloadHex() 
    {
        let hexString = "";
        program.forEach(i=>{
            hexString += `0x${i.machineCode.toString(16)}\n`
        });
        const element = document.createElement("a");
        const file = new Blob([hexString], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "hex.txt";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    return <>
    <Button leftIcon={<IoIosDownload/>} onClick={() => downloadHex()}>Download Hex</Button>
        <Grid templateColumns='repeat(17, 50px)' gap={0} style={{marginTop:15}} >
       {program.map((i,n) => {
         return <HexDisplay n={n} i={i} />
       })}
    </Grid>
    </>
}

export default React.memo(HexView);
