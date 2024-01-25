import { Icon, Input, Textarea } from "@chakra-ui/react";
import React, { useState } from "react";
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

  return (
    <>
      {/* <Icon
        as={MdDelete}
        onClick={() => {
          Logger.instance.clearConsole();
          props.onClear();
        }}
        style={{
          position: "relative",
          left: "95%",
          scale: "1.5",
          zIndex: 10,
        }}
      /> */}
      <Textarea
        readOnly={true}
        border={"hidden"}
        placeholder={"Empty"}
        height={"150px"}
        style={{ position: "relative", bottom: 40, userSelect: "text" }}
        id={"consoleTxtArea"}
        scrollBehavior={"smooth"}
        value={txtArea}
      ></Textarea>
      <Input style={{position: "relative", bottom: 40}} onChange={(e) => {
        setCmd(e.target.value)
      }} onKeyDown={(e) => {
        if (e.key == "Enter")
        {
          WorkerService.instance.cpuWorker?.postMessage({command:"mem terminal"})
          setTimeout(() => {

            if (cmd.includes("$")){
              let convertToBin = SimulatorService.getInstance().assembleRegister(cmd)
              let index = new TemplateProcessor().mapRegister(parseInt(convertToBin,2))
              let reg = shared.currentProcessor?.regbank[index]
              setTxtArea(txtArea+`${reg}\n`)

            }
            else
            {
              let addr = parseInt(cmd)
              let memValue = shared.currentProcessor?.memory.find(x => x.address == addr)?.value ?? -1
              setTxtArea(txtArea+`${memValue}\n`)
            }

            console.log(`mem terminal ${cmd}`)

          }, 100)
        }
      }} placeholder='Write a memory address or register here (e.g. 2000 or $t0)' size='md' />
    </>
  );
}
