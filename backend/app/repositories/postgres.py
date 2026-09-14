"""Concrete SQLAlchemy async implementations of the repository Protocols."""

from __future__ import annotations

import builtins

from geoalchemy2.functions import ST_DWithin, ST_MakePoint, ST_SetSRID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities import (
    AdaptationEntity,
    EventEntity,
    EvidenceEntity,
    MSMEEntity,
)
from app.models.adaptation import Adaptation
from app.models.event import ClimateEvent
from app.models.evidence import Evidence
from app.models.msme import MSME


def _msme_to_entity(row: MSME) -> MSMEEntity:
    return MSMEEntity(
        id=row.id,
        name=row.name,
        entity_type=row.entity_type,
        sector=row.sector,
        city=row.city,
        state=row.state,
        country=row.country,
        latitude=row.latitude,
        longitude=row.longitude,
        annual_revenue_inr=row.annual_revenue_inr,
        inventory_value_inr=row.inventory_value_inr,
        equipment_value_inr=row.equipment_value_inr,
        facility_area_sqft=row.facility_area_sqft,
        employees=row.employees,
        hazard_score=row.hazard_score,
        exposure_score=row.exposure_score,
        vulnerability_score=row.vulnerability_score,
        business_criticality_score=row.business_criticality_score,
        risk_score=row.risk_score,
        risk_band=row.risk_band,
        is_synthetic=row.is_synthetic,
    )


def _event_to_entity(row: ClimateEvent) -> EventEntity:
    return EventEntity(
        id=row.id,
        type=row.type,
        location_name=row.location_name,
        latitude=row.latitude,
        longitude=row.longitude,
        radius_km=row.radius_km,
        start_date=row.start_date,
        end_date=row.end_date,
        severity=row.severity,
        source=row.source,
        source_url=row.source_url,
        source_type=row.source_type,
        description=row.description,
    )


def _adaptation_to_entity(row: Adaptation) -> AdaptationEntity:
    return AdaptationEntity(
        id=row.id,
        msme_id=row.msme_id,
        measure_id=row.measure_id,
        hazard=row.hazard,
        status=row.status,
        cost_inr=row.cost_inr,
        date_implemented=row.date_implemented,
        evidence=row.evidence,
        estimated_effect=row.estimated_effect,
    )


def _evidence_to_entity(row: Evidence) -> EvidenceEntity:
    return EvidenceEntity(
        id=row.id,
        msme_id=row.msme_id,
        type=row.type,
        source=row.source,
        source_url=row.source_url,
        quality=row.quality,
        description=row.description,
        timestamp=row.timestamp,
    )


class SqlAlchemyMSMERepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, msme_id: str) -> MSMEEntity | None:
        row = await self._session.get(MSME, msme_id)
        return _msme_to_entity(row) if row else None

    async def list(self) -> builtins.list[MSMEEntity]:
        result = await self._session.execute(select(MSME).order_by(MSME.name))
        return [_msme_to_entity(row) for row in result.scalars().all()]

    async def create(self, entity: MSMEEntity) -> MSMEEntity:
        row = MSME(
            id=entity.id,
            name=entity.name,
            entity_type=entity.entity_type,
            sector=entity.sector,
            city=entity.city,
            state=entity.state,
            country=entity.country,
            latitude=entity.latitude,
            longitude=entity.longitude,
            location=f"SRID=4326;POINT({entity.longitude} {entity.latitude})",
            annual_revenue_inr=entity.annual_revenue_inr,
            inventory_value_inr=entity.inventory_value_inr,
            equipment_value_inr=entity.equipment_value_inr,
            facility_area_sqft=entity.facility_area_sqft,
            employees=entity.employees,
            hazard_score=entity.hazard_score,
            exposure_score=entity.exposure_score,
            vulnerability_score=entity.vulnerability_score,
            business_criticality_score=entity.business_criticality_score,
            risk_score=entity.risk_score,
            risk_band=entity.risk_band,
            is_synthetic=entity.is_synthetic,
        )
        self._session.add(row)
        await self._session.flush()
        return _msme_to_entity(row)

    async def update(self, msme_id: str, **fields: object) -> MSMEEntity | None:
        row = await self._session.get(MSME, msme_id)
        if row is None:
            return None
        for key, value in fields.items():
            if value is not None and hasattr(row, key):
                setattr(row, key, value)
        if "latitude" in fields or "longitude" in fields:
            row.location = f"SRID=4326;POINT({row.longitude} {row.latitude})"
        await self._session.flush()
        return _msme_to_entity(row)

    async def find_within_radius(
        self, latitude: float, longitude: float, radius_km: float
    ) -> builtins.list[MSMEEntity]:
        point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
        stmt = select(MSME).where(ST_DWithin(MSME.location, point, radius_km * 1000))
        result = await self._session.execute(stmt)
        return [_msme_to_entity(row) for row in result.scalars().all()]


class SqlAlchemyEventRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, event_id: str) -> EventEntity | None:
        row = await self._session.get(ClimateEvent, event_id)
        return _event_to_entity(row) if row else None

    async def list(self) -> list[EventEntity]:
        result = await self._session.execute(select(ClimateEvent).order_by(ClimateEvent.start_date.desc()))
        return [_event_to_entity(row) for row in result.scalars().all()]


class SqlAlchemyAdaptationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_for_msme(self, msme_id: str) -> list[AdaptationEntity]:
        result = await self._session.execute(
            select(Adaptation).where(Adaptation.msme_id == msme_id).order_by(Adaptation.date_implemented)
        )
        return [_adaptation_to_entity(row) for row in result.scalars().all()]

    async def get(self, adaptation_id: str) -> AdaptationEntity | None:
        row = await self._session.get(Adaptation, adaptation_id)
        return _adaptation_to_entity(row) if row else None

    async def create(self, entity: AdaptationEntity) -> AdaptationEntity:
        row = Adaptation(
            id=entity.id,
            msme_id=entity.msme_id,
            measure_id=entity.measure_id,
            hazard=entity.hazard,
            status=entity.status,
            cost_inr=entity.cost_inr,
            date_implemented=entity.date_implemented,
            evidence=entity.evidence,
            estimated_effect=entity.estimated_effect,
        )
        self._session.add(row)
        await self._session.flush()
        return _adaptation_to_entity(row)

    async def update(self, adaptation_id: str, **fields: object) -> AdaptationEntity | None:
        row = await self._session.get(Adaptation, adaptation_id)
        if row is None:
            return None
        for key, value in fields.items():
            if value is not None and hasattr(row, key):
                setattr(row, key, value)
        await self._session.flush()
        return _adaptation_to_entity(row)

    async def delete(self, adaptation_id: str) -> bool:
        row = await self._session.get(Adaptation, adaptation_id)
        if row is None:
            return False
        await self._session.delete(row)
        await self._session.flush()
        return True


class SqlAlchemyCounterfactualRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, run: dict[str, object]) -> str:
        from app.models.counterfactual_run import CounterfactualRun

        row = CounterfactualRun(**run)
        self._session.add(row)
        await self._session.flush()
        return row.id

    async def get(self, run_id: str) -> dict[str, object] | None:
        from app.models.counterfactual_run import CounterfactualRun

        row = await self._session.get(CounterfactualRun, run_id)
        if row is None:
            return None
        return {c.name: getattr(row, c.name) for c in row.__table__.columns}


class SqlAlchemyEvidenceRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_for_msme(self, msme_id: str) -> list[EvidenceEntity]:
        result = await self._session.execute(select(Evidence).where(Evidence.msme_id == msme_id))
        return [_evidence_to_entity(row) for row in result.scalars().all()]

    async def list_all(self) -> list[EvidenceEntity]:
        result = await self._session.execute(select(Evidence))
        return [_evidence_to_entity(row) for row in result.scalars().all()]
