import { test } from "node:test";
import assert from "node:assert";
import { createPoolGreedy, PoolMemberIn } from "../../src/core/application/pooling.js";

test("createPoolGreedy - valid pool", () => {
  const members: PoolMemberIn[] = [
    { shipId: "R001", cb_before_g: 1000 },
    { shipId: "R002", cb_before_g: -500 },
  ];

  const result = createPoolGreedy(members);

  assert.strictEqual(result.find(m => m.shipId === "R001")?.cb_after_g, 500);
  assert.strictEqual(result.find(m => m.shipId === "R002")?.cb_after_g, 0);
});

test("createPoolGreedy - invalid pool", () => {
  const members: PoolMemberIn[] = [
    { shipId: "R001", cb_before_g: 1000 },
    { shipId: "R002", cb_before_g: -1500 },
  ];

  assert.throws(() => createPoolGreedy(members), Error, "Pool invalid: total adjusted CB < 0");
});
