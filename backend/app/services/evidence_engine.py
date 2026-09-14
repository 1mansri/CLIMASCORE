"""Evidence Engine (spec section 16): evidence confidence, not model accuracy.

Distinguishes the QUALITY of the evidence feeding a borrower's profile
(is there a real source behind this input?) from the counterfactual
engine's MODELLED impact estimate. This score must never be presented as
a statistically calibrated confidence interval.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.config.model_config import EVIDENCE_QUALITY_SCORES, EVIDENCE_QUALITY_WEIGHTS
from app.repositories.interfaces import EvidenceRepository
from app.schemas.common import ILLUSTRATIVE_EVIDENCE_LABEL

EVIDENCE_CHAIN_STAGES: tuple[str, ...] = (
    "CLIMATE EVENT",
    "HAZARD DATA",
    "BORROWER LOCATION",
    "ASSET / OPERATIONS",
    "ADAPTATION RECORD",
    "MODELLED IMPACT",
)

_STAGE_TO_EVIDENCE_TYPE: dict[str, str] = {
    "CLIMATE EVENT": "hazard_event",
    "HAZARD DATA": "hazard_event",
    "BORROWER LOCATION": "location",
    "ASSET / OPERATIONS": "asset_operations",
    "ADAPTATION RECORD": "adaptation_record",
    "MODELLED IMPACT": "observed_loss",
}


@dataclass(frozen=True)
class EvidenceConfidenceResult:
    msme_id: str
    evidence_confidence: float
    label: str
    components: dict[str, float]
    evidence_chain: list[str]


class EvidenceEngine:
    def __init__(self, evidence_repository: EvidenceRepository) -> None:
        self._evidence_repository = evidence_repository

    async def evidence_confidence(self, msme_id: str) -> EvidenceConfidenceResult:
        records = await self._evidence_repository.list_for_msme(msme_id)
        by_type = {record.type: record for record in records}

        components: dict[str, float] = {}
        total = 0.0
        for category, weight in EVIDENCE_QUALITY_WEIGHTS.items():
            record = by_type.get(category)
            quality = record.quality if record else "missing"
            quality_score = EVIDENCE_QUALITY_SCORES.get(quality, 0)
            components[category] = float(quality_score)
            total += weight * quality_score

        chain = [
            f"{stage} {'✓' if by_type.get(_STAGE_TO_EVIDENCE_TYPE[stage]) else '—'}"
            for stage in EVIDENCE_CHAIN_STAGES
        ]

        return EvidenceConfidenceResult(
            msme_id=msme_id,
            evidence_confidence=round(total, 2),
            label=ILLUSTRATIVE_EVIDENCE_LABEL,
            components=components,
            evidence_chain=chain,
        )
