import test, { describe } from "node:test";
import { createPoolGreedy } from "../../src/core/application/pooling";

describe("pooling", () => {
  test("fails if pool sum < 0", () => {
    expect(() =>
      createPoolGreedy([{ shipId:"A", cb_before_g:-200 }, { shipId:"B", cb_before_g:100 }])
    ).toThrow();
  });

  test("redistributes surplus to deficit", () => {
    const members = [
      { shipId:"A", cb_before_g:200 },
      { shipId:"B", cb_before_g:-150 }
    ];

    const result = createPoolGreedy(members);
    const A = result.find(r=>r.shipId==="A")!.cb_after_g;
    const B = result.find(r=>r.shipId==="B")!.cb_after_g;

    expect(A).toBe(50);   // 200 - 150
    expect(B).toBe(0);    // -150 + 150
  });
});
