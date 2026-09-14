from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid

if TYPE_CHECKING:
    from app.models.msme import MSME


class Adaptation(Base, TimestampMixin):
    __tablename__ = "adaptations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_uuid)
    msme_id: Mapped[str] = mapped_column(ForeignKey("msmes.id", ondelete="CASCADE"), nullable=False)
    measure_id: Mapped[str] = mapped_column(String(64), nullable=False)
    hazard: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active")
    cost_inr: Mapped[float | None] = mapped_column(Float, nullable=True)
    date_implemented: Mapped[date] = mapped_column(Date, nullable=False)
    evidence: Mapped[str] = mapped_column(String(1024), nullable=False, default="")
    estimated_effect: Mapped[str] = mapped_column(String(512), nullable=False, default="")

    msme: Mapped[MSME] = relationship(back_populates="adaptations")
