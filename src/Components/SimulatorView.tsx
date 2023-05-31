import { ColorModeSwitcher } from "../ColorModeSwitcher";
import { Logo } from "../Logo";
import Editor from "@monaco-editor/react";
import AssemblyEditor from "./AssemblyEditor";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { HiPlay } from "react-icons/hi";
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
} from "@chakra-ui/react";
import SimulatorService from "../Service/SimulatorService";
import HardwareView from "./HardwareView";

const HiPlayIcon = () => <Icon as={HiPlay} />;

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
    console.log(simservice.assemblyCode);

    toast({
      title: "Code assembled",
      description: "Your code has been assembled",
      status: "success",
      duration: 4000,
      isClosable: true,
    });
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
  return (
    <Stack direction={"row"}>
      <AssemblyEditor onEditorChange={props.onEditorChange} />
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
    </Stack>
  );
}
