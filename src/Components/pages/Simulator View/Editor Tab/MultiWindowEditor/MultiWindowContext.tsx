// src/contexts/TabsContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface TabItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface TabsContextType {
  tabs: TabItem[];
  selectedTab: string | null;
  addTab: () => void;
  removeTab: (id: string) => void;
  selectTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const TabsProvider: React.FC<{children: JSX.Element}> = ({ children }) => {
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  const uuid = () => Math.random().toString(36).substring(2, 15);

  const addTab = () => {
    const newTabs = [...tabs];
    const uid = uuid();
    newTabs.push({ id: uid, title: `Tab ${newTabs.length + 1}`, content: `Tab Content ${newTabs.length + 1}` });
    setTabs(newTabs);
    setSelectedTab(uid);
  };

  const removeTab = (id: string) => {
    const newTabs = tabs.filter(tab => tab.id !== id);
    setTabs(newTabs);
    if (selectedTab === id) {
      setSelectedTab(newTabs.length > 0 ? newTabs[0].id : null);
    }
  };

  const selectTab = (id: string) => {
    setSelectedTab(id);
  };

  return (
    <TabsContext.Provider value={{ tabs, selectedTab, addTab, removeTab, selectTab }}>
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