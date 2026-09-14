from app.services.risk_engine import RiskComponents, RiskEngine


def test_seed_components_weighted_score_is_approximately_78() -> None:
    engine = RiskEngine()
    result = engine.calculate(
        RiskComponents(hazard=82, exposure=78, vulnerability=80, business_criticality=68)
    )
    assert round(result.risk_score) == 78
    assert result.risk_band == "High"


def test_weights_sum_to_one() -> None:
    from app.config.model_config import RISK_COMPONENT_WEIGHTS

    assert abs(sum(RISK_COMPONENT_WEIGHTS.values()) - 1.0) < 1e-9


def test_zero_components_yield_zero_score() -> None:
    engine = RiskEngine()
    result = engine.calculate(
        RiskComponents(hazard=0, exposure=0, vulnerability=0, business_criticality=0)
    )
    assert result.risk_score == 0
    assert result.risk_band == "Low"
