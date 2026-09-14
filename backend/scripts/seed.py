"""Idempotent seed loader: data/seed/*.json -> Postgres.

Safe to run multiple times (upserts by id via AsyncSession.merge). Used by
`python -m scripts.seed` (docker-compose entrypoint) and by
POST /api/v1/demo/reset (app/api/demo.py) for the "Load Demo Scenario"
button, so both paths share exactly one seeding implementation.
"""

from __future__ import annotations

import asyncio
import json
from datetime import date, datetime
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.adaptation import Adaptation
from app.models.event import ClimateEvent
from app.models.evidence import Evidence
from app.models.msme import MSME

SEED_DIR = Path(__file__).resolve().parents[2] / "data" / "seed"


def _load(filename: str) -> list[dict]:
    return json.loads((SEED_DIR / filename).read_text(encoding="utf-8"))


async def seed_msmes(session: AsyncSession) -> None:
    for item in _load("msmes.json"):
        row = MSME(
            id=item["id"],
            name=item["name"],
            entity_type=item.get("entity_type", "Illustrative MSME"),
            sector=item["sector"],
            city=item["city"],
            state=item["state"],
            country=item.get("country", "India"),
            latitude=item["latitude"],
            longitude=item["longitude"],
            location=f"SRID=4326;POINT({item['longitude']} {item['latitude']})",
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
        await session.merge(row)


async def seed_events(session: AsyncSession) -> None:
    for item in _load("events.json"):
        row = ClimateEvent(
            id=item["id"],
            type=item["type"],
            location_name=item["location_name"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            location=f"SRID=4326;POINT({item['longitude']} {item['latitude']})",
            radius_km=item.get("radius_km", 15.0),
            start_date=date.fromisoformat(item["start_date"]),
            end_date=date.fromisoformat(item["end_date"]) if item.get("end_date") else None,
            severity=item["severity"],
            source=item["source"],
            source_url=item["source_url"],
            source_type=item["source_type"],
            description=item.get("description", ""),
        )
        await session.merge(row)


async def seed_adaptations(session: AsyncSession) -> None:
    for item in _load("adaptations.json"):
        row = Adaptation(
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
        await session.merge(row)


async def seed_evidence(session: AsyncSession) -> None:
    for item in _load("evidence.json"):
        row = Evidence(
            id=item["id"],
            msme_id=item.get("msme_id"),
            type=item["type"],
            source=item["source"],
            source_url=item.get("source_url", ""),
            quality=item["quality"],
            description=item["description"],
            timestamp=datetime.fromisoformat(item["timestamp"]),
        )
        await session.merge(row)


async def seed_all(session: AsyncSession) -> None:
    await seed_msmes(session)
    await seed_events(session)
    await seed_adaptations(session)
    await seed_evidence(session)
    await session.commit()


async def main() -> None:
    from app.db.session import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        await seed_all(session)


if __name__ == "__main__":
    asyncio.run(main())
