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
} from "@chakra-ui/react";
import SimulatorService from "../../../Service/SimulatorService";
import HardwareView from "../../HardwareView";
import SISMIPS from "../../../Hardware/SIS Mips/SIS";
import Logger from "../../../Service/Logger";
import SharedData from "../../../Service/SharedData";
import EditorView from "./Editor Tab/EditorTab";
import MonoMIPS from "../../../Hardware/Mono Mips/MonoMIPS";

export default function SimulatorView() {
  // Handles the assembly code present in the editor
  const [code, setCode] = React.useState<string>("");

  // const [assemblyCode, setAssemblyCode] = React.useState<string>("");

  // SimulatorService instance that handles the assembly of the code
  let simservice: SimulatorService = SimulatorService.getInstance();

  // Notification toast
  const toast = useToast();

  // Holds the shared state of the application
  let share: SharedData = SharedData.instance;

  // Logger instance
  let log: Logger = Logger.instance;

  // Updates the assembly code when the code changes
  function onEditorChange(value: string | undefined, event: any) {
    setCode(value!);
    share.code = code;
  }

  function forceGetCode() {

    if(share.monacoEditor == null) {
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

  function runCode() {
    // if code state is empty, get code from monaco editor and update share.code
    forceGetCode();

    //resets the program
    share.program = [];

    // Assembles the code
    simservice.assembledCode = simservice.assemble(share.code);

    let instructions = simservice.assembledCode.split(" ");

    let f = share.processorFrequency;

    if(share.currentProcessor == null) share.currentProcessor = new MonoMIPS();

    let cpu = share.currentProcessor;
    cpu.reset();
    cpu.frequency = f;
    //share.currentProcessor = cpu;
    cpu.loadProgram(instructions);

    cpu.execute();

    if (log.getErrors().length == 0) {
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

  /* DESCRIPTION */
  // View page that houses the assembly code editor, assembly hex, and hardware view

  return (
    <Tabs variant="soft-rounded">
      <TabList>
        <Tab>Editor</Tab>
        <Tab>Hex View</Tab>
        <Tab>Simulation</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <EditorView onEditorChange={onEditorChange} runBtn={runCode} />
        </TabPanel>

        <TabPanel>
          <Textarea
            style={{ height: "80vh" }}
            value={simservice.assembledCode}
          />
        </TabPanel>

        <TabPanel>
          <HardwareView />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
