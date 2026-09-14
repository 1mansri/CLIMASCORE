# Methodology

> **Every number in this document is an illustrative modelling assumption, not a statistically calibrated
> or empirically fitted parameter, and not causal proof of anything (spec rule #12).** The purpose of this
> page is transparency: a lender or judge should be able to trace any score on screen back to the exact
> formula and coefficient that produced it.

Coefficients live in code at [`backend/app/config/model_config.py`](../backend/app/config/model_config.py)
— this document mirrors that file; if they ever disagree, the code is the source of truth.

## 1. Risk score (spec §9)

```
Risk Score = 0.35 × Hazard + 0.30 × Exposure + 0.20 × Vulnerability + 0.15 × Business Criticality
```

Each component is scored 0–100 (higher = greater climate risk). Bands: **Low** (0–39), **Moderate**
(40–64), **High** (65–84), **Severe** (85–100).

Seed example: Hazard 82, Exposure 78, Vulnerability 80, Business Criticality 68 → **Risk ≈ 78 (High)**.

## 2. Adaptation measures (spec §10)

Each measure carries three illustrative effect parameters: `risk_reduction_points` (points removed from
the counterfactual risk score for the hazard it addresses), `vulnerability_reduction_pct`, and
`downtime_reduction_pct`. Full values are in `model_config.py`; e.g. Raised Equipment addresses Flood with
20 risk-reduction points, 40% vulnerability reduction, 35% downtime reduction.

## 3. Loss model (spec §13)

```
Total Estimated Loss = Asset Damage + Inventory Damage + Downtime Loss + Recovery Cost

Asset Damage      = Equipment Value × Damage Rate
Inventory Damage  = Inventory Value × Damage Rate
Downtime Loss     = Daily Revenue × Downtime Days × Operational Loss Factor
Recovery Cost     = Recovery Cost % × (Asset Damage + Inventory Damage)
```

For the flood hazard, `Damage Rate` and `Downtime Hours` are interpolated between a "without adaptation"
endpoint (damage rate 0.156, downtime 39h) and a "with full adaptation" endpoint (damage rate 0.050,
downtime 11h), scaled by the selected measures' `risk_reduction_points` relative to the full-adaptation
reference total. This is what lets any subset of adaptation measures produce a proportionate result, not
just the all-or-nothing demo case.

## 4. Counterfactual engine (spec §12)

The same `Event` (identical hazard/location/date/severity) is run twice through the loss model: once with
baseline vulnerability (no adaptation), once with vulnerability adjusted for the selected adaptation
measures. Only adaptation-driven assumptions change between the two runs — this invariant is enforced by an
automated test (`backend/tests/test_counterfactual_engine.py`) that asserts both scenarios are driven by the
literal same event object.

## 5. Resilience delta (spec §15)

```
Resilience Delta = Counterfactual (without-adaptation) Loss − Adapted (with-adaptation) Loss
```

Displayed as avoided loss (₹), loss-reduction percentage, and downtime avoided (hours).

## 6. Uncertainty band (beyond the base spec)

Rather than presenting a single, falsely precise number, every counterfactual run also reports a
sensitivity range: the loss model is re-run with damage-rate coefficients perturbed ±15%
(`LOSS_SENSITIVITY_PCT`), and both the point estimate and the resulting range are returned and displayed
(e.g. "₹6.7L, range ₹5.4L–₹8.1L"). This is a deliberate choice: a single confident number reads as
fabricated precision to a risk-literate reviewer, while a range signals honest, bounded modelling and
reinforces that this is an illustrative estimate, not a measurement.

## 7. Evidence confidence (spec §16)

A 0–100 weighted score across six evidence categories (hazard/event, location, asset/operations, adaptation
record, observed loss, remote sensing — weights in `EVIDENCE_QUALITY_WEIGHTS`), each scored by how well
that category is documented (verified/documented/self-reported/missing). Always labeled **"Illustrative
evidence score"** — never presented as statistically calibrated confidence.

## What this model is not

It is not a causally validated estimate of adaptation's effect. It is not a trained ML model — no
real-world labeled outcome dataset exists yet to train one on (see
[`docs/adr/0003-deterministic-not-ml.md`](adr/0003-deterministic-not-ml.md)). It does not measure the
synthetic seed borrower's actual, observed losses — those are illustrative model output. Real external
facts (RBI, WRI India, World Bank, IFC, Indian Express) are clearly separated from synthetic/modelled values
throughout the UI via the `ProvenanceBadge` component — see [`docs/sources.md`](sources.md).
