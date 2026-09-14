from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, Response, status

from app.api.deps import MSMERepoDep, RiskEngineDep
from app.core.rate_limit import EXPENSIVE_COMPUTE_LIMIT, limiter
from app.schemas.msme import RiskCalculateRequest, RiskCalculateResponse
from app.services.risk_engine import RiskComponents

router = APIRouter(prefix="/risk", tags=["risk"])


@router.post("/calculate", response_model=RiskCalculateResponse)
@limiter.limit(EXPENSIVE_COMPUTE_LIMIT)
async def calculate_risk(
    request: Request,
    response: Response,
    payload: RiskCalculateRequest,
    repo: MSMERepoDep,
    risk_engine: RiskEngineDep,
) -> RiskCalculateResponse:
    msme = await repo.get(payload.msme_id)
    if msme is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"MSME '{payload.msme_id}' not found")
    result = risk_engine.calculate(
        RiskComponents(
            hazard=msme.hazard_score,
            exposure=msme.exposure_score,
            vulnerability=msme.vulnerability_score,
            business_criticality=msme.business_criticality_score,
        )
    )
    return RiskCalculateResponse(msme_id=payload.msme_id, **result.__dict__)
