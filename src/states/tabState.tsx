import { createContext, useContext } from "react";


type TabContextType = {
  activeTab: number;
  setActiveTab: (tab: number) => void;
};

export const TabManagerContext = createContext<TabContextType | undefined>(undefined);

export const useTabManager = () => {
  const context = useContext(TabManagerContext);
  if (!context) {
    throw new Error('useTabManager must be used within a TabManagerProvider');
  }
  return context;
};