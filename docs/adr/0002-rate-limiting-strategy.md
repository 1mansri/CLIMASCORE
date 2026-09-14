# ADR 0002: Tiered rate limiting with slowapi

## Status
Accepted

## Context
The prototype is explicitly pitched as an API a bank/NBFC would integrate against at portfolio scale (spec
§5, §30). A demo with no rate limiting at all reads as unfinished; a single flat global limit ignores that
compute-heavy endpoints (counterfactual runs) cost far more per call than reads.

## Decision
Use `slowapi` (Starlette/FastAPI-compatible), in-memory backend by default, Redis-backed when `REDIS_URL`
is set. Tier limits by endpoint cost: 60/min for cheap reads, 10/min for expensive compute
(`/counterfactual/run`, `/risk/calculate`). Return RFC 7807 `application/problem+json` on 429, with
`Retry-After` and `X-RateLimit-*` headers on every response.

## Consequences
No mandatory infrastructure is required to run the demo (in-memory backend), while the Redis path
demonstrates the production-scale story without being load-bearing for judging. Rate limits are
automatically tested (`backend/tests/test_api_rate_limit.py`), so this isn't just a README claim.
