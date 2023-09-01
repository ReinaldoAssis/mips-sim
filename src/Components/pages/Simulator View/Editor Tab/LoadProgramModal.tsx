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
  import MonoMIPS from "../../../../Hardware/Mono Mips/MonoMIPS";
  
export default function LoadProgramModal(props: {
    isOpen: boolean;
    close: Function;
  }){

    const share: SharedData = SharedData.instance;

    React.useEffect(() => {
        console.log(share.getListOfCachedPrograms())
    }, [])

    return (
        <Modal isOpen={props.isOpen} onClose={() => props.close()}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Load Program</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack direction="column" spacing={2}>
                <Text>Programs</Text>
                {
                    share.getListOfCachedPrograms().map((program, index) => {
                        return (
                            <Button key={index} onClick={() => {
                                share.code = share.loadProgram(program);
                                share.updateMonacoCode();
                            }}>{program}</Button>
                        )
                    })
                }
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
