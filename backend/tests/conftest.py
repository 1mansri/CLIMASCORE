from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.api import deps
from tests.fakes import (
    FakeAdaptationRepository,
    FakeCounterfactualRepository,
    FakeEventRepository,
    FakeEvidenceRepository,
    FakeMSMERepository,
)


@pytest.fixture
def app_client() -> Iterator[TestClient]:
    from app.main import app

    msme_repo = FakeMSMERepository()
    event_repo = FakeEventRepository()
    adaptation_repo = FakeAdaptationRepository()
    counterfactual_repo = FakeCounterfactualRepository()
    evidence_repo = FakeEvidenceRepository()

    app.dependency_overrides[deps.get_msme_repository] = lambda: msme_repo
    app.dependency_overrides[deps.get_event_repository] = lambda: event_repo
    app.dependency_overrides[deps.get_adaptation_repository] = lambda: adaptation_repo
    app.dependency_overrides[deps.get_counterfactual_repository] = lambda: counterfactual_repo
    app.dependency_overrides[deps.get_evidence_repository] = lambda: evidence_repo

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()
