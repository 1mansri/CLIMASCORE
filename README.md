# CLIMASCORE

**Borrower-level climate-risk intelligence for lenders.** CLIMASCORE turns adaptation investment into a
measurable credit signal: for the same borrower and the same climate event, it models what would likely
have happened *without* adaptation versus *with* adaptation, and converts the difference into a
lender-readable resilience signal.

Team DASK · IIT Kharagpur · SANKALP 2026, Climate Edition · Student Track

Full product/engineering spec: [`CLIMASCORE_Prototype_Master_Specification.md`](CLIMASCORE_Prototype_Master_Specification.md).

## Quickstart

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:8000/api/v1 · interactive docs at http://localhost:8000/docs

The database is migrated and seeded automatically on first boot with the deterministic Surat demo scenario
(spec §8/§11). No API key is required for anything in the default path — Mapbox/live-weather integrations
are optional and env-gated (spec §22).

**If Docker isn't available at the venue**, see [`docs/native-dev.md`](docs/native-dev.md) for the fallback
(pre-pulled images / locally installed Postgres) — this is a deliberate, documented fallback, not a silent
one.

## The demo path (judge journey, spec §33)

1. Open the dashboard → select **Surat Textile Works** (illustrative/synthetic MSME).
2. See its baseline climate risk (78/100 — HIGH) and risk breakdown.
3. Select adaptation measures on the Adaptation Plan screen.
4. Trigger the seeded Surat Flood (July 2026) event.
5. Open **Counterfactual Analysis** — the hero screen — and compare WITHOUT vs WITH adaptation for the
   *same* event.
6. Inspect the Evidence Panel and the Lender Action screen.

Use the **Load Demo Scenario** button (or `Shift+D`) at any point to reset to the deterministic seed state —
this is the safety net for live judging.

## Stack (current-latest as of Sept 2026 — see `docs/adr/0005-stack-currency.md`)

| Layer | Choice |
|---|---|
| Frontend | Next.js 16.3, React 19.2, TypeScript, Tailwind CSS 4, shadcn/ui-style primitives, Recharts, Leaflet |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2.0 (async), Alembic, Python 3.14 |
| Database | PostgreSQL 18 + PostGIS |
| Rate limiting | slowapi (in-memory by default, Redis if `REDIS_URL` is set) |

## Repository layout

```
backend/    FastAPI service — engines, API, migrations, tests (see backend/README or docs/architecture.md)
frontend/   Next.js app — all 10 required screens (see frontend/README.md)
data/seed/  Canonical seed JSON (msmes, events, adaptations, evidence)
docs/       Architecture, methodology, sources, security, ADRs
scripts/    Root-level convenience scripts
```

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system diagram, SOLID rationale
- [`docs/methodology.md`](docs/methodology.md) — every formula, explicitly labeled illustrative/non-causal
- [`docs/sources.md`](docs/sources.md) — the 5 real external evidence sources, with URLs
- [`docs/security.md`](docs/security.md) — rate limiting, input validation, secrets handling
- [`docs/adr/`](docs/adr/) — architecture decision records

## Non-negotiable rules this codebase follows (spec §36)

Never present synthetic values as real. Never call modelled avoided loss "verified savings." Always label
synthetic/modelled data. No mandatory paid APIs. Deterministic, offline-capable demo. The counterfactual
comparison is the visual centerpiece. Decision support only — never autonomous lending.
