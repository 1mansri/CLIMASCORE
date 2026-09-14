"""Resets the database to the deterministic Surat demo scenario.

Deletes derived run/assessment history (counterfactual runs, risk
assessments) and re-applies the idempotent seed. Called both from the CLI
(`python -m scripts.demo_reset`) and from POST /api/v1/demo/reset.
"""

from __future__ import annotations

import asyncio

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.counterfactual_run import CounterfactualRun
from app.models.risk_assessment import RiskAssessment
from scripts.seed import seed_all


async def reset_demo(session: AsyncSession) -> None:
    await session.execute(delete(CounterfactualRun))
    await session.execute(delete(RiskAssessment))
    await session.commit()
    await seed_all(session)


async def main() -> None:
    from app.db.session import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        await reset_demo(session)


if __name__ == "__main__":
    asyncio.run(main())
