import { Icon, Input, Textarea } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import TemplateProcessor from "../../../../Hardware/TemplatePorcessor";
import Logger from "../../../../Service/Logger";
import SharedData from "../../../../Service/SharedData";
import SimulatorService from "../../../../Service/SimulatorService";
import WorkerService from "../../../../Service/WorkerService";

export default function MemoryTerminal() {

  const [cmd, setCmd] = useState("")
  const [txtArea, setTxtArea] = useState("")
  const shared = SharedData.instance

  useEffect(()=>{
    if (txtArea == "") setTxtArea(shared.memoryterminalText)
  },[])

  return (
    <>
      <Icon
        as={MdDelete}
        onClick={() => {
          setTxtArea("")
          shared.memoryterminalText = ""
        }}
        style={{
          position: "relative",
          left: "95%",
          scale: "1.5",
          zIndex: 10,
        }}
      />
      <Textarea
        readOnly={true}
        border={"hidden"}
        placeholder={"Empty"}
        height={"150px"}
        style={{ position: "relative", bottom: 50, userSelect: "text" }}
        id={"consoleTxtArea"}
        scrollBehavior={"smooth"}
        value={txtArea}
      ></Textarea>
      <Input style={{position: "relative", bottom: 60}} onChange={(e) => {
        setCmd(e.target.value)
      }} onKeyDown={(e) => {
        if (e.key == "Enter")
        {
          WorkerService.instance.cpuWorker?.postMessage({command:"mem terminal"})
          setTimeout(() => {

            let newtext = ""

            if (cmd.includes("$")){

              let convertToBin = SimulatorService.getInstance().assembleRegister(cmd)
              let index = new TemplateProcessor().mapRegister(parseInt(convertToBin,2))
              let reg = shared.currentProcessor?.regbank[index]
              setTxtArea(txtArea+`${reg}\n`)
              shared.memoryterminalText = txtArea+`${reg}\n`

            }
            else
            {
              let range : Array<number> = []
              newtext = cmd+": "
              if (cmd.includes("-"))
              {
                const spl = cmd.split("-")
                const addr1 = parseInt(spl[0])
                const addr2 = parseInt(spl[1])
                // console.log("addr1 e 2 ", addr1, addr2)
                for (let i = addr1; i <= addr2; i+=4)
                  range.push(i)
              }
              else{
                range.push(parseInt(cmd))
              }

              range.forEach(addr => {
                // console.log("addr",addr)
                let memValue = shared.currentProcessor?.memory.find(x => x.address === addr)?.value ?? "undefined"
                if (memValue === undefined) memValue = "undefined"
                // console.log("mem",memValue)
                newtext += `${memValue} `
              })
              setTxtArea(txtArea+newtext+`\n`)
              shared.memoryterminalText = txtArea+newtext+`\n`


              // let addr = parseInt(cmd)
              // let memValue = shared.currentProcessor?.memory.find(x => x.address == addr)?.value ?? "undefined"
              // setTxtArea(txtArea+`${memValue}\n`)
              // shared.memoryterminalText = txtArea+`${memValue}\n`
            }

            // console.log(`mem terminal ${cmd}`)

          }, 100)
        }
      }} placeholder='Write a memory address or register here (e.g. 2000 or $t0)' size='md' />
    </>
  );
}
