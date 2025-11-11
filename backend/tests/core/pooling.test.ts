// tests/pooling.test.ts
import test, { describe } from "node:test";
import assert from "node:assert";
import { createPoolGreedy } from "../../src/core/application/pooling";

describe("pooling", () => {
  test("fails if pool sum < 0", () => {
    assert.throws(() =>
      createPoolGreedy([
        { shipId: "A", cb_before_g: -200 },
        { shipId: "B", cb_before_g: 100 },
      ])
    );
  });

  test("redistributes surplus to deficit", () => {
    const members = [
      { shipId: "A", cb_before_g: 200 },
      { shipId: "B", cb_before_g: -150 },
    ];

    const result = createPoolGreedy(members);
    const A = result.find((r) => r.shipId === "A")!.cb_after_g;
    const B = result.find((r) => r.shipId === "B")!.cb_after_g;

    assert.strictEqual(A, 50); // 200 - 150
    assert.strictEqual(B, 0);  // -150 + 150
  });
});
