"""Risk Engine (spec section 9): transparent weighted 0-100 risk score."""

from __future__ import annotations

from dataclasses import dataclass

from app.config.model_config import RISK_COMPONENT_WEIGHTS, risk_band_for_score
from app.schemas.common import ILLUSTRATIVE_MODEL_DISCLAIMER


@dataclass(frozen=True)
class RiskComponents:
    hazard: float
    exposure: float
    vulnerability: float
    business_criticality: float


@dataclass(frozen=True)
class RiskResult:
    hazard: float
    exposure: float
    vulnerability: float
    business_criticality: float
    risk_score: float
    risk_band: str
    disclaimer: str = ILLUSTRATIVE_MODEL_DISCLAIMER


class RiskEngine:
    """Computes the weighted composite climate-risk score for an MSME.

    Pure function of its inputs -- no I/O -- so it needs no repository and
    is trivially unit-testable against spec section 27's numeric case.
    """

    def calculate(self, components: RiskComponents) -> RiskResult:
        weights = RISK_COMPONENT_WEIGHTS
        score = (
            weights["hazard"] * components.hazard
            + weights["exposure"] * components.exposure
            + weights["vulnerability"] * components.vulnerability
            + weights["business_criticality"] * components.business_criticality
        )
        score = round(score, 2)
        return RiskResult(
            hazard=components.hazard,
            exposure=components.exposure,
            vulnerability=components.vulnerability,
            business_criticality=components.business_criticality,
            risk_score=score,
            risk_band=risk_band_for_score(score).value,
        )
