// src/contexts/TabsContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { Instruction } from '../../../../../Service/SharedData';

interface TabItem {
  id: string;
  title: string;
  content: React.ReactNode;
  editorCode?: string;
  program?: Array<Instruction>;
}

interface TabsContextType {
  tabs: TabItem[];
  selectedTab: string | null;
  addTab: (uid?: string | null, title?: string) => string;
  removeTab: (id: string) => void;
  selectTab: (id: string) => void;
  renameTab: (id: string, newTitle: string) => void;
  setEditorCode: (id: string, newCode: string) => void;
  getEditorCode: (id: string) => string;
  setProgram: (id:string, program: Array<Instruction>) => void;  
  getProgram: () => Array<Instruction>;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const uuid = () => Math.random().toString(36).substring(2, 15);

export const TabsProvider: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  const addTab = (uid?: string | null, title: string = ""): string => {
    const newTabs = [...tabs];
    uid = uuid();
    newTabs.push({ id: uid, title: title ? title : `Tab ${newTabs.length + 1}`, content: `Tab Content ${newTabs.length + 1}`, editorCode: "" });
    setTabs(newTabs);
    setSelectedTab(uid);

    console.log('Added Tab:', newTabs.find(tab => tab.id === uid));
    return uid;
  };

  const removeTab = (id: string) => {
    const newTabs = tabs.filter(tab => tab.id !== id);
    setTabs(newTabs);
    if (selectedTab === id) {
      setSelectedTab(newTabs.length > 0 ? newTabs[0].id : null);
    }
  };

  const selectTab = (id: string) => {
    // const editorCode = tabs.find(tab => tab.id === id)?.editorCode ?? "";
    // if (editorCode !== "" ) setEditorCode(id, tabs.find(tab => tab.id === id)?.editorCode ?? "");
    setSelectedTab(id);
  };

  const renameTab = (id: string, newTitle: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === id ? { ...tab, title: newTitle } : tab
      )
    );
  };

  const setEditorCode = (id: string, newCode: string) => {
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.map((tab) =>
        tab.id === id ? { ...tab, editorCode: newCode } : tab
      );
      console.log('Updated Tabs:', updatedTabs);
      return updatedTabs;
    });
  };

  const getEditorCode = (id?: string) => {
    if (id === undefined) return tabs.find(tab => tab.id === selectedTab)?.editorCode ?? "";
    return tabs.find(tab => tab.id === id)?.editorCode ?? "";
  }

  const setProgram = (id:string, program : Array<Instruction>) => {
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.map((tab) =>
        tab.id === id ? { ...tab, program: program } : tab
      );
      
      return updatedTabs;
    });
  }

  const getProgram = (id?: string) => {
    if (id === undefined) return tabs.find(tab => tab.id === selectedTab)?.program ?? [];
    return tabs.find(tab => tab.id === id)?.program ?? [];
  }


  return (
    <TabsContext.Provider value={{ tabs, selectedTab, addTab, removeTab, selectTab, renameTab, setEditorCode, getEditorCode, setProgram, getProgram }}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
};