import request from "supertest";
import { app } from "../../src/infrastructure/server/index.js";
import { describe, test } from "node:test";
import assert from "node:assert";

async function getSurplusRoute() {
  const res = await request(app).get("/api/routes");
  if (!Array.isArray(res.body)) {
    return null;
  }
  for (const r of res.body) {
    const cb = await request(app).get(`/api/compliance/cb?routeId=${r.routeId}`);
    if (cb.body.complianceBalance_gco2eq > 0) {
      return { shipId: r.routeId, year: r.year };
    }
  }
  return null;
}

function assertNotNull<T>(val: T, msg?: string): asserts val is NonNullable<T> {
  assert.notStrictEqual(val, null, msg);
  assert.notStrictEqual(val, undefined, msg);
}

describe("Banking API", () => {
  test("banking workflow (only for surplus ship)", async () => {
    const target = await getSurplusRoute();
    assertNotNull(target, "No surplus route found");

    const { shipId, year } = target;

    await request(app)
      .post("/api/banking/bank")
      .send({ shipId, year })
      .expect(200);

    const recRes = await request(app)
      .get(`/api/banking/records?shipId=${shipId}&year=${year}`)
      .expect(200);

    console.log("recRes.body", recRes.body);
    assert.ok(recRes.body.totalBanked > 0, "Expected totalBanked > 0");
  });
});
