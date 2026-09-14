"""Counterfactual Engine (spec section 12) -- the core product innovation.

Runs the SAME climate event twice against an MSME: once assuming no
adaptation (baseline vulnerability) and once assuming the borrower's
selected adaptation measures are active. The event object passed into both
scenario runs is identical -- only adaptation-driven assumptions differ
(asserted by tests/test_counterfactual_engine.py's integrity test).
"""

from __future__ import annotations

from dataclasses import dataclass

from app.config.model_config import ADAPTATION_MEASURES, HazardType, risk_band_for_score
from app.domain.entities import EventEntity, MSMEEntity
from app.repositories.interfaces import (
    CounterfactualRepository,
    EventRepository,
    MSMERepository,
)
from app.schemas.common import ILLUSTRATIVE_MODEL_DISCLAIMER
from app.services.evidence_engine import EvidenceEngine
from app.services.loss_model import LossModel, adaptation_fraction_for


class MSMENotFoundError(Exception):
    pass


class EventNotFoundError(Exception):
    pass


@dataclass(frozen=True)
class ScenarioOutcome:
    risk_score: float
    risk_band: str
    estimated_loss_inr: float
    downtime_hours: float
    loss_low_inr: float
    loss_high_inr: float


@dataclass(frozen=True)
class ResilienceDelta:
    avoided_loss_inr: float
    loss_reduction_pct: float
    downtime_avoided_hours: float


@dataclass(frozen=True)
class CounterfactualResult:
    msme_id: str
    event_id: str
    event: EventEntity
    adaptation_measure_ids: list[str]
    without_adaptation: ScenarioOutcome
    with_adaptation: ScenarioOutcome
    resilience_delta: ResilienceDelta
    evidence_confidence: float
    disclaimer: str = ILLUSTRATIVE_MODEL_DISCLAIMER


def _hazard_type_for_event(event: EventEntity) -> HazardType:
    return HazardType(event.type)


class CounterfactualEngine:
    def __init__(
        self,
        msme_repository: MSMERepository,
        event_repository: EventRepository,
        counterfactual_repository: CounterfactualRepository,
        evidence_engine: EvidenceEngine,
        loss_model: LossModel | None = None,
    ) -> None:
        self._msme_repository = msme_repository
        self._event_repository = event_repository
        self._counterfactual_repository = counterfactual_repository
        self._evidence_engine = evidence_engine
        self._loss_model = loss_model or LossModel()

    async def run(
        self, msme_id: str, event_id: str, adaptation_measure_ids: list[str]
    ) -> CounterfactualResult:
        msme = await self._msme_repository.get(msme_id)
        if msme is None:
            raise MSMENotFoundError(msme_id)
        event = await self._event_repository.get(event_id)
        if event is None:
            raise EventNotFoundError(event_id)

        result = self.run_pure(msme, event, adaptation_measure_ids)
        confidence = await self._evidence_engine.evidence_confidence(msme_id)

        result = CounterfactualResult(
            msme_id=result.msme_id,
            event_id=result.event_id,
            event=result.event,
            adaptation_measure_ids=result.adaptation_measure_ids,
            without_adaptation=result.without_adaptation,
            with_adaptation=result.with_adaptation,
            resilience_delta=result.resilience_delta,
            evidence_confidence=confidence.evidence_confidence,
        )
        return result

    def run_pure(
        self,
        msme: MSMEEntity,
        event: EventEntity,
        adaptation_measure_ids: list[str],
    ) -> CounterfactualResult:
        """No I/O: runs both scenarios against the SAME event entity.

        Kept separate from `run` so it is directly unit-testable with plain
        dataclasses and no repositories/database at all.
        """
        hazard = _hazard_type_for_event(event)

        without = self._score_scenario(msme, event, hazard, active_measure_ids=[])
        with_adapt = self._score_scenario(msme, event, hazard, active_measure_ids=adaptation_measure_ids)

        avoided_loss = without.estimated_loss_inr - with_adapt.estimated_loss_inr
        loss_reduction_pct = (
            round(avoided_loss / without.estimated_loss_inr * 100, 2)
            if without.estimated_loss_inr
            else 0.0
        )
        downtime_avoided = round(without.downtime_hours - with_adapt.downtime_hours, 2)

        delta = ResilienceDelta(
            avoided_loss_inr=round(avoided_loss, 2),
            loss_reduction_pct=loss_reduction_pct,
            downtime_avoided_hours=downtime_avoided,
        )

        return CounterfactualResult(
            msme_id=msme.id,
            event_id=event.id,
            event=event,
            adaptation_measure_ids=list(adaptation_measure_ids),
            without_adaptation=without,
            with_adaptation=with_adapt,
            resilience_delta=delta,
            evidence_confidence=0.0,
        )

    def _score_scenario(
        self,
        msme: MSMEEntity,
        event: EventEntity,
        hazard: HazardType,
        active_measure_ids: list[str],
    ) -> ScenarioOutcome:
        risk_reduction = 0.0
        for measure_id in active_measure_ids:
            cfg = ADAPTATION_MEASURES.get(measure_id)
            if cfg and hazard in cfg.hazards_addressed:
                risk_reduction += cfg.risk_reduction_points

        adapted_risk = max(0.0, round(msme.risk_score - risk_reduction, 2))
        fraction = adaptation_fraction_for(hazard, risk_reduction)

        estimate = self._loss_model.estimate(
            hazard=hazard,
            equipment_value_inr=msme.equipment_value_inr,
            inventory_value_inr=msme.inventory_value_inr,
            annual_revenue_inr=msme.annual_revenue_inr,
            adaptation_fraction=fraction,
        )

        return ScenarioOutcome(
            risk_score=adapted_risk,
            risk_band=risk_band_for_score(adapted_risk).value,
            estimated_loss_inr=estimate.total_loss_inr,
            downtime_hours=estimate.downtime_hours,
            loss_low_inr=estimate.loss_low_inr,
            loss_high_inr=estimate.loss_high_inr,
        )
