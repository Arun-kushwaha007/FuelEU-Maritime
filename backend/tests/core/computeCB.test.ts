import { test } from "node:test";
import assert from "node:assert";
import { computeCBForRoute } from "../../src/core/application/computeCB.js";
import { Route } from "../../src/core/domain/types.js";

test("computeCBForRoute", () => {
  const route: Route = {
    routeId: "R001",
    vesselType: "VLCC",
    fuelType: "HFO",
    year: 2024,
    ghgIntensity: 90,
    fuelConsumption_t: 100,
    distance_km: 1000,
    totalEmissions_t: 300,
  };

  const result = computeCBForRoute(route, 89.3368);

  assert.strictEqual(result.energy_MJ, 4100000);
  assert.ok(result.complianceBalance_gco2eq < -2718119 && result.complianceBalance_gco2eq > -2718121);
});
