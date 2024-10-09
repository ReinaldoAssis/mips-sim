import { Badge, Box, Button, Flex, GridItem, IconButton, position, Stack, Text} from "@chakra-ui/react";
import React, { useEffect, useImperativeHandle, useState } from "react";
import SharedData, { Instruction } from "../../../Service/SharedData";
import WorkerService from "../../../Service/WorkerService";
import { ReactComponent as MipsSVG } from "./mips32.svg";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import {useColorModeValue, useColorMode} from "@chakra-ui/react"

const typeR = ["add", "and", "or", "sll", "slt", "srl", "sub"]
const typeI = ["addi","slti"]

export class HardwareViewService {
    private static _instance : HardwareViewService;
    
}

function InstructionDisplay({n,i}:{n:number,i:Instruction}){
    return (
    
        <Box
      key={n}
      bg="#f0f0f0"
      border="1px solid #ccc"
      borderRadius="4px"
      marginBottom="40px"
      padding="0.5rem 1rem"
      marginLeft="0.5rem"
      _hover={{ bg: "#e0e0e0", cursor: "pointer" }}
      fontFamily="monospace"
      backgroundColor={useColorModeValue("none", "gray.900")}
      borderColor={useColorModeValue("#ccc", "gray.700")}
    >
        <Text color={"blue.500"} as="b">{n}</Text>
        <Text color={"pink.400"} as="b" marginLeft={10}>0x{i.memAddress.toString(16).padStart(8,"0")}</Text>
        <Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0xff000000) >> 24 & 0xff).toString(16).padStart(2,"0")}</Text>
        <Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x00ff0000) >> 16 & 0xff).toString(16).padStart(2,"0")}</Text>
        <Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x0000ff00) >> 8 & 0xff).toString(16).padStart(2,"0")}</Text>
        <Text color={"gray.600"} as="b" marginLeft={10}>0x{((i.machineCode & 0x000000ff) & 0xff).toString(16).padStart(2,"0")}</Text>
        <Text color={"purple.500"} as="b" marginLeft={10}>{i.humanCode}</Text>
        </Box>)
}

//{stepFunc, currentI}:{stepFunc:Function, currentI:Instruction|null}
export default function HardwareView(props:{callExecutableStep:Function}) {

    let share = SharedData.instance;

    const [inst, setInst] = useState({humanCode:"",machineCode:0,index:0,memAddress:0})
    const [state,setState] = useState("typeR")

    const { colorMode } = useColorMode();
  const strokeColor = useColorModeValue("#000000", "#ffffff");
  const fillColor = useColorModeValue("#000000", "#ffffff");

  useEffect(() => {
    // Aplicar stroke para as classes s0, s2, s3, s5
    const strokeClasses = document.querySelectorAll<SVGElement>(".s0, .s2, .s3, .s5, .s7");
    strokeClasses.forEach((element) => {
      element.style.stroke = strokeColor;
    });

    // Aplicar fill para as classes s1, s4
    const fillClasses = document.querySelectorAll<SVGElement>(".s1, .s4");
    fillClasses.forEach((element) => {
      element.style.fill = fillColor;
    });

    const imgElement = document.getElementById("img1");
    if (imgElement) {
        if (colorMode == "dark") imgElement.style.filter = "invert(100%) sepia(100%) saturate(0%) hue-rotate(200deg)";
        else imgElement.style.filter = "invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg)";
    }
        

  }, [colorMode, strokeColor, fillColor]);


    function resetPaint(){
        paintTypeR(colorMode == "light" ? "#000000" : "#ffffff")
        paintJR(colorMode == "light" ? "#000000" : "#ffffff")
        paintMfhiMflo(colorMode == "light" ? "#000000" : "#ffffff","mfhi")
        paintMfhiMflo(colorMode == "light" ? "#000000" : "#ffffff","mflo")
        paintJal(colorMode == "light" ? "#000000" : "#ffffff")
        paintI(colorMode == "light" ? "#000000" : "#ffffff")
        paintSW(colorMode == "light" ? "#000000" : "#ffffff")
        paintLW(colorMode == "light" ? "#000000" : "#ffffff")
        paintBranch(colorMode == "light" ? "#000000" : "#ffffff");
    }

    function paintJal(color:string){
        const svgPath = Array<HTMLElement|null>()
        svgPath.push(document.getElementById("pc-out-im"));
        svgPath.push(document.getElementById("arr-pc-out-im"));
        
        svgPath.push(document.getElementById("pc-in"));
        svgPath.push(document.getElementById("arr-pc-in"));
        svgPath.push(document.getElementById("im-out-ctrl-1"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-1"));
        svgPath.push(document.getElementById("im-out-ctrl-2"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-2"));
        svgPath.push(document.getElementById("writereg"));
        svgPath.push(document.getElementById("arr-writereg"));
        svgPath.push(document.getElementById("arr-ra"));
        svgPath.push(document.getElementById("ra"));
        svgPath.push(document.getElementById("writedata"));
        svgPath.push(document.getElementById("arr-writedata"));
        svgPath.push(document.getElementById("jal-ra"));
        svgPath.push(document.getElementById("arr-jal-ra"));
        svgPath.push(document.getElementById("im-out-shift"));
        svgPath.push(document.getElementById("arr-im-out-shift"));
        svgPath.push(document.getElementById("shift-out-combine"));
        svgPath.push(document.getElementById("arr-shift-out-combine"));
        svgPath.push(document.getElementById("pc-out-add"));
        svgPath.push(document.getElementById("arr-pc-out-add"));
        svgPath.push(document.getElementById("4"));
        svgPath.push(document.getElementById("arr-4"));
        svgPath.push(document.getElementById("pc4"));
        svgPath.push(document.getElementById("arr-pc4"));
        svgPath.push(document.getElementById("Path 148")); // REVISAR
        svgPath.push(document.getElementById("arr-pc4-out-combine"));
        svgPath.push(document.getElementById("jumpaddr"));
        svgPath.push(document.getElementById("arr-jumpaddr"));
        

        svgPath.forEach(x => {
            if(x){
                x.style.stroke = color;
                if(x.id.startsWith("arr")) x.style.fill = color;
                x.style.color = color;
            }
        })
    }

    function paintJ(color:string){
        const svgPath = Array<HTMLElement|null>()
        svgPath.push(document.getElementById("pc-out-im"));
        svgPath.push(document.getElementById("arr-pc-out-im"));
        
        svgPath.push(document.getElementById("pc-in"));
        svgPath.push(document.getElementById("arr-pc-in"));
        svgPath.push(document.getElementById("im-out-ctrl-1"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-1"));
        svgPath.push(document.getElementById("im-out-ctrl-2"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-2"));
      
        svgPath.push(document.getElementById("im-out-shift"));
        svgPath.push(document.getElementById("arr-im-out-shift"));
        svgPath.push(document.getElementById("shift-out-combine"));
        svgPath.push(document.getElementById("arr-shift-out-combine"));
        svgPath.push(document.getElementById("pc-out-add"));
        svgPath.push(document.getElementById("arr-pc-out-add"));
        svgPath.push(document.getElementById("4"));
        svgPath.push(document.getElementById("arr-4"));
        svgPath.push(document.getElementById("pc4"));
        svgPath.push(document.getElementById("arr-pc4"));
        svgPath.push(document.getElementById("Path 148")); // REVISAR
        svgPath.push(document.getElementById("arr-pc4-out-combine"));
        svgPath.push(document.getElementById("jumpaddr"));
        svgPath.push(document.getElementById("arr-jumpaddr"));
        

        svgPath.forEach(x => {
            if(x){
                x.style.stroke = color;
                if(x.id.startsWith("arr")) x.style.fill = color;
                x.style.color = color;
            }
        })
    }

    function paintTypeR(color:string){
        const svgPath = Array<HTMLElement|null>()
        svgPath.push(document.getElementById("pc-out-im"));
        svgPath.push(document.getElementById("arr-pc-out-im"));
        svgPath.push(document.getElementById("im-out-reg1"));
        svgPath.push(document.getElementById("arr-im-out-reg1"));
        svgPath.push(document.getElementById("im-our-reg2"));
        svgPath.push(document.getElementById("arr-im-our-reg2"));
        svgPath.push(document.getElementById("im-out-mux3"));
        svgPath.push(document.getElementById("arr-im-out-mux3"));
        svgPath.push(document.getElementById("writereg"));
        svgPath.push(document.getElementById("arr-writereg"));
        svgPath.push(document.getElementById("data1"));
        svgPath.push(document.getElementById("arr-data1"));
        svgPath.push(document.getElementById("arr-data2"));
        svgPath.push(document.getElementById("data2"));
        svgPath.push(document.getElementById("b"));
        svgPath.push(document.getElementById("arr-b"));
        svgPath.push(document.getElementById("alu-out-mux"));
        svgPath.push(document.getElementById("arr-alu-out-mux"));
        svgPath.push(document.getElementById("writedata-mux1"));
        svgPath.push(document.getElementById("arr-writedata-mux1"));
        svgPath.push(document.getElementById("pc-out-add"));
        svgPath.push(document.getElementById("arr-pc-out-add"));
        svgPath.push(document.getElementById("Mask"));
        svgPath.push(document.getElementById("arr-4"));
        svgPath.push(document.getElementById("pc4"));
        svgPath.push(document.getElementById("arr-pc4"));
        svgPath.push(document.getElementById("mux-pc4-beq-out"));
        svgPath.push(document.getElementById("arr-mux-pc4-beq"));
        svgPath.push(document.getElementById("pc-in"));
        svgPath.push(document.getElementById("arr-pc-in"));
        svgPath.push(document.getElementById("im-out-ctrl-1"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-1"));
        svgPath.push(document.getElementById("im-out-ctrl-2"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-2"));
        svgPath.push(document.getElementById("arr-im-out-reg2"));
        svgPath.push(document.getElementById("mux-pc4-beq"));
        svgPath.push(document.getElementById("arr-writedata"));
        svgPath.push(document.getElementById("writedata"));
        svgPath.push(document.getElementById("arr-mux-pc4-beq"));
        
        svgPath.forEach(x => {
            if(x){
                x.style.stroke = color;
                if(x.id.startsWith("arr")) x.style.fill = color;
            }
        })
    
    }

    function paintJR(color:string){
        const svgPath = Array<HTMLElement|null>()
        svgPath.push(document.getElementById("pc-out-im"));
        svgPath.push(document.getElementById("arr-pc-out-im"));
        svgPath.push(document.getElementById("im-out-reg1"));
        svgPath.push(document.getElementById("arr-im-out-reg1"));
        svgPath.push(document.getElementById("pc-in"));
        svgPath.push(document.getElementById("arr-pc-in"));
        svgPath.push(document.getElementById("im-out-ctrl-1"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-1"));
        svgPath.push(document.getElementById("im-out-ctrl-2"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-2"));
        svgPath.push(document.getElementById("data1"));
        svgPath.push(document.getElementById("arr-data1"));
        svgPath.push(document.getElementById("data1-mux"));
        svgPath.push(document.getElementById("arr-data1-mux"));
        svgPath.push(document.getElementById("Register 1"));

        svgPath.forEach(x => {
            if(x){
                x.style.stroke = color;
                if(x.id.startsWith("arr")) x.style.fill = color;
                x.style.color = color;
            }
        })
    }

    function paintI(color:string){
        const svgPath = Array<HTMLElement|null>()
        svgPath.push(document.getElementById("pc-out-im"));
        svgPath.push(document.getElementById("arr-pc-out-im"));
        svgPath.push(document.getElementById("im-out-reg1"));
        svgPath.push(document.getElementById("arr-im-out-reg1"));
        svgPath.push(document.getElementById("pc-in"));
        svgPath.push(document.getElementById("arr-pc-in"));
        svgPath.push(document.getElementById("im-out-ctrl-1"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-1"));
        svgPath.push(document.getElementById("im-out-ctrl-2"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-2"));
        svgPath.push(document.getElementById("data1"));
        svgPath.push(document.getElementById("arr-data1"));
        svgPath.push(document.getElementById("writereg"));
        svgPath.push(document.getElementById("arr-writereg"));
        svgPath.push(document.getElementById("im-out-mux3"));
        svgPath.push(document.getElementById("arr-im-out-mux3"));
        svgPath.push(document.getElementById("im-out-extend"));
        svgPath.push(document.getElementById("arr-im-out-extend"));
        svgPath.push(document.getElementById("extend-out-alu"));
        svgPath.push(document.getElementById("arr-extend-out-alu"));
        svgPath.push(document.getElementById("arr-b"));
        svgPath.push(document.getElementById("b"));
        svgPath.push(document.getElementById("alu-out-mux"));
        svgPath.push(document.getElementById("arr-alu-out-mux"));
        svgPath.push(document.getElementById("writedata-mux1"));
        svgPath.push(document.getElementById("arr-writedata-mux1"));
        svgPath.push(document.getElementById("arr-writedata"));
        svgPath.push(document.getElementById("writedata"));
        svgPath.push(document.getElementById("pc-out-add"));
        svgPath.push(document.getElementById("arr-pc-out-add"));
        svgPath.push(document.getElementById("Mask"));
        svgPath.push(document.getElementById("arr-4"));
        svgPath.push(document.getElementById("pc4"));
        svgPath.push(document.getElementById("arr-pc4"));
        svgPath.push(document.getElementById("mux-pc4-beq-out"));
        // svgPath.push(document.getElementById("arr-mux-pc4-beq"));

        svgPath.forEach(x => {
            if(x){
                x.style.stroke = color;
                if(x.id.startsWith("arr")) x.style.fill = color;
                x.style.color = color;
            }
        })
    }

    function paintMfhiMflo(color:string, token : string){
        const svgPath = Array<HTMLElement|null>()
        svgPath.push(document.getElementById("pc-out-im"));
        svgPath.push(document.getElementById("arr-pc-out-im"));
        svgPath.push(document.getElementById("pc-in"));
        svgPath.push(document.getElementById("arr-pc-in"));
        svgPath.push(document.getElementById("im-out-ctrl-1"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-1"));
        svgPath.push(document.getElementById("im-out-ctrl-2"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-2"));
        svgPath.push(document.getElementById("writereg"));
        svgPath.push(document.getElementById("arr-writereg"));
        svgPath.push(document.getElementById("im-out-mux3"));
        svgPath.push(document.getElementById("arr-im-out-mux3"));
        svgPath.push(document.getElementById("arr-writedata"));
        svgPath.push(document.getElementById("writedata"));
        svgPath.push(document.getElementById("pc-out-add"));
        svgPath.push(document.getElementById("arr-pc-out-add"));
        svgPath.push(document.getElementById("Mask"));
        svgPath.push(document.getElementById("arr-4"));
        svgPath.push(document.getElementById("pc4"));
        svgPath.push(document.getElementById("arr-pc4"));
        svgPath.push(document.getElementById("mux-pc4-beq-out"));
        
        if(token == "mfhi")
        {
            svgPath.push(document.getElementById("hi-out"));
            svgPath.push(document.getElementById("arr-hi-out"));
        }
        else {
            svgPath.push(document.getElementById("lo-out"));
            svgPath.push(document.getElementById("arr-lo-out"));
        }

        
        // svgPath.push(document.getElementById("arr-mux-pc4-beq"));

        svgPath.forEach(x => {
            if(x){
                x.style.stroke = color;
                if(x.id.startsWith("arr")) x.style.fill = color;
                x.style.color = color;
            }
        })
    }

    function paintSW(color: string){
        const svgPath = Array<HTMLElement|null>()
        svgPath.push(document.getElementById("pc-out-im"));
        svgPath.push(document.getElementById("arr-pc-out-im"));
        svgPath.push(document.getElementById("im-out-reg1"));
        svgPath.push(document.getElementById("arr-im-out-reg1"));
        svgPath.push(document.getElementById("pc-in"));
        svgPath.push(document.getElementById("arr-pc-in"));
        svgPath.push(document.getElementById("im-out-ctrl-1"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-1"));
        svgPath.push(document.getElementById("im-out-ctrl-2"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-2"));
        svgPath.push(document.getElementById("data1"));
        svgPath.push(document.getElementById("arr-data1"));
        svgPath.push(document.getElementById("b"));
        svgPath.push(document.getElementById("arr-b"));
        svgPath.push(document.getElementById("im-out-extend"));
        svgPath.push(document.getElementById("arr-im-out-extend"));
        svgPath.push(document.getElementById("extend-out-alu"));
        svgPath.push(document.getElementById("arr-extend-out-alu"));
        svgPath.push(document.getElementById("alu-out"));
        svgPath.push(document.getElementById("arr-alu-out"));
        svgPath.push(document.getElementById("im-our-reg2"));
        svgPath.push(document.getElementById("arr-im-our-reg2"));
        svgPath.push(document.getElementById("datamem-writedata"));
        svgPath.push(document.getElementById("arr-datamem-writedata"));
        svgPath.push(document.getElementById("data2"));
        svgPath.push(document.getElementById("pc-out-add"));
        svgPath.push(document.getElementById("arr-pc-out-add"));
        svgPath.push(document.getElementById("4"));
        svgPath.push(document.getElementById("arr-4"));
        svgPath.push(document.getElementById("pc4"));
        svgPath.push(document.getElementById("arr-pc4"));
        svgPath.push(document.getElementById("mux-pc4-beq-out"));
        svgPath.push(document.getElementById("arr-mux-pc4-beq-out"));

        svgPath.forEach(x => {
            if(x){
                x.style.stroke = color;
                if(x.id.startsWith("arr")) x.style.fill = color;
                x.style.color = color;
            }
        })
    }

    function paintLW(color: string){
        const svgPath = Array<HTMLElement|null>()
        svgPath.push(document.getElementById("pc-out-im"));
        svgPath.push(document.getElementById("arr-pc-out-im"));
        svgPath.push(document.getElementById("im-out-reg1"));
        svgPath.push(document.getElementById("arr-im-out-reg1"));
        svgPath.push(document.getElementById("pc-in"));
        svgPath.push(document.getElementById("arr-pc-in"));
        svgPath.push(document.getElementById("im-out-ctrl-1"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-1"));
        svgPath.push(document.getElementById("im-out-ctrl-2"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-2"));
        svgPath.push(document.getElementById("data1"));
        svgPath.push(document.getElementById("arr-data1"));
        svgPath.push(document.getElementById("b"));
        svgPath.push(document.getElementById("arr-b"));
        svgPath.push(document.getElementById("im-out-extend"));
        svgPath.push(document.getElementById("arr-im-out-extend"));
        svgPath.push(document.getElementById("extend-out-alu"));
        svgPath.push(document.getElementById("arr-extend-out-alu"));
        svgPath.push(document.getElementById("alu-out"));
        svgPath.push(document.getElementById("arr-alu-out"));
        svgPath.push(document.getElementById("writereg"));
        svgPath.push(document.getElementById("arr-writereg"));
        svgPath.push(document.getElementById("pc-out-add"));
        svgPath.push(document.getElementById("arr-pc-out-add"));
        svgPath.push(document.getElementById("4"));
        svgPath.push(document.getElementById("arr-4"));
        svgPath.push(document.getElementById("pc4"));
        svgPath.push(document.getElementById("arr-pc4"));
        svgPath.push(document.getElementById("mux-pc4-beq-out"));
        svgPath.push(document.getElementById("arr-mux-pc4-beq-out"));
        svgPath.push(document.getElementById("im-out-mux1"));
        svgPath.push(document.getElementById("arr-im-out-mux1"));
        svgPath.push(document.getElementById("readdata"));
        svgPath.push(document.getElementById("arr-readdata"));
        svgPath.push(document.getElementById("writedata-mux1"));
        svgPath.push(document.getElementById("arr-writedata-mux1"));
        svgPath.push(document.getElementById("writedata"));
        svgPath.push(document.getElementById("arr-writedata"));

        svgPath.forEach(x => {
            if(x){
                x.style.stroke = color;
                if(x.id.startsWith("arr")) x.style.fill = color;
                x.style.color = color;
            }
        })
    }

    function paintBranch(color: string)
    {
        const svgPath = Array<HTMLElement|null>()
        svgPath.push(document.getElementById("pc-out-im"));
        svgPath.push(document.getElementById("arr-pc-out-im"));
        svgPath.push(document.getElementById("im-out-reg1"));
        svgPath.push(document.getElementById("arr-im-out-reg1"));
        svgPath.push(document.getElementById("pc-in"));
        svgPath.push(document.getElementById("arr-pc-in"));
        svgPath.push(document.getElementById("im-out-ctrl-1"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-1"));
        svgPath.push(document.getElementById("im-out-ctrl-2"));
        svgPath.push(document.getElementById("arr-im-out-ctrl-2"));
        svgPath.push(document.getElementById("im-our-reg2"));
        svgPath.push(document.getElementById("arr-im-our-reg2"));
        svgPath.push(document.getElementById("data1"));
        svgPath.push(document.getElementById("arr-data1"));
        svgPath.push(document.getElementById("data2"));
        svgPath.push(document.getElementById("arr-data2"));
        svgPath.push(document.getElementById("b"));
        svgPath.push(document.getElementById("arr-b"));
        svgPath.push(document.getElementById("im-out-extend"));
        svgPath.push(document.getElementById("arr-im-out-extend"));
        svgPath.push(document.getElementById("extend-out-pc"));
        svgPath.push(document.getElementById("arr-extend-out-pc"));
        svgPath.push(document.getElementById("arr-beq"));
        svgPath.push(document.getElementById("beq"));
        svgPath.push(document.getElementById("pc4-A"));
        svgPath.push(document.getElementById("arr-pc4-A"));
        svgPath.push(document.getElementById("pc4"));
        svgPath.push(document.getElementById("mux-pc4-beq"));
        svgPath.push(document.getElementById("arr-mux-pc4-beq"));
        svgPath.push(document.getElementById("mux-pc4-beq-out"));
        svgPath.push(document.getElementById("arr-mux-pc4-beq-out"));
        svgPath.push(document.getElementById("pc-out-add"));
        svgPath.push(document.getElementById("arr-pc-out-add"));
        svgPath.push(document.getElementById("4"));
        svgPath.push(document.getElementById("arr-4"));
        svgPath.push(document.getElementById(""));
        svgPath.push(document.getElementById(""));
        svgPath.push(document.getElementById(""));
        svgPath.push(document.getElementById(""));
        svgPath.push(document.getElementById(""));

        svgPath.forEach(x => {
            if(x){
                x.style.stroke = color;
                if(x.id.startsWith("arr")) x.style.fill = color;
                x.style.color = color;
            }
        })
    }
    

    useEffect(() => {
        share.refreshHardwareView = (i : Instruction) => {setInst(i)};

        let token = inst.humanCode.split(" ")[0]
        let color = "#5c21ff"

        resetPaint()
        if (typeR.includes(token))
        {
            setState("typeR")
            paintTypeR(color)

        }

        else if (typeI.includes(token)){
            setState("typeI")
            paintI(color)
        }

        else if (token == "jr"){
            setState("typeR")
            paintJR(color)
        }

        else if (token == "mfhi" || token == "mflo"){
            setState("typeR")
            paintMfhiMflo(color, token)
        }

        else if (token == "jal"){
            setState("typeJ")
            paintJal(color)
        }

        else if (token == "j"){
            setState("typeJ")
            paintJ(color)
        }

        else if (token == "sw"){
            setState("typeI");
            paintSW(color);
        }

        else if (token == "lw"){
            setState("typeI");
            paintLW(color);
        }

        else if( token == "beq" || token == "bne")
        {
            setState("typeI");
            paintBranch(color);
        }

        else{
            resetPaint()
        }

        WorkerService.instance.cpuWorker?.postMessage({command:"mem terminal"})

    }, [inst]);

    return (
        <>
            <Stack direction='row' backgroundColor={useColorModeValue("none", "gray.900")} spacing={4} align='center' position="fixed" bottom={4} zIndex={20}>
                <Button
                    // bg="#dadee3"
                    // border="1px solid #ccc"
                    borderRadius="4px"
                    padding="0.5rem 1rem"
                    // _hover={{ bg: "#c0c0c0" }}
                    // _active={{ bg: "#a9a9a9", transform: "scale(0.95)" }}
                    // transition="background-color 0.2s, transform 0.2s"
                    colorScheme={"teal"}
                    variant="solid"
                    zIndex={20}
                    onClick={() => props.callExecutableStep()}
                >
                    Next
                </Button>
                <InstructionDisplay n={0} i={inst}/>
            </Stack>

            <Flex style={{marginBottom:10}} fontFamily="monospace">
            <Badge colorScheme="green">T0 <br/> {share.currentProcessor?.regbank[5].toString(16)}</Badge>
            <Badge colorScheme="green">T1 <br/>{share.currentProcessor?.regbank[6].toString(16)}</Badge>
            <Badge colorScheme="green">T2 <br/>{share.currentProcessor?.regbank[7].toString(16)}</Badge>
            <Badge colorScheme="green">T3 <br/>{share.currentProcessor?.regbank[8].toString(16)}</Badge>
            <Badge colorScheme="green">T4 <br/>{share.currentProcessor?.regbank[13].toString(16)}</Badge>
            <Badge colorScheme="green">T5 <br/>{share.currentProcessor?.regbank[14].toString(16)}</Badge>
            <Badge colorScheme="green">T6 <br/>{share.currentProcessor?.regbank[15].toString(16)}</Badge>
            <Badge colorScheme="red">A0 <br/>{share.currentProcessor?.regbank[3].toString(16)}</Badge>
            <Badge colorScheme="red">A1 <br/>{share.currentProcessor?.regbank[4].toString(16)}</Badge>
            <Badge colorScheme="red">A2 <br/>{share.currentProcessor?.regbank[12].toString(16)}</Badge>
            <Badge colorScheme="red">A3 <br/>{share.currentProcessor?.regbank[17].toString(16)}</Badge>
            <Badge colorScheme="cyan">S0 <br/>{share.currentProcessor?.regbank[18].toString(16)}</Badge>
            <Badge colorScheme="cyan">S1 <br/>{share.currentProcessor?.regbank[19].toString(16)}</Badge>
            <Badge colorScheme="cyan">S2 <br/>{share.currentProcessor?.regbank[20].toString(16)}</Badge>
            <Badge colorScheme="cyan">S3 <br/>{share.currentProcessor?.regbank[21].toString(16)}</Badge>
            <Badge colorScheme="cyan">S4 <br/>{share.currentProcessor?.regbank[22].toString(16)}</Badge>
            <Badge colorScheme="cyan">S5 <br/>{share.currentProcessor?.regbank[23].toString(16)}</Badge>
            <Badge colorScheme="cyan">S6 <br/>{share.currentProcessor?.regbank[24].toString(16)}</Badge>
            <Badge colorScheme="red">RA <br/>{share.currentProcessor?.regbank[9].toString(16)}</Badge>
            <Badge colorScheme="red">SP <br/>{share.currentProcessor?.regbank[16].toString(16)}</Badge>
            <Badge colorScheme="purple">V0 <br/>{share.currentProcessor?.regbank[1].toString(16)}</Badge>
            <Badge colorScheme="purple">V1 <br/>{share.currentProcessor?.regbank[2].toString(16)}</Badge>
            </Flex>

            <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '90vh', // Full viewport height
            width: '90vw',  // Full viewport width
            position: 'relative', // Ensures it fills the screen
            zIndex: 0, 
            }}>
                <MipsSVG 
                title="MIPS" 
                style={{ 
                    width: '70%', 
                    maxHeight: '100%', 
                    maxWidth: '100%', 
                    position: 'relative', 
                    left: -50,
                    
                }}
                />

            </div>

            {/* <Button onClick={() => {}}>Refreh</Button> */}
        </>
    );
}
