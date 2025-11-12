import request from "supertest";  
import { app } from "../../src/infrastructure/server/index.js";  
import { describe, test } from "node:test";  
import assert from "node:assert";  
  
describe("Banking API", () => {  
  test("banking workflow", async () => {  
    // Step 1: compute CB (this creates the shipCompliance record)  
    const cbRes = await request(app)  
      .get("/api/compliance/cb?routeId=R002")  
      .expect(200);  
  
    // Only proceed if CB is positive  
    if (cbRes.body.complianceBalance_gco2eq <= 0) {  
      console.log("Skipping banking test: R002 has no surplus");  
      return;  
    }  
  
    // Step 2: bank surplus  
    const bankRes = await request(app)  
      .post("/api/banking/bank")  
      .send({ shipId: "R002", year: 2024 })  
      .expect(200);  
  
    assert.ok(bankRes.body.amount_banked !== undefined, "amount_banked missing");  
    assert.ok(bankRes.body.amount_banked > 0, "Expected amount_banked > 0");  
  
    // Step 3: get records  
    const recRes = await request(app)  
      .get("/api/banking/records?shipId=R002&year=2024")  
      .expect(200);  
  
    assert.ok(recRes.body.totalBanked > 0, "Expected totalBanked > 0");  
  });  
});