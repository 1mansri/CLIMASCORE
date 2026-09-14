from __future__ import annotations

from fastapi import APIRouter

from app.api import (
    adaptations,
    counterfactual,
    demo,
    events,
    evidence,
    health,
    msmes,
    portfolio,
    risk,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(msmes.router)
api_router.include_router(risk.router)
api_router.include_router(events.router)
api_router.include_router(adaptations.router)
api_router.include_router(counterfactual.router)
api_router.include_router(evidence.router)
api_router.include_router(portfolio.router)
api_router.include_router(demo.router)
