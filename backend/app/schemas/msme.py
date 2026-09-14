from __future__ import annotations

from pydantic import Field

from app.schemas.common import ORMModel


class MSMEBase(ORMModel):
    name: str = Field(min_length=1, max_length=255)
    entity_type: str = "Illustrative MSME"
    sector: str
    city: str
    state: str
    country: str = "India"
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    annual_revenue_inr: float = Field(gt=0)
    inventory_value_inr: float = Field(ge=0)
    equipment_value_inr: float = Field(ge=0)
    facility_area_sqft: float = Field(gt=0)
    employees: int = Field(ge=0)


class MSMECreate(MSMEBase):
    id: str


class MSMEUpdate(ORMModel):
    name: str | None = None
    sector: str | None = None
    city: str | None = None
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    annual_revenue_inr: float | None = None
    inventory_value_inr: float | None = None
    equipment_value_inr: float | None = None
    facility_area_sqft: float | None = None
    employees: int | None = None


class MSMEOut(MSMEBase):
    id: str
    hazard_score: float
    exposure_score: float
    vulnerability_score: float
    business_criticality_score: float
    risk_score: float
    risk_band: str
    is_synthetic: bool


class RiskBreakdown(ORMModel):
    hazard: float
    exposure: float
    vulnerability: float
    business_criticality: float
    risk_score: float
    risk_band: str
    disclaimer: str


class RiskCalculateRequest(ORMModel):
    msme_id: str


class RiskCalculateResponse(RiskBreakdown):
    msme_id: str
