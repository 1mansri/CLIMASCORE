# ADR 0005: Use current-latest (Sept 2026) versions of every major dependency

## Status
Accepted, with one documented exception

## Context
The user explicitly requested the current latest-stable version of every major piece of the stack, verified
by research rather than assumed from training data, specifically to avoid the common hackathon failure mode
of shipping a stack that was "latest" a year or two before the event.

## Decision
Verified via web search (Sept 2026) and adopted:

- **Next.js 16.3.x** (App Router), **React 19.2**, **Tailwind CSS 4.3.x** (CSS-first `@theme`, no
  `tailwind.config.js`), **pnpm** as package manager.
- **Python 3.14.x**, **FastAPI** (latest ~0.141.x line), **Pydantic v2 (2.13+)**, **SQLAlchemy 2.0.x
  async**, **PostgreSQL 18 + PostGIS**.
- **TypeScript**: tried **7.0.2** (the new Go-native compiler) first, with Next.js's official
  `experimental.useTypeScriptCli` support (added in 16.3). `next build` passed under TS7. However,
  `typescript-eslint` does not yet support the TS7 compiler API and crashes `pnpm lint` under it (tracked
  upstream: typescript-eslint#10940). **Fallback: `typescript@6.0.3`**, the latest release of the classic
  compiler line — not a downgrade to an old version, but a deliberate, documented choice of the newest
  version whose tooling ecosystem actually works end-to-end today. Re-evaluate when typescript-eslint ships
  TS7 support.

## Consequences
The stack is genuinely current, not merely labeled as such, and the one place a "latest" choice had to be
walked back (TypeScript 7 → 6.0.3) is documented with its exact cause and a re-evaluation trigger, rather
than silently reverting to a familiar older version without explanation.
