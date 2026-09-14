"""FastAPI dependency wiring: Protocol repositories -> SQLAlchemy impls (DIP)."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.repositories.interfaces import (
    AdaptationRepository,
    CounterfactualRepository,
    EventRepository,
    EvidenceRepository,
    MSMERepository,
)
from app.repositories.postgres import (
    SqlAlchemyAdaptationRepository,
    SqlAlchemyCounterfactualRepository,
    SqlAlchemyEventRepository,
    SqlAlchemyEvidenceRepository,
    SqlAlchemyMSMERepository,
)
from app.services.counterfactual_engine import CounterfactualEngine
from app.services.event_engine import EventEngine
from app.services.evidence_engine import EvidenceEngine
from app.services.portfolio_engine import PortfolioEngine
from app.services.risk_engine import RiskEngine

SessionDep = Annotated[AsyncSession, Depends(get_session)]

# Return types are the repository Protocols, not the concrete SqlAlchemy*
# classes, so DIP is enforced by mypy at the wiring boundary itself: an
# engine/route requesting one of the *RepoDep aliases below only ever sees
# the Protocol's method surface, even though the concrete implementation
# constructed here has a wider one. This closes the gap where a method
# added to a concrete repository but missing from its Protocol could be
# called by a caller typed against the concrete class instead.


def get_msme_repository(session: SessionDep) -> MSMERepository:
    return SqlAlchemyMSMERepository(session)


def get_event_repository(session: SessionDep) -> EventRepository:
    return SqlAlchemyEventRepository(session)


def get_adaptation_repository(session: SessionDep) -> AdaptationRepository:
    return SqlAlchemyAdaptationRepository(session)


def get_counterfactual_repository(session: SessionDep) -> CounterfactualRepository:
    return SqlAlchemyCounterfactualRepository(session)


def get_evidence_repository(session: SessionDep) -> EvidenceRepository:
    return SqlAlchemyEvidenceRepository(session)


MSMERepoDep = Annotated[MSMERepository, Depends(get_msme_repository)]
EventRepoDep = Annotated[EventRepository, Depends(get_event_repository)]
AdaptationRepoDep = Annotated[AdaptationRepository, Depends(get_adaptation_repository)]
CounterfactualRepoDep = Annotated[CounterfactualRepository, Depends(get_counterfactual_repository)]
EvidenceRepoDep = Annotated[EvidenceRepository, Depends(get_evidence_repository)]


def get_risk_engine() -> RiskEngine:
    return RiskEngine()


def get_event_engine(msme_repo: MSMERepoDep, event_repo: EventRepoDep) -> EventEngine:
    return EventEngine(event_repository=event_repo, msme_repository=msme_repo)


def get_evidence_engine(evidence_repo: EvidenceRepoDep) -> EvidenceEngine:
    return EvidenceEngine(evidence_repository=evidence_repo)


def get_counterfactual_engine(
    msme_repo: MSMERepoDep,
    event_repo: EventRepoDep,
    counterfactual_repo: CounterfactualRepoDep,
    evidence_repo: EvidenceRepoDep,
) -> CounterfactualEngine:
    return CounterfactualEngine(
        msme_repository=msme_repo,
        event_repository=event_repo,
        counterfactual_repository=counterfactual_repo,
        evidence_engine=EvidenceEngine(evidence_repository=evidence_repo),
    )


def get_portfolio_engine(
    msme_repo: MSMERepoDep, event_repo: EventRepoDep, adaptation_repo: AdaptationRepoDep
) -> PortfolioEngine:
    return PortfolioEngine(
        msme_repository=msme_repo, event_repository=event_repo, adaptation_repository=adaptation_repo
    )


RiskEngineDep = Annotated[RiskEngine, Depends(get_risk_engine)]
EventEngineDep = Annotated[EventEngine, Depends(get_event_engine)]
EvidenceEngineDep = Annotated[EvidenceEngine, Depends(get_evidence_engine)]
CounterfactualEngineDep = Annotated[CounterfactualEngine, Depends(get_counterfactual_engine)]
PortfolioEngineDep = Annotated[PortfolioEngine, Depends(get_portfolio_engine)]
