from __future__ import annotations

from fastapi import APIRouter, Request, Response

from app.api.deps import EvidenceEngineDep, EvidenceRepoDep
from app.core.rate_limit import CHEAP_READ_LIMIT, limiter
from app.schemas.evidence import EvidenceConfidenceOut, EvidenceOut

router = APIRouter(prefix="/msmes/{msme_id}/evidence", tags=["evidence"])


@router.get("", response_model=EvidenceConfidenceOut)
@limiter.limit(CHEAP_READ_LIMIT)
async def get_msme_evidence(
    request: Request, response: Response, msme_id: str, repo: EvidenceRepoDep, engine: EvidenceEngineDep
) -> EvidenceConfidenceOut:
    result = await engine.evidence_confidence(msme_id)
    return EvidenceConfidenceOut(
        msme_id=msme_id,
        evidence_confidence=result.evidence_confidence,
        label=result.label,
        components=result.components,
        evidence_chain=result.evidence_chain,
    )


@router.get("/records", response_model=list[EvidenceOut])
@limiter.limit(CHEAP_READ_LIMIT)
async def get_msme_evidence_records(
    request: Request, response: Response, msme_id: str, repo: EvidenceRepoDep
) -> list[EvidenceOut]:
    records = await repo.list_for_msme(msme_id)
    return [EvidenceOut.model_validate(r) for r in records]
