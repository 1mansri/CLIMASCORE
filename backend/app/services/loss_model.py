"""Loss Model (spec section 13): transparent illustrative loss formula.

    Total Estimated Loss = Asset Damage + Inventory Damage
                          + Downtime Loss + Recovery Cost

All coefficients live in app.config.model_config, not here, so tuning the
model is a config change (OCP).
"""

from __future__ import annotations

from dataclasses import dataclass

from app.config.model_config import (
    DAYS_PER_YEAR,
    FULL_ADAPTATION_REFERENCE_POINTS,
    HOURS_PER_DAY,
    LOSS_MODEL_COEFFICIENTS,
    LOSS_SENSITIVITY_PCT,
    HazardType,
)


@dataclass(frozen=True)
class LossEstimate:
    total_loss_inr: float
    asset_damage_inr: float
    inventory_damage_inr: float
    downtime_loss_inr: float
    recovery_cost_inr: float
    downtime_hours: float
    loss_low_inr: float
    loss_high_inr: float


class LossModel:
    """Deterministic transparent loss + downtime estimator.

    `adaptation_fraction` in [0, 1] interpolates linearly between the
    "without adaptation" and "with full adaptation" damage-rate/downtime
    endpoints for the given hazard, so any subset of adaptation measures
    degrades the estimate gracefully rather than requiring a branch per
    combination.
    """

    def estimate(
        self,
        hazard: HazardType,
        equipment_value_inr: float,
        inventory_value_inr: float,
        annual_revenue_inr: float,
        adaptation_fraction: float,
    ) -> LossEstimate:
        fraction = max(0.0, min(1.0, adaptation_fraction))
        coeffs = LOSS_MODEL_COEFFICIENTS[hazard]

        damage_rate = coeffs.damage_rate_without_adaptation - fraction * (
            coeffs.damage_rate_without_adaptation - coeffs.damage_rate_with_full_adaptation
        )
        downtime_hours = coeffs.downtime_hours_without_adaptation - fraction * (
            coeffs.downtime_hours_without_adaptation - coeffs.downtime_hours_with_full_adaptation
        )

        result = self._compute_loss(
            equipment_value_inr,
            inventory_value_inr,
            annual_revenue_inr,
            damage_rate,
            downtime_hours,
            coeffs.operational_loss_factor,
            coeffs.recovery_cost_pct_of_physical_damage,
        )

        low = self._compute_loss(
            equipment_value_inr,
            inventory_value_inr,
            annual_revenue_inr,
            damage_rate * (1 - LOSS_SENSITIVITY_PCT),
            downtime_hours,
            coeffs.operational_loss_factor,
            coeffs.recovery_cost_pct_of_physical_damage,
        )[0]
        high = self._compute_loss(
            equipment_value_inr,
            inventory_value_inr,
            annual_revenue_inr,
            damage_rate * (1 + LOSS_SENSITIVITY_PCT),
            downtime_hours,
            coeffs.operational_loss_factor,
            coeffs.recovery_cost_pct_of_physical_damage,
        )[0]

        total, asset, inventory, downtime_loss, recovery = result
        return LossEstimate(
            total_loss_inr=round(total, 2),
            asset_damage_inr=round(asset, 2),
            inventory_damage_inr=round(inventory, 2),
            downtime_loss_inr=round(downtime_loss, 2),
            recovery_cost_inr=round(recovery, 2),
            downtime_hours=round(downtime_hours, 2),
            loss_low_inr=round(low, 2),
            loss_high_inr=round(high, 2),
        )

    @staticmethod
    def _compute_loss(
        equipment_value_inr: float,
        inventory_value_inr: float,
        annual_revenue_inr: float,
        damage_rate: float,
        downtime_hours: float,
        operational_loss_factor: float,
        recovery_cost_pct: float,
    ) -> tuple[float, float, float, float, float]:
        asset_damage = equipment_value_inr * damage_rate
        inventory_damage = inventory_value_inr * damage_rate
        daily_revenue = annual_revenue_inr / DAYS_PER_YEAR
        downtime_days = downtime_hours / HOURS_PER_DAY
        downtime_loss = daily_revenue * downtime_days * operational_loss_factor
        physical_damage = asset_damage + inventory_damage
        recovery_cost = physical_damage * recovery_cost_pct
        total = asset_damage + inventory_damage + downtime_loss + recovery_cost
        return total, asset_damage, inventory_damage, downtime_loss, recovery_cost


def adaptation_fraction_for(hazard: HazardType, risk_reduction_points: float) -> float:
    reference = FULL_ADAPTATION_REFERENCE_POINTS.get(hazard, 0.0)
    if reference <= 0:
        return 0.0
    return max(0.0, min(1.0, risk_reduction_points / reference))
