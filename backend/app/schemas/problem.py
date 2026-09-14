from __future__ import annotations

from pydantic import BaseModel


class ProblemDetail(BaseModel):
    """RFC 7807 application/problem+json body."""

    type: str = "about:blank"
    title: str
    status: int
    detail: str | None = None
    instance: str | None = None
