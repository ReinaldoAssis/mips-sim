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
    IconButton,
    Icon,
  } from "@chakra-ui/react";
  import SISMIPS from "../../../../Hardware/SIS Mips/SIS";
  import SharedData from "../../../../Service/SharedData";
  import React from "react";
  import MonoMIPS from "../../../../Hardware/Mono Mips/MonoMIPS";
import DeleteProgramAlert from "./DeleteProgramAlert";
import { ReactIcon } from "@chakra-ui/icons";
import { MdDelete } from "react-icons/md";
  
export default function LoadProgramModal(props: {
    isOpen: boolean;
    close: Function;
  }){

    const share: SharedData = SharedData.instance;
    const [cachedPrograms, setCachedPrograms] = React.useState<string[]>([]);

    React.useEffect(() => {
      // if(cachedPrograms.length == 0){
        setCachedPrograms(share.getListOfCachedPrograms() as string[]);

      // }
    }, [props.isOpen, props.close])

    const [deletePromptOpen, setDeletePromptOpen] = React.useState<boolean>(false);
    const [selectedProgram, setSelectedProgram] = React.useState<string>("");


    return (
      <>
        <Modal isOpen={props.isOpen} onClose={() => props.close()}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Load Program</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack direction="column" spacing={2}>
                <Text>Programs</Text>
                {
                    cachedPrograms.map((program, index) => {
                        return (
                            <Flex key={index} style={{verticalAlign:"center"}}>
                              <Button key={index} width="80%" onClick={() => {
                                share.code = share.loadProgram(program);
                                share.updateMonacoCode();
                                share.programTitle = program.toLocaleUpperCase();
                            }}>{program}</Button>
                             <IconButton aria-label="Delete" borderRadius={30} style={{backgroundColor:"black", marginLeft:"20px"}} icon={<MdDelete color={"white"}/>} onClick={() => {
                              setDeletePromptOpen(true);
                              setSelectedProgram(program);
                             }}  />
                            </Flex>
                        )
                    })
                }
              </Stack>
            </ModalBody>
    
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={() => props.close()}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <DeleteProgramAlert isOpen={deletePromptOpen} close={() => setDeletePromptOpen(false)} delete={() => {
          share.removeProgram(selectedProgram);
          console.log("deleted program", selectedProgram);
        }} />
        </>
      );
}
