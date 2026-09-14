from __future__ import annotations

from datetime import date

from pydantic import Field

from app.schemas.common import ORMModel
from app.schemas.msme import MSMEOut


class EventOut(ORMModel):
    id: str
    type: str
    location_name: str
    latitude: float
    longitude: float
    radius_km: float
    start_date: date
    end_date: date | None
    severity: str
    source: str
    source_url: str
    source_type: str
    description: str


class EventWithAffectedMSMEs(EventOut):
    affected_msmes: list[MSMEOut] = Field(default_factory=list)
