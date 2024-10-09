import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  Stack,
  Text,
  SliderMark,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Select,
  Button,
  Flex,
  Input,
  Switch,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import SISMIPS from "../../../../Hardware/SIS Mips/SIS";
import SharedData from "../../../../Service/SharedData";
import React from "react";
import MonoMIPS from "../../../../Hardware/Mono Mips/MonoMIPS";

export default function ConfigModal(props: {
  isOpen: boolean;
  close: Function;
}) {
  const share: SharedData = SharedData.instance;
  const [clockSpeed, setClockSpeed] = React.useState<number>(0);
  const toast = useToast();
  
  // controls whether the simulator should run in debug mode
  const [ useDebug, setUseDebug ] = React.useState<boolean>(false);

  const simModelSelector = React.useRef<HTMLSelectElement>(null);

  const [model, setModel] = React.useState<string>("mono");

  const { colorMode, toggleColorMode } = useColorMode()

  React.useEffect(() => {
    setClockSpeed(share.processorFrequency);
    setUseDebug(share.debugInstructions);
    setModel(share.currentProcessor?.refname ?? "mono");
  }, []);

  function handleSelectChange(e: any) {
    let simModelValue: string = e.target.value;
    if (simModelValue == "sis") share.currentProcessor = new SISMIPS();
    else if (simModelValue == "mono") share.currentProcessor = new MonoMIPS();

    setModel(simModelValue);

    console.log("changed model to ", simModelValue);
  }

  function clockSpeedChange(e: any)
  {
    setClockSpeed( e.target.value)
    share.processorFrequency = e.target.value;
    if(share.currentProcessor) share.currentProcessor.frequency = e.target.value;
    console.log(`Share set at ${share.processorFrequency}`)

    if (e.target.value > 100){
      toast({
        title: "Warning",
        description: "The maximum step allowed is 100, any value higher the processor will run without stepping.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }

  }

  return (
    <Modal isOpen={props.isOpen} onClose={() => props.close()}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Configuration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack direction="column" spacing={2}>
            <Flex >
            <Text>Step speed</Text>
            <Input onChange={clockSpeedChange} value={clockSpeed} style={{width:"80px", marginLeft:10, alignSelf:"center"}} placeholder="10" size="xs"/>
            </Flex>

            <Text style={{ marginTop: 30 }}>Debug instructions</Text>
            <Switch isChecked={share.debugInstructions} onChange={(e) => {
              setUseDebug(e.target.checked)
              share.debugInstructions = e.target.checked;
            }}/>

<Button onClick={() => {toggleColorMode(); share.updateCached("theme-data",colorMode == "dark" ? "light" : "dark"); console.log(`THEM DATA ${share.getCached("theme-data")}`)}}>
        Toggle {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'} 
      </Button>

          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={() => props.close()}>
            Close
          </Button>
          <Button variant="ghost">Reset</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
