from __future__ import annotations

from typing import TYPE_CHECKING

from geoalchemy2 import Geography
from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.adaptation import Adaptation


class MSME(Base, TimestampMixin):
    __tablename__ = "msmes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(64), nullable=False, default="Illustrative MSME")
    sector: Mapped[str] = mapped_column(String(128), nullable=False)
    city: Mapped[str] = mapped_column(String(128), nullable=False)
    state: Mapped[str] = mapped_column(String(128), nullable=False)
    country: Mapped[str] = mapped_column(String(128), nullable=False, default="India")
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    location = mapped_column(Geography(geometry_type="POINT", srid=4326), nullable=True)

    annual_revenue_inr: Mapped[float] = mapped_column(Float, nullable=False)
    inventory_value_inr: Mapped[float] = mapped_column(Float, nullable=False)
    equipment_value_inr: Mapped[float] = mapped_column(Float, nullable=False)
    facility_area_sqft: Mapped[float] = mapped_column(Float, nullable=False)
    employees: Mapped[int] = mapped_column(Integer, nullable=False)

    hazard_score: Mapped[float] = mapped_column(Float, nullable=False)
    exposure_score: Mapped[float] = mapped_column(Float, nullable=False)
    vulnerability_score: Mapped[float] = mapped_column(Float, nullable=False)
    business_criticality_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_band: Mapped[str] = mapped_column(String(32), nullable=False)

    is_synthetic: Mapped[bool] = mapped_column(default=True, nullable=False)

    adaptations: Mapped[list[Adaptation]] = relationship(back_populates="msme")
