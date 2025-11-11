import React, { useEffect, useState } from "react";
import { api } from "../../infrastructure/api";

type Member = { shipId: string; cb_before_g: number; };

export default function PoolingTab() {
  const [year, setYear] = useState("2024");
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<{ [shipId: string]: boolean }>({});
  const [result, setResult] = useState<any>(null);

  const fetchAdjusted = async () => {
    const res = await api.get(`/compliance/adjusted-cb?year=${year}`);
    setMembers(res.data);
    setSelected({});
    setResult(null);
  };

  useEffect(() => { fetchAdjusted(); }, [year]);

  const selectedMembers = members.filter(m => selected[m.shipId]);

  const poolSum = selectedMembers.reduce((sum, m) => sum + m.cb_before_g, 0);

  const isValidPool = selectedMembers.length >= 2 && poolSum >= 0;

  const createPool = async () => {
    const payload = {
      year: Number(year),
      members: selectedMembers.map(m=>({
        shipId: m.shipId,
        cb_before_g: m.cb_before_g
      }))
    };
    const res = await api.post("/pools", payload);
    setResult(res.data);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Pooling</h2>

      <div className="flex gap-2">
        <select className="border p-2" value={year} onChange={e=>setYear(e.target.value)}>
          {["2024","2025"].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button className="bg-black text-white px-3 py-2 rounded" onClick={fetchAdjusted}>
          Refresh
        </button>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Select</th>
            <th className="p-2 text-left">Ship</th>
            <th className="p-2 text-left">Adjusted CB (g)</th>
            <th className="p-2 text-left">Adjusted CB (tonnes)</th>
          </tr>
        </thead>
        <tbody>
          {members.map(m=>(
            <tr key={m.shipId} className="border-b">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={!!selected[m.shipId]}
                  onChange={e=>setSelected(s=>({...s, [m.shipId]: e.target.checked}))}
                />
              </td>
              <td className="p-2">{m.shipId}</td>
              <td className="p-2">{m.cb_before_g.toFixed(0)}</td>
              <td className="p-2">{(m.cb_before_g / 1e6).toFixed(3)} t</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-4 border rounded bg-white space-y-2">
        <p><b>Pool Sum:</b> {(poolSum/1e6).toFixed(3)} tCO₂e</p>
        <p className={poolSum >= 0 ? "text-green-600" : "text-red-600"}>
          {poolSum >= 0 ? "Valid pool (≥ 0)" : "Invalid pool (sum < 0)"}
        </p>

        <button
          className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-40"
          disabled={!isValidPool}
          onClick={createPool}
        >
          Create Pool
        </button>
      </div>

      {result && (
        <div className="border p-4 rounded bg-white">
          <h3 className="font-semibold mb-2">Pool Result</h3>
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Ship</th>
                <th className="p-2 text-left">Before (t)</th>
                <th className="p-2 text-left">After (t)</th>
              </tr>
            </thead>
            <tbody>
              {result.members.map((m:any)=>(
                <tr key={m.shipId} className="border-b">
                  <td className="p-2">{m.shipId}</td>
                  <td className="p-2">{(m.cb_before/1e6).toFixed(3)}</td>
                  <td className="p-2">{(m.cb_after/1e6).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
