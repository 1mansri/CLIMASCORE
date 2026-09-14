from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, Response, status

from app.api.deps import EventEngineDep
from app.core.rate_limit import CHEAP_READ_LIMIT, limiter
from app.schemas.event import EventOut, EventWithAffectedMSMEs
from app.schemas.msme import MSMEOut
from app.services.event_engine import EventNotFoundError

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventOut])
@limiter.limit(CHEAP_READ_LIMIT)
async def list_events(request: Request, response: Response, engine: EventEngineDep) -> list[EventOut]:
    events = await engine.list_events()
    return [EventOut.model_validate(e) for e in events]


@router.get("/{event_id}", response_model=EventWithAffectedMSMEs)
@limiter.limit(CHEAP_READ_LIMIT)
async def get_event(request: Request, response: Response, event_id: str, engine: EventEngineDep) -> EventWithAffectedMSMEs:
    try:
        event = await engine.get_event(event_id)
        affected = await engine.affected_msmes(event_id)
    except EventNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Event '{event_id}' not found") from exc
    return EventWithAffectedMSMEs(
        **EventOut.model_validate(event).model_dump(),
        affected_msmes=[MSMEOut.model_validate(m) for m in affected],
    )
