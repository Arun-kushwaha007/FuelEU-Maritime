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

export default router;
