# ADR 0001: PostgreSQL + PostGIS as the datastore

## Status
Accepted

## Context
The spec's architecture diagram (§18) specifies PostgreSQL + PostGIS. The alternative considered was
SQLite, for zero-setup judge installability. We need real geospatial queries (portfolio cluster map,
"MSMEs within event radius", exposure-zone membership) which SQLite cannot do natively.

## Decision
Use PostgreSQL 18 + PostGIS via a `docker-compose` service, with `GeoAlchemy2` for geometry columns and
`ST_DWithin`/`ST_Contains` for the portfolio and exposure-map queries (see `docs/security.md`,
`backend/app/repositories/postgres.py`). To de-risk judge-day setup, the whole stack ships as one
`docker compose up`, and `docs/native-dev.md` documents a non-Docker fallback.

## Consequences
Real geospatial functionality backs the "affected MSMEs" and cluster-map features instead of being
simulated. The cost is a heavier local dependency (Docker + a Postgres image) versus SQLite — mitigated by
the documented native-Postgres fallback for demo-day resilience.
