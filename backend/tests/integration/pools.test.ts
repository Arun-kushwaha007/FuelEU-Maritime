import test, { describe } from "node:test";
import assert from "node:assert";
import request from "supertest";

describe("Pooling API", () => {
  test("valid pool creation", async () => {
    const adj = await request("http://localhost:4000")
      .get("/api/compliance/adjusted-cb?year=2024")
      .expect(200);

    const chosen = adj.body.slice(0, 2);
    const sum = chosen.reduce((s: number, m: any) => s + m.cb_before_g, 0);
    if (sum < 0) return; // skip if deficit in dataset

    const payload = {
      year: 2024,
      members: chosen.map((m: any) => ({
        shipId: m.shipId,
        cb_before_g: m.cb_before_g,
      })),
    };

    const res = await request("http://localhost:4000")
      .post("/api/pools")
      .send(payload)
      .expect(200);

    assert.strictEqual(res.body.members.length, chosen.length);
  });
});
