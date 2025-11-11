import request from "supertest";
import { describe, test } from "node:test";
import assert from "node:assert";

describe("Banking API", () => {
  test("banking workflow", async () => {
    // Step 1: compute CB
    await request("http://localhost:4000")
      .get("/api/compliance/cb?routeId=R002")
      .expect(200);

    // Step 2: bank surplus
    const bankRes = await request("http://localhost:4000")
      .post("/api/banking/bank")
      .send({ shipId: "R002", year: 2024 })
      .expect(200);

    assert.ok(bankRes.body.amount_banked !== undefined, "amount_banked missing");
    assert.ok(bankRes.body.amount_banked > 0, "Expected amount_banked > 0");

    // Step 3: get records
    const recRes = await request("http://localhost:4000")
      .get("/api/banking/records?shipId=R002&year=2024")
      .expect(200);

    assert.ok(recRes.body.totalBanked > 0, "Expected totalBanked > 0");
  });
});
