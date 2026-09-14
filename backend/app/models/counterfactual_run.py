from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, new_uuid


class CounterfactualRun(Base):
    __tablename__ = "counterfactual_runs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_uuid)
    msme_id: Mapped[str] = mapped_column(ForeignKey("msmes.id", ondelete="CASCADE"), nullable=False)
    event_id: Mapped[str] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    adaptation_measure_ids: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    baseline_risk: Mapped[float] = mapped_column(Float, nullable=False)
    adapted_risk: Mapped[float] = mapped_column(Float, nullable=False)
    baseline_loss_inr: Mapped[float] = mapped_column(Float, nullable=False)
    adapted_loss_inr: Mapped[float] = mapped_column(Float, nullable=False)
    baseline_downtime_hours: Mapped[float] = mapped_column(Float, nullable=False)
    adapted_downtime_hours: Mapped[float] = mapped_column(Float, nullable=False)

    avoided_loss_inr: Mapped[float] = mapped_column(Float, nullable=False)
    loss_reduction_pct: Mapped[float] = mapped_column(Float, nullable=False)
    downtime_avoided_hours: Mapped[float] = mapped_column(Float, nullable=False)

    loss_low_inr: Mapped[float] = mapped_column(Float, nullable=False)
    loss_high_inr: Mapped[float] = mapped_column(Float, nullable=False)

    evidence_confidence: Mapped[float] = mapped_column(Float, nullable=False)

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
