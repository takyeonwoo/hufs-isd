"""인증/인가 의존성.

Bearer 토큰을 검증해 현재 사용자를 추출한다. 두 종류 토큰을 모두 처리:
- 관리자 토큰: 우리가 HS256(SUPABASE_JWT_SECRET)으로 직접 발급 → 로컬 검증.
- 사장님 토큰: Supabase Auth 발급. 프로젝트가 비대칭 키(ES256 등)를 쓰면 HS256 로컬
  검증이 안 되므로, Supabase 에 검증을 위임(auth.get_user)한다.
- DEV_FAKE_AUTH=true 면 토큰 없이도 가짜 owner/admin 으로 통과 (로컬 개발용).
"""
from dataclasses import dataclass
from typing import Literal

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.core.responses import forbidden, unauthorized
from app.core.supabase import get_service_client

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


def _decode_hs256(token: str) -> dict:
    """HS256 로컬 검증 (관리자 토큰 / 레거시 Supabase HS256)."""
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


def _role_of(meta: dict, fallback_role: str | None) -> Role:
    role = (meta or {}).get("role") or fallback_role or "owner"
    return "admin" if role == "admin" else "owner"


def _verify_via_supabase(token: str) -> CurrentUser:
    """비대칭 서명(ES256 등) Supabase 토큰은 Supabase API 에 검증을 위임한다."""
    client = get_service_client()
    if client is None:
        raise unauthorized("서버 Supabase 설정이 없어 토큰을 검증할 수 없습니다.")
    try:
        res = client.auth.get_user(token)
    except Exception as e:  # noqa: BLE001
        raise unauthorized(f"유효하지 않은 토큰입니다: {e}") from e
    user = getattr(res, "user", None)
    if user is None:
        raise unauthorized()
    return CurrentUser(id=user.id, email=user.email, role=_role_of(user.user_metadata or {}, None))


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> CurrentUser:
    if creds is None:
        if settings.dev_fake_auth:
            # owner_id 컬럼이 UUID 타입이므로 유효한 UUID 형식이어야 한다.
            return CurrentUser(id=DEV_OWNER_ID, email="dev@foorendy.local", role="owner")
        raise unauthorized()

    token = creds.credentials
    try:
        alg = jwt.get_unverified_header(token).get("alg") if jwt else "HS256"
    except Exception:  # noqa: BLE001
        raise unauthorized("토큰 형식이 올바르지 않습니다.")

    if alg == "HS256":
        claims = _decode_hs256(token)
        return CurrentUser(
            id=claims.get("sub", ""),
            email=claims.get("email"),
            role=_role_of(claims.get("user_metadata", {}) or {}, claims.get("role")),
        )
    # 비대칭(ES256/RS256) → Supabase 위임 검증
    return _verify_via_supabase(token)


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
