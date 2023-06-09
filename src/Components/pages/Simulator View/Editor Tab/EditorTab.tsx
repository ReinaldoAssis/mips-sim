import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Icon,
  IconButton,
  Slide,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Textarea,
  Text,
  Tooltip,
  Select,
} from "@chakra-ui/react";
import React from "react";
import { BsTerminalFill } from "react-icons/bs";
import { HiPlay } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { RiRewindFill, RiSettings2Fill } from "react-icons/ri";
import SISMIPS from "../../../../Hardware/SIS Mips/SIS";
import Logger from "../../../../Service/Logger";
import SharedData from "../../../../Service/SharedData";
import SimulatorService from "../../../../Service/SimulatorService";
import AssemblyEditor from "../../../AssemblyEditor";
import ConfigModal from "./ConfigModal";
import ConsoleTerminal from "./ConsoleTerminal";
import DebugTerminal from "./DebugTerminal";

export default function EditorView(props: {
  runBtn: Function;
  onEditorChange: (value: string | undefined, event: any) => void;
}) {
  //Icons
  const HiPlayIcon = () => (
    <Icon as={HiPlay} style={{ transform: "scale(1.4)" }} />
  );
  const TerminalFill = () => <Icon as={BsTerminalFill} />;

  // Handles the visibility of the console and debug terminal
  const [consoleOpen, setConsoleOpen] = React.useState<boolean>(false);

  // Handles the state of the console and debug terminal
  const [consoleTxt, setConsoleTxt] = React.useState<string>("");

  // Handles witch terminal is currently selected
  const [currentTerminal, setCurrentTerminal] = React.useState<number>(0);

  // Handles the information text of the debug terminal
  const [debugTxt, setDebugTxt] = React.useState<string>("");

  const [configModalOpen, setConfigModalOpen] = React.useState<boolean>(false);

  // SharedData instance that holds the shared state of the application
  let share: SharedData = SharedData.instance;

  //Logger instance
  let log: Logger = Logger.instance;

  // SimulatorService instance that handles the assembly of the code
  let simservice: SimulatorService = SimulatorService.getInstance();

  // Updates the console and debug terminal when the log changes
  React.useEffect(() => {
    Logger.instance.onLogChange(() => {
      setConsoleTxt(log.getConsole() + log.getErrors());
      setDebugTxt(log.getDebug());

      /* Responsible for scrolling the text areas */
      let debugTxtArea = document.getElementById("debugTxtArea");
      if (debugTxtArea) debugTxtArea.scrollTop = debugTxtArea.scrollHeight;

      let consoleTxtArea = document.getElementById("consoleTxtArea");
      if (consoleTxtArea)
        consoleTxtArea.scrollTop = consoleTxtArea.scrollHeight;
    });
  }, [consoleOpen, debugTxt]);

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

          {/* Console  */}
          {currentTerminal == 0 ? (
            <ConsoleTerminal
              value={consoleTxt}
              onClear={() => {
                setConsoleTxt("");
                Logger.instance.clearConsole();
              }}
            />
          ) : (
            <></>
          )}

          {/* Debug terminal  */}
          {currentTerminal == 1 ? (
            <DebugTerminal
              value={debugTxt}
              onClear={() => {
                setDebugTxt("");
                Logger.instance.clearDebug();
              }}
            />
          ) : (
            <></>
          )}
        </Box>
      </Slide>
      <Stack spacing={4}>
        <Stack direction="column" spacing={4}>
          <Tooltip label="Assemble & Run">
            <IconButton
              icon={<HiPlayIcon />}
              colorScheme="teal"
              variant="solid"
              onClick={() => props.runBtn()}
              aria-label="Run program"
              borderRadius={50}
              size="sm"
            >
              Run
            </IconButton>
          </Tooltip>
          <Tooltip label="Run next instruction">
            <IconButton
              icon={<ArrowForwardIcon style={{ transform: "scale(1.4)" }} />}
              colorScheme="yellow"
              aria-label="Run step"
              variant="solid"
              borderRadius={50}
              size="sm"
              onClick={() => {
                share.monacoEditor?.setPosition(
                  new share.monaco.Position(share.currentStepLine, 0)
                );

                if (share.currentProcessor) {
                  share.currentProcessor.executeStep();
                } else {
                  share.currentProcessor = new SISMIPS();
                  const assembly = simservice.assemble(share.code);
                  share.currentProcessor.loadProgram(assembly.split(" "));
                  console.log(
                    `Current assembly code: ${assembly} code: ${share.code}`
                  );
                  share.currentProcessor.executeStep();
                }
              }}
            >
              Step
            </IconButton>
          </Tooltip>
          <Tooltip label="Open terminal">
            <IconButton
              icon={<TerminalFill />}
              color="white"
              backgroundColor={SharedData.theme.editorBackground}
              variant="solid"
              aria-label="Open console"
              borderRadius={50}
              size="sm"
              onClick={() => {
                setConsoleOpen(!consoleOpen);
              }}
            >
              Terminal
            </IconButton>
          </Tooltip>
          <Tooltip label="Reset">
            <IconButton
              icon={<Icon as={RiRewindFill} />}
              aria-label="Reset"
              backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              onClick={() => {
                share.currentProcessor = null;
                share.currentPc = share.pcStart;
              }}
            >
              Reset
            </IconButton>
          </Tooltip>
          <Tooltip label="Configuration">
            <IconButton
              icon={
                <Icon
                  as={RiSettings2Fill}
                  style={{ transform: "scale(1.2)" }}
                />
              }
              aria-label="Configuration"
              backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              onClick={() => setConfigModalOpen(true)}
            >
              Configuration
            </IconButton>
          </Tooltip>
        </Stack>
        <ConfigModal
          isOpen={configModalOpen}
          close={() => setConfigModalOpen(false)}
        />
      </Stack>
    </Stack>
  );
}
