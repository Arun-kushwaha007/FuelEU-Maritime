import test, { describe } from "node:test";
import { computeCBForRoute } from "../../src/core/application/computeCB";

describe("computeCBForRoute", () => {
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

    const cb = computeCBForRoute(route, 89.3368);

    // Manual expected:
    // delta = 89.3368 - 91.0 = -1.6632
    // energy = 5000 * 41000 = 205,000,000 MJ
    // cb_g = -1.6632 * 205,000,000 ≈ -341,056,000 g
    expect(Math.round(cb.complianceBalance_gco2eq)).toBe(-341056000);
  });
});
