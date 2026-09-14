"""RFC 7807 application/problem+json error handling for every 4xx/5xx."""

from __future__ import annotations

import structlog
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.schemas.problem import ProblemDetail

logger = structlog.get_logger(__name__)

PROBLEM_JSON = "application/problem+json"


def _problem_response(status_code: int, title: str, detail: str | None, instance: str) -> JSONResponse:
    body = ProblemDetail(title=title, status=status_code, detail=detail, instance=instance)
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(exclude_none=True),
        media_type=PROBLEM_JSON,
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return _problem_response(exc.status_code, exc.detail or "HTTP Error", None, str(request.url.path))

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return _problem_response(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Validation Error",
            str(exc.errors()),
            str(request.url.path),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("unhandled_exception", error=str(exc), path=str(request.url.path))
        return _problem_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Internal Server Error",
            "An unexpected error occurred.",
            str(request.url.path),
        )
