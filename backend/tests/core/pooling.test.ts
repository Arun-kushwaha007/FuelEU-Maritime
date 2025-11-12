import { describe, test } from "node:test";  
import assert from "node:assert";  
import { createPoolGreedy, PoolMemberIn } from "../../src/core/application/pooling.js";  
  
describe("pooling", () => {  
  test("createPoolGreedy - invalid pool", () => {  
    const members: PoolMemberIn[] = [  
      { shipId: "R001", cb_before_g: 1000 },  
      { shipId: "R002", cb_before_g: -1500 },  
    ];  
  
    assert.throws(() => createPoolGreedy(members), Error, "Pool invalid: total adjusted CB < 0");  
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
  
  test("should handle deficit ship not exiting worse", () => {  
    const members = [  
      { shipId: "A", cb_before_g: 100 },  
      { shipId: "B", cb_before_g: -50 },  
    ];  
  
    const result = createPoolGreedy(members);  
    const B_after = result.find((r) => r.shipId === "B")!.cb_after_g;  
  
    // B should not exit worse than before  
    assert.ok(B_after >= -50, "Deficit ship should not exit worse");  
  });  
  
  test("should handle surplus ship not exiting negative", () => {  
    const members = [  
      { shipId: "A", cb_before_g: 150 },  // Changed from 50 to make sum positive  
      { shipId: "B", cb_before_g: -100 },  
    ];  
  
    const result = createPoolGreedy(members);  
    const A_after = result.find((r) => r.shipId === "A")!.cb_after_g;  
  
    // A should not exit negative after transferring to B  
    assert.ok(A_after >= 0, "Surplus ship should not exit negative");  
  });  
});