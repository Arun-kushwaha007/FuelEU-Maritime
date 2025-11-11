// frontend/src/adapters/ui/Sidebar/KnowledgeSidebar.tsx

import React, { useMemo } from 'react';
import { TARGET_INTENSITY_2025, MJ_PER_TON } from '../../../../core/domain/constants';

type KnowledgeSidebarProps = {
  tab: "routes" | "compare" | "banking" | "pooling";
  baselineRouteId?: string;
  baselineGhgIntensity?: number;
  compareRows?: Array<{ routeId: string; baselineIntensity: number; comparisonIntensity: number; percentDiff: number; compliant: boolean }>;
  currentCB_g?: number; // grams
  bankAvailable_g?: number; // grams
  poolingMembers?: Array<{ shipId: string; cb_before_g: number; cb_after_g?: number }>;
};

const toTonnes = (g?: number) => (typeof g === "number" ? (g / 1e6) : undefined);
const fmt = (n?: number, d = 3) => (typeof n === "number" ? n.toFixed(d) : "—");

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <details className="mb-4" open>
    <summary className="font-bold bg-black cursor-pointer">{title}</summary>
    <div className="mt-2 p-2 bg-black rounded">{children}</div>
  </details>
);

const KnowledgeSidebar: React.FC<KnowledgeSidebarProps> = (props) => {
  const { tab } = props;

  const content = useMemo(() => {
    switch (tab) {
      case 'routes':
        return (
          <>
            <Section title="What you’re seeing">
              <p>This table shows seeded routes. One route is set as Baseline.</p>
            </Section>
            <Section title="Key thresholds">
              <p>Target (2025): {TARGET_INTENSITY_2025} gCO₂e/MJ</p>
            </Section>
            <Section title="Formulas used">
              <pre><code>Energy (MJ) = fuelConsumption_t × {MJ_PER_TON}</code></pre>
              <pre><code>CB (gCO₂e) = (Target − Actual) × Energy</code></pre>
            </Section>
            <Section title="Quick checks">
              <p>Current baseline: {props.baselineRouteId} ({fmt(props.baselineGhgIntensity, 2)} gCO₂e/MJ)</p>
              <p className="text-sm text-gray-500">Hint: Setting a baseline does not change the target; it’s used for comparison visuals.</p>
            </Section>
          </>
        );
      case 'compare':
        const compliantCount = props.compareRows?.filter(r => r.compliant).length || 0;
        const nonCompliantCount = (props.compareRows?.length || 0) - compliantCount;
        const intensities = props.compareRows?.map(r => r.comparisonIntensity) || [];
        return (
          <>
            <Section title="What you’re seeing">
              <p>Compares each route’s GHG intensity to the baseline and shows compliance vs the 2025 target.</p>
            </Section>
            <Section title="Key thresholds">
              <p>Compliant if ghgIntensity ≤ {TARGET_INTENSITY_2025} gCO₂e/MJ</p>
            </Section>
            <Section title="Formulas used">
              <pre><code>percentDiff = ((comparison / baseline) − 1) × 100</code></pre>
            </Section>
            <Section title="Quick checks">
              <p>Compliant rows: {compliantCount} ✅</p>
              <p>Non-compliant rows: {nonCompliantCount} ❌</p>
              <p>Min/Max intensity: {fmt(Math.min(...intensities), 2)} / {fmt(Math.max(...intensities), 2)} gCO₂e/MJ</p>
            </Section>
          </>
        );
      case 'banking':
        return (
          <>
            <Section title="What you’re seeing">
              <p>Bank positive CB (surplus). Apply banked surplus to cover deficits later.</p>
            </Section>
            <Section title="Key thresholds">
              <p>Can only bank if CB &gt; 0.</p>
              <p>Applying must be ≤ available banked amount.</p>
            </Section>
            <Section title="Formulas used">
              <pre><code>CB (gCO₂e) = (Target − Actual) × Energy(MJ)</code></pre>
              <pre><code>CB_tonnes = CB_g / 1e6</code></pre>
            </Section>
            <Section title="Quick checks">
              <p>Current CB: {fmt(toTonnes(props.currentCB_g))} tCO₂e</p>
              <p>Actionability: {(props.currentCB_g || 0) <= 0 ? "Bank disabled if CB ≤ 0" : "Bank enabled"}</p>
              <p>Available bank: {fmt(toTonnes(props.bankAvailable_g))} t</p>
            </Section>
          </>
        );
      case 'pooling':
        const poolSum = props.poolingMembers?.reduce((sum, m) => sum + m.cb_before_g, 0) || 0;
        return (
          <>
            <Section title="What you’re seeing">
              <p>Redistribute surplus to cover deficits inside a pool.</p>
            </Section>
            <Section title="Rules">
              <p>Σ(adjustedCB) ≥ 0</p>
              <p>Deficit ship cannot exit worse.</p>
              <p>Surplus ship cannot exit negative.</p>
            </Section>
            <Section title="Quick checks">
              <p>Pool Sum before: {fmt(toTonnes(poolSum))} tCO₂e {poolSum >= 0 ? '✅' : '❌'}</p>
            </Section>
          </>
        );
      default:
        return null;
    }
  }, [tab, props]);

  return (
    <aside
      role="complementary"
      aria-label="Analysis sidebar"
      className="w-full md:w-2/5 bg-black p-4 border-l h-full overflow-y-auto"
    >
      <h2 className="text-xl font-bold mb-4">Knowledge Sidebar</h2>
      {content}
    </aside>
  );
};

export default KnowledgeSidebar;
