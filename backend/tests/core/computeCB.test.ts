import { test } from "node:test";
import assert from "node:assert";
import { computeCBForRoute } from "../../src/core/application/computeCB.js";
import { Route } from "../../src/core/domain/types.js";

// backend/tests/core/computeCB.test.ts  
test("computes CB for R001 correctly", () => {  
  const route = {  
    routeId: "R001",  
    vesselType: "Container",  
    fuelType: "HFO",  
    year: 2024,  
    ghgIntensity: 91.0,  
    fuelConsumption_t: 5000,  
    distance_km: 12000,  
    totalEmissions_t: 4500,  
  };  
  
  const result = computeCBForRoute(route, 89.3368);  
  
  // delta = 89.3368 - 91.0 = -1.6632  
  // energy = 5000 * 41000 = 205,000,000 MJ  
  // cb_g = -1.6632 * 205,000,000 = -340,956,000 g  
  assert.strictEqual(Math.round(result.complianceBalance_gco2eq), -340956000);  
});