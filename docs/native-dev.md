# Native (non-Docker) fallback

If Docker isn't usable at the venue (no internet for `docker pull`, Docker Desktop not installed, corporate
lockdown, etc.), run the stack natively. Pre-pull the two images ahead of time if you know Docker will be
used (`docker pull postgis/postgis:18-3.5`) so the demo never depends on last-mile bandwidth — that's the
preferred path. This page is the explicit, documented fallback for when that isn't possible.

## 1. Database

Install PostgreSQL 18 with the PostGIS extension locally, or use a cloud Postgres you already have access
to. Then:

```sql
CREATE DATABASE climascore;
\c climascore
CREATE EXTENSION IF NOT EXISTS postgis;
```

Set `DATABASE_URL` in `.env` to point at it, e.g.
`postgresql+asyncpg://<user>:<password>@localhost:5432/climascore`.

## 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # or: source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --port 8000
```

## 3. Frontend

```bash
cd frontend
corepack enable
pnpm install
pnpm dev
```

Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1` in `frontend/.env.local` if it isn't already
picked up from the root `.env`.

## If even the backend can't come up in time

The frontend is designed to run standalone: `frontend/lib/api.ts` falls back to bundled seed data
(`frontend/lib/seed/*.json`) whenever the API is unreachable, so `pnpm dev` alone is enough to demo every
screen with the deterministic Surat scenario (spec §22). This is the last-resort path, not the intended one
— it doesn't exercise the real rate limiting, PostGIS queries, or persistence, but it guarantees the demo
itself can never go blank.
