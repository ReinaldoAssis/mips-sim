import { Button, CloseButton, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { useState } from "react"
import { FaPlus } from "react-icons/fa"
import SingleWindow from "./SingleWindow"

export default function MultiWindowEditor ()
  {
    interface Item {
      id: string
      title: string
      content: React.ReactNode
    }

    // placeholder items
    const items: Item[] = [
      { id: "1", title: "Tab", content: "Tab Content" },
      { id: "2", title: "Tab", content: "Tab Content" },
      { id: "3", title: "Tab", content: "Tab Content" },
      { id: "4", title: "Tab", content: "Tab Content" },
    ]

    const [tabs, setTabs] = useState<Item[]>(items)
    const [selectedTab, setSelectedTab] = useState<string | null>(items[0].id)
    const [isRenamingTab, setIsRenamingTab] = useState(false)
    const [tabToEdit, setTabToEdit] = useState<string | null>(null)
    const [newTitle, setNewTitle] = useState("")

    const uuid = () => {
      return Math.random().toString(36).substring(2, 15)
    }

    const addTab = () => {
      const newTabs = [...tabs]
  
      const uid = uuid()
  
      newTabs.push({
        id: uid,
        title: `Tab`,
        content: `Tab Body`,
      })
  
      setTabs(newTabs)
      setSelectedTab(newTabs[newTabs.length - 1].id)
    }
  
    const removeTab = (id: string) => {
      if (tabs.length > 1) {
        const newTabs = [...tabs].filter((tab) => tab.id !== id)
        setTabs(newTabs)
      }
    }

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
      setTabs((prev) =>
        prev.map((t) => (t.id === tabToEdit ? { ...t, title: newTitle } : t))
      )
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
      onChange={(index) => setSelectedTab(tabs[index].id)}
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
            <SingleWindow />
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