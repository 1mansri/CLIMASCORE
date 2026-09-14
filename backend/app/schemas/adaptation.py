from __future__ import annotations

from datetime import date

from pydantic import Field

from app.schemas.common import ORMModel


class AdaptationBase(ORMModel):
    measure_id: str
    hazard: str
    status: str = "active"
    cost_inr: float | None = None
    date_implemented: date
    evidence: str = ""


class AdaptationCreate(AdaptationBase):
    pass


class AdaptationUpdate(ORMModel):
    status: str | None = None
    cost_inr: float | None = None
    evidence: str | None = None


class AdaptationOut(AdaptationBase):
    id: str
    msme_id: str
    estimated_effect: str
    measure_name: str | None = None


class AdaptationMeasureCatalogItem(ORMModel):
    id: str
    name: str
    hazards_addressed: list[str]
    risk_reduction_points: float = Field(description="Illustrative model assumption, not empirically calibrated.")
    vulnerability_reduction_pct: float
    downtime_reduction_pct: float
    description: str
