# CLIMASCORE — Frontend

Borrower-level climate-risk intelligence UI for lenders. Next.js 16 / React 19 / TypeScript, built against the
CLIMASCORE prototype specification (see `../CLIMASCORE_Prototype_Master_Specification.md`).

## Stack

Next.js 16.3 (App Router, Turbopack) · React 19.2 · TypeScript · Tailwind CSS 4 (CSS-first `@theme` config) ·
shadcn/ui-style primitives · Recharts · Leaflet / react-leaflet (Mapbox optional, env-gated) · Vitest · Playwright.

## Getting started

```bash
corepack enable
pnpm install
pnpm dev
```

Open http://localhost:3000. The app works fully offline: `lib/api.ts` tries the FastAPI backend
(`NEXT_PUBLIC_API_BASE_URL`, default `http://localhost:8000/api/v1`) and falls back to the bundled seed data in
`lib/seed/*.json` whenever the backend is unreachable — see spec §22 (Demo Mode / Reliability).

Use the **Load Demo Scenario** button in the top nav (or press `Shift+D`) at any time to reset adaptation state
back to the deterministic Surat seed scenario.

## Scripts

- `pnpm dev` — start the dev server
- `pnpm build` — production build (also runs TypeScript checking)
- `pnpm lint` — ESLint
- `pnpm test` — Vitest unit tests (loss model, formatting helpers)
- `pnpm test:e2e` — Playwright judge-journey smoke test (`tests/e2e/judge-journey.spec.ts`)

## Project layout

- `app/` — routes, one per required screen (spec §17): dashboard, MSME profile/exposure/adaptation,
  events, the counterfactual hero screen + evidence panel, lender decision, portfolio, borrower report.
- `components/ui/` — shared primitives, including the mandatory `ProvenanceBadge` (Observed / Modelled
  (Illustrative) / Synthetic — spec §25), `MetricWithRange` (point estimate + uncertainty band) and the
  accessible `ComparisonPanel` used on the hero screen.
- `lib/` — `api.ts` (typed fetch client + offline fallback), `loss-model.ts` / `counterfactual.ts` (the
  transparent illustrative loss model, spec §13–§15), `formatting.ts` (centralized INR/lakh formatting, risk-band
  labels, provenance copy), `seed/*.json` (bundled seed data mirroring the backend's `data/seed/*.json`).
- `types/domain.ts` — shared domain types mirroring the spec §20 data model.

## Documented deviation: TypeScript version

TypeScript 7.0.2 (the native/"Corsa" compiler) was tried first, with `experimental.useTypeScriptCli` enabled in
`next.config.ts`, and `next build` passed cleanly under it. It was reverted to `typescript@6.0.3` (the latest
stable release of the classic/JS compiler line — there is no `6.9`) only because `typescript-eslint` does not yet
support the TS 7 API and hard-crashes `pnpm lint` under it (tracked upstream:
https://github.com/typescript-eslint/typescript-eslint/issues/10940). See `next.config.ts` for the inline note.
