"""In-memory fakes implementing the repository Protocols.

Used by every engine/API test so the numeric test cases in spec section 27
run with no database at all (DIP: engines/routes depend on Protocols, and
these fakes satisfy them structurally).
"""

from __future__ import annotations

import builtins
import json
import math
from datetime import date, datetime
from pathlib import Path

from app.domain.entities import (
    AdaptationEntity,
    EventEntity,
    EvidenceEntity,
    MSMEEntity,
)

SEED_DIR = Path(__file__).resolve().parents[2] / "data" / "seed"


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def load_seed_msmes() -> dict[str, MSMEEntity]:
    raw = json.loads((SEED_DIR / "msmes.json").read_text(encoding="utf-8"))
    return {
        item["id"]: MSMEEntity(
            id=item["id"],
            name=item["name"],
            entity_type=item.get("entity_type", "Illustrative MSME"),
            sector=item["sector"],
            city=item["city"],
            state=item["state"],
            country=item.get("country", "India"),
            latitude=item["latitude"],
            longitude=item["longitude"],
            annual_revenue_inr=item["annual_revenue_inr"],
            inventory_value_inr=item["inventory_value_inr"],
            equipment_value_inr=item["equipment_value_inr"],
            facility_area_sqft=item["facility_area_sqft"],
            employees=item["employees"],
            hazard_score=item["hazard_score"],
            exposure_score=item["exposure_score"],
            vulnerability_score=item["vulnerability_score"],
            business_criticality_score=item["business_criticality_score"],
            risk_score=item["risk_score"],
            risk_band=item["risk_band"],
            is_synthetic=item.get("is_synthetic", True),
        )
        for item in raw
    }


def load_seed_events() -> dict[str, EventEntity]:
    raw = json.loads((SEED_DIR / "events.json").read_text(encoding="utf-8"))
    events: dict[str, EventEntity] = {}
    for item in raw:
        events[item["id"]] = EventEntity(
            id=item["id"],
            type=item["type"],
            location_name=item["location_name"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            radius_km=item.get("radius_km", 15.0),
            start_date=date.fromisoformat(item["start_date"]),
            end_date=date.fromisoformat(item["end_date"]) if item.get("end_date") else None,
            severity=item["severity"],
            source=item["source"],
            source_url=item["source_url"],
            source_type=item["source_type"],
            description=item.get("description", ""),
        )
    return events


def load_seed_adaptations() -> list[AdaptationEntity]:
    raw = json.loads((SEED_DIR / "adaptations.json").read_text(encoding="utf-8"))
    return [
        AdaptationEntity(
            id=item["id"],
            msme_id=item["msme_id"],
            measure_id=item["measure_id"],
            hazard=item["hazard"],
            status=item.get("status", "active"),
            cost_inr=item.get("cost_inr"),
            date_implemented=date.fromisoformat(item["date_implemented"]),
            evidence=item.get("evidence", ""),
            estimated_effect=item.get("estimated_effect", ""),
        )
        for item in raw
    ]


def load_seed_evidence() -> list[EvidenceEntity]:
    raw = json.loads((SEED_DIR / "evidence.json").read_text(encoding="utf-8"))
    return [
        EvidenceEntity(
            id=item["id"],
            msme_id=item.get("msme_id"),
            type=item["type"],
            source=item["source"],
            source_url=item.get("source_url", ""),
            quality=item["quality"],
            description=item["description"],
            timestamp=datetime.fromisoformat(item["timestamp"]),
        )
        for item in raw
    ]


class FakeMSMERepository:
    def __init__(self, msmes: dict[str, MSMEEntity] | None = None) -> None:
        self._msmes = msmes if msmes is not None else load_seed_msmes()

    async def get(self, msme_id: str) -> MSMEEntity | None:
        return self._msmes.get(msme_id)

    async def list(self) -> list[MSMEEntity]:
        return list(self._msmes.values())

    async def create(self, entity: MSMEEntity) -> MSMEEntity:
        self._msmes[entity.id] = entity
        return entity

    async def update(self, msme_id: str, **fields: object) -> MSMEEntity | None:
        existing = self._msmes.get(msme_id)
        if existing is None:
            return None
        clean_fields = {k: v for k, v in fields.items() if v is not None}
        updated = existing.__class__(**{**existing.__dict__, **clean_fields})
        self._msmes[msme_id] = updated
        return updated

    async def find_within_radius(
        self, latitude: float, longitude: float, radius_km: float
    ) -> builtins.list[MSMEEntity]:
        return [
            m
            for m in self._msmes.values()
            if _haversine_km(latitude, longitude, m.latitude, m.longitude) <= radius_km
        ]


class FakeEventRepository:
    def __init__(self, events: dict[str, EventEntity] | None = None) -> None:
        self._events = events if events is not None else load_seed_events()

    async def get(self, event_id: str) -> EventEntity | None:
        return self._events.get(event_id)

    async def list(self) -> list[EventEntity]:
        return list(self._events.values())


class FakeAdaptationRepository:
    def __init__(self, adaptations: list[AdaptationEntity] | None = None) -> None:
        self._adaptations = {a.id: a for a in (adaptations or load_seed_adaptations())}

    async def list_for_msme(self, msme_id: str) -> list[AdaptationEntity]:
        return [a for a in self._adaptations.values() if a.msme_id == msme_id]

    async def get(self, adaptation_id: str) -> AdaptationEntity | None:
        return self._adaptations.get(adaptation_id)

    async def create(self, entity: AdaptationEntity) -> AdaptationEntity:
        self._adaptations[entity.id] = entity
        return entity

    async def update(self, adaptation_id: str, **fields: object) -> AdaptationEntity | None:
        existing = self._adaptations.get(adaptation_id)
        if existing is None:
            return None
        clean_fields = {k: v for k, v in fields.items() if v is not None}
        updated = existing.__class__(**{**existing.__dict__, **clean_fields})
        self._adaptations[adaptation_id] = updated
        return updated

    async def delete(self, adaptation_id: str) -> bool:
        return self._adaptations.pop(adaptation_id, None) is not None


class FakeCounterfactualRepository:
    def __init__(self) -> None:
        self._runs: dict[str, dict[str, object]] = {}
        self._counter = 0

    async def save(self, run: dict[str, object]) -> str:
        self._counter += 1
        run_id = f"CF-RUN-{self._counter}"
        self._runs[run_id] = {**run, "id": run_id}
        return run_id

    async def get(self, run_id: str) -> dict[str, object] | None:
        return self._runs.get(run_id)


class FakeEvidenceRepository:
    def __init__(self, evidence: list[EvidenceEntity] | None = None) -> None:
        self._evidence = evidence if evidence is not None else load_seed_evidence()

    async def list_for_msme(self, msme_id: str) -> list[EvidenceEntity]:
        return [e for e in self._evidence if e.msme_id == msme_id]

    async def list_all(self) -> list[EvidenceEntity]:
        return list(self._evidence)
