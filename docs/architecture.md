# Architecture

## System diagram

```
                   ┌───────────────────────┐
                   │   CLIMASCORE WEB APP  │
                   │  Next.js 16 / React   │
                   └───────────┬───────────┘
                               │ HTTPS (JSON, /api/v1)
                               ▼
                   ┌───────────────────────┐
                   │      FASTAPI API      │  ← rate limiting, RFC 7807 errors,
                   └───────────┬───────────┘    X-Request-ID logging
                               │
          ┌────────────────────┼─────────────────────┐
          ▼                    ▼                     ▼
 ┌────────────────┐   ┌─────────────────┐   ┌────────────────┐
 │ Risk Engine    │   │ Event Engine    │   │ Evidence Engine│
 └───────┬────────┘   └────────┬────────┘   └───────┬────────┘
         │                     │                    │
         └─────────────────────┼────────────────────┘
                               ▼
                   ┌───────────────────────┐
                   │ Counterfactual Engine │
                   └───────────┬───────────┘
                               ▼
                   ┌───────────────────────┐
                   │ PostgreSQL + PostGIS  │
                   └───────────────────────┘
```

Portfolio Engine sits alongside the others, aggregating across MSMEs/events for the portfolio and cluster
map views (spec §17 Screen 9), using PostGIS `ST_DWithin`/`ST_Contains` for real geospatial queries rather
than a decorative map layer.

## SOLID, applied concretely (not decoratively)

- **SRP** — `backend/app/services/{risk,event,counterfactual,evidence,portfolio}_engine.py` each own exactly
  one concern. API routers in `backend/app/api/` are thin: they validate input and delegate; there is no
  business math in a route handler.
- **OCP** — hazard weights, adaptation-measure effects, and loss-model coefficients live as data in
  `backend/app/config/model_config.py`. Adding a new adaptation measure or hazard type is a config change,
  not an edit to `counterfactual_engine.py`.
- **LSP** — `backend/app/services/sources.py` defines `EventSource`/`EvidenceSource` Protocols. The seeded
  implementations used today (`SeededEventSource`, `SeededEvidenceSource`) are substitutable behind those
  same interfaces by a future live-data source, with zero caller changes.
- **ISP** — `backend/app/repositories/interfaces.py` splits repository access narrowly per aggregate
  (`MSMERepository`, `EventRepository`, `AdaptationRepository`, `CounterfactualRepository`,
  `EvidenceRepository`) instead of one large repository interface.
- **DIP** — engines depend on the repository Protocols, wired to concrete async SQLAlchemy implementations
  via FastAPI `Depends()` in `backend/app/api/deps.py`. This is why the engine test suite
  (`backend/tests/`) runs entirely against in-memory fakes with no database required.

## Why the counterfactual engine is deterministic, not a trained model

The loss model (spec §13) and risk score (spec §9) are transparent, coefficient-driven functions, not a
model fit to real outcome data — because no such labeled dataset exists yet for this problem. Spec rule #12
is enforced throughout: the product never claims causal proof, only a modelled counterfactual framework.
See `docs/methodology.md` and `docs/adr/0003-deterministic-not-ml.md`.
