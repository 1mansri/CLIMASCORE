"""slowapi rate limiting, RFC 7807 429 body, X-RateLimit-* headers."""

from __future__ import annotations

from fastapi import Request, status
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import get_settings
from app.schemas.problem import ProblemDetail

settings = get_settings()

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.redis_url or "memory://",
    headers_enabled=True,
)

CHEAP_READ_LIMIT = "60/minute"
EXPENSIVE_COMPUTE_LIMIT = "10/minute"


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    retry_after = str(getattr(exc, "retry_after", 60) or 60)
    body = ProblemDetail(
        title="Too Many Requests",
        status=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=f"Rate limit exceeded: {exc.detail}",
        instance=str(request.url.path),
    )
    response = JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content=body.model_dump(exclude_none=True),
        media_type="application/problem+json",
    )
    response.headers["Retry-After"] = retry_after
    return response
