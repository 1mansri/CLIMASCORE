from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, Response, status

from app.api.deps import CounterfactualEngineDep, CounterfactualRepoDep
from app.core.rate_limit import CHEAP_READ_LIMIT, EXPENSIVE_COMPUTE_LIMIT, limiter
from app.schemas.common import ILLUSTRATIVE_EVIDENCE_LABEL, ILLUSTRATIVE_MODEL_DISCLAIMER
from app.schemas.counterfactual import (
    CounterfactualRunRequest,
    CounterfactualRunResponse,
    ResilienceDelta,
    ScenarioResult,
)
from app.services.counterfactual_engine import CounterfactualResult, EventNotFoundError, MSMENotFoundError

router = APIRouter(prefix="/counterfactual", tags=["counterfactual"])


def _to_response(run_id: str, result: CounterfactualResult) -> CounterfactualRunResponse:
    return CounterfactualRunResponse(
        id=run_id,
        msme_id=result.msme_id,
        event_id=result.event_id,
        adaptation_measure_ids=result.adaptation_measure_ids,
        without_adaptation=ScenarioResult(
            risk_score=result.without_adaptation.risk_score,
            risk_band=result.without_adaptation.risk_band,
            estimated_loss_inr=result.without_adaptation.estimated_loss_inr,
            downtime_hours=result.without_adaptation.downtime_hours,
            loss_range_low_inr=result.without_adaptation.loss_low_inr,
            loss_range_high_inr=result.without_adaptation.loss_high_inr,
        ),
        with_adaptation=ScenarioResult(
            risk_score=result.with_adaptation.risk_score,
            risk_band=result.with_adaptation.risk_band,
            estimated_loss_inr=result.with_adaptation.estimated_loss_inr,
            downtime_hours=result.with_adaptation.downtime_hours,
            loss_range_low_inr=result.with_adaptation.loss_low_inr,
            loss_range_high_inr=result.with_adaptation.loss_high_inr,
        ),
        resilience_delta=ResilienceDelta(
            avoided_loss_inr=result.resilience_delta.avoided_loss_inr,
            loss_reduction_pct=result.resilience_delta.loss_reduction_pct,
            downtime_avoided_hours=result.resilience_delta.downtime_avoided_hours,
        ),
        evidence_confidence=result.evidence_confidence,
        evidence_confidence_label=ILLUSTRATIVE_EVIDENCE_LABEL,
        disclaimer=ILLUSTRATIVE_MODEL_DISCLAIMER,
    )


@router.post("/run", response_model=CounterfactualRunResponse)
@limiter.limit(EXPENSIVE_COMPUTE_LIMIT)
async def run_counterfactual(
    request: Request,
    response: Response,
    payload: CounterfactualRunRequest,
    engine: CounterfactualEngineDep,
    repo: CounterfactualRepoDep,
) -> CounterfactualRunResponse:
    try:
        result = await engine.run(payload.msme_id, payload.event_id, payload.adaptations)
    except MSMENotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"MSME '{payload.msme_id}' not found") from exc
    except EventNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Event '{payload.event_id}' not found") from exc

    run_id = await repo.save(
        {
            "msme_id": result.msme_id,
            "event_id": result.event_id,
            "adaptation_measure_ids": result.adaptation_measure_ids,
            "baseline_risk": result.without_adaptation.risk_score,
            "adapted_risk": result.with_adaptation.risk_score,
            "baseline_loss_inr": result.without_adaptation.estimated_loss_inr,
            "adapted_loss_inr": result.with_adaptation.estimated_loss_inr,
            "baseline_downtime_hours": result.without_adaptation.downtime_hours,
            "adapted_downtime_hours": result.with_adaptation.downtime_hours,
            "avoided_loss_inr": result.resilience_delta.avoided_loss_inr,
            "loss_reduction_pct": result.resilience_delta.loss_reduction_pct,
            "downtime_avoided_hours": result.resilience_delta.downtime_avoided_hours,
            "loss_low_inr": result.with_adaptation.loss_low_inr,
            "loss_high_inr": result.without_adaptation.loss_high_inr,
            "evidence_confidence": result.evidence_confidence,
        }
    )
    return _to_response(run_id, result)


@router.get("/{run_id}", response_model=CounterfactualRunResponse)
@limiter.limit(CHEAP_READ_LIMIT)
async def get_counterfactual_run(
    request: Request, response: Response, run_id: str, repo: CounterfactualRepoDep
) -> CounterfactualRunResponse:
    row = await repo.get(run_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Counterfactual run '{run_id}' not found")

    def _s(key: str) -> str:
        return str(row[key])

    def _f(key: str) -> float:
        return float(row[key])  # type: ignore[arg-type]

    return CounterfactualRunResponse(
        id=_s("id"),
        msme_id=_s("msme_id"),
        event_id=_s("event_id"),
        adaptation_measure_ids=list(row["adaptation_measure_ids"]),  # type: ignore[call-overload]
        without_adaptation=ScenarioResult(
            risk_score=_f("baseline_risk"),
            risk_band="",
            estimated_loss_inr=_f("baseline_loss_inr"),
            downtime_hours=_f("baseline_downtime_hours"),
        ),
        with_adaptation=ScenarioResult(
            risk_score=_f("adapted_risk"),
            risk_band="",
            estimated_loss_inr=_f("adapted_loss_inr"),
            downtime_hours=_f("adapted_downtime_hours"),
        ),
        resilience_delta=ResilienceDelta(
            avoided_loss_inr=_f("avoided_loss_inr"),
            loss_reduction_pct=_f("loss_reduction_pct"),
            downtime_avoided_hours=_f("downtime_avoided_hours"),
        ),
        evidence_confidence=_f("evidence_confidence"),
        evidence_confidence_label=ILLUSTRATIVE_EVIDENCE_LABEL,
        disclaimer=ILLUSTRATIVE_MODEL_DISCLAIMER,
    )
