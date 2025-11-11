import React, { JSX, useState } from "react";
import { Button } from "@/components/ui/button";

interface Tab {
  name: string;
  content: JSX.Element;
}

interface TabsProps {
  tabs: Tab[];
}

export default function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        {tabs.map((tab, index) => (
          <Button
            key={tab.name}
            onClick={() => setActiveTab(index)}
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
