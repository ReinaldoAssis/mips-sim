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

    function loadFromFile()
    {
        // Cria um elemento input invisível para selecionar o arquivo
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt'; // Aceita apenas arquivos .txt

      // Ao selecionar o arquivo
      input.onchange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          const file = target.files[0];
          const reader = new FileReader();

          // Ao carregar o conteúdo do arquivo
          reader.onload = (e) => {
            const content = e.target?.result as string;
            share.code = content
            share.updateMonacoCode();
            props.close()
          };

          reader.readAsText(file); // Lê o arquivo como texto
        }
      };

      // Abre o diálogo para selecionar o arquivo
      input.click();
    }

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
            <Button colorScheme="blue" mr={3} onClick={() => loadFromFile()}>
                From File
              </Button>
              <Button colorScheme="red" mr={3} onClick={() => props.close()}>
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
