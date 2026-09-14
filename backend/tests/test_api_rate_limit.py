from __future__ import annotations

from fastapi.testclient import TestClient


def test_expensive_route_rate_limit_returns_429_with_retry_after(app_client: TestClient) -> None:
    payload = {
        "msme_id": "MSME-SURAT-001",
        "event_id": "EVENT-SURAT-FLOOD-2026",
        "adaptations": ["raised_equipment"],
    }
    last_response = None
    for _ in range(15):
        last_response = app_client.post("/api/v1/counterfactual/run", json=payload)
        if last_response.status_code == 429:
            break

    assert last_response is not None
    assert last_response.status_code == 429
    assert last_response.headers["content-type"].startswith("application/problem+json")
    assert "Retry-After" in last_response.headers
    body = last_response.json()
    assert body["status"] == 429


def test_rate_limit_headers_present_on_normal_response(app_client: TestClient) -> None:
    resp = app_client.get("/api/v1/msmes")
    assert resp.status_code == 200
    assert "X-RateLimit-Limit" in resp.headers or "x-ratelimit-limit" in [
        h.lower() for h in resp.headers
    ]
