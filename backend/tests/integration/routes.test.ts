import test, { describe } from "node:test";
import assert from "node:assert";
import request from "supertest";

describe("Routes API", () => {
  test("GET /routes returns seeded data", async () => {
    const res = await request("http://localhost:4000")
      .get("/api/routes")
      .expect(200);
    assert.ok(res.body.length > 0, "Expected at least one route");
  });

  test("POST /routes/:id/baseline updates baseline", async () => {
    await request("http://localhost:4000")
      .post("/api/routes/R002/baseline")
      .expect(200);

    const res = await request("http://localhost:4000").get("/api/routes");
    const r002 = res.body.find((r: any) => r.routeId === "R002");

    assert.strictEqual(r002.isBaseline, true);
  });
});
