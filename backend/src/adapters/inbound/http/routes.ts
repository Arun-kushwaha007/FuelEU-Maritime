import { Router } from "express";
import { PrismaRepository } from "../../outbound/postgres/repository.js";
import { computeCBForRoute } from "../../../core/application/computeCB.js";
import { computeComparison } from "../../../core/application/computeComparison.js";
import { createPoolGreedy } from "../../../core/application/pooling.js";
import { bankSurplus, applyBanked } from "../../../core/application/banking.js";
import { z } from "zod";
import { Route } from "../../../core/domain/types.js";

const router = Router();
const repository = new PrismaRepository();

// Routes
router.get("/routes", async (_req, res) => res.json(await repository.getRoutes()));

router.post("/routes/:routeId/baseline", async (req, res) => {
  const { routeId } = req.params;
  await repository.updateManyRoutes({ where: {} }, { isBaseline: false });
  const updated = await repository.updateRoute(routeId, { isBaseline: true });
  res.json(updated);
});

router.get("/routes/comparison", async (_req, res) => {
  const routes = await repository.getRoutes();
  const baseline = routes.find((r: Route) => r.isBaseline);
  if (!baseline) return res.status(400).json({ error: "No baseline defined" });
  const rows = computeComparison(baseline, routes.filter((r: { routeId: any; })=>r.routeId!==baseline.routeId));
  res.json({ baseline, rows });
});

// Compliance
const complianceQuerySchema = z.object({
  shipId: z.string().optional(),
  year: z.coerce.number().int().optional(),
  routeId: z.string().optional(), // Deprecated
});

router.get("/compliance/cb", async (req, res) => {
  const query = complianceQuerySchema.safeParse(req.query);
  if (!query.success) return res.status(400).json({ error: query.error });

  const { shipId, year, routeId } = query.data;

  if (routeId) {
    // Deprecated: a client is using the old routeId param
    const route = await repository.getRouteById(routeId);
    if (!route) return res.status(404).json({ error: "route not found" });
    const target = Number(process.env.TARGET_INTENSITY ?? 89.3368);
    const cb = computeCBForRoute(route, target);
    return res.json(cb);
  }

  if (!shipId || !year) return res.status(400).json({ error: "shipId and year required" });

  const route = await repository.getRouteById(shipId);
  if (!route) return res.status(404).json({ error: "route not found" });
  const target = Number(process.env.TARGET_INTENSITY ?? 89.3368);
  const cb = computeCBForRoute(route, target);
  res.json(cb);
});

// Banking (minimal; extend as needed)
router.get("/banking/records", async (req, res) => {
  const shipId = String(req.query.shipId || "");
  const year = Number(req.query.year);
  const records = await repository.getBankEntries(shipId, year);
  res.json(records);
});

router.post("/pools", async (req, res) => {
  const { year, members } = req.body as { year: number; members: { shipId: string; cb_before_g: number }[] };
  try {
    const out = createPoolGreedy(members);
    const pool = await repository.createPool({
        year,
        members: out.map(m => ({
          shipId: m.shipId,
          cb_before: members.find(x=>x.shipId===m.shipId)!.cb_before_g,
          cb_after: m.cb_after_g
        }))
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

  const entries = await repository.getBankEntries(String(shipId), Number(year));

  const totalBanked = entries.reduce((sum: any, e: { amount: any; }) => sum + e.amount, 0);

  res.json({ totalBanked, entries });
});


// POST /banking/bank  { shipId, year }
router.post("/banking/bank", async (req, res) => {
  const { shipId, year } = req.body;
  if (!shipId || !year) return res.status(400).json({ error: "shipId and year required" });

  try {
    const entry = await bankSurplus(repository, shipId, year);
    res.json({ message: "Banked", amount_banked: entry.amount, entry });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});


// POST /banking/apply  { shipId, year }
router.post("/banking/apply", async (req, res) => {
  const { shipId, year } = req.body;
  if (!shipId || !year) return res.status(400).json({ error: "shipId and year required" });

  try {
    const route = await repository.getRouteById(shipId);
    if (!route) return res.status(404).json({ error: "route not found" });

    const cbCurrent = computeCBForRoute(route).complianceBalance_gco2eq;
    const entry = await applyBanked(repository, shipId, year, cbCurrent);

    const entries = await repository.getBankEntries(shipId, year);
    const bankTotal = entries.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      shipId,
      year,
      cb_before_g: cbCurrent,
      applied_g: -entry.amount,
      cb_after_g: cbCurrent - entry.amount,
      remaining_bank_g: bankTotal,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});


// GET /compliance/adjusted-cb?year=2024
router.get("/compliance/adjusted-cb", async (req, res) => {
  const { year } = req.query;
  if (!year) return res.status(400).json({ error: "year required" });

  const y = Number(year);

  const routes = (await repository.getRoutes()).filter(r => r.year === y);
  if (!routes.length) return res.json([]);

  const results = [];

  for (const route of routes) {
    // Current CB
    const baseCB = computeCBForRoute(route).complianceBalance_gco2eq;

    // Total banked adjustments from bank_entries
    const entries = await repository.getBankEntries(route.routeId, y);
    const bankTotal = entries.reduce((sum: any, e: { amount: any; }) => sum + e.amount, 0);

    results.push({
      shipId: route.routeId,
      year: y,
      cb_before_g: baseCB + bankTotal // adjusted CB
    });
  }

  res.json(results);
});


export default router;
