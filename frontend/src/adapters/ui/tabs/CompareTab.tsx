import { useEffect, useState } from "react";
import { api } from "../../infrastructure/api";
import type { Route } from "../../../core/domain/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import useMedia from "use-media";

type ComparisonRow = {
  routeId: string;
  baselineIntensity: number;
  comparisonIntensity: number;
  percentDiff: number;
  compliant: boolean;
};

export default function CompareTab({
  setSidebarProps,
}: {
  setSidebarProps: (props: any) => void;
}) {
  const [baseline, setBaseline] = useState<Route | null>(null);
  const [rows, setRows] = useState<ComparisonRow[]>([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useMedia({ maxWidth: "640px" });

  const fetchData = async () => {
    setLoading(true);
    const res = await api.get("/routes/comparison");
    setBaseline(res.data.baseline);
    setRows(res.data.rows);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setSidebarProps({
      compareRows: rows,
    });
  }, [rows, setSidebarProps]);

  if (loading || !baseline) return <div className="p-4">Loading…</div>;

  const chartData = rows.map((r) => ({
    routeId: r.routeId,
    baseline: baseline.ghgIntensity,
    comparison: r.comparisonIntensity,
    comparisonColor: r.compliant ? "#10B981" : "#EF4444", // green / red
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Compare Routes</CardTitle>
          <CardDescription>
            Compare routes to the baseline ({baseline.routeId}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="grid gap-4">
              {rows.map((r) => (
                <Card key={r.routeId}>
                  <CardHeader>
                    <CardTitle>{r.routeId}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      Baseline Intensity: {r.baselineIntensity.toFixed(3)}
                    </div>
                    <div>
                      Comparison Intensity: {r.comparisonIntensity.toFixed(3)}
                    </div>
                    <div>% Difference: {r.percentDiff.toFixed(2)}%</div>
                    <div>
                      Compliant:{" "}
                      <Badge variant={r.compliant ? "default" : "destructive"}>
                        {r.compliant ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Baseline Intensity</TableHead>
                  <TableHead>Comparison Intensity</TableHead>
                  <TableHead>% Difference</TableHead>
                  <TableHead>Compliant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.routeId}>
                    <TableCell>{r.routeId}</TableCell>
                    <TableCell>{r.baselineIntensity.toFixed(3)}</TableCell>
                    <TableCell>{r.comparisonIntensity.toFixed(3)}</TableCell>
                    <TableCell>{r.percentDiff.toFixed(2)}%</TableCell>
                    <TableCell>
                      <Badge variant={r.compliant ? "default" : "destructive"}>
                        {r.compliant ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>GHG Intensity Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="routeId" />
              <YAxis />
              <Tooltip />
              <Legend />

              {/* Baseline bars - stable neutral gray */}
              <Bar dataKey="baseline" name="Baseline" fill="#4B5563" />

              {/* Comparison bars - dynamic color */}
              <Bar dataKey="comparison" name="Comparison">
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.comparisonColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
