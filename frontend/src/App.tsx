import { useState } from "react";
import Layout from "./components/Layout";
import RoutesTab from "./adapters/ui/tabs/RoutesTab";
import CompareTab from "./adapters/ui/tabs/CompareTab";
import PoolingTab from "./adapters/ui/tabs/PoolingTab";
import BankingTab from "./adapters/ui/tabs/BankingTab";
import Tabs from "./components/Tabs";
import BottomNav from "./components/BottomNav";
import useMedia from "use-media";

function App() {
  const [activeTab, setActiveTab] = useState("Routes");
  const isMobile = useMedia({ maxWidth: "640px" });

  const tabs = [
    { name: "Routes", content: <RoutesTab setSidebarProps={function (props: any): void {
      throw new Error("Function not implemented.");
    } } /> },
    { name: "Compare", content: <CompareTab setSidebarProps={function (props: any): void {
      throw new Error("Function not implemented.");
    } } /> },
    { name: "Pooling", content: <PoolingTab setSidebarProps={function (props: any): void {
      throw new Error("Function not implemented.");
    } } /> },
    { name: "Banking", content: <BankingTab setSidebarProps={function (props: any): void {
      throw new Error("Function not implemented.");
    } } /> },
  ];

  const onTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    const tab = tabs.find((t) => t.name === activeTab);
    return tab ? tab.content : null;
  };

  return (
    <Layout>
      {/* Container that centers and constrains the width */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-6xl bg-white shadow-md rounded-lg p-6 sm:p-8">
          {isMobile ? (
            renderContent()
          ) : (
            <Tabs tabs={tabs} onTabChange={onTabChange} />
          )}
        </div>
      </div>
      {isMobile && <BottomNav activeTab={activeTab} onTabChange={onTabChange} />}
    </Layout>
  );
}

export default App;
