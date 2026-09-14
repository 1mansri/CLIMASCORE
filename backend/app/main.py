from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api import api_router
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging
from app.core.middleware import request_id_middleware
from app.core.rate_limit import limiter, rate_limit_exceeded_handler

settings = get_settings()
configure_logging(settings.log_level)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield


app = FastAPI(
    title="CLIMASCORE API",
    description=(
        "Borrower-level climate-risk intelligence and counterfactual "
        "resilience engine. All borrower data in demo mode is synthetic; "
        "all counterfactual outputs are illustrative model estimates, not "
        "verified savings or causal proof."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
# slowapi's handler signature (Request, RateLimitExceeded) is narrower than
# Starlette's declared (Request, Exception) handler type; this is a known
# stub mismatch between the two libraries, not a real type error.
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)  # type: ignore[arg-type]
app.add_middleware(SlowAPIMiddleware)
app.middleware("http")(request_id_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(api_router)
