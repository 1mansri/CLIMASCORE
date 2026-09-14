"""Illustrative model configuration for the CLIMASCORE risk/loss engines.

Every coefficient in this module is a *modelling assumption* used to produce
a transparent, deterministic, illustrative demo output. Nothing here is a
statistically calibrated or empirically fitted parameter. Per spec (rule 4
and 13) these values must live in configuration, not scattered through
engine code, so that adding a new adaptation measure or hazard type is a
data change rather than an if/else edit (Open/Closed Principle).
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class HazardType(StrEnum):
    FLOOD = "Flood"
    EXTREME_HEAT = "Extreme Heat"
    CYCLONE = "Cyclone"
    DROUGHT = "Drought"


class RiskBand(StrEnum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    SEVERE = "Severe"


# ---------------------------------------------------------------------------
# 1. RISK ENGINE (spec section 9)
# ---------------------------------------------------------------------------

RISK_COMPONENT_WEIGHTS: dict[str, float] = {
    "hazard": 0.35,
    "exposure": 0.30,
    "vulnerability": 0.20,
    "business_criticality": 0.15,
}

RISK_BAND_THRESHOLDS: tuple[tuple[float, RiskBand], ...] = (
    (85.0, RiskBand.SEVERE),
    (65.0, RiskBand.HIGH),
    (40.0, RiskBand.MODERATE),
    (0.0, RiskBand.LOW),
)


def risk_band_for_score(score: float) -> RiskBand:
    for threshold, band in RISK_BAND_THRESHOLDS:
        if score >= threshold:
            return band
    return RiskBand.LOW


# ---------------------------------------------------------------------------
# 2. ADAPTATION MEASURES (spec section 10)
# ---------------------------------------------------------------------------
#
# `risk_reduction_points` is the illustrative number of points (on the 0-100
# risk score scale) that activating this measure removes from a borrower's
# event-specific counterfactual risk score, when the measure addresses the
# hazard in question. This is the single lever a new adaptation measure
# needs to plug into the counterfactual engine (OCP: add a row, no code
# change). `vulnerability_reduction_pct` and `downtime_reduction_pct` drive
# the loss-model blending used to interpolate between the "without" and
# "with adaptation" damage-rate/downtime endpoints for partial adaptation
# coverage.


@dataclass(frozen=True)
class AdaptationMeasureConfig:
    id: str
    name: str
    hazards_addressed: tuple[HazardType, ...]
    risk_reduction_points: float
    vulnerability_reduction_pct: float
    downtime_reduction_pct: float
    description: str


ADAPTATION_MEASURES: dict[str, AdaptationMeasureConfig] = {
    "raised_equipment": AdaptationMeasureConfig(
        id="raised_equipment",
        name="Raised Equipment",
        hazards_addressed=(HazardType.FLOOD,),
        risk_reduction_points=20.0,
        vulnerability_reduction_pct=0.40,
        downtime_reduction_pct=0.35,
        description="Reduces flood exposure to critical machinery by elevating it above expected water levels.",
    ),
    "flood_barrier": AdaptationMeasureConfig(
        id="flood_barrier",
        name="Flood Barrier",
        hazards_addressed=(HazardType.FLOOD,),
        risk_reduction_points=17.0,
        vulnerability_reduction_pct=0.35,
        downtime_reduction_pct=0.30,
        description="Reduces water ingress into the facility during flood events.",
    ),
    "improved_drainage": AdaptationMeasureConfig(
        id="improved_drainage",
        name="Improved Drainage",
        hazards_addressed=(HazardType.FLOOD,),
        risk_reduction_points=10.0,
        vulnerability_reduction_pct=0.25,
        downtime_reduction_pct=0.30,
        description="Reduces water accumulation and shortens recovery time after flooding.",
    ),
    "cooling_heat_protection": AdaptationMeasureConfig(
        id="cooling_heat_protection",
        name="Cooling / Heat Protection",
        hazards_addressed=(HazardType.EXTREME_HEAT,),
        risk_reduction_points=15.0,
        vulnerability_reduction_pct=0.30,
        downtime_reduction_pct=0.25,
        description="Reduces heat vulnerability for workers and heat-sensitive equipment.",
    ),
    "backup_power": AdaptationMeasureConfig(
        id="backup_power",
        name="Backup Power",
        hazards_addressed=(HazardType.FLOOD, HazardType.EXTREME_HEAT, HazardType.CYCLONE),
        risk_reduction_points=8.0,
        vulnerability_reduction_pct=0.15,
        downtime_reduction_pct=0.40,
        description="Reduces operational downtime during grid outages caused by climate events.",
    ),
    "protected_inventory": AdaptationMeasureConfig(
        id="protected_inventory",
        name="Inventory Elevation / Protected Storage",
        hazards_addressed=(HazardType.FLOOD,),
        risk_reduction_points=6.0,
        vulnerability_reduction_pct=0.20,
        downtime_reduction_pct=0.10,
        description="Reduces inventory loss by elevating or protecting stored goods.",
    ),
}


def max_risk_reduction_for_hazard(measure_ids: list[str], hazard: HazardType) -> float:
    total = 0.0
    for measure_id in measure_ids:
        cfg = ADAPTATION_MEASURES.get(measure_id)
        if cfg and hazard in cfg.hazards_addressed:
            total += cfg.risk_reduction_points
    return total


# ---------------------------------------------------------------------------
# 3. LOSS MODEL (spec section 13/14)
# ---------------------------------------------------------------------------
#
# Damage-rate and downtime-hour endpoints are illustrative assumptions
# calibrated so the seeded demo scenario (MSME-SURAT-001 +
# EVENT-SURAT-FLOOD-2026 + [raised_equipment, flood_barrier,
# improved_drainage]) reproduces spec section 14's numbers:
#   without adaptation -> risk 78, loss ~Rs 9.8L, downtime 39h
#   with adaptation    -> risk 31, loss ~Rs 3.1L, downtime 11h


@dataclass(frozen=True)
class LossModelCoefficients:
    damage_rate_without_adaptation: float
    damage_rate_with_full_adaptation: float
    downtime_hours_without_adaptation: float
    downtime_hours_with_full_adaptation: float
    operational_loss_factor: float
    recovery_cost_pct_of_physical_damage: float


LOSS_MODEL_COEFFICIENTS: dict[HazardType, LossModelCoefficients] = {
    HazardType.FLOOD: LossModelCoefficients(
        damage_rate_without_adaptation=0.156,
        damage_rate_with_full_adaptation=0.050,
        downtime_hours_without_adaptation=39.0,
        downtime_hours_with_full_adaptation=11.0,
        operational_loss_factor=0.5,
        recovery_cost_pct_of_physical_damage=0.10,
    ),
    HazardType.EXTREME_HEAT: LossModelCoefficients(
        damage_rate_without_adaptation=0.04,
        damage_rate_with_full_adaptation=0.015,
        downtime_hours_without_adaptation=18.0,
        downtime_hours_with_full_adaptation=6.0,
        operational_loss_factor=0.35,
        recovery_cost_pct_of_physical_damage=0.08,
    ),
}

# Sensitivity band for the uncertainty-range differentiator: point estimate
# is also re-run with damage-rate coefficients perturbed by +/- this amount.
LOSS_SENSITIVITY_PCT = 0.15

DAYS_PER_YEAR = 365
HOURS_PER_DAY = 24

# Full-adaptation reference: the sum of risk_reduction_points across the
# three demo flood measures. Used to scale a *partial* adaptation selection
# (a subset of measures, or measures for other hazards) proportionally
# between the "without" and "with full adaptation" damage-rate/downtime
# endpoints, so the loss model degrades gracefully for any combination.
FULL_ADAPTATION_REFERENCE_POINTS: dict[HazardType, float] = {
    HazardType.FLOOD: sum(
        cfg.risk_reduction_points
        for cfg in ADAPTATION_MEASURES.values()
        if HazardType.FLOOD in cfg.hazards_addressed
        and cfg.id in ("raised_equipment", "flood_barrier", "improved_drainage")
    ),
    HazardType.EXTREME_HEAT: ADAPTATION_MEASURES["cooling_heat_protection"].risk_reduction_points,
}


# ---------------------------------------------------------------------------
# 4. EVIDENCE CONFIDENCE (spec section 16)
# ---------------------------------------------------------------------------

EVIDENCE_QUALITY_WEIGHTS: dict[str, float] = {
    "hazard_event": 0.25,
    "location": 0.15,
    "asset_operations": 0.20,
    "adaptation_record": 0.20,
    "observed_loss": 0.10,
    "remote_sensing": 0.10,
}

EVIDENCE_QUALITY_SCORES: dict[str, int] = {
    "verified": 100,
    "documented": 80,
    "self_reported": 55,
    "missing": 0,
}
