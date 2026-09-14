# ADR 0004: No authentication/authorization in the prototype

## Status
Accepted (known, documented gap — not an oversight)

## Context
Spec §29 places authentication and multi-user accounts in P2 (optional), behind the full P0 feature set.
Building auth well (proper session/JWT handling, role separation between lender users, secure storage) is
itself a significant scope item that would trade off against completing the core counterfactual/evidence
flow that is the actual competition differentiator.

## Decision
Ship the prototype without authentication. Document this explicitly here and in `docs/security.md` rather
than silently omitting it, so it reads as a scoping decision, not a security blind spot the team didn't
notice.

## Consequences
The prototype is not deployable as-is to handle real borrower data. A production version would add
authentication (likely OAuth2/JWT via FastAPI's security utilities) and role-based access before any real
lender data touches it — this is called out explicitly rather than implied.
