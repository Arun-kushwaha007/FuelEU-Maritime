// tests/computeComparison.test.ts
import { computeComparison } from "../../src/core/application/computeComparison.js";
import { describe, test } from "node:test";
import assert from "node:assert";

describe("computeComparison", () => {
  test("percent difference and compliance correct", () => {
    const baseline = { routeId: "R001", ghgIntensity: 91.0 } as any;
    const others = [{ routeId: "R002", ghgIntensity: 88.0 }] as any[];

    const rows = computeComparison(baseline, others);

    const expectedDiff = ((88 / 91) - 1) * 100;
    assert.ok(
      Math.abs(rows[0].percentDiff - expectedDiff) < 1e-6,
      `Expected ${rows[0].percentDiff} ≈ ${expectedDiff}`
    );
    assert.strictEqual(rows[0].compliant, true);
  });
});
