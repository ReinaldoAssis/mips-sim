import { ColorModeSwitcher } from "../ColorModeSwitcher";
import { Logo } from "../Logo";
import Editor from "@monaco-editor/react";
import AssemblyEditor from "./AssemblyEditor";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { HiPlay } from "react-icons/hi";
import { BsTerminalFill } from "react-icons/bs";
import { RiRewindFill } from "react-icons/ri";
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
} from "@chakra-ui/react";
import SimulatorService from "../Service/SimulatorService";
import HardwareView from "./HardwareView";
import SISMIPS from "../Hardware/SIS Mips/SIS";
import Logger from "../Service/Logger";
import SharedData from "../Service/SharedData";

const HiPlayIcon = () => <Icon as={HiPlay} />;
const TerminalFill = () => <Icon as={BsTerminalFill} />;
const DeleteIcon = () => <Icon as={MdDelete} />;

export default function SimulatorView() {
  //const [code, setCode] = React.useState<string>("");

  const [code, setCode] = React.useState<string>("");
  const [assemblyCode, setAssemblyCode] = React.useState<string>("");

  let simservice: SimulatorService = SimulatorService.getInstance();

  const toast = useToast();

  let share: SharedData = SharedData.instance;

  React.useEffect(() => {
    setAssemblyCode(simservice.assemblyCode);
  }, [simservice.assemblyCode]);

  function onEditorChange(value: string | undefined, event: any) {
    setCode(value!);
    share.code = code;
  }

  function runCode() {
    console.log("Running code");
    simservice.assemblyCode = simservice.assemble(code);
    setAssemblyCode(simservice.assemblyCode);

    toast({
      title: "Code assembled",
      description: "Your code has been assembled",
      status: "success",
      duration: 4000,
      isClosable: true,
    });

    let instructions = simservice.assemblyCode.split(" ");
    console.log(instructions);
    //temporary

    let cpu = new SISMIPS();
    cpu.loadProgram(instructions);

    cpu.memory.forEach((value, index) => {
      console.log(
        "CPU mem " + value.address.value + " " + value.value.getBinaryValue(32)
      );
    });
    cpu.execute();
  }

  return (
    <Tabs variant="soft-rounded">
      <TabList>
        <Tab>Code</Tab>
        <Tab>Assembly</Tab>
        <Tab>Simulation</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <EditorView onEditorChange={onEditorChange} runBtn={runCode} />
        </TabPanel>

        <TabPanel>
          <Textarea
            style={{ height: "80vh" }}
            value={simservice.assemblyCode}
          />
        </TabPanel>

        <TabPanel>
          <HardwareView />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

function EditorView(props: {
  runBtn: Function;
  onEditorChange: (value: string | undefined, event: any) => void;
}) {
  const [consoleOpen, setConsoleOpen] = React.useState<boolean>(false);
  const [consoleTxt, setConsoleTxt] = React.useState<string>("");
  const [currentTerminal, setCurrentTerminal] = React.useState<number>(0);
  const [debugTxt, setDebugTxt] = React.useState<string>("");

  let share: SharedData = SharedData.instance;
  let simservice: SimulatorService = SimulatorService.getInstance();

  React.useEffect(() => {
    Logger.instance.onLogChange(() => {
      setConsoleTxt(Logger.instance.getConsole());
      setDebugTxt(Logger.instance.getDebug());
    });
  }, [consoleOpen]);

  return (
    <Stack direction={"row"}>
      <AssemblyEditor onEditorChange={props.onEditorChange} />
      <Slide
        direction="bottom"
        in={consoleOpen}
        style={{
          zIndex: 10,
        }}
      >
        <Box
          p="40px"
          color="white"
          mt="4"
          bg="#20212b"
          rounded="md"
          shadow="md"
          style={{
            position: "relative",
            right: "11px",
            width: "102vw",
            height: "250px",
          }}
        >
          <Stack direction="row" spacing={4}>
            <Button
              style={{
                position: "relative",
                borderBottom: currentTerminal == 0 ? "solid" : "none",
                backgroundColor: "none",
                background: "none",
                borderRadius: "0px",
                top: -40,
                right: 20,
              }}
              onClick={() => setCurrentTerminal(0)}
            >
              Terminal
            </Button>
            <Button
              style={{
                position: "relative",
                borderBottom: currentTerminal == 1 ? "solid" : "none",
                backgroundColor: "none",
                background: "none",
                borderRadius: "0px",
                top: -40,
                right: 20,
              }}
              onClick={() => setCurrentTerminal(1)}
            >
              Debug
            </Button>
          </Stack>

          {currentTerminal == 0 ? (
            <>
              <Icon
                as={MdDelete}
                onClick={() => {
                  setConsoleTxt("");
                  Logger.instance.clearConsole();
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
                value={consoleTxt}
                height={"150px"}
                style={{ position: "relative", bottom: 50 }}
              ></Textarea>
            </>
          ) : (
            <></>
          )}

          {currentTerminal == 1 ? (
            <>
              <Icon
                as={MdDelete}
                onClick={() => {
                  setDebugTxt("");
                }}
                style={{
                  position: "relative",
                  left: "95%",
                  top: 0,
                  scale: "1.5",
                  zIndex: 10,
                }}
              />
              <Textarea
                readOnly={true}
                border={"hidden"}
                placeholder={"Empty"}
                value={debugTxt}
                height={"150px"}
                style={{ position: "relative", bottom: 50 }}
              ></Textarea>
            </>
          ) : (
            <></>
          )}
        </Box>
      </Slide>
      <Stack spacing={4}>
        <Stack direction="row" spacing={4}>
          <Button
            leftIcon={<HiPlayIcon />}
            colorScheme="teal"
            variant="solid"
            onClick={() => props.runBtn()}
          >
            Run
          </Button>
          <Button
            rightIcon={<ArrowForwardIcon />}
            colorScheme="teal"
            variant="outline"
            onClick={() => {
              share.monacoEditor?.setPosition(
                new share.monaco.Position(share.currentStepLine, 0)
              );

              if (share.currentProcessor) {
                share.currentProcessor.executeStep();
              } else {
                share.currentProcessor = new SISMIPS();
                const assembly = simservice.assemble(SharedData.instance.code);
                share.currentProcessor.loadProgram(assembly.split(" "));
                console.log(
                  `Current assembly code: ${assembly} code: ${share.code}`
                );
                share.currentProcessor.executeStep();
              }
            }}
          >
            Step
          </Button>
        </Stack>
        <Stack direction="row" spacing={4}>
          <Button
            rightIcon={<TerminalFill />}
            colorScheme="teal"
            variant="outline"
            onClick={() => {
              setConsoleOpen(!consoleOpen);
              console.log("Console open " + consoleOpen);
            }}
          >
            Terminal
          </Button>
          <Button
            rightIcon={<Icon as={RiRewindFill} />}
            colorScheme="teal"
            onClick={() => {
              share.currentProcessor = null;
              share.currentPc = share.PcStart;
            }}
          >
            Reset
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
