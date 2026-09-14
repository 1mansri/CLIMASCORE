from __future__ import annotations

from fastapi import APIRouter, Request, Response

from app.api.deps import SessionDep
from app.core.rate_limit import EXPENSIVE_COMPUTE_LIMIT, limiter
from scripts.demo_reset import reset_demo

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/reset")
@limiter.limit(EXPENSIVE_COMPUTE_LIMIT)
async def demo_reset(request: Request, response: Response, session: SessionDep) -> dict[str, str]:
    await reset_demo(session)
    return {"status": "reset", "scenario": "Surat Textile Works / Surat Flood 2026"}
