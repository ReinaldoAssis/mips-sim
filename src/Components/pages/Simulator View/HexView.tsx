import { Button, Grid, GridItem, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { useEffect } from "react";
import { IoIosDownload } from "react-icons/io";
import SharedData, { Instruction } from "../../../Service/SharedData";
import SimulatorService from "../../../Service/SimulatorService";

export function HexDisplay({n,i}:{n:number,i:Instruction}){
    return (<>
        <GridItem key={n} w='100%' h='10' colSpan={1}><Text color={"blue.500"} as="b">{n}</Text></GridItem>
        <GridItem key={n+1} w='100%' h='10' colSpan={3}><Text color={"pink.400"} as="b" marginLeft={10}>0x{i.memAddress.toString(16).padStart(8,"0")}</Text></GridItem>
        <GridItem key={n+2} w='100%' h='10' colSpan={2}><Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0xff000000) >> 24 & 0xff).toString(16).padStart(2,"0")}</Text></GridItem>
        <GridItem key={n+3} w='100%' h='10' colSpan={2}><Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x00ff0000) >> 16 & 0xff).toString(16).padStart(2,"0")}</Text></GridItem>
        <GridItem key={n+4} w='100%' h='10' colSpan={2}><Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x0000ff00) >> 8 & 0xff).toString(16).padStart(2,"0")}</Text></GridItem>
        <GridItem key={n+5} w='100%' h='10' colSpan={2}><Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x000000ff) & 0xff).toString(16).padStart(2,"0")}</Text></GridItem>
        <GridItem key={n+6} w='100%' h='10' colSpan={5}><Text color={"purple.500"} as="b" marginLeft={10}>{i.humanCode}</Text></GridItem>
    </>)
}

function HexView({program} : {program : Array<Instruction>}){
    // const simservice = SimulatorService.getInstance();
    let shared  : SharedData = SharedData.instance;

    function downloadHex() 
    {
        let hexString = "";
        program.forEach(i=>{
            hexString += `0x${i.machineCode.toString(16)}\n`
        });
        const element = document.createElement("a");
        const file = new Blob([hexString], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "program.txt";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    return <>
    <Button leftIcon={<IoIosDownload/>} onClick={() => downloadHex()}>Download Hex</Button>
        <Grid templateColumns='repeat(17, 50px)' gap={0} style={{marginTop:15}} >
       {program.map((i,n) => {
         return <HexDisplay key={n} n={n} i={i} />
       })}
    </Grid>
    {shared.program.length == 0 ? <Text>Your assembled program will show up here.</Text> : <></>}
    </>
}

export default React.memo(HexView);
