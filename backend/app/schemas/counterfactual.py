from __future__ import annotations

from pydantic import Field

from app.schemas.common import ORMModel


class CounterfactualRunRequest(ORMModel):
    msme_id: str
    event_id: str
    adaptations: list[str] = Field(default_factory=list, description="Adaptation measure ids to apply.")


class ScenarioResult(ORMModel):
    risk_score: float
    risk_band: str
    estimated_loss_inr: float
    downtime_hours: float
    loss_range_low_inr: float | None = None
    loss_range_high_inr: float | None = None


class ResilienceDelta(ORMModel):
    avoided_loss_inr: float
    loss_reduction_pct: float
    downtime_avoided_hours: float


class CounterfactualRunResponse(ORMModel):
    id: str
    msme_id: str
    event_id: str
    adaptation_measure_ids: list[str]
    without_adaptation: ScenarioResult
    with_adaptation: ScenarioResult
    resilience_delta: ResilienceDelta
    evidence_confidence: float
    evidence_confidence_label: str
    disclaimer: str
