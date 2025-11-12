import { test } from "node:test";
import assert from "node:assert";
import { bankSurplus, applyBanked } from "../../src/core/application/banking.js";
import { Repository } from "../../src/core/ports/repository.js";
import { BankEntry, Pool, Route, ShipCompliance } from "../../src/core/domain/types.js";

class MockRepository implements Repository {
  private shipCompliance: ShipCompliance | null = null;
  private bankEntries: BankEntry[] = [];

  setShipCompliance(compliance: ShipCompliance | null) {
    this.shipCompliance = compliance;
  }

  setBankEntries(entries: BankEntry[]) {
    this.bankEntries = entries;
  }

  getRoutes(): Promise<Route[]> {
    throw new Error("Method not implemented.");
  }
  getRouteById(routeId: string): Promise<Route | null> {
    throw new Error("Method not implemented.");
  }
  updateRoute(routeId: string, data: Partial<Route>): Promise<Route> {
    throw new Error("Method not implemented.");
  }
  updateManyRoutes(where: any, data: Partial<Route>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getBankEntries(shipId: string, year: number): Promise<BankEntry[]> {
    return Promise.resolve(this.bankEntries);
  }
  createBankEntry(data: BankEntry): Promise<BankEntry> {
    this.bankEntries.push(data);
    return Promise.resolve(data);
  }
  getPools(year: number): Promise<Pool[]> {
    throw new Error("Method not implemented.");
  }
  createPool(data: Pool): Promise<Pool> {
    throw new Error("Method not implemented.");
  }
  getShipCompliance(shipId: string, year: number): Promise<ShipCompliance | null> {
    return Promise.resolve(this.shipCompliance);
  }
  createShipCompliance(data: ShipCompliance): Promise<ShipCompliance> {
    this.shipCompliance = data;
    return Promise.resolve(data);
  }
}

test("bankSurplus", async () => {
  const repository = new MockRepository();
  repository.setShipCompliance({ shipId: "R001", year: 2024, cb_gco2eq: 1000 });

  const result = await bankSurplus(repository, "R001", 2024);
  assert.strictEqual(result.amount, 1000);
});

test("applyBanked", async () => {
  const repository = new MockRepository();
  repository.setBankEntries([{ shipId: "R001", year: 2024, amount: 1000 }]);

  const result = await applyBanked(repository, "R001", 2024, -500);
  assert.strictEqual(result.amount, -500);
});
