import React, { useState } from "react";
import { api } from "../../infrastructure/api";

export default function BankingTab() {
  const [shipId, setShipId] = useState("R001");
  const [year, setYear] = useState("2024");

  const [cb, setCb] = useState<any>(null);
  const [bankData, setBankData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchCB = async () => {
    setLoading(true);
    const res = await api.get(`/compliance/cb?routeId=${shipId}`);
    setCb(res.data);
    const bankRes = await api.get(`/banking/records?shipId=${shipId}&year=${year}`);
    setBankData(bankRes.data);
    setLoading(false);
  };

  const bankSurplus = async () => {
    await api.post("/banking/bank", { shipId, year: Number(year) });
    await fetchCB();
  };

  const applyBank = async () => {
    await api.post("/banking/apply", { shipId, year: Number(year) });
    await fetchCB();
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Banking</h2>

      <div className="flex gap-2">
        <select className="border p-2" value={shipId} onChange={e=>setShipId(e.target.value)}>
          {["R001","R002","R003","R004","R005"].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="border p-2" value={year} onChange={e=>setYear(e.target.value)}>
          {["2024","2025"].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button className="bg-black text-white px-3 py-2 rounded" onClick={fetchCB}>
          Fetch CB + Bank Data
        </button>
      </div>

      {loading && <div>Loading…</div>}

      {cb && (
        <div className="border p-4 rounded bg-white">
          <p><b>CB (grams):</b> {cb.complianceBalance_gco2eq.toFixed(0)}</p>
          <p><b>CB (tonnes):</b> {(cb.complianceBalance_gco2eq/1e6).toFixed(3)} tCO₂e</p>
        </div>
      )}

     {bankData && (
       <div className="border p-4 rounded bg-white space-y-2">
         <p>
           <b>Total Banked:</b>{" "}
           {((bankData.totalBanked ?? 0)).toFixed(0)} gCO₂e (
           {((bankData.totalBanked ?? 0) / 1e6).toFixed(3)} t)
         </p>
     
         <button
           className="px-3 py-2 rounded bg-emerald-600 text-white disabled:opacity-40"
           disabled={!cb || cb.complianceBalance_gco2eq <= 0}
           onClick={bankSurplus}
         >
           Bank Surplus
         </button>
     
         <button
           className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-40"
           disabled={!cb || cb.complianceBalance_gco2eq >= 0 || (bankData.totalBanked ?? 0) <= 0}
           onClick={applyBank}
         >
           Apply Bank to Deficit
         </button>
       </div>
     )}
     
    </div>
  );
}
