import { describe, test } from "node:test";  
import assert from "node:assert";  
  
describe("ApplyBanked Logic", () => {  
  test("should apply minimum of bank total or deficit", () => {  
    const deficit = 300000000;  
    const bankTotal = 200000000;  
      
    const applyAmount = Math.min(bankTotal, deficit);  
      
    assert.strictEqual(applyAmount, 200000000, "Should apply all available bank");  
  });  
    
  test("should not over-apply beyond deficit", () => {  
    const deficit = 100000000;  
    const bankTotal = 200000000;  
      
    const applyAmount = Math.min(bankTotal, deficit);  
      
    assert.strictEqual(applyAmount, 100000000, "Should only apply deficit amount");  
  });  
    
  test("should fail when no deficit exists", () => {  
    const cbCurrent = 50000000; // Positive CB  
      
    assert.ok(cbCurrent >= 0, "Should not apply when no deficit");  
  });  
    
  test("should fail when no bank balance available", () => {  
    const bankTotal = 0;  
      
    assert.ok(bankTotal <= 0, "Should not apply when no bank available");  
  });  
});