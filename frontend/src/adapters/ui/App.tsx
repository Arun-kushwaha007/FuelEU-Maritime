import React, { useState } from "react";
import RoutesTab from "./tabs/RoutesTab";
import CompareTab from "./tabs/CompareTab";
import BankingTab from "./tabs/BankingTab";
import PoolingTab from "./tabs/PoolingTab";

function Placeholder({label}:{label:string}) {
  return <div className="p-4 text-gray-600">{label} — implement next</div>;
}

export default function App(){
  const [tab, setTab] = useState<"routes"|"compare"|"banking"|"pooling">("routes");
  return (
    <div className="min-h-screen">
      <header className="border-b p-4 flex gap-2">
        {["routes","compare","banking","pooling"].map(t => (
          <button key={t}
            className={`px-3 py-1 rounded ${tab===t ? "bg-black text-white" : "bg-gray-100"}`}
            onClick={()=>setTab(t as any)}>
            {t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
      </header>
      {tab==="routes" && <RoutesTab/>}
      {tab==="compare" && <Placeholder label="Compare Tab"/>}
      {tab==="banking" && <Placeholder label="Banking Tab"/>}
      {tab==="pooling" && <Placeholder label="Pooling Tab"/>}
      {tab==="compare" && <CompareTab/>}
      {tab==="banking" && <BankingTab/>}
      {tab==="pooling" && <PoolingTab/>}
      
    </div>
  );
}
