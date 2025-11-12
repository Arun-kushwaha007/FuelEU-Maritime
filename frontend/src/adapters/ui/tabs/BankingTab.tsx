import { useState, useEffect } from "react";
import { api } from "../../infrastructure/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function BankingTab({
  setSidebarProps,
}: {
  setSidebarProps: (props: any) => void;
}) {
  const [shipId, setShipId] = useState("R001");
  const [year, setYear] = useState("2024");

  const [cb, setCb] = useState<any>(null);
  const [bankData, setBankData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchCB = async () => {
    setLoading(true);
    //
    // NB: We fetch the *adjusted* CB here to ensure the UI always reflects
    // the true compliance balance after any banking actions have occurred.
    //
    const res = await api.get(`/compliance/adjusted-cb?year=${year}`);
    const entry = res.data.find((e: any) => e.shipId === shipId);
    setCb({ complianceBalance_gco2eq: entry?.cb_before_g ?? 0 });

    const bankRes = await api.get(
      `/banking/records?shipId=${shipId}&year=${year}`
    );
    setBankData(bankRes.data);
    setLoading(false);
  };

  const bankSurplus = async () => {
    if (!cb || cb.complianceBalance_gco2eq <= 0) return;
    await api.post("/banking/bank", { shipId, year: Number(year) });
    await fetchCB();
  };

  const applyBank = async () => {
    if (
      !cb ||
      cb.complianceBalance_gco2eq >= 0 ||
      !bankData ||
      bankData.totalBanked <= 0
    )
      return;
    await api.post("/banking/apply", { shipId, year: Number(year) });
    await fetchCB();
  };

  useEffect(() => {
    setSidebarProps({
      currentCB_g: cb?.complianceBalance_gco2eq,
      bankAvailable_g: bankData?.totalBanked,
    });
  }, [cb, bankData, setSidebarProps]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banking</CardTitle>
        <CardDescription>
          Manage your compliance balance and banked allowances.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Select value={shipId} onValueChange={setShipId}>
            <SelectTrigger>
              <SelectValue placeholder="Select ship" />
            </SelectTrigger>
            <SelectContent>
              {["R001", "R002", "R003", "R004", "R005"].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Button onClick={fetchCB}>Fetch CB + Bank Data</Button>
        </div>

        {loading && <div>Loading…</div>}

        {cb && (
          <Card>
            <CardHeader>
              <CardTitle>Compliance Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <b>CB (grams):</b> {cb.complianceBalance_gco2eq.toFixed(0)}
              </p>
              <p>
                <b>CB (tonnes):</b>{" "}
                {(cb.complianceBalance_gco2eq / 1e6).toFixed(3)} tCO₂e
              </p>
            </CardContent>
          </Card>
        )}

        {bankData && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Bank Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <b>Total Banked:</b>{" "}
                {(bankData.totalBanked ?? 0).toFixed(0)} gCO₂e (
                {((bankData.totalBanked ?? 0) / 1e6).toFixed(3)} t)
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  disabled={!cb || !bankData || cb.complianceBalance_gco2eq <= 0}
                  onClick={bankSurplus}
                >
                  Bank Surplus
                </Button>
                <Button
                  disabled={
                    !cb ||
                    !bankData ||
                    cb.complianceBalance_gco2eq >= 0 ||
                    (bankData.totalBanked ?? 0) <= 0
                  }
                  onClick={applyBank}
                >
                  Apply Bank to Deficit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
