import test, { describe } from "node:test";
import { computeComparison } from "../../src/core/application/computeComparison";

describe("computeComparison", () => {
  test("percent difference and compliance correct", () => {
    const baseline = { routeId:"R001", ghgIntensity: 91.0 } as any;
    const others = [{ routeId:"R002", ghgIntensity: 88.0 }] as any[];

    const rows = computeComparison(baseline, others);
    expect(rows[0].percentDiff).toBeCloseTo(((88/91)-1)*100);
    expect(rows[0].compliant).toBe(true);
  });
});
