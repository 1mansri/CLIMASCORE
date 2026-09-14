
import pytest

from app.domain.entities import EventEntity, MSMEEntity
from app.services.counterfactual_engine import CounterfactualEngine
from app.services.evidence_engine import EvidenceEngine
from tests.fakes import (
    FakeCounterfactualRepository,
    FakeEventRepository,
    FakeEvidenceRepository,
    FakeMSMERepository,
)

SEED_MSME_ID = "MSME-SURAT-001"
SEED_EVENT_ID = "EVENT-SURAT-FLOOD-2026"
DEMO_ADAPTATIONS = ["raised_equipment", "flood_barrier", "improved_drainage"]


def _engine() -> CounterfactualEngine:
    return CounterfactualEngine(
        msme_repository=FakeMSMERepository(),
        event_repository=FakeEventRepository(),
        counterfactual_repository=FakeCounterfactualRepository(),
        evidence_engine=EvidenceEngine(FakeEvidenceRepository()),
    )


def _seed_msme() -> MSMEEntity:
    import asyncio

    msme = asyncio.run(FakeMSMERepository().get(SEED_MSME_ID))
    assert msme is not None
    return msme


def _seed_event() -> EventEntity:
    import asyncio

    event = asyncio.run(FakeEventRepository().get(SEED_EVENT_ID))
    assert event is not None
    return event


def test_seed_scenario_reproduces_spec_section_14_numbers() -> None:
    engine = _engine()
    msme = _seed_msme()
    event = _seed_event()

    result = engine.run_pure(msme, event, DEMO_ADAPTATIONS)

    assert round(result.without_adaptation.risk_score) == 78
    assert round(result.without_adaptation.estimated_loss_inr / 100_000, 1) == 9.8
    assert result.without_adaptation.downtime_hours == 39.0

    assert round(result.with_adaptation.risk_score) == 31
    assert round(result.with_adaptation.estimated_loss_inr / 100_000, 1) == 3.1
    assert result.with_adaptation.downtime_hours == 11.0

    assert round(result.resilience_delta.avoided_loss_inr / 100_000, 1) == 6.7
    assert round(result.resilience_delta.loss_reduction_pct) == 68
    assert result.resilience_delta.downtime_avoided_hours == 28.0


def test_counterfactual_integrity_same_event_both_scenarios() -> None:
    """The climate event must be IDENTICAL in both scenarios (spec section 27)."""
    engine = _engine()
    msme = _seed_msme()
    event = _seed_event()

    result = engine.run_pure(msme, event, DEMO_ADAPTATIONS)

    assert result.event.id == event.id
    assert result.event is event  # exact same event object fed to both scenario runs
    assert result.event_id == SEED_EVENT_ID


def test_no_adaptation_selected_yields_baseline_both_sides() -> None:
    engine = _engine()
    msme = _seed_msme()
    event = _seed_event()

    result = engine.run_pure(msme, event, [])

    assert result.without_adaptation.risk_score == result.with_adaptation.risk_score
    assert result.without_adaptation.estimated_loss_inr == result.with_adaptation.estimated_loss_inr
    assert result.resilience_delta.avoided_loss_inr == 0.0


@pytest.mark.asyncio
async def test_run_via_repositories_matches_run_pure() -> None:
    engine = _engine()
    result = await engine.run(SEED_MSME_ID, SEED_EVENT_ID, DEMO_ADAPTATIONS)
    assert round(result.without_adaptation.risk_score) == 78
    assert round(result.with_adaptation.risk_score) == 31
    assert result.evidence_confidence > 0
