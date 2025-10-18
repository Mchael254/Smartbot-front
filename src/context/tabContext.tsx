import { useEffect, useState, type ReactNode } from "react";
import { TabManagerContext } from "../states/tabState";


export const TabManagerProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    console.log("🔁 Global tab changed to:", activeTab);
  }, [activeTab]);

  return (
    <TabManagerContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabManagerContext.Provider>
  );
};