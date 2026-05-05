"""
JWT authentication dependencies for FastAPI routes.

Supabase issues HS256 JWTs signed with the project JWT secret.
Set SUPABASE_JWT_SECRET in .env; leave SKIP_AUTH=true for local dev.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import httpx
from app.core.config import settings

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict:
    """Verify Supabase JWT and return the decoded payload."""
    if settings.SKIP_AUTH:
        return {"sub": "dev-user", "email": "dev@localhost"}

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not settings.SUPABASE_JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT secret not configured on server",
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


async def _fetch_user_role(user_id: str) -> str:
    """Query Supabase profiles table for the user's role."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return "user"  # permissive fallback when not configured

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{settings.SUPABASE_URL}/rest/v1/profiles",
                params={"id": f"eq.{user_id}", "select": "role"},
                headers={
                    "apikey": settings.SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                },
            )
        if resp.status_code == 200:
            data = resp.json()
            if data:
                return data[0].get("role", "user")
    except Exception:
        pass  # network issue — fail open to avoid blocking legitimate requests

    return "user"


async def require_manager(user: dict = Depends(get_current_user)) -> dict:
    """Allow only users with role 'manager' or 'admin' to proceed."""
    if settings.SKIP_AUTH:
        return user

    user_id = user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    role = await _fetch_user_role(user_id)
    if role not in ("admin", "manager"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager or Admin role required for this action",
        )
    return {**user, "profile_role": role}
