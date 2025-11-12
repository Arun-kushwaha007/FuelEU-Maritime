import { PrismaClient } from "@prisma/client";
import { Repository } from "../../../core/ports/repository.js";
import { Route, BankEntry, Pool, ShipCompliance } from "../../../core/domain/types.js";

export class PrismaRepository implements Repository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getRoutes(): Promise<Route[]> {
    return this.prisma.route.findMany();
  }

  async getRouteById(routeId: string): Promise<Route | null> {
    return this.prisma.route.findUnique({ where: { routeId } });
  }

  async updateRoute(routeId: string, data: Partial<Route>): Promise<Route> {
    return this.prisma.route.update({ where: { routeId }, data });
  }

  async updateManyRoutes(where: any, data: Partial<Route>): Promise<void> {
    await this.prisma.route.updateMany({ where, data });
  }

  async getBankEntries(shipId: string, year: number): Promise<BankEntry[]> {
    return this.prisma.bankEntry.findMany({ where: { shipId, year } });
  }

  async createBankEntry(data: BankEntry): Promise<BankEntry> {
    return this.prisma.bankEntry.create({ data });
  }

  async getPools(year: number): Promise<Pool[]> {
    return this.prisma.pool.findMany({ where: { year }, include: { members: true } });
  }

  async createPool(data: Pool): Promise<Pool> {
    return this.prisma.pool.create({ data: {
      year: data.year,
      members: { create: data.members }
    }, include: { members: true } });
  }

  async getShipCompliance(shipId: string, year: number): Promise<ShipCompliance | null> {
    return this.prisma.shipCompliance.findFirst({ where: { shipId, year }, orderBy: { createdAt: "desc" } });
  }

  async createShipCompliance(data: ShipCompliance): Promise<ShipCompliance> {
    return this.prisma.shipCompliance.create({ data });
  }
}
