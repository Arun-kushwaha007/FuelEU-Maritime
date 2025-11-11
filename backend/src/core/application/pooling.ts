// /backend/src/core/application/pooling.ts
export type PoolMemberIn = { shipId: string; cb_before_g: number };
export type PoolMemberOut = { shipId: string; cb_after_g: number };

export function createPoolGreedy(members: PoolMemberIn[]): PoolMemberOut[] {
  const sum = members.reduce((s,m)=>s+m.cb_before_g,0);
  if (sum < 0) throw new Error("Pool invalid: total adjusted CB < 0");

  const after = new Map(members.map(m=>[m.shipId, m.cb_before_g]));
  const surpluses = [...members].filter(m=>m.cb_before_g>0).sort((a,b)=>b.cb_before_g-a.cb_before_g);
  const deficits  = [...members].filter(m=>m.cb_before_g<0).sort((a,b)=>a.cb_before_g-b.cb_before_g);

  for (const d of deficits) {
    let need = -after.get(d.shipId)!;
    for (const s of surpluses) {
      if (need<=0) break;
      const sAvail = after.get(s.shipId)!;
      if (sAvail<=0) continue;
      const xfer = Math.min(sAvail, need);
      after.set(s.shipId, sAvail - xfer);
      after.set(d.shipId, after.get(d.shipId)! + xfer);
      need -= xfer;
    }
    if (need > 1e-6) throw new Error("Could not cover deficit");
  }
  return members.map(m=>({ shipId:m.shipId, cb_after_g: after.get(m.shipId)! }));
}
