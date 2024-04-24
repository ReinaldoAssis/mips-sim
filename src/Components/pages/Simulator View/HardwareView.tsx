import { Button, GridItem, Text} from "@chakra-ui/react";
import React, { useEffect, useImperativeHandle, useState } from "react";
import SharedData, { Instruction } from "../../../Service/SharedData";
import { ReactComponent as MipsSVG } from "./mips32.svg";

const typeR = ["add", "and", "or", "sll", "slt", "srl", "sub"]
const typeI = ["addi","slti"]

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
    const [state,setState] = useState("typeR")

    function resetPaint(){
        paintTypeR("#000000")
        paintJR("#000000")
        paintMfhiMflo("#000000","mfhi")
        paintMfhiMflo("#000000","mflo")
        paintJal("#000000")
        paintI("#000000")
        paintSW("#000000")
        paintLW("#000000")
        paintBranch("#000000");
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
        // svgPath.push(document.getElementById("alu-out"));
        // svgPath.push(document.getElementById("arr-alu-out"));
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
        share.refreshHardwareView = (i : Instruction) => {setInst(i); console.log("receiving", i)};

        let token = inst.humanCode.split(" ")[0]
        let color = "#5c21ff"

        console.log(`Current token ${token}`)

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

    }, [inst]);

    return (
        <>
            <InstructionDisplay n={0} i={inst} />
            <MipsSVG style={{ width:"70%", zIndex:0, position:"absolute", left:300, top: -400 }} />
            {/* <Button onClick={() => settest(!test)}>Refreh</Button> */}
        </>
    );
}
