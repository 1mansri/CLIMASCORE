from app.config.model_config import HazardType
from app.services.loss_model import LossModel

# Seed MSME-SURAT-001 figures (spec section 8).
EQUIPMENT_VALUE = 2_500_000.0
INVENTORY_VALUE = 3_000_000.0
ANNUAL_REVENUE = 15_000_000.0


def test_without_adaptation_matches_spec_section_14() -> None:
    model = LossModel()
    estimate = model.estimate(
        hazard=HazardType.FLOOD,
        equipment_value_inr=EQUIPMENT_VALUE,
        inventory_value_inr=INVENTORY_VALUE,
        annual_revenue_inr=ANNUAL_REVENUE,
        adaptation_fraction=0.0,
    )
    assert estimate.downtime_hours == 39.0
    # displayed in lakhs, rounded to 1 decimal -> 9.8L
    assert round(estimate.total_loss_inr / 100_000, 1) == 9.8


def test_with_full_adaptation_matches_spec_section_14() -> None:
    model = LossModel()
    estimate = model.estimate(
        hazard=HazardType.FLOOD,
        equipment_value_inr=EQUIPMENT_VALUE,
        inventory_value_inr=INVENTORY_VALUE,
        annual_revenue_inr=ANNUAL_REVENUE,
        adaptation_fraction=1.0,
    )
    assert estimate.downtime_hours == 11.0
    assert round(estimate.total_loss_inr / 100_000, 1) == 3.1


def test_loss_difference_and_reduction_pct() -> None:
    model = LossModel()
    without = model.estimate(HazardType.FLOOD, EQUIPMENT_VALUE, INVENTORY_VALUE, ANNUAL_REVENUE, 0.0)
    with_full = model.estimate(HazardType.FLOOD, EQUIPMENT_VALUE, INVENTORY_VALUE, ANNUAL_REVENUE, 1.0)

    avoided = without.total_loss_inr - with_full.total_loss_inr
    assert round(avoided / 100_000, 1) == 6.7

    reduction_pct = avoided / without.total_loss_inr * 100
    assert round(reduction_pct) == 68


def test_downtime_avoided_is_28_hours() -> None:
    model = LossModel()
    without = model.estimate(HazardType.FLOOD, EQUIPMENT_VALUE, INVENTORY_VALUE, ANNUAL_REVENUE, 0.0)
    with_full = model.estimate(HazardType.FLOOD, EQUIPMENT_VALUE, INVENTORY_VALUE, ANNUAL_REVENUE, 1.0)
    assert without.downtime_hours - with_full.downtime_hours == 28.0


def test_sensitivity_band_brackets_point_estimate() -> None:
    model = LossModel()
    estimate = model.estimate(HazardType.FLOOD, EQUIPMENT_VALUE, INVENTORY_VALUE, ANNUAL_REVENUE, 0.0)
    assert estimate.loss_low_inr < estimate.total_loss_inr < estimate.loss_high_inr
