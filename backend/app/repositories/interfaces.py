"""Narrow repository Protocols, one per aggregate (Interface Segregation).

Engines and API routes depend on these Protocols (DIP), not on concrete
SQLAlchemy classes. Each Protocol exposes only the methods the aggregate
actually needs -- callers that only read events never see MSME write
methods, and vice versa.
"""

from __future__ import annotations

import builtins
from typing import Protocol

from app.domain.entities import (
    AdaptationEntity,
    EventEntity,
    EvidenceEntity,
    MSMEEntity,
)


class MSMERepository(Protocol):
    async def get(self, msme_id: str) -> MSMEEntity | None: ...

    async def list(self) -> builtins.list[MSMEEntity]: ...

    async def create(self, entity: MSMEEntity) -> MSMEEntity: ...

    async def update(self, msme_id: str, **fields: object) -> MSMEEntity | None: ...

    async def find_within_radius(
        self, latitude: float, longitude: float, radius_km: float
    ) -> builtins.list[MSMEEntity]: ...


class EventRepository(Protocol):
    async def get(self, event_id: str) -> EventEntity | None: ...

    async def list(self) -> list[EventEntity]: ...


class AdaptationRepository(Protocol):
    async def list_for_msme(self, msme_id: str) -> list[AdaptationEntity]: ...

    async def get(self, adaptation_id: str) -> AdaptationEntity | None: ...

    async def create(self, entity: AdaptationEntity) -> AdaptationEntity: ...

    async def update(self, adaptation_id: str, **fields: object) -> AdaptationEntity | None: ...

    async def delete(self, adaptation_id: str) -> bool: ...


class CounterfactualRepository(Protocol):
    async def save(self, run: dict[str, object]) -> str: ...

    async def get(self, run_id: str) -> dict[str, object] | None: ...


class EvidenceRepository(Protocol):
    async def list_for_msme(self, msme_id: str) -> list[EvidenceEntity]: ...

    async def list_all(self) -> list[EvidenceEntity]: ...
