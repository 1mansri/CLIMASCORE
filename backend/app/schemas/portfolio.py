from __future__ import annotations

from app.schemas.common import ORMModel


class PortfolioSummary(ORMModel):
    total_borrowers: int
    high_risk_borrowers: int
    active_events: int
    adaptation_coverage_pct: float
    total_estimated_exposure_inr: float
    disclaimer: str


class RiskMapPoint(ORMModel):
    msme_id: str
    name: str
    latitude: float
    longitude: float
    risk_score: float
    risk_band: str
    sector: str
    city: str
    adaptation_active: bool


class PortfolioRiskMap(ORMModel):
    points: list[RiskMapPoint]
