import React from "react";
import { Home, LineChart, Users2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

type BottomNavProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function BottomNav({
  activeTab,
  onTabChange,
}: BottomNavProps) {
  const tabs = [
    { name: "Routes", icon: <Users2 className="h-5 w-5" /> },
    { name: "Compare", icon: <LineChart className="h-5 w-5" /> },
    { name: "Pooling", icon: <Package className="h-5 w-5" /> },
    { name: "Banking", icon: <Home className="h-5 w-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t sm:hidden">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {tabs.map((tab) => (
          <Button
            key={tab.name}
            variant={activeTab === tab.name ? "secondary" : "ghost"}
            className="inline-flex flex-col items-center justify-center px-5"
            onClick={() => onTabChange(tab.name)}
          >
            {tab.icon}
            <span className="text-sm">{tab.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
