"""Climate Event Engine (spec section 11).

Resolves climate events and the MSMEs geospatially affected by them
(PostGIS ST_DWithin via MSMERepository.find_within_radius).
"""

from __future__ import annotations

from dataclasses import dataclass

from app.domain.entities import EventEntity, MSMEEntity
from app.repositories.interfaces import EventRepository, MSMERepository


class EventNotFoundError(Exception):
    pass


@dataclass
class EventEngine:
    event_repository: EventRepository
    msme_repository: MSMERepository

    async def get_event(self, event_id: str) -> EventEntity:
        event = await self.event_repository.get(event_id)
        if event is None:
            raise EventNotFoundError(event_id)
        return event

    async def list_events(self) -> list[EventEntity]:
        return await self.event_repository.list()

    async def affected_msmes(self, event_id: str) -> list[MSMEEntity]:
        event = await self.get_event(event_id)
        return await self.msme_repository.find_within_radius(
            event.latitude, event.longitude, event.radius_km
        )
