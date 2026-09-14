from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, Response, status

from app.api.deps import AdaptationRepoDep
from app.config.model_config import ADAPTATION_MEASURES
from app.core.rate_limit import CHEAP_READ_LIMIT, EXPENSIVE_COMPUTE_LIMIT, limiter
from app.domain.entities import AdaptationEntity
from app.models.base import new_uuid
from app.schemas.adaptation import (
    AdaptationCreate,
    AdaptationMeasureCatalogItem,
    AdaptationOut,
    AdaptationUpdate,
)

router = APIRouter(tags=["adaptations"])


def _to_out(entity: AdaptationEntity) -> AdaptationOut:
    cfg = ADAPTATION_MEASURES.get(entity.measure_id)
    return AdaptationOut(
        id=entity.id,
        msme_id=entity.msme_id,
        measure_id=entity.measure_id,
        hazard=entity.hazard,
        status=entity.status,
        cost_inr=entity.cost_inr,
        date_implemented=entity.date_implemented,
        evidence=entity.evidence,
        estimated_effect=entity.estimated_effect,
        measure_name=cfg.name if cfg else None,
    )


@router.get("/adaptations/catalog", response_model=list[AdaptationMeasureCatalogItem])
@limiter.limit(CHEAP_READ_LIMIT)
async def adaptation_catalog(request: Request, response: Response) -> list[AdaptationMeasureCatalogItem]:
    return [
        AdaptationMeasureCatalogItem(
            id=cfg.id,
            name=cfg.name,
            hazards_addressed=[h.value for h in cfg.hazards_addressed],
            risk_reduction_points=cfg.risk_reduction_points,
            vulnerability_reduction_pct=cfg.vulnerability_reduction_pct,
            downtime_reduction_pct=cfg.downtime_reduction_pct,
            description=cfg.description,
        )
        for cfg in ADAPTATION_MEASURES.values()
    ]


@router.get("/msmes/{msme_id}/adaptations", response_model=list[AdaptationOut])
@limiter.limit(CHEAP_READ_LIMIT)
async def list_adaptations(request: Request, response: Response, msme_id: str, repo: AdaptationRepoDep) -> list[AdaptationOut]:
    items = await repo.list_for_msme(msme_id)
    return [_to_out(item) for item in items]


@router.post("/msmes/{msme_id}/adaptations", response_model=AdaptationOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(EXPENSIVE_COMPUTE_LIMIT)
async def create_adaptation(
    request: Request, response: Response, msme_id: str, payload: AdaptationCreate, repo: AdaptationRepoDep
) -> AdaptationOut:
    cfg = ADAPTATION_MEASURES.get(payload.measure_id)
    if cfg is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Unknown adaptation measure '{payload.measure_id}'")
    entity = AdaptationEntity(
        id=new_uuid(),
        msme_id=msme_id,
        measure_id=payload.measure_id,
        hazard=payload.hazard,
        status=payload.status,
        cost_inr=payload.cost_inr,
        date_implemented=payload.date_implemented,
        evidence=payload.evidence,
        estimated_effect=(
            f"Illustrative model assumption: up to {cfg.risk_reduction_points:.0f} risk-score points, "
            f"{cfg.vulnerability_reduction_pct:.0%} vulnerability reduction."
        ),
    )
    created = await repo.create(entity)
    return _to_out(created)


@router.put("/adaptations/{adaptation_id}", response_model=AdaptationOut)
@limiter.limit(EXPENSIVE_COMPUTE_LIMIT)
async def update_adaptation(
    request: Request, response: Response, adaptation_id: str, payload: AdaptationUpdate, repo: AdaptationRepoDep
) -> AdaptationOut:
    updated = await repo.update(adaptation_id, **payload.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Adaptation '{adaptation_id}' not found")
    return _to_out(updated)


@router.delete("/adaptations/{adaptation_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit(EXPENSIVE_COMPUTE_LIMIT)
async def delete_adaptation(request: Request, response: Response, adaptation_id: str, repo: AdaptationRepoDep) -> None:
    deleted = await repo.delete(adaptation_id)
    if not deleted:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Adaptation '{adaptation_id}' not found")
