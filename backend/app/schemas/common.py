from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


ILLUSTRATIVE_MODEL_DISCLAIMER = (
    "Illustrative model output - not observed borrower data. "
    "This is a transparent modelled estimate, not a causal or statistically "
    "calibrated prediction, and must not be treated as verified savings."
)

ILLUSTRATIVE_EVIDENCE_LABEL = "Illustrative evidence score - not statistically calibrated confidence."
