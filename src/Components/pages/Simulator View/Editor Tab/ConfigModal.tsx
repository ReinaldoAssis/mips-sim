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
} from "@chakra-ui/react";
import SISMIPS from "../../../../Hardware/SIS Mips/SIS";
import SharedData from "../../../../Service/SharedData";

export default function ConfigModal(props: {
  isOpen: boolean;
  close: Function;
}) {
  const share: SharedData = SharedData.instance;

  function handleSelectChange(e: any) {
    let simModelValue: string = e.target.value;
    // if (simModelValue == "sis") share.currentProcessor = new SISMIPS();

    console.log("changed model to ", simModelValue);
  }

  return (
    <Modal isOpen={props.isOpen} onClose={() => props.close()}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Configuration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack direction="column" spacing={2}>
            <Text>Clock speed</Text>
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
