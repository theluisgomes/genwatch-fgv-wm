from __future__ import annotations

import os

from fastapi import Header, HTTPException, status

ADMIN_API_KEY = os.getenv("GENWATCH_ADMIN_KEY", "genwatch-dev-admin")
PUBLIC_READ = os.getenv("GENWATCH_PUBLIC_READ", "true").lower() == "true"


def require_admin(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> None:
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin API key required",
        )


def optional_auth(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> str:
    if x_api_key == ADMIN_API_KEY:
        return "admin"
    if PUBLIC_READ:
        return "public"
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
    )
