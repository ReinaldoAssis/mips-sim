import { Button, GridItem, Text} from "@chakra-ui/react";
import React, { useEffect, useImperativeHandle, useState } from "react";
import SharedData, { Instruction } from "../../../Service/SharedData";
import { ReactComponent as MipsSVG } from "./mips32.svg";

export class HardwareViewService {
    private static _instance : HardwareViewService;
    
}

function InstructionDisplay({n,i}:{n:number,i:Instruction}){
    return (<div style={{position:"absolute", bottom:10}}>
        <Text color={"blue.500"} as="b">{n}</Text>
        <Text color={"pink.400"} as="b" marginLeft={10}>0x{i.memAddress.toString(16).padStart(8,"0")}</Text>
        <Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0xff000000) >> 24 & 0xff).toString(16).padStart(2,"0")}</Text>
        <Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x00ff0000) >> 16 & 0xff).toString(16).padStart(2,"0")}</Text>
        <Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x0000ff00) >> 8 & 0xff).toString(16).padStart(2,"0")}</Text>
        <Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x000000ff) & 0xff).toString(16).padStart(2,"0")}</Text>
        <Text color={"purple.500"} as="b" marginLeft={10}>{i.humanCode}</Text>
    </div>)
}

//{stepFunc, currentI}:{stepFunc:Function, currentI:Instruction|null}
export default function HardwareView() {

    let share = SharedData.instance;

    const [inst, setInst] = useState({humanCode:"",machineCode:0,index:0,memAddress:0})
    

    useEffect(() => {
        // Manipulate the SVG elements here
        const svgPath = document.getElementById("pc-out-imem");
        if (svgPath) {
            svgPath.style.stroke = "blue";
        }

        share.refreshHardwareView = (i : Instruction) => {setInst(i); console.log("receiving", i)};

    }, []);

    return (
        <>
            <InstructionDisplay n={0} i={inst} />
            <MipsSVG style={{ width:"70%", zIndex:0, position:"absolute", left:300, top: -400 }} />
            {/* <Button onClick={() => settest(!test)}>Refreh</Button> */}
        </>
    );
}
