import { ColorModeSwitcher } from "../../../ColorModeSwitcher";
import { Logo } from "../../../Logo";
import Editor from "@monaco-editor/react";
import AssemblyEditor from "../../AssemblyEditor";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { HiPlay } from "react-icons/hi";
import { BsTerminalFill } from "react-icons/bs";
import { RiRewindFill, RiSettings2Fill } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import * as React from "react";
import {
  Stack,
  Button,
  Icon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Textarea,
  useToast,
  Slide,
  Box,
  IconButton,
  Tooltip,
  Input,
} from "@chakra-ui/react";
import SimulatorService from "../../../Service/SimulatorService";
import HardwareView from "./HardwareView";
import SISMIPS from "../../../Hardware/SIS Mips/SIS";
import Logger from "../../../Service/Logger";
import SharedData, { Instruction } from "../../../Service/SharedData";
import EditorView from "./Editor Tab/EditorTab";
import MonoMIPS from "../../../Hardware/Mono Mips/MonoMIPS";
import WorkerService from "../../../Service/WorkerService";
import { ScreenRenderer } from "./Editor Tab/Screen";
import HexView from "./HexView";

// const cpuWorker = new Worker(new URL('./MonoMIPSWorker.ts', import.meta.url));

export default function SimulatorView() {
  // Handles the assembly code present in the editor
  const [code, setCode] = React.useState<string>("");
  const [program, setProgram] = React.useState<Array<Instruction>>();
  const [currentInstruction, setCurrentInstruction] = React.useState<Instruction>();

  // Handles the title of the program
  //const [programTitle, setProgramTitle] = React.useState<string>("Recent");

  // const [assemblyCode, setAssemblyCode] = React.useState<string>("");

  // SimulatorService instance that handles the assembly of the code
  let simservice: SimulatorService = SimulatorService.getInstance();

  // Notification toast
  const toast = useToast();

  // Holds the shared state of the application
  let share: SharedData = SharedData.instance;

  // Logger instance
  let log: Logger = Logger.instance;

  const txtProgramtitle = React.useRef<HTMLInputElement>(null);

  const hardwareRef = React.useRef();

  function handleKeyPress(e : KeyboardEvent) 
  {
    //if(e.repeat) return;
    let ascii, key = e.key;
    if(key.length == 1) {
        ascii = key.charCodeAt(0);
        if(ascii < 128 && e.ctrlKey) {
             ascii = ascii & 0x1f;
        }
    }
    if( typeof ascii == "number" && ascii < 128) {
        share.ibuffer.push(ascii); //todo: change to shift register
        // console.log(`ASCII code ${ascii} entered from keyboard`);
    }
    
  }

  React.useEffect(() => {
    // TODO : check if it is necessary to remove the event
    // document.removeEventListener("keydown", handleKeyPress, true)
    document.addEventListener("keypress", handleKeyPress, true)
  }, [])

  React.useEffect(() => {
    if (txtProgramtitle.current) txtProgramtitle.current.value = share.programTitle;
  }, [share.programTitle, program, currentInstruction])



  // Updates the assembly code when the code changes
  function onEditorChange(value: string | undefined, event: any) {
    setCode(value!);
    share.code = value ?? code;
  }

  function forceGetCode() {

    if (share.monacoEditor == null) {
      log.pushAppError("Monaco editor is null")
      return;
    }

    console.log("monaco editor value ", share.monacoEditor.getValue());
    console.log("code ", code);
    if (code == "" && share.monacoEditor != null) {
      let monacoCode = share.monacoEditor.getValue();
      setCode(monacoCode);
      share.code = monacoCode;
    }
  }

  function setScreenRendererCanva(){
    try{
      let canva = (document.getElementById("screenCanvas") as HTMLCanvasElement).getContext("2d");
      ScreenRenderer.instance.draw = canva;
    }
    catch{}
  }

  function assembleCode()
  {
     // first, we have to link our canvas with our ScreenRenderer
     setScreenRendererCanva()

     // if code state is empty, get code from monaco editor and update share.code
     forceGetCode();
 
     //resets the program
     share.program = [];
 
     // Assembles the code
     simservice.assembledCode = simservice.assemble(share.code);
     // share._debugMemory();
 
     setProgram(simservice.program);

     if (log.getErrors().length == 0 && log.appErrors.length == 0) {
      toast({
        title: "Code assembled",
        description: "Your code has been assembled",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Assemble failed",
        description:
          "Your code has not been assembled, please check the terminal for errors",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }

  function runCode() {

    // first, we have to link our canvas with our ScreenRenderer
    setScreenRendererCanva()
    share.ibuffer = [0];
    // share.resetStartMemory();

    if (share.currentProcessor == null) share.currentProcessor = new MonoMIPS();

    share.currentProcessor.halted = false;
    WorkerService.instance.runCode(share.program, share.processorFrequency);

    console.log(`Running at frequency ${share.processorFrequency}`)

    
  }

  function callExecuteStep()
  {

    share.updateCode();
    if(share.currentProcessor == null) share.currentProcessor = new MonoMIPS();

    if(share.currentProcessor.halted){
      share.currentProcessor.halted = false;
      // console.log("processor was halted before")
      simservice.assembledCode = simservice.assemble(share.code)
      WorkerService.instance.stepCode();
    }
    else
    {
      // console.log("processor was not halted before")
      WorkerService.instance.stepCode();
    }

    setProgram(simservice.program);

    setCurrentInstruction(share.currentProcessor.currentInstruction);

  }

  /* DESCRIPTION */
  // View page that houses the assembly code editor, assembly hex, and hardware view

  return (
    <Tabs variant="soft-rounded" style={{zIndex:50}}>
      <TabList style={{zIndex:50}}>
        <Tab style={{zIndex:50}}>Editor</Tab>
        <Tab style={{zIndex:50}}>Hex View</Tab>
        <Tab style={{zIndex:50}}>Datapath</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Stack>
            <Input placeholder="Recent" ref={txtProgramtitle} variant={"unstyled"} defaultValue={share.programTitle} onChange={(e) => {
              // setProgramTitle(e.target.value);
              share.programTitle = e.target.value;
            }} />
            <EditorView onEditorChange={onEditorChange} assembleBtn={assembleCode} runBtn={runCode} callExecuteStep={callExecuteStep} />
          </Stack>
        </TabPanel>

        <TabPanel>
          {/* <Textarea
            style={{ height: "80vh" }}
            value={
              simservice.program.map(i => "0x"+i.machineCode.toString(16)).join(" ")  
            }
          /> */}
          <HexView program={program ?? []}/>
        </TabPanel>

        <TabPanel>
          <HardwareView callExecutableStep={callExecuteStep} />
          {/* stepFunc={callExecuteStep} currentI={share.currentProcessor?.currentInstruction ?? null} */}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
