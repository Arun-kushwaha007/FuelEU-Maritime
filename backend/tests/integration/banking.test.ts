import test, { describe } from "node:test";
import request from "supertest";

describe("Banking API", () => {
  test("banking workflow", async () => {
    // Step 1: compute CB
    await request("http://localhost:4000")
      .get("/api/compliance/cb?routeId=R002") // choose a known surplus route
      .expect(200);

    // Step 2: bank surplus
    const bankRes = await request("http://localhost:4000")
      .post("/api/banking/bank")
      .send({ shipId:"R002", year:2024 })
      .expect(200);

    expect(bankRes.body.amount_banked).toBeDefined();

    // Step 3: get records
    const recRes = await request("http://localhost:4000")
      .get("/api/banking/records?shipId=R002&year=2024")
      .expect(200);

    expect(recRes.body.totalBanked).toBeGreaterThan(0);
  });
});
