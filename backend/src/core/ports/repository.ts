import { Route, BankEntry, Pool, ShipCompliance } from "../domain/types.js";

export interface Repository {
  getRoutes(): Promise<Route[]>;
  getRouteById(routeId: string): Promise<Route | null>;
  updateRoute(routeId: string, data: Partial<Route>): Promise<Route>;
  updateManyRoutes(where: any, data: Partial<Route>): Promise<void>;
  getBankEntries(shipId: string, year: number): Promise<BankEntry[]>;
  createBankEntry(data: BankEntry): Promise<BankEntry>;
  getPools(year: number): Promise<Pool[]>;
  createPool(data: Pool): Promise<Pool>;
  getShipCompliance(shipId: string, year: number): Promise<ShipCompliance | null>;
  createShipCompliance(data: ShipCompliance): Promise<ShipCompliance>;
}
