import request from "supertest";  
import { app } from "../../src/infrastructure/server/index.js";  
import { describe, test } from "node:test";  
import assert from "node:assert";  
  
describe("Routes API", () => {  
  test("GET /routes returns seeded data", async () => {  
    const res = await request(app)  
      .get("/api/routes")  // Added /api prefix  
      .expect(200);  
    assert.ok(res.body.length > 0, "Expected at least one route");  
  });  
  
  test("POST /routes/:id/baseline updates baseline", async () => {  
    await request(app)  
      .post("/api/routes/R002/baseline")  // Added /api prefix  
      .expect(200);  
  
    const res = await request(app).get("/api/routes");  // Added /api prefix  
    const r002 = res.body.find((r: { routeId: string; }) => r.routeId === "R002");  
  
    assert.ok(r002, "R002 not found");  
    assert.strictEqual(r002.isBaseline, true);  
  });  
});