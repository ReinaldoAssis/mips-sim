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
} from "@chakra-ui/react";
import SimulatorService from "../Service/SimulatorService";

const HiPlayIcon = () => <Icon as={HiPlay} />;

export default function SimulatorView() {
  //const [code, setCode] = React.useState<string>("");

  const simservice: SimulatorService = SimulatorService.getInstance();

  function runCode() {
    console.log("Running code");
    console.log(simservice.assemble("test"));
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
          <EditorView runBtn={runCode} />
        </TabPanel>

        <TabPanel>
          <Textarea style={{ height: "80vh" }} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

function EditorView(props: { runBtn: Function }) {
  return (
    <Stack direction={"row"}>
      <AssemblyEditor />
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
