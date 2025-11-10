import React, { useEffect, useState } from "react";
import { api } from "../../infrastructure/api";
import type{ Route } from "../../../core/domain/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

type ComparisonRow = {
  routeId: string;
  baselineIntensity: number;
  comparisonIntensity: number;
  percentDiff: number;
  compliant: boolean;
};

export default function CompareTab() {
  const [baseline, setBaseline] = useState<Route | null>(null);
  const [rows, setRows] = useState<ComparisonRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await api.get("/routes/comparison");
    setBaseline(res.data.baseline);
    setRows(res.data.rows);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading || !baseline) return <div className="p-4">Loading…</div>;

  const chartData = rows.map(r => ({
    routeId: r.routeId,
    baseline: baseline.ghgIntensity,
    comparison: r.comparisonIntensity
  }));

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Compare Routes to Baseline ({baseline.routeId})</h2>

      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Route</th>
            <th className="p-2 text-left">Baseline Intensity</th>
            <th className="p-2 text-left">Comparison Intensity</th>
            <th className="p-2 text-left">% Difference</th>
            <th className="p-2 text-left">Compliant</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.routeId} className="border-b">
              <td className="p-2">{r.routeId}</td>
              <td className="p-2">{r.baselineIntensity.toFixed(3)}</td>
              <td className="p-2">{r.comparisonIntensity.toFixed(3)}</td>
              <td className="p-2">{r.percentDiff.toFixed(2)}%</td>
              <td className="p-2">{r.compliant ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border p-4 rounded-md bg-white">
        <h3 className="font-semibold mb-2">GHG Intensity Chart</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="routeId" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="baseline" fill="#555" name="Baseline" />
            <Bar dataKey="comparison" fill="#0ea5e9" name="Comparison" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
