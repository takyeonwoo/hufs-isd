"""Auth — API_SPEC §3"""
from fastapi import APIRouter, Depends, status

from app.core.deps import CurrentUser, get_current_user
from app.core.responses import ApiError, ok
from app.core.supabase import get_service_client
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


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def withdraw(user: CurrentUser = Depends(get_current_user)):
    """회원 탈퇴 — 본인 매장 + 계정 삭제. (신규, UI.pen "10 회원 탈퇴")

    1) 본인 stores 삭제 (FK cascade 로 products/notices/logs 동반 삭제)
    2) owners 행 삭제
    3) Supabase Auth 유저 삭제 (service-role admin)
    """
    db = get_service_client()
    if db is None:
        raise ApiError(
            "SUPABASE_NOT_CONFIGURED",
            "서버 Supabase service key 가 설정되지 않았습니다. (.env SUPABASE_SERVICE_KEY)",
            status_code=500,
        )

    db.table("stores").delete().eq("owner_id", user.id).execute()
    db.table("owners").delete().eq("owner_id", user.id).execute()
    try:
        db.auth.admin.delete_user(user.id)
    except Exception:  # noqa: BLE001 — dev 가짜 uuid 등 실제 auth 유저가 아니면 무시
        pass
    return None
