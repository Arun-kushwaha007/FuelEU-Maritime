import { useState } from "react";
import RoutesTab from "./tabs/RoutesTab";
import CompareTab from "./tabs/CompareTab";
import BankingTab from "./tabs/BankingTab";
import PoolingTab from "./tabs/PoolingTab";
import KnowledgeSidebar from "../ui/tabs/components/KnowledgeSidebar";

function Placeholder({label}:{label:string}) {
  return <div className="p-4 text-gray-600">{label} </div>;
}

export default function App(){
  const [tab, setTab] = useState<"routes"|"compare"|"banking"|"pooling">("routes");
  const [sidebarProps, setSidebarProps] = useState({});

  return (
    <div className="min-h-screen m-3 p-3  md:flex">
      <main className="flex-1">
        <header className="border-b p-4 flex gap-2">
          {["routes","compare","banking","pooling"].map(t => (
            <button key={t}
              className={`px-3 py-1 rounded ${tab===t ? "bg-black text-white" : "bg-gray-100"}`}
              onClick={()=>setTab(t as any)}>
              {t[0].toUpperCase()+t.slice(1)}
            </button>
          ))}
        </header>
        <div className="p-4">
          {tab==="routes" && <RoutesTab setSidebarProps={setSidebarProps} />}
          {tab==="compare" && <CompareTab setSidebarProps={setSidebarProps} />}
          {tab==="banking" && <BankingTab setSidebarProps={setSidebarProps} />}
          {tab==="pooling" && <PoolingTab setSidebarProps={setSidebarProps} />}
        </div>
      </main>
      <KnowledgeSidebar tab={tab} {...sidebarProps} />
    </div>
  );
}
