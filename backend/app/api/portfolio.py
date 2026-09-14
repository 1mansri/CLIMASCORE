from __future__ import annotations

from fastapi import APIRouter, Request, Response

from app.api.deps import PortfolioEngineDep
from app.core.rate_limit import CHEAP_READ_LIMIT, limiter
from app.schemas.portfolio import PortfolioRiskMap, PortfolioSummary, RiskMapPoint

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/summary", response_model=PortfolioSummary)
@limiter.limit(CHEAP_READ_LIMIT)
async def portfolio_summary(request: Request, response: Response, engine: PortfolioEngineDep) -> PortfolioSummary:
    result = await engine.summary()
    return PortfolioSummary(**result.__dict__)


@router.get("/risk-map", response_model=PortfolioRiskMap)
@limiter.limit(CHEAP_READ_LIMIT)
async def portfolio_risk_map(request: Request, response: Response, engine: PortfolioEngineDep) -> PortfolioRiskMap:
    points = await engine.risk_map()
    return PortfolioRiskMap(points=[RiskMapPoint(**p.__dict__) for p in points])
