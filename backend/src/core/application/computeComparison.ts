import { Route } from "../domain/types.js";
export type ComparisonRow = {
  routeId: string; baselineIntensity: number; comparisonIntensity: number;
  percentDiff: number; compliant: boolean;
};
export function computeComparison(baseline: Route, others: Route[], target=89.3368): ComparisonRow[] {
  return others.map(r => ({
    routeId: r.routeId,
    baselineIntensity: baseline.ghgIntensity,
    comparisonIntensity: r.ghgIntensity,
    percentDiff: ((r.ghgIntensity / baseline.ghgIntensity) - 1) * 100,
    compliant: r.ghgIntensity <= target
  }));
}
