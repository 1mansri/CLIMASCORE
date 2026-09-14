from __future__ import annotations

from datetime import datetime

from app.schemas.common import ORMModel


class EvidenceOut(ORMModel):
    id: str
    type: str
    source: str
    source_url: str
    quality: str
    description: str
    timestamp: datetime


class EvidenceConfidenceOut(ORMModel):
    msme_id: str
    evidence_confidence: float
    label: str
    components: dict[str, float]
    evidence_chain: list[str]
