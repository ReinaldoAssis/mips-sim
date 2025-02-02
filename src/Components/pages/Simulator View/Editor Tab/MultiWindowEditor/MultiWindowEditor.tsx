import { Button, CloseButton, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { useState } from "react"
import { FaPlus } from "react-icons/fa"
import { useTabs } from "./MultiWindowContext";
import SingleWindow from "./SingleWindow"


export default function MultiWindowEditor({ callExecuteStep }: { callExecuteStep: () => void }) {
    
  const { tabs, selectedTab, addTab, removeTab, selectTab, renameTab } = useTabs();
  
    const [isRenamingTab, setIsRenamingTab] = useState(false)
    const [tabToEdit, setTabToEdit] = useState<string | null>(null)
    const [newTitle, setNewTitle] = useState("")

    function openRenameModal(id: string, currentTitle: string) {
      setTabToEdit(id)
      setNewTitle(currentTitle)
      setIsRenamingTab(true)
    }
    
    function closeRenameModal() {
      setIsRenamingTab(false)
      setTabToEdit(null)
      setNewTitle("")
    }
    
    function saveNewTitle() {
      renameTab(tabToEdit!, newTitle)
      closeRenameModal()
    }

    function ChangeTabTitleModal (id: string)
    {
      return (
        <Modal isOpen={true} onClose={() => {}}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Change Tab Title</ModalHeader>
            <ModalBody>
              <Input placeholder="Tab Title" />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={() => {}}>
                Save
              </Button>
              <Button onClick={() => {}}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )
    }

    return <>
    <Tabs
      index={tabs.findIndex(tab => tab.id === selectedTab)}
      variant="enclosed"
      size="sm"
      onChange={(index) => selectTab(tabs[index].id)}
    >
      <TabList flex="1 1 auto">
        
        {tabs.map((item) => (

              <Tab key={item.id} onDoubleClick={() => openRenameModal(item.id, item.title)}>
              {item.title}{" "}
              <CloseButton
                as="span"
                role="button"
                size="sm"
                me="-2"
                style={{ marginLeft: "5px"}}
                onClick={(e) => {
                  e.stopPropagation()
                  removeTab(item.id)
                }}
              />
            </Tab>

          
        ))}
        <Button
          alignSelf="center"
          ms="2"
          size="2xs"
          variant="ghost"
          
          onClick={addTab}
        >
          <FaPlus style={{ marginRight: "7px"}} /> Add Tab
        </Button>
      </TabList>

      <TabPanels>
        {tabs.map((item) => (
          <TabPanel key={item.id}>
            {/* <Heading size="xl" my="6">
              {item.content} {item.id}
            </Heading> */}
            <SingleWindow callExecuteStep={callExecuteStep}/>
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
    {isRenamingTab && (
      <Modal isOpen={isRenamingTab} onClose={closeRenameModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Tab Title</ModalHeader>
          <ModalBody>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={saveNewTitle}>
              Save
            </Button>
            <Button onClick={closeRenameModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )}
    </>

  }