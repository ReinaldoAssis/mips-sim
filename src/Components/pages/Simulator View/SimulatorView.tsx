import * as React from "react";
import {
  Stack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
} from "@chakra-ui/react";
import SimulatorService from "../../../Service/SimulatorService";
import HardwareView from "./HardwareView";
import SharedData, { Instruction } from "../../../Service/SharedData";
import MonoMIPS from "../../../Hardware/Mono Mips/MonoMIPS";
import WorkerService from "../../../Service/WorkerService";
import HexView from "./HexView";
import MultiWindowEditor from "./Editor Tab/MultiWindowEditor/MultiWindowEditor";
import { TabsProvider } from "./Editor Tab/MultiWindowEditor/MultiWindowContext";

// const cpuWorker = new Worker(new URL('./MonoMIPSWorker.ts', import.meta.url));

export default function SimulatorView() {
  
  const [program, setProgram] = React.useState<Array<Instruction>>();
  const [currentInstruction, setCurrentInstruction] = React.useState<Instruction>();

  // Handles the title of the program
  //const [programTitle, setProgramTitle] = React.useState<string>("Recent");

  // const [assemblyCode, setAssemblyCode] = React.useState<string>("");

  // SimulatorService instance that handles the assembly of the code
  let simservice: SimulatorService = SimulatorService.getInstance();

  // Holds the shared state of the application
  let share: SharedData = SharedData.instance;

  

  const txtProgramtitle = React.useRef<HTMLInputElement>(null);

  // const hardwareRef = React.useRef();

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
            <MultiWindowEditor callExecuteStep={callExecuteStep} />
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
