import { app } from "../src/infrastructure/server/index.js";
import { before, after } from "node:test";
import type { Server } from "node:http";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function resetDatabase() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("NODE_ENV must be 'test' to reset the database.");
  }
  await prisma.$executeRaw`DELETE FROM "Route";`;
  await prisma.$executeRaw`DELETE FROM "BankEntry";`;
  await prisma.$executeRaw`DELETE FROM "Pool";`;
  await prisma.$executeRaw`DELETE FROM "ShipCompliance";`;
  await prisma.$executeRaw`DELETE FROM "PoolMember";`;
}

let server: Server;

before(async () => {
  await resetDatabase();
  server = app.listen(4000);
});

after(() => {
  if (server) {
    server.close();
  }
});
