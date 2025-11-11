import { Route, CBResult, MJ_PER_TON } from "../domain/types.js";

export function computeCBForRoute(route: Route, target = 89.3368): CBResult {
  const energyMJ = route.fuelConsumption_t * MJ_PER_TON;
  const cb_g = (target - route.ghgIntensity) * energyMJ;
  return {
    shipId: route.routeId,
    year: route.year,
    targetIntensity: target,
    actualIntensity: route.ghgIntensity,
    energy_MJ: energyMJ,
    complianceBalance_gco2eq: cb_g
  };
}
