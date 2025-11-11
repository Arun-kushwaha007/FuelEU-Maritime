import React, { useEffect, useState } from "react";
import { api } from "../../infrastructure/api";
import type { Route } from "../../../core/domain/types";
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
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

export default function RoutesTab() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filters, setFilters] = useState({
    vesselType: "all",
    fuelType: "all",
    year: "all",
  });
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchRoutes = async () => {
    setLoading(true);
    const r = await api.get<Route[]>("/routes");
    setRoutes(r.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const setBaseline = async (routeId: string) => {
    try {
      await api.post(`/routes/${routeId}/baseline`);
      await fetchRoutes();
    } catch (e: any) {
      alert(e?.response?.data?.error || e.message);
    }
  };

  const filtered = routes.filter((rt) => {
    if (filters.vesselType !== "all" && rt.vesselType !== filters.vesselType)
      return false;
    if (filters.fuelType !== "all" && rt.fuelType !== filters.fuelType)
      return false;
    if (filters.year !== "all" && String(rt.year) !== filters.year)
      return false;
    return true;
  });

  const unique = (k: keyof Route) =>
    Array.from(new Set(routes.map((r) => String(r[k])))).sort();

  const columns: ColumnDef<Route>[] = [
    {
      accessorKey: "routeId",
      header: "Route ID",
    },
    {
      accessorKey: "vesselType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Vessel Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "fuelType",
      header: "Fuel Type",
    },
    {
      accessorKey: "year",
      header: "Year",
    },
    {
      accessorKey: "ghgIntensity",
      header: "GHG Intensity",
    },
    {
      accessorKey: "fuelConsumption_t",
      header: "Fuel Consumption (t)",
    },
    {
      accessorKey: "distance_km",
      header: "Distance (km)",
    },
    {
      accessorKey: "totalEmissions_t",
      header: "Total Emissions (t)",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const route = row.original;
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBaseline(route.routeId)}
            >
              Set Baseline
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const res = await api.get(
                  `/compliance/cb?routeId=${route.routeId}`
                );
                const cb = res.data;
                alert(
                  `CB for ${route.routeId}: ${(
                    cb.complianceBalance_gco2eq / 1e6
                  ).toFixed(3)} tCO2e`
                );
              }}
            >
              CB
            </Button>
          </>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Routes</CardTitle>
        <CardDescription>
          Browse and manage your shipping routes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Select
            value={filters.vesselType}
            onValueChange={(value: any) =>
              setFilters((s) => ({ ...s, vesselType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All vessel types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vessel types</SelectItem>
              {unique("vesselType").map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.fuelType}
            onValueChange={(value: any) =>
              setFilters((s) => ({ ...s, fuelType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All fuels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fuels</SelectItem>
              {unique("fuelType").map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.year}
            onValueChange={(value: any) => setFilters((s) => ({ ...s, year: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {unique("year").map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="ml-auto" onClick={fetchRoutes}>
            Refresh
          </Button>
        </div>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                          
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
