import { ColorModeSwitcher } from "../ColorModeSwitcher";
import { Logo } from "../Logo";
import Editor from "@monaco-editor/react";
import AssemblyEditor from "./AssemblyEditor";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { HiPlay } from "react-icons/hi";
import { BsTerminalFill } from "react-icons/bs";
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
  useDisclosure,
} from "@chakra-ui/react";
import SimulatorService from "../Service/SimulatorService";
import HardwareView from "./HardwareView";
import SISMIPS from "../Hardware/SIS Mips/SIS";
import BinaryNumber from "../Hardware/BinaryNumber";

const HiPlayIcon = () => <Icon as={HiPlay} />;
const TerminalFill = () => <Icon as={BsTerminalFill} />;

export default function SimulatorView() {
  //const [code, setCode] = React.useState<string>("");

  const [code, setCode] = React.useState<string>("");
  const [assemblyCode, setAssemblyCode] = React.useState<string>("");

  const simservice: SimulatorService = SimulatorService.getInstance();

  const toast = useToast();

  React.useEffect(() => {
    setAssemblyCode(simservice.assemblyCode);
  }, [simservice.assemblyCode]);

  function onEditorChange(value: string | undefined, event: any) {
    setCode(value!);
  }

  function runCode() {
    console.log("Running code");
    simservice.assemblyCode = simservice.assemble(code);
    setAssemblyCode(simservice.assemblyCode);
    console.log("Assembly " + simservice.assemblyCode);

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
  const [consoleOpen, setConsoleOpen] = React.useState<boolean>(true);

  //React.useEffect(() => {}, [consoleOpen]);

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
          <Textarea
            readOnly={true}
            border={"hidden"}
            placeholder={"Empty"}
          ></Textarea>
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
          >
            Step
          </Button>
        </Stack>
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
      </Stack>
    </Stack>
  );
}
