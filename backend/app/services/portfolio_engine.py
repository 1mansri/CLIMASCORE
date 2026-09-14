"""Portfolio Engine: cross-borrower aggregation for Screens 1 and 9."""

from __future__ import annotations

from dataclasses import dataclass

from app.config.model_config import RiskBand
from app.repositories.interfaces import (
    AdaptationRepository,
    EventRepository,
    MSMERepository,
)
from app.schemas.common import ILLUSTRATIVE_MODEL_DISCLAIMER


@dataclass(frozen=True)
class PortfolioSummaryResult:
    total_borrowers: int
    high_risk_borrowers: int
    active_events: int
    adaptation_coverage_pct: float
    total_estimated_exposure_inr: float
    disclaimer: str = ILLUSTRATIVE_MODEL_DISCLAIMER


@dataclass(frozen=True)
class RiskMapPointResult:
    msme_id: str
    name: str
    latitude: float
    longitude: float
    risk_score: float
    risk_band: str
    sector: str
    city: str
    adaptation_active: bool


class PortfolioEngine:
    def __init__(
        self,
        msme_repository: MSMERepository,
        event_repository: EventRepository,
        adaptation_repository: AdaptationRepository,
    ) -> None:
        self._msme_repository = msme_repository
        self._event_repository = event_repository
        self._adaptation_repository = adaptation_repository

    async def summary(self) -> PortfolioSummaryResult:
        msmes = await self._msme_repository.list()
        events = await self._event_repository.list()

        high_risk = [m for m in msmes if m.risk_band in (RiskBand.HIGH.value, RiskBand.SEVERE.value)]
        adapted_count = 0
        for msme in msmes:
            adaptations = await self._adaptation_repository.list_for_msme(msme.id)
            if any(a.status == "active" for a in adaptations):
                adapted_count += 1

        coverage_pct = round((adapted_count / len(msmes)) * 100, 2) if msmes else 0.0
        total_exposure = sum(m.equipment_value_inr + m.inventory_value_inr for m in msmes)

        return PortfolioSummaryResult(
            total_borrowers=len(msmes),
            high_risk_borrowers=len(high_risk),
            active_events=len(events),
            adaptation_coverage_pct=coverage_pct,
            total_estimated_exposure_inr=total_exposure,
        )

    async def risk_map(self) -> list[RiskMapPointResult]:
        msmes = await self._msme_repository.list()
        points: list[RiskMapPointResult] = []
        for msme in msmes:
            adaptations = await self._adaptation_repository.list_for_msme(msme.id)
            points.append(
                RiskMapPointResult(
                    msme_id=msme.id,
                    name=msme.name,
                    latitude=msme.latitude,
                    longitude=msme.longitude,
                    risk_score=msme.risk_score,
                    risk_band=msme.risk_band,
                    sector=msme.sector,
                    city=msme.city,
                    adaptation_active=any(a.status == "active" for a in adaptations),
                )
            )
        return points
