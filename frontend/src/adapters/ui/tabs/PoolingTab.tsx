import { useEffect, useState, useMemo } from "react";
import { api } from "../../infrastructure/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import useMedia from "use-media";

type Member = { shipId: string; cb_before_g: number };

export default function PoolingTab({
  setSidebarProps,
}: {
  setSidebarProps: (props: any) => void;
}) {
  const [year, setYear] = useState("2024");
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<{ [shipId: string]: boolean }>({});
  const [result, setResult] = useState<any>(null);
  const isMobile = useMedia({ maxWidth: "640px" });

  const fetchAdjusted = async () => {
    const res = await api.get(`/compliance/adjusted-cb?year=${year}`);
    const normalized = res.data.map((m: any) => ({
      shipId: m.shipId,
      cb_before_g: Number(m.cb_before_g),
    }));
    setMembers(normalized);
    setSelected({});
    setResult(null);
  };

  useEffect(() => {
    fetchAdjusted();
  }, [year]);

  const selectedMembers = useMemo(
    () => members.filter((m) => selected[m.shipId]),
    [members, selected]
  );

  useEffect(() => {
    setSidebarProps({
      poolingMembers: selectedMembers,
    });
  }, [selectedMembers, setSidebarProps]);

  const poolSum = selectedMembers.reduce((sum, m) => sum + m.cb_before_g, 0);
  const isValidPool = selectedMembers.length >= 2 && poolSum >= 0;

  const createPool = async () => {
    const payload = {
      year: Number(year),
      members: selectedMembers.map((m) => ({
        shipId: m.shipId,
        cb_before_g: m.cb_before_g,
      })),
    };
    const res = await api.post("/pools", payload);
    setResult(res.data);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Pooling</CardTitle>
          <CardDescription>Create and manage compliance pools.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {["2024", "2025"].map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchAdjusted}>Refresh</Button>
          </div>

          {isMobile ? (
            <div className="grid gap-4">
              {members.map((m) => (
                <Card key={m.shipId}>
                  <CardHeader>
                    <CardTitle>{m.shipId}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Checkbox
                        id={m.shipId}
                        checked={!!selected[m.shipId]}
                        onCheckedChange={(checked) =>
                          setSelected((s) => ({
                            ...s,
                            [m.shipId]: Boolean(checked),
                          }))
                        }
                      />
                      <label htmlFor={m.shipId} className="ml-2">
                        Select
                      </label>
                    </div>
                    <div>Adjusted CB (g): {m.cb_before_g.toFixed(0)}</div>
                    <div>
                      Adjusted CB (tonnes): {(m.cb_before_g / 1e6).toFixed(3)} t
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Ship</TableHead>
                  <TableHead>Adjusted CB (g)</TableHead>
                  <TableHead>Adjusted CB (tonnes)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.shipId}>
                    <TableCell>
                      <Checkbox
                        checked={!!selected[m.shipId]}
                        onCheckedChange={(checked) =>
                          setSelected((s) => ({
                            ...s,
                            [m.shipId]: Boolean(checked),
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>{m.shipId}</TableCell>
                    <TableCell>{m.cb_before_g.toFixed(0)}</TableCell>
                    <TableCell>{(m.cb_before_g / 1e6).toFixed(3)} t</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pool Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <b>Pool Sum:</b> {(poolSum / 1e6).toFixed(3)} tCO₂e
          </p>
          <Badge variant={poolSum >= 0 ? "default" : "destructive"}>
            {poolSum >= 0 ? "Valid pool (≥ 0)" : "Invalid pool (sum < 0)"}
          </Badge>
          <Button
            className="mt-4 w-full sm:w-auto"
            disabled={!isValidPool}
            onClick={createPool}
          >
            Create Pool
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Pool Result</CardTitle>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              <div className="grid gap-4">
                {result.members?.map((m: any) => (
                  <Card key={m.shipId}>
                    <CardHeader>
                      <CardTitle>{m.shipId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        Before (t): {(Number(m.cb_before) / 1e6).toFixed(3)}
                      </div>
                      <div>
                        After (t): {(Number(m.cb_after) / 1e6).toFixed(3)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ship</TableHead>
                    <TableHead>Before (t)</TableHead>
                    <TableHead>After (t)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.members?.map((m: any) => (
                    <TableRow key={m.shipId}>
                      <TableCell>{m.shipId}</TableCell>
                      <TableCell>
                        {(Number(m.cb_before) / 1e6).toFixed(3)}
                      </TableCell>
                      <TableCell>
                        {(Number(m.cb_after) / 1e6).toFixed(3)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
