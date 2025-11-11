import request from "supertest";
import app from "../../src/adapters/inbound/http/server"; 

describe("Routes API", () => {
  test("GET /routes returns seeded data", async () => {
    const res = await request("http://localhost:4000")
      .get("/api/routes")
      .expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("POST /routes/:id/baseline updates baseline", async () => {
    await request("http://localhost:4000")
      .post("/api/routes/R002/baseline")
      .expect(200);
    const res = await request("http://localhost:4000").get("/api/routes");
    const r002 = res.body.find((r:any)=>r.routeId==="R002");
    expect(r002.isBaseline).toBe(true);
  });
});
