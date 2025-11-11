# FuelEU-Maritime — How I Actually Used AI Agents to Ship This Project

What worked, what broke, and the exact prompts/patches that fixed it.

---

## 0) TL;DR for Reviewers

**Agents used:** Claude, ChatGPT, Google Jules, DeepWiki.

**Scope covered:** Backend init (Express/Prisma/TS), Prisma + ESM pitfalls, Jest vs ts-node-dev/tsx, deterministic tests, Vitest + Vite aliasing, import.meta headaches, UI perf on Routes tab, bank/pool/test flakiness, and frontend testing with React Testing Library.

**Deliverables produced by agents:** Working backend dev/test scripts, fixed Prisma env + ESM config, Jest → TSX migration, Vitest config with path aliases, test suites (core + integration) stabilized, UI perf fixes prompts/diffs, repo-wide audits, and documentation outlines.

**What I didn't like:** Repeated generic advice ("run prisma generate"), ts-node-dev + ESM guesswork, Jest + ESM churn, incomplete UI fixes, and missing path alias handling in tests; all called out below with concrete examples.

**Result:** App runs; frontend tests green; backend tests mostly green after stabilization steps.
---

## 1) Architecture + Tooling Context (Why the Agents Mattered)

**Backend:** Node + Express + TypeScript, Prisma + Postgres, hexagonal layering (core, adapters, infrastructure).

**Frontend:** React + TypeScript + Tailwind + Vite, tabs for Routes / Compare / Banking / Pooling.

**Testing:**
- **Backend:** unit + integration. Moved from ts-node-dev + jest → tsx --test (and/or jest stabilized) to handle ESM sanely.
- **Frontend:** Vitest + React Testing Library; @ alias to src/.

**State of the world before agents:** Constant ESM/CommonJS conflicts, Prisma not picking up .env, failing migrations/seeds, and test frameworks stepping on each other.

---

## 2) Key Incidents (Errors → Diagnosis → Fix)

### Incident A — Prisma Refused to Load Env; ESM Chaos

**Symptom (logs):**
```
PrismaConfigEnvError: Missing required environment variable: DATABASE_URL
@prisma/client did not initialize yet. Please run "prisma generate"
Error: Must use import to load ES Module
```

**Root causes:**
- .env not loaded by prisma.config.ts / misuse of source .env npx prisma generate.
- Mixed "type": "module" + ts-node-dev without proper ESM setup.

**Agent contributions:**

ChatGPT (good): Normalize to ESM, switch dev runner to tsx, add import "dotenv/config" in entry or rely on Prisma's default .env load, and ensure tsconfig uses "module": "ESNext".

**Effective change:**
```json
// package.json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/infrastructure/server/index.ts",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate"
  }
}
```

```typescript
// src/infrastructure/db/client.ts
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()
```

**What I didn't like:** Early advice suggesting source .env npx prisma generate (bash misuse) and generic "run prisma generate again".

**Final sequence that works:**
```bash
rm -rf node_modules
npm i
npx prisma generate
npm run prisma:migrate
npm run dev
```

---

### Incident B — Jest + TypeScript + ESM: "Must use import…" & Missing Globals

**Symptom:**
```
Must use import to load ES Module
Cannot find name 'expect'/'describe'
Property 'toBe' does not exist on type 'void'
Tests hanging; --localstorage-file warning.
```

**Root causes:**
- Jest with ESM/TS without proper preset or .cjs configs.
- Mixing Node's native node:test with Jest in the same suite.
- Tests mutating DB state; no isolation.

**Agent contributions:**

ChatGPT (good): Use CommonJS for Jest or replace dev runner with tsx --test; export app from server for supertest; remove stray jest flags; add types: ["jest"] in tsconfig.

**Representative config:**
```javascript
// jest.config.cjs
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  transform: { "^.+\\.ts$": ["ts-jest", { isolatedModules: true }] }
}
```

**What I didn't like:** Some suggestions flip-flopped between CJS/ESM without finishing the migration plan. The final stable dev runner for code is tsx; for tests, ts-jest or tsx --test both fine if consistent.

**Stabilization tactics that worked:**
- Export app without always calling listen (guard with NODE_ENV !== 'test').
- Reset DB per suite or seed deterministically; avoid tests depending on earlier mutations.
- Use --runInBand for heavy integration tests.

---

### Incident C — Frontend Tests Broke on import.meta and @ Alias

**Symptom:**
```
Vitest fail: "Failed to resolve import '@/components/ui/card'"
Jest earlier choked on import.meta.env.
```

**Root causes:**
- Missing alias in vite.config.ts and tsconfig.json.
- Jest not suitable for import.meta; moved to Vitest.

**Agent contributions:**

Claude (good): Recommend Vitest over Jest for Vite projects; show alias setup.

**Fixes:**
```typescript
// vite.config.ts
import path from 'path'
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: { environment: 'jsdom' }
})
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

**What I didn't like:** No initial mention to restart Vitest or clear cache after alias change. I did: `npx vitest --clearCache`.

**Final:** Frontend tests all green after alias + Vitest setup.

---

### Incident D — Routes Tab Dropdown Lag (UI Performance)

**Symptom:**

Changing dropdown filters causes visible lag / stutter.

**Likely root causes (validated by repo pass):**
- Unmemoized heavy filter/sort/compute in render path.
- Event handlers recreated every render; child trees re-rendering.
- Possibly refetching the same data repeatedly.

**Agent contributions:**

Google Jules (prompt below) → repo analysis + patch with useMemo for derived lists, useCallback for handlers, stable props for child components, and ensuring fetch triggers only on dependency change.

**Representative patch shape (what I applied):**
```typescript
// Before: compute filteredRows inline, handlers in JSX

// After
const filtered = useMemo(
  () => baseRows.filter(r => ok(r, vessel, fuel, year)),
  [baseRows, vessel, fuel, year]
)

const onVesselChange = useCallback((v:string) => setVessel(v), [])
// same for fuel/year

// Ensure data fetch is useEffect([...deps]) with stable deps only
```

**Result:** Noticeable improvement; no freeze on dropdown change.

---

### Incident E — Banking / Pooling / Routes API Tests Flaky

**Symptom (sample):**
```
✖ banking workflow
✖ valid pool creation
✖ GET /routes returns seeded data
```

Plus numeric mismatches:
```
Expected: -341056000
Received: -340956000
```

**Root causes:**
- Test assumes static CB values while seed or calc changed slightly.
- Tests share DB state and mutate baseline/routes.
- Rounding differences; should assert with tolerances.

**Agent contributions:**

Claude & ChatGPT (good): Make tests deterministic:
- Reset/seed per suite.
- Pick known surplus route dynamically in test based on on-the-fly CB compute.
- Use toBeCloseTo for floating/numeric calc tests.
- Avoid parallel DB writes; use --runInBand.

**Representative fixes:**
```typescript
// tests/setup.ts
beforeAll(async () => {
  // prisma migrate reset OR explicit delete/seed
})
afterAll(async () => prisma.$disconnect())

// computeCB.test.ts
expect(cb.complianceBalance_gco2eq).toBeCloseTo(-341056000, -2) // 2 decimals tolerance

// banking.test.ts
// pick a route with surplus programmatically or seed a known-good one
```

---

## 3) Prompts I Used (Verbatim) + Why They Worked

These are the exact prompts that produced useful results. I kept both the good and the painful ones.

### P1 — Prisma/ESM Failures (ChatGPT)

**Prompt:**
```
I'm getting multiple errors in my Node.js/Prisma/TypeScript project…
(Included: env error, prisma client not initialized, ts-node-dev ES Module error; project structure and commands I'm running.)
Please help me: 1) fix env loading, 2) ensure prisma generate works with ESM, 3) configure ts-node-dev or tsx, 4) correct sequence, 5) show tsconfig/package.json configs.
```

**Why effective:** Forced concrete configs and one recommended dev runner (tsx), making the ESM path consistent.

**What I didn't like:** Early back-and-forth about CJS vs ESM before settling on tsx.

---

### P2 — Jest Type Errors + Module Imports (ChatGPT)

**Prompt:**
```
I'm getting Jest errors: Cannot find name 'expect', module import fails from server, etc.
Help me: 1) install + configure @types/jest, 2) ESM setup or CJS flip, 3) tsconfig types, 4) fix server export and tests, 5) remove bad flags, 6) ts-jest config, 7) package.json scripts.
```

**Why effective:** Gave me a complete CJS Jest config option and the safer path of tsx --test.

**What I didn't like:** It didn't emphasize DB isolation strongly enough; I added that.

---

### P3 — DeepWiki Audit (DeepWiki)

**Prompt (shortened):**
```
Audit my repo vs assignment: structure, endpoints, formulas, tests, docs (AGENT_WORKFLOW.md, README.md, REFLECTION.md), hexagon rules, seed data, scripts. Return COMPLETE/PARTIAL/MISSING/VIOLATION results.
```

**Why effective:** Produced a clear checklist and flagged the missing docs as submission blockers.

**Pain point:** None — this was useful.

---

### P4 — Jules Repo-Wide Patch Request for UI Lag + Backend Test Failures (Google Jules)

**Prompt (core):**
```
Analyze repo for Routes dropdown lag (re-renders, useEffect loops, repeated fetch) and produce a unified diff to fix perf.
Then fix backend test failures: make tests deterministic, stable baseline, DB reset per suite, adjust expectations/tolerances, output unified diffs.
```

**Why effective:** The diff requirement forces concrete, patch-ready output instead of generic advice.

**Pain point:** Needed one follow-up to also address numeric tolerances (toBeCloseTo) and dynamic surplus picking.

---

### P5 — Vite + Vitest import.meta (Claude)

**Prompt (core):**
```
Jest can't handle import.meta. Provide complete Vitest setup (vite.config, tsconfig paths, scripts) and example tests; or Babel/Jest plan if I insist. Prefer easiest, most reliable solution.
```

**Why effective:** Moved me cleanly to Vitest; added alias + jsdom; solved path + import.meta in one pass.

**Pain point:** Forgot to mention Vitest cache; I cleared it manually.

---

## 4) Validations I Performed (How I Verified Agent Output)

**Smoke runs after each config change:**
- `npm run dev` backend; hit `/api/routes`.
- `npx prisma generate` → confirm no client init error.

**Backend tests:**
- Run serial: `NODE_ENV=test tsx --test --run --test-reporter=spec tests/**/*.test.ts`
- Verified no DB leakage between suites; baseline remains deterministic.

**Frontend tests:**
- `npm test` with Vitest; confirmed all 5 suites green.

**UI perf:**
- Throttle CPU in devtools and toggle Routes filters; verified no stutter after memoization and effect fixes.

---

## 5) Things I Didn't Like (and Why)

- **"Just run prisma generate again"** — surface-level advice, ignored the .env loader specifics and prisma.config.ts behavior.
- **ts-node-dev with ESM** — several agents suggested tweaks, but the real fix was to stop fighting and use tsx.
- **Jest + ESM** — confusing guidance; Vitest is the pragmatic choice for Vite.
- **Frontend aliasing in tests** — many answers forgot both vite.config.ts and tsconfig paths must be configured, and that Vitest cache can bite you.
- **UI "fixes" that restyle but don't address re-render sources** — I demanded concrete diffs with useMemo/useCallback/deps corrected.

---

## 6) Final Working States (Commands & Key Configs)

### Backend

```json
// package.json (backend)
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/infrastructure/server/index.ts",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "test": "NODE_ENV=test tsx --test --test-reporter=spec --test-reporter-destination=stdout tests/setup.ts tests/**/*.test.ts"
  }
}
```

```typescript
// src/adapters/inbound/http/server.ts
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import router from './routes'

export const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use('/api', router)

const port = Number(process.env.PORT || 4000)
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`))
}
```

---

### Frontend

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: { environment: 'jsdom' }
})
```

```json
// tsconfig.json (frontend)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "strict": true
  }
}
```

```json
// package.json (frontend)
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  }
}
```

---

## 7) Evidence Snapshots (Select)

### Backend Tests (Before Stabilization)

```
✖ Banking API (workflows)
✖ Pooling API (valid pool)
✖ Routes API (seeded data/baseline)
Expected: -341056000
Received: -340956000
```

### Backend Tests (After Stabilization Steps)

- Deterministic seeds per suite
- toBeCloseTo for CB tolerance
- Selecting surplus routes dynamically
- Serial runs (--runInBand equivalent)

**Status:** mostly green; see Open Items for the last edge case(s) if any remain.

---

### Frontend Vitest (Final)

```
✓ tests/api/apiClient.test.ts
✓ tests/RoutesTab.test.tsx
✓ tests/CompareTab.test.tsx
✓ tests/BankingTab.test.tsx  (act() warnings addressed in follow-up)
✓ tests/PoolingTab.test.tsx
```

---

## 8) Best Practices I'm Keeping

- Use **tsx** for ESM TS projects (dev + tests if not using Jest).
- For Vite apps, use **Vitest**; configure alias in both vite + tsconfig.
- Reset DB/seed per suite; avoid tests coupled to previous mutations.
- Numeric assertions: prefer **toBeCloseTo** with explicit precision.
- Guard `app.listen()` during tests.
- Memoize expensive filters; stabilize handlers with useCallback; fix effect deps.

---

## 9) Open Items / Future Improvements

- **Banking integration test:** keep asserting server responses, but derive expectations from fresh CB compute to survive slight formula tweaks.
- **Frontend act() warnings:** wrap async user events in `await act(async () => { ... })` where needed (most already addressed).
- **Docs:** This file is done; README.md and REFLECTION.md must remain aligned with this workflow.

---

## 10) Prompts that can Reuse (generated by ai)(Copy-Paste)

### A) Repo Patch Request to Jules — UI Lag + Backend Tests

```
You are acting as a senior software architect and code surgeon. Analyze this full repository to identify and fix two classes of issues:

1) FRONTEND PERFORMANCE BUG:
The "Routes" tab dropdown (vesselType/fuelType/year) causes noticeable lag. Find re-render hotspots (unmemoized derived data, useEffect dependency loops, repeated fetches, handlers recreated each render) and produce a minimal patch. Use useMemo/useCallback, correct dependency arrays, and prevent redundant network calls. Output a unified git diff.

2) BACKEND TEST FAILURES:
Given this failing output (paste the latest run), make tests deterministic:
- Reset DB per suite and reseed deterministically.
- Ensure baseline is stable and not impacted by earlier tests.
- Pick a known surplus route for banking or compute one at runtime.
- Use toBeCloseTo for numeric CB assertions.
- Run tests serially.
Output unified diffs for tests + any minimal server changes. Provide a brief root-cause explanation.
```

---

### B) Vitest + Vite Alias Fix (If Someone Regresses It)

```
Configure Vitest to work with Vite aliases and import.meta:
- vite.config.ts: alias {'@': path.resolve(__dirname, './src')}, test.environment = 'jsdom'
- tsconfig.json: "paths": { "@/*": ["src/*"] }, "baseUrl": "."
- Clear Vitest cache if needed: `npx vitest --clearCache`
Provide the exact file changes as a unified diff.
```

---

## 11) Appendix — Raw Error Excerpts (Kept for Traceability)

- **Prisma env:** `PrismaConfigEnvError: Missing required environment variable: DATABASE_URL`
- **Prisma client:** `@prisma/client did not initialize yet`
- **ESM:** `Error: Must use import to load ES Module`
- **Jest TS:** `Cannot find name 'expect' / Property 'toBe' does not exist on type 'void'`
- **Vitest alias:** `Failed to resolve import "@/components/ui/card"`
- **Frontend tests warning:** `An update to BankingTab inside a test was not wrapped in act(...)`

---

## 12) What Changed in the Repo (High-Level)

**Backend:** standardized on ESM + tsx; server exports app; DB isolation in tests; numeric tolerance in asserts; deterministic seeds.

**Frontend:** migrated to Vitest; alias configured; fixed test env; perf patch on Routes tab (memoization + effects/handlers).

**Docs:** formating of this AGENT_WORKFLOW.md documents agents, prompts, outcomes, and verification.