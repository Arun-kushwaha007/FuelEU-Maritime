import React, { useEffect, useState } from "react";
import { api } from "../../infrastructure/api";
import type{ Route } from "../../../core/domain/types";

export default function RoutesTab(){
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filters, setFilters] = useState({ vesselType: "", fuelType: "", year: ""});
  const [loading, setLoading] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    const r = await api.get<Route[]>("/routes");
    setRoutes(r.data);
    setLoading(false);
  };

  useEffect(() => { fetchRoutes(); }, []);

  const setBaseline = async (routeId: string) => {
    try {
      await api.post(`/routes/${routeId}/baseline`);
      await fetchRoutes();
    } catch (e: any) {
      alert(e?.response?.data?.error || e.message);
    }
  };

  const filtered = routes.filter(rt => {
    if (filters.vesselType && rt.vesselType !== filters.vesselType) return false;
    if (filters.fuelType && rt.fuelType !== filters.fuelType) return false;
    if (filters.year && String(rt.year) !== filters.year) return false;
    return true;
  });

  const unique = (k: keyof Route) => Array.from(new Set(routes.map(r => String(r[k])))).sort();

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <select className="border p-2" value={filters.vesselType} onChange={e=>setFilters(s=>({...s, vesselType:e.target.value}))}>
          <option value="">All vessel types</option>
          {unique("vesselType").map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select className="border p-2" value={filters.fuelType} onChange={e=>setFilters(s=>({...s, fuelType:e.target.value}))}>
          <option value="">All fuels</option>
          {unique("fuelType").map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select className="border p-2" value={filters.year} onChange={e=>setFilters(s=>({...s, year:e.target.value}))}>
          <option value="">All years</option>
          {unique("year").map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <button className="ml-auto bg-gray-900 text-white px-3 py-2 rounded" onClick={fetchRoutes}>Refresh</button>
      </div>

      {loading ? <div>Loading…</div> : (
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {["routeId","vesselType","fuelType","year","ghgIntensity","fuelConsumption (t)","distance (km)","totalEmissions (t)","actions"].map(h=>
                <th key={h} className="p-2 text-left">{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.routeId} className="border-b">
                <td className="p-2">{r.routeId}</td>
                <td className="p-2">{r.vesselType}</td>
                <td className="p-2">{r.fuelType}</td>
                <td className="p-2">{r.year}</td>
                <td className="p-2">{r.ghgIntensity}</td>
                <td className="p-2">{r.fuelConsumption_t}</td>
                <td className="p-2">{r.distance_km}</td>
                <td className="p-2">{r.totalEmissions_t}</td>
                <td className="p-2">
                  <button className="px-2 py-1 bg-blue-600 text-white rounded mr-2" onClick={()=>setBaseline(r.routeId)}>Set Baseline</button>
                  <button className="px-2 py-1 bg-gray-200" onClick={async ()=>{
                    const res = await api.get(`/compliance/cb?routeId=${r.routeId}`);
                    const cb = res.data;
                    alert(`CB for ${r.routeId}: ${(cb.complianceBalance_gco2eq/1e6).toFixed(3)} tCO2e`);
                  }}>CB</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
