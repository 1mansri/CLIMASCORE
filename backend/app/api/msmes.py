from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, Response, status

from app.api.deps import MSMERepoDep, RiskEngineDep
from app.core.rate_limit import CHEAP_READ_LIMIT, EXPENSIVE_COMPUTE_LIMIT, limiter
from app.domain.entities import MSMEEntity
from app.schemas.msme import (
    MSMECreate,
    MSMEOut,
    MSMEUpdate,
    RiskCalculateResponse,
)
from app.services.risk_engine import RiskComponents

router = APIRouter(prefix="/msmes", tags=["msmes"])


@router.get("", response_model=list[MSMEOut])
@limiter.limit(CHEAP_READ_LIMIT)
async def list_msmes(request: Request, response: Response, repo: MSMERepoDep) -> list[MSMEOut]:
    msmes = await repo.list()
    return [MSMEOut.model_validate(m) for m in msmes]


@router.get("/{msme_id}", response_model=MSMEOut)
@limiter.limit(CHEAP_READ_LIMIT)
async def get_msme(request: Request, response: Response, msme_id: str, repo: MSMERepoDep) -> MSMEOut:
    msme = await repo.get(msme_id)
    if msme is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"MSME '{msme_id}' not found")
    return MSMEOut.model_validate(msme)


@router.post("", response_model=MSMEOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(EXPENSIVE_COMPUTE_LIMIT)
async def create_msme(
    request: Request, response: Response, payload: MSMECreate, repo: MSMERepoDep, risk_engine: RiskEngineDep
) -> MSMEOut:
    existing = await repo.get(payload.id)
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, f"MSME '{payload.id}' already exists")

    risk = risk_engine.calculate(
        RiskComponents(hazard=50.0, exposure=50.0, vulnerability=50.0, business_criticality=50.0)
    )
    entity = MSMEEntity(
        id=payload.id,
        name=payload.name,
        entity_type=payload.entity_type,
        sector=payload.sector,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        latitude=payload.latitude,
        longitude=payload.longitude,
        annual_revenue_inr=payload.annual_revenue_inr,
        inventory_value_inr=payload.inventory_value_inr,
        equipment_value_inr=payload.equipment_value_inr,
        facility_area_sqft=payload.facility_area_sqft,
        employees=payload.employees,
        hazard_score=risk.hazard,
        exposure_score=risk.exposure,
        vulnerability_score=risk.vulnerability,
        business_criticality_score=risk.business_criticality,
        risk_score=risk.risk_score,
        risk_band=risk.risk_band,
        is_synthetic=True,
    )
    created = await repo.create(entity)
    return MSMEOut.model_validate(created)


@router.put("/{msme_id}", response_model=MSMEOut)
@limiter.limit(EXPENSIVE_COMPUTE_LIMIT)
async def update_msme(
    request: Request, response: Response, msme_id: str, payload: MSMEUpdate, repo: MSMERepoDep
) -> MSMEOut:
    updated = await repo.update(msme_id, **payload.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"MSME '{msme_id}' not found")
    return MSMEOut.model_validate(updated)


@router.get("/{msme_id}/risk", response_model=RiskCalculateResponse)
@limiter.limit(CHEAP_READ_LIMIT)
async def get_msme_risk(
    request: Request, response: Response, msme_id: str, repo: MSMERepoDep, risk_engine: RiskEngineDep
) -> RiskCalculateResponse:
    msme = await repo.get(msme_id)
    if msme is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"MSME '{msme_id}' not found")
    result = risk_engine.calculate(
        RiskComponents(
            hazard=msme.hazard_score,
            exposure=msme.exposure_score,
            vulnerability=msme.vulnerability_score,
            business_criticality=msme.business_criticality_score,
        )
    )
    return RiskCalculateResponse(msme_id=msme_id, **result.__dict__)
