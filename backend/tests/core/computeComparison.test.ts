import { test } from "node:test";
import assert from "node:assert";
import { computeComparison } from "../../src/core/application/computeComparison.js";
import { Route } from "../../src/core/domain/types.js";

test("computeComparison", () => {
  const baseline: Route = {
    routeId: "R001",
    vesselType: "VLCC",
    fuelType: "HFO",
    year: 2024,
    ghgIntensity: 90,
    fuelConsumption_t: 100,
    distance_km: 1000,
    totalEmissions_t: 300,
  };

  const others: Route[] = [
    {
      routeId: "R002",
      vesselType: "VLCC",
      fuelType: "HFO",
      year: 2024,
      ghgIntensity: 80,
      fuelConsumption_t: 100,
      distance_km: 1000,
      totalEmissions_t: 300,
    },
    {
      routeId: "R003",
      vesselType: "VLCC",
      fuelType: "HFO",
      year: 2024,
      ghgIntensity: 100,
      fuelConsumption_t: 100,
      distance_km: 1000,
      totalEmissions_t: 300,
    },
  ];

  const result = computeComparison(baseline, others, 89.3368);

  assert.ok(Math.abs(result[0].percentDiff - -11.111) < 0.001);
  assert.strictEqual(result[0].compliant, true);
  assert.ok(Math.abs(result[1].percentDiff - 11.111) < 0.001);
  assert.strictEqual(result[1].compliant, false);
});
