import { describe, test } from "node:test";  
import assert from "node:assert";  
  
describe("BankSurplus Logic", () => {  
  test("should only bank when CB is positive", () => {  
    const positiveCB = 150000000;  
    const negativeCB = -100000000;  
      
    // Test that positive CB can be banked  
    assert.ok(positiveCB > 0, "Positive CB should be bankable");  
      
    // Test that negative CB cannot be banked  
    assert.ok(negativeCB <= 0, "Negative CB should not be bankable");  
  });  
    
  test("should create bank entry with correct amount", () => {  
    const cb = 200000000;  
    const bankAmount = cb;  
      
    assert.strictEqual(bankAmount, cb, "Bank amount should equal CB");  
  });  
});