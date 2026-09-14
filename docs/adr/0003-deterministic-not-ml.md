# ADR 0003: Deterministic transparent formulas, not a trained ML model

## Status
Accepted

## Context
Spec §19 explicitly instructs: "Use deterministic transparent functions. Do not train a fake ML model on
invented data." No real, labeled dataset linking climate events, borrower exposure, adaptation, and
observed financial outcomes exists yet — training or presenting an ML model here would mean fabricating
either the training data or the model's apparent rigor. Spec rule #12 forbids claiming causal proof from
the prototype.

## Decision
The risk score, loss model, and counterfactual engine are transparent, coefficient-driven functions
(`backend/app/config/model_config.py`, `docs/methodology.md`), not a trained model. Every score links to
its exact formula via the in-app Methodology page. A deterministic sensitivity sweep produces an
uncertainty band (±15% on damage-rate coefficients) instead of a falsely precise point estimate.

## Consequences
The product's honesty about what it is (a modelled framework, not a proven causal system) is a
differentiator, not a limitation — it directly supports the RBI/RB-CRIS positioning (spec §4.5): CLIMASCORE
is a transparent layer that could consume standardized climate-risk data, not a black box. Future
production versions may use XGBoost/LightGBM or calibrated causal models once real training data exists
(spec §19) — the current `EventSource`/`EvidenceSource` Protocol boundaries (ADR-equivalent in
`docs/architecture.md`, LSP section) are designed so that transition doesn't require rewriting the engines.
