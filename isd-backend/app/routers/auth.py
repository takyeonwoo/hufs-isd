"""Auth — API_SPEC §3"""
from fastapi import APIRouter, Depends, status

from app.core.deps import CurrentUser, get_current_user
from app.core.responses import ok
from app.schemas.auth import AuthCallbackIn

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/callback")
async def auth_callback(body: AuthCallbackIn):
    """소셜 로그인 콜백 → 세션 교환. (1)"""
    # TODO: Supabase Auth 로 code 교환 후 토큰 발급
    return ok(
        {
            "access_token": "<jwt>",
            "refresh_token": "<refresh>",
            "expires_in": 3600,
            "user": {"id": "uuid", "email": None, "role": body.role},
        }
    )


@router.get("/me")
async def me(user: CurrentUser = Depends(get_current_user)):
    """내 프로필 조회. (2)"""
    return ok({"id": user.id, "email": user.email, "role": user.role, "created_at": None})


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(_: CurrentUser = Depends(get_current_user)):
    """로그아웃. (3)"""
    # TODO: refresh token 무효화
    return None
