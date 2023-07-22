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
} from "@chakra-ui/react";
import SISMIPS from "../../../../Hardware/SIS Mips/SIS";
import SharedData from "../../../../Service/SharedData";
import React from "react";

export default function ConfigModal(props: {
  isOpen: boolean;
  close: Function;
}) {
  const share: SharedData = SharedData.instance;
  const [clockSpeed, setClockSpeed] = React.useState<number>(0);

  React.useEffect(() => {
    setClockSpeed(share.processorFrequency);
  }, [share.processorFrequency]);

  function handleSelectChange(e: any) {
    let simModelValue: string = e.target.value;
    // if (simModelValue == "sis") share.currentProcessor = new SISMIPS();

    console.log("changed model to ", simModelValue);
  }

  function clockSpeedChange(e: any)
  {
    setClockSpeed( e.target.value)
    share.processorFrequency = e.target.value;
    if(share.currentProcessor) share.currentProcessor.frequency = e.target.value;
    console.log(`Share set at ${share.processorFrequency}`)
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
            <Text>Clock speed</Text>
            <Input onChange={clockSpeedChange} value={clockSpeed} style={{width:"40px", marginLeft:10, alignSelf:"center"}} placeholder="10" size="xs"/>
            </Flex>
            <Slider
              aria-label="Clock speed"
              defaultValue={30}
              min={0}
              max={10000}
              isDisabled={true}
            >
              <SliderMark value={2500} mt="1" ml="-2.5" fontSize="sm">
                2.5K
              </SliderMark>
              <SliderMark value={5000} mt="1" ml="-2.5" fontSize="sm">
                5K
              </SliderMark>
              <SliderMark value={7500} mt="1" ml="-2.5" fontSize="sm">
                7.5K
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>

              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>

            <Text style={{ marginTop: 30 }}>Processor model</Text>
            <Select
              defaultValue={"sis"}
              size="md"
              onChange={handleSelectChange}
            >
              <option value="sis">Simplified Instruction Set</option>
              <option value="mono">Monocycle</option>
            </Select>
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
