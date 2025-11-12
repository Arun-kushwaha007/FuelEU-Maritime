import React, { JSX, useState } from "react";
import { Button } from "@/components/ui/button";

interface Tab {
  name: string;
  content: JSX.Element;
}

interface TabsProps {
  tabs: Tab[];
  onTabChange: (tab: string) => void;
}

export default function Tabs({ tabs, onTabChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    onTabChange(tabs[index].name);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        {tabs.map((tab, index) => (
          <Button
            key={tab.name}
            onClick={() => handleTabClick(index)}
            variant={activeTab === index ? "default" : "outline"}
          >
            {tab.name}
          </Button>
        ))}
      </div>
      {tabs[activeTab].content}
    </div>
  );
}
