from __future__ import annotations

from fastapi.testclient import TestClient


def test_health(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_list_and_get_msme(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/msmes")
    assert resp.status_code == 200
    data = resp.json()
    assert any(m["id"] == "MSME-SURAT-001" for m in data)

    resp = app_client.get("/api/v1/msmes/MSME-SURAT-001")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Surat Textile Works"


def test_get_msme_not_found_returns_problem_json(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/msmes/DOES-NOT-EXIST")
    assert resp.status_code == 404
    assert resp.headers["content-type"].startswith("application/problem+json")
    body = resp.json()
    assert body["status"] == 404


def test_msme_risk_breakdown(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/msmes/MSME-SURAT-001/risk")
    assert resp.status_code == 200
    body = resp.json()
    assert round(body["risk_score"]) == 78
    assert body["risk_band"] == "High"
    assert "disclaimer" in body


def test_list_events(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/events")
    assert resp.status_code == 200
    ids = [e["id"] for e in resp.json()]
    assert "EVENT-SURAT-FLOOD-2026" in ids
    assert "EVENT-SURAT-HEAT-2026" in ids


def test_event_affected_msmes(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/events/EVENT-SURAT-FLOOD-2026")
    assert resp.status_code == 200
    body = resp.json()
    assert any(m["id"] == "MSME-SURAT-001" for m in body["affected_msmes"])


def test_adaptation_catalog(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/adaptations/catalog")
    assert resp.status_code == 200
    ids = [m["id"] for m in resp.json()]
    assert "raised_equipment" in ids


def test_list_msme_adaptations(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/msmes/MSME-SURAT-001/adaptations")
    assert resp.status_code == 200
    measures = {a["measure_id"] for a in resp.json()}
    assert {"raised_equipment", "flood_barrier", "improved_drainage"}.issubset(measures)


def test_counterfactual_run_seed_scenario(app_client: TestClient) -> None:
    resp = app_client.post(
        "/api/v1/counterfactual/run",
        json={
            "msme_id": "MSME-SURAT-001",
            "event_id": "EVENT-SURAT-FLOOD-2026",
            "adaptations": ["raised_equipment", "flood_barrier", "improved_drainage"],
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert round(body["without_adaptation"]["risk_score"]) == 78
    assert round(body["with_adaptation"]["risk_score"]) == 31
    assert round(body["resilience_delta"]["loss_reduction_pct"]) == 68
    assert "Illustrative" in body["disclaimer"]

    run_id = body["id"]
    get_resp = app_client.get(f"/api/v1/counterfactual/{run_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["msme_id"] == "MSME-SURAT-001"


def test_counterfactual_run_unknown_msme_returns_404(app_client: TestClient) -> None:
    resp = app_client.post(
        "/api/v1/counterfactual/run",
        json={"msme_id": "NOPE", "event_id": "EVENT-SURAT-FLOOD-2026", "adaptations": []},
    )
    assert resp.status_code == 404


def test_evidence_confidence(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/msmes/MSME-SURAT-001/evidence")
    assert resp.status_code == 200
    body = resp.json()
    assert round(body["evidence_confidence"]) == 82
    assert "Illustrative" in body["label"]


def test_portfolio_summary(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/portfolio/summary")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_borrowers"] >= 1


def test_portfolio_risk_map(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/portfolio/risk-map")
    assert resp.status_code == 200
    assert len(resp.json()["points"]) >= 1


def test_request_id_header_present(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/health")
    assert "X-Request-ID" in resp.headers
