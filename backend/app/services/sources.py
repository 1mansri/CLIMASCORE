"""EventSource / EvidenceSource Protocols (LSP).

These describe *where canonical demo data comes from*, independent of how
it is persisted. `SeededEventSource` / `SeededEvidenceSource` read the
deterministic JSON fixtures under `data/seed/`. A future
`LiveWeatherEventSource` (calling a real weather/climate API) could
implement `EventSource` with the exact same `get_event` / `list_events`
signature and be substituted with no caller changes -- callers (the seed
script, the demo-reset endpoint) depend only on the Protocol.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Protocol

from app.domain.entities import EventEntity, EvidenceEntity


class EventSource(Protocol):
    def get_event(self, event_id: str) -> EventEntity | None: ...

    def list_events(self) -> list[EventEntity]: ...


class EvidenceSource(Protocol):
    def list_evidence(self) -> list[EvidenceEntity]: ...


def _default_seed_dir() -> Path:
    return Path(__file__).resolve().parents[3] / "data" / "seed"


class SeededEventSource:
    """LSP-compliant EventSource backed by the deterministic seed JSON."""

    def __init__(self, seed_dir: Path | None = None) -> None:
        self._seed_dir = seed_dir or _default_seed_dir()
        self._events: dict[str, EventEntity] | None = None

    def _load(self) -> dict[str, EventEntity]:
        if self._events is None:
            raw = json.loads((self._seed_dir / "events.json").read_text(encoding="utf-8"))
            self._events = {}
            for item in raw:
                from datetime import date as date_cls

                start = date_cls.fromisoformat(item["start_date"])
                end = date_cls.fromisoformat(item["end_date"]) if item.get("end_date") else None
                self._events[item["id"]] = EventEntity(
                    id=item["id"],
                    type=item["type"],
                    location_name=item["location_name"],
                    latitude=item["latitude"],
                    longitude=item["longitude"],
                    radius_km=item.get("radius_km", 15.0),
                    start_date=start,
                    end_date=end,
                    severity=item["severity"],
                    source=item["source"],
                    source_url=item["source_url"],
                    source_type=item["source_type"],
                    description=item.get("description", ""),
                )
        return self._events

    def get_event(self, event_id: str) -> EventEntity | None:
        return self._load().get(event_id)

    def list_events(self) -> list[EventEntity]:
        return list(self._load().values())


class SeededEvidenceSource:
    """LSP-compliant EvidenceSource backed by the deterministic seed JSON."""

    def __init__(self, seed_dir: Path | None = None) -> None:
        self._seed_dir = seed_dir or _default_seed_dir()
        self._evidence: list[EvidenceEntity] | None = None

    def list_evidence(self) -> list[EvidenceEntity]:
        if self._evidence is None:
            raw = json.loads((self._seed_dir / "evidence.json").read_text(encoding="utf-8"))
            from datetime import datetime as dt_cls

            self._evidence = [
                EvidenceEntity(
                    id=item["id"],
                    msme_id=item.get("msme_id"),
                    type=item["type"],
                    source=item["source"],
                    source_url=item["source_url"],
                    quality=item["quality"],
                    description=item["description"],
                    timestamp=dt_cls.fromisoformat(item["timestamp"]),
                )
                for item in raw
            ]
        return self._evidence
