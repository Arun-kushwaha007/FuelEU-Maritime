import request from "supertest";
import { app } from "../../src/infrastructure/server/index.js";
import test, { describe } from "node:test";
import assert from "node:assert";

async function getSurplusRoute() {
  const res = await request(app).get("/api/routes");
  for (const r of res.body) {
    const cb = await request(app).get(`/api/compliance/cb?routeId=${r.routeId}`);
    if (cb.body.complianceBalance_gco2eq > 0) {
      return { shipId: r.routeId, year: r.year };
    }
  }
  return null;
}

describe("Banking API", () => {
  test("banking workflow (only for surplus ship)", async () => {
    const target = await getSurplusRoute();
    assert.notStrictEqual(target, null, "No surplus route found");

    const { shipId, year } = target!;

    // Bank surplus
    await request(app)
      .post("/api/banking/bank")
      .send({ shipId, year })
      .expect(200);

    const recRes = await request(app)
      .get(`/api/banking/records?shipId=${shipId}&year=${year}`)
      .expect(200);

    // recRes.body.totalBanked should be > 0
    assert.ok(
      recRes.body.totalBanked > 0,
      `Expected totalBanked > 0, got ${recRes.body.totalBanked}`
    );
  });
});
