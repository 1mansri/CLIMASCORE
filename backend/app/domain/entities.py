"""Plain-Python domain entities used by the service-layer engines.

Kept independent of SQLAlchemy so the engines (risk_engine, event_engine,
counterfactual_engine, evidence_engine, portfolio_engine) can be unit
tested with in-memory fakes and no database, per DIP: engines depend on
these entities and on repository Protocols, never on ORM models directly.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class MSMEEntity:
    id: str
    name: str
    entity_type: str
    sector: str
    city: str
    state: str
    country: str
    latitude: float
    longitude: float
    annual_revenue_inr: float
    inventory_value_inr: float
    equipment_value_inr: float
    facility_area_sqft: float
    employees: int
    hazard_score: float
    exposure_score: float
    vulnerability_score: float
    business_criticality_score: float
    risk_score: float
    risk_band: str
    is_synthetic: bool = True


@dataclass(frozen=True)
class EventEntity:
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
    description: str = ""


@dataclass(frozen=True)
class AdaptationEntity:
    id: str
    msme_id: str
    measure_id: str
    hazard: str
    status: str
    cost_inr: float | None
    date_implemented: date
    evidence: str
    estimated_effect: str = ""


@dataclass(frozen=True)
class EvidenceEntity:
    id: str
    msme_id: str | None
    type: str
    source: str
    source_url: str
    quality: str
    description: str
    timestamp: object
