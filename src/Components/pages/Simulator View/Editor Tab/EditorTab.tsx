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
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { BsTerminalFill } from "react-icons/bs";
import {IoMdSave} from "react-icons/io";
import { HiPlay } from "react-icons/hi";
import {CgScreen} from "react-icons/cg";
import { MdDelete } from "react-icons/md";
import { BsFileEarmarkCode } from "react-icons/bs";
import { RiRewindFill, RiSettings2Fill } from "react-icons/ri";
import SISMIPS from "../../../../Hardware/SIS Mips/SIS";
import Logger from "../../../../Service/Logger";
import SharedData from "../../../../Service/SharedData";
import SimulatorService from "../../../../Service/SimulatorService";
import AssemblyEditor from "../../../AssemblyEditor";
import ConfigModal from "./ConfigModal";
import ConsoleTerminal from "./ConsoleTerminal";
import DebugTerminal from "./DebugTerminal";
import MonoMIPS from "../../../../Hardware/Mono Mips/MonoMIPS";
import { FaDownload, FaFolderOpen } from "react-icons/fa";
import LoadProgramModal from "./LoadProgramModal";
import WorkerService from "../../../../Service/WorkerService";
import Screen, { ScreenRenderer } from "./Screen";
import MemoryTerminal from "./MemoryTerminal";

export default function EditorView(props: {
  runBtn: Function;
  assembleBtn: Function;
  onEditorChange: (value: string | undefined, event: any) => void;
  callExecuteStep: Function;
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

  // Handles the visibility of the configuration modal
  const [configModalOpen, setConfigModalOpen] = React.useState<boolean>(false);

  // Handles the visibility of the load program modal
  const [loadProgramModalOpen, setLoadProgramModalOpen] = React.useState<boolean>(false);

  // Handles the visibility of the screen modal
  const [screenModalOpen, setScreenModalOpen] = React.useState<boolean>(false);

  // SharedData instance that holds the shared state of the application
  let share: SharedData = SharedData.instance;

  //Logger instance
  let log: Logger = Logger.instance;

  // SimulatorService instance that handles the assembly of the code
  let simservice: SimulatorService = SimulatorService.getInstance();

  const toast = useToast();

  function setScreenRendererCanva(){
    try{
      let canva = (document.getElementById("screenCanvas") as HTMLCanvasElement).getContext("2d");
      ScreenRenderer.instance.draw = canva;
    }
    catch (e){
      console.log("error defining canva", e);
    }
  }

  

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

  React.useEffect(()=> {
    setScreenRendererCanva();
  }, [screenModalOpen])

  return (
    <Stack direction={"row"}>
      
      <AssemblyEditor onEditorChange={props.onEditorChange} />
      {screenModalOpen ? <Screen /> : <></>}
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
          <Stack direction="row" spacing={4} zIndex={10}>
            <Button
              style={{
                position: "relative",
                borderBottom: currentTerminal == 0 ? "solid" : "none",
                backgroundColor: "none",
                background: "none",
                borderRadius: "0px",
                top: -40,
                right: 20,
                zIndex:10
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
                zIndex:10
              }}
              onClick={() => setCurrentTerminal(1)}
            >
              Debug
            </Button>

            <Button
              style={{
                position: "relative",
                borderBottom: currentTerminal == 2 ? "solid" : "none",
                backgroundColor: "none",
                background: "none",
                borderRadius: "0px",
                top: -40,
                right: 20,
                zIndex:10
              }}
              onClick={() => setCurrentTerminal(2)}
            >
              Memory
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

            {/* Registers terminal  */}
          {currentTerminal == 2 ? (
           <MemoryTerminal/>
          ) : (
            <></>
          )}

        </Box>
      </Slide>
      <Stack spacing={4}>
        <Stack direction="column" spacing={4}>
        <Tooltip label="Assemble">
            <IconButton
              icon={<BsFileEarmarkCode style={{ transform: "scale(1.4)" }} />}
              colorScheme="linkedin"
              variant="solid"
              onClick={() => {
                props.assembleBtn()
              }}
              aria-label="Assemble program"
              borderRadius={50}
              size="sm"
              zIndex={10}
            >
              Run
            </IconButton>
          </Tooltip>
          <Tooltip label="Run">
            <IconButton
              icon={<HiPlayIcon />}
              colorScheme="teal"
              variant="solid"
              onClick={() => props.runBtn()}
              aria-label="Run program"
              borderRadius={50}
              size="sm"
              zIndex={10}
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
              onClick={() => props.callExecuteStep()}
              zIndex={10}
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
              zIndex={10}
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
              zIndex={10}
              onClick={() => {
                // share.currentProcessor?.reset();
                // share.currentPc = share.pcStart;
                WorkerService.instance.resetCpu();
                share.currentProcessor?.reset()
                if (share.currentProcessor){
                  share.currentProcessor.halted = true;
                  share.currentProcessor.frequency = 1000;
                  share.processorFrequency = 1000;
                }
                clearInterval(share.interval ?? 0);
              }}
            >
              Reset
            </IconButton>
          </Tooltip>
          <Tooltip label="Screen">
            <IconButton icon={<CgScreen/>}  aria-label={"Screen"} backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              zIndex={10}
              onClick={() => {
                setScreenModalOpen(!screenModalOpen);
              }} />
          </Tooltip>
          <Tooltip label="Configuration">
            <IconButton
              icon={
                <Icon
                  as={RiSettings2Fill}
                  style={{ transform: "scale(1.2)" }}
                />
              }
              zIndex={10}
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
          <Tooltip label="Save">
            <IconButton
              icon={
                <Icon
                  as={IoMdSave}
                  style={{ transform: "scale(1.2)" }}
                />
              }
              zIndex={10}
              aria-label="Save"
              backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              onClick={() => {
                share.saveProgram(share.programTitle.toLowerCase(), share.code);
                toast({
                  title: "Code saved",
                  description: "Your code has been saved",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
            }}
            >
              Save
            </IconButton>
          </Tooltip>
          <Tooltip label="Load">
            <IconButton
              icon={
                <Icon
                  as={FaFolderOpen}
                  style={{ transform: "scale(1.2)" }}
                />
              }
              zIndex={10}
              aria-label="Load"
              backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              onClick={() => setLoadProgramModalOpen(true)}
            >
              Load
            </IconButton>
          </Tooltip>
          <Tooltip label="Download Code">
            <IconButton
              icon={
                <Icon
                  as={FaDownload}
                  style={{ transform: "scale(1.2)" }}
                />
              }
              zIndex={10}
              aria-label="Download Code"
              backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              onClick={() => {
                function downloadFile() 
                {
                    
                    const element = document.createElement("a");
                    const file = new Blob([share.code], {type: 'text/plain'});
                    element.href = URL.createObjectURL(file);
                    element.download = share.programTitle+".txt";
                    document.body.appendChild(element); // Required for this to work in FireFox
                    element.click();
                }

                try{
                  downloadFile()
                  toast({
                    title: "Code downloaded",
                    description: "Your code has been downloaded",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });
                }
                catch{
                  toast({
                    title: "Something went wrong...",
                    description: "There was an error while trying to download the code",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                }

            }}
            >
              Download
            </IconButton>
          </Tooltip>
        </Stack>
        {configModalOpen ? <ConfigModal
          isOpen={configModalOpen}
          close={() => setConfigModalOpen(false)}
        /> : <></>}
        <LoadProgramModal isOpen={loadProgramModalOpen} close={() => setLoadProgramModalOpen(false)} />
      </Stack>
    </Stack>
  );
}
