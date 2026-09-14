"""Initial schema: msmes, hazards, adaptations, events, risk_assessments,
counterfactual_runs, evidence + PostGIS.

Revision ID: 0001_initial
Revises:
Create Date: 2026-09-15
"""

from __future__ import annotations

from collections.abc import Sequence

import geoalchemy2
import sqlalchemy as sa

from alembic import op

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.create_table(
        "msmes",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("entity_type", sa.String(64), nullable=False),
        sa.Column("sector", sa.String(128), nullable=False),
        sa.Column("city", sa.String(128), nullable=False),
        sa.Column("state", sa.String(128), nullable=False),
        sa.Column("country", sa.String(128), nullable=False),
        sa.Column("latitude", sa.Float, nullable=False),
        sa.Column("longitude", sa.Float, nullable=False),
        sa.Column("location", geoalchemy2.Geography(geometry_type="POINT", srid=4326), nullable=True),
        sa.Column("annual_revenue_inr", sa.Float, nullable=False),
        sa.Column("inventory_value_inr", sa.Float, nullable=False),
        sa.Column("equipment_value_inr", sa.Float, nullable=False),
        sa.Column("facility_area_sqft", sa.Float, nullable=False),
        sa.Column("employees", sa.Integer, nullable=False),
        sa.Column("hazard_score", sa.Float, nullable=False),
        sa.Column("exposure_score", sa.Float, nullable=False),
        sa.Column("vulnerability_score", sa.Float, nullable=False),
        sa.Column("business_criticality_score", sa.Float, nullable=False),
        sa.Column("risk_score", sa.Float, nullable=False),
        sa.Column("risk_band", sa.String(32), nullable=False),
        sa.Column("is_synthetic", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "hazards",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("type", sa.String(64), nullable=False),
        sa.Column("location_name", sa.String(255), nullable=False),
        sa.Column("severity", sa.String(32), nullable=False),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("source", sa.String(255), nullable=False),
        sa.Column("source_url", sa.String(512), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "events",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("type", sa.String(64), nullable=False),
        sa.Column("location_name", sa.String(255), nullable=False),
        sa.Column("latitude", sa.Float, nullable=False),
        sa.Column("longitude", sa.Float, nullable=False),
        sa.Column("location", geoalchemy2.Geography(geometry_type="POINT", srid=4326), nullable=True),
        sa.Column("radius_km", sa.Float, nullable=False),
        sa.Column("start_date", sa.Date, nullable=False),
        sa.Column("end_date", sa.Date, nullable=True),
        sa.Column("severity", sa.String(32), nullable=False),
        sa.Column("source", sa.String(255), nullable=False),
        sa.Column("source_url", sa.String(512), nullable=False),
        sa.Column("source_type", sa.String(128), nullable=False),
        sa.Column("description", sa.String(1024), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "adaptations",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("msme_id", sa.String(64), sa.ForeignKey("msmes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("measure_id", sa.String(64), nullable=False),
        sa.Column("hazard", sa.String(64), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("cost_inr", sa.Float, nullable=True),
        sa.Column("date_implemented", sa.Date, nullable=False),
        sa.Column("evidence", sa.String(1024), nullable=False),
        sa.Column("estimated_effect", sa.String(512), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "risk_assessments",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("msme_id", sa.String(64), sa.ForeignKey("msmes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_id", sa.String(64), sa.ForeignKey("events.id", ondelete="SET NULL"), nullable=True),
        sa.Column("hazard_score", sa.Float, nullable=False),
        sa.Column("exposure_score", sa.Float, nullable=False),
        sa.Column("vulnerability_score", sa.Float, nullable=False),
        sa.Column("criticality_score", sa.Float, nullable=False),
        sa.Column("risk_score", sa.Float, nullable=False),
        sa.Column("risk_band", sa.String(32), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "counterfactual_runs",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("msme_id", sa.String(64), sa.ForeignKey("msmes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_id", sa.String(64), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("adaptation_measure_ids", sa.JSON, nullable=False),
        sa.Column("baseline_risk", sa.Float, nullable=False),
        sa.Column("adapted_risk", sa.Float, nullable=False),
        sa.Column("baseline_loss_inr", sa.Float, nullable=False),
        sa.Column("adapted_loss_inr", sa.Float, nullable=False),
        sa.Column("baseline_downtime_hours", sa.Float, nullable=False),
        sa.Column("adapted_downtime_hours", sa.Float, nullable=False),
        sa.Column("avoided_loss_inr", sa.Float, nullable=False),
        sa.Column("loss_reduction_pct", sa.Float, nullable=False),
        sa.Column("downtime_avoided_hours", sa.Float, nullable=False),
        sa.Column("loss_low_inr", sa.Float, nullable=False),
        sa.Column("loss_high_inr", sa.Float, nullable=False),
        sa.Column("evidence_confidence", sa.Float, nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "evidence",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("msme_id", sa.String(64), sa.ForeignKey("msmes.id", ondelete="CASCADE"), nullable=True),
        sa.Column("type", sa.String(64), nullable=False),
        sa.Column("source", sa.String(255), nullable=False),
        sa.Column("source_url", sa.String(512), nullable=False),
        sa.Column("quality", sa.String(32), nullable=False),
        sa.Column("description", sa.String(1024), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("evidence")
    op.drop_table("counterfactual_runs")
    op.drop_table("risk_assessments")
    op.drop_table("adaptations")
    op.drop_table("events")
    op.drop_table("hazards")
    op.drop_table("msmes")
