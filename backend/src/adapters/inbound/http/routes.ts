import { Router } from "express";
import { prisma } from "../../../infrastructure/db/client.js";
import { computeCBForRoute } from "../../../core/application/computeCB.js";
import { computeComparison } from "../../../core/application/computeComparison.js";
import { createPoolGreedy } from "../../../core/application/pooling.js";

const router = Router();

// Routes
router.get("/routes", async (_req, res) => res.json(await prisma.route.findMany()));

router.post("/routes/:routeId/baseline", async (req, res) => {
  const { routeId } = req.params;
  await prisma.route.updateMany({ where: {}, data: { isBaseline: false } });
  const updated = await prisma.route.update({ where: { routeId }, data: { isBaseline: true }});
  res.json(updated);
});

router.get("/routes/comparison", async (_req, res) => {
  const routes = await prisma.route.findMany();
  const baseline = routes.find((r: { isBaseline: any; }) => r.isBaseline);
  if (!baseline) return res.status(400).json({ error: "No baseline defined" });
  const rows = computeComparison(baseline, routes.filter((r: { routeId: any; })=>r.routeId!==baseline.routeId));
  res.json({ baseline, rows });
});

// Compliance
router.get("/compliance/cb", async (req, res) => {
  const routeId = String(req.query.routeId || "");
  if (!routeId) return res.status(400).json({ error: "routeId required" });
  const route = await prisma.route.findUnique({ where: { routeId }});
  if (!route) return res.status(404).json({ error: "route not found" });
  const target = Number(process.env.TARGET_INTENSITY ?? 89.3368);
  const cb = computeCBForRoute(route as any, target);
  await prisma.shipCompliance.create({ data: { shipId: route.routeId, year: route.year, cb_gco2eq: cb.complianceBalance_gco2eq }});
  res.json(cb);
});

// Banking (minimal; extend as needed)
router.get("/banking/records", async (req, res) => {
  const shipId = String(req.query.shipId || "");
  const year = Number(req.query.year);
  const records = await prisma.bankEntry.findMany({ where: { shipId, year }});
  res.json(records);
});

router.post("/pools", async (req, res) => {
  const { year, members } = req.body as { year: number; members: { shipId: string; cb_before_g: number }[] };
  try {
    const out = createPoolGreedy(members);
    const pool = await prisma.pool.create({
      data: {
        year,
        members: { create: out.map(m => ({
          shipId: m.shipId,
          cb_before: members.find(x=>x.shipId===m.shipId)!.cb_before_g,
          cb_after: m.cb_after_g
        })) }
      },
      include: { members: true }
    });
    res.json(pool);
  } catch (e:any) {
    res.status(400).json({ error: e.message });
  }
});

// BANKING ENDPOINTS

// GET /banking/records?shipId=R001&year=2024
router.get("/banking/records", async (req, res) => {
  const { shipId, year } = req.query;
  if (!shipId || !year) return res.status(400).json({ error: "shipId and year required" });

  const entries = await prisma.bankEntry.findMany({
    where: { shipId: String(shipId), year: Number(year) },
    orderBy: { createdAt: "asc" }
  });

  const totalBanked = entries.reduce((sum: any, e: { amount: any; }) => sum + e.amount, 0);

  res.json({ totalBanked, entries });
});


// POST /banking/bank  { shipId, year }
router.post("/banking/bank", async (req, res) => {
  const { shipId, year } = req.body;
  if (!shipId || !year) return res.status(400).json({ error: "shipId and year required" });

  const route = await prisma.route.findUnique({ where: { routeId: shipId }});
  if (!route) return res.status(404).json({ error: "route not found" });

  const cb = (await prisma.shipCompliance.findFirst({
    where: { shipId, year },
    orderBy: { createdAt: "desc" }
  }))?.cb_gco2eq;

  if (!cb) return res.status(400).json({ error: "Run CB first via /compliance/cb" });
  if (cb <= 0) return res.status(400).json({ error: "CB is not positive; cannot bank" });

  const entry = await prisma.bankEntry.create({
    data: { shipId, year, amount: cb }
  });

  res.json({ message: "Banked", amount_banked: cb, entry });
});


// POST /banking/apply  { shipId, year }
router.post("/banking/apply", async (req, res) => {
  const { shipId, year } = req.body;
  if (!shipId || !year) return res.status(400).json({ error: "shipId and year required" });

  const route = await prisma.route.findUnique({ where: { routeId: shipId }});
  if (!route) return res.status(404).json({ error: "route not found" });

  const cbCurrent = computeCBForRoute(route).complianceBalance_gco2eq;

  const entries = await prisma.bankEntry.findMany({
    where: { shipId, year },
    orderBy: { createdAt: "asc" }
  });
  const bankTotal = entries.reduce((sum: any, e: { amount: any; }) => sum + e.amount, 0);

  if (cbCurrent >= 0) return res.status(400).json({ error: "Ship has no deficit; nothing to apply" });
  if (bankTotal <= 0) return res.status(400).json({ error: "No banked surplus available" });

  const deficit = Math.abs(cbCurrent);
  const applyAmount = Math.min(bankTotal, deficit);

  // Store the application as a negative entry to reduce bank
  await prisma.bankEntry.create({
    data: { shipId, year, amount: -applyAmount }
  });

  const cbAfter = cbCurrent + applyAmount;

  res.json({
    shipId,
    year,
    cb_before_g: cbCurrent,
    applied_g: applyAmount,
    cb_after_g: cbAfter,
    remaining_bank_g: bankTotal - applyAmount
  });
});


export default router;
