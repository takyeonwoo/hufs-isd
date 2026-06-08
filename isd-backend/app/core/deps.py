"""인증/인가 의존성.

Supabase Auth(JWT) Bearer 토큰을 검증해 현재 사용자를 추출한다.
- DEV_FAKE_AUTH=true 면 토큰 없이도 가짜 owner/admin 으로 통과 (로컬 개발용).
- 운영에서는 SUPABASE_JWT_SECRET 으로 HS256 서명을 검증한다.
"""
from dataclasses import dataclass
from typing import Literal

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.core.responses import forbidden, unauthorized

try:
    from jose import JWTError, jwt
except ImportError:
    jwt = None  # type: ignore
    JWTError = Exception  # type: ignore

Role = Literal["owner", "admin"]

# auto_error=False → 토큰 없을 때 직접 처리(DEV 우회 등)
_bearer = HTTPBearer(auto_error=False)


@dataclass
class CurrentUser:
    id: str
    email: str | None
    role: Role


# DEV_FAKE_AUTH 용 가짜 유저 id (UUID 형식이어야 stores.owner_id 등 UUID 컬럼 쿼리에서 안 깨짐)
DEV_OWNER_ID = "00000000-0000-0000-0000-0000000000a1"
DEV_ADMIN_ID = "00000000-0000-0000-0000-0000000000b2"


def _decode(token: str) -> dict:
    if not jwt or not settings.supabase_jwt_secret:
        raise unauthorized("JWT 검증 설정이 없습니다.")
    try:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError as e:  # noqa: BLE001
        raise unauthorized(f"유효하지 않은 토큰입니다: {e}") from e


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> CurrentUser:
    if creds is None:
        if settings.dev_fake_auth:
            # owner_id 컬럼이 UUID 타입이므로 유효한 UUID 형식이어야 한다.
            return CurrentUser(id=DEV_OWNER_ID, email="dev@foorendy.local", role="owner")
        raise unauthorized()

    claims = _decode(creds.credentials)
    # Supabase 는 role 을 app_metadata 등에 담을 수 있음. 프로젝트 규약에 맞게 조정.
    role = (claims.get("user_metadata", {}) or {}).get("role") or claims.get("role") or "owner"
    role = "admin" if role == "admin" else "owner"
    return CurrentUser(id=claims.get("sub", ""), email=claims.get("email"), role=role)


async def require_owner(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "owner":
        raise forbidden("사장님 권한이 필요합니다.")
    return user


async def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "admin":
        if settings.dev_fake_auth:
            return CurrentUser(id=DEV_ADMIN_ID, email="admin@foorendy.local", role="admin")
        raise forbidden("심사자 권한이 필요합니다.")
    return user
