"""Notices(공지) — API_SPEC §7"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status

from app.core.config import settings
from app.core.deps import CurrentUser, require_owner
from app.core.responses import forbidden, not_found, ok
from app.core.supabase import require_service_client
from app.schemas.common import NoticeStatus
from app.schemas.notices import NoticeCreateIn, NoticeUpdateIn

router = APIRouter(tags=["notices"])


def _assert_store_owner(db, store_id: int, user: CurrentUser) -> None:
    rows = db.table("stores").select("owner_id").eq("store_id", store_id).execute().data or []
    if not rows:
        raise not_found("STORE_NOT_FOUND", "매장을 찾을 수 없습니다.")
    if rows[0]["owner_id"] != user.id and not settings.dev_fake_auth:
        raise forbidden("본인 매장만 접근할 수 있습니다.")


def _get_owned_notice(db, notice_id: int, user: CurrentUser) -> dict:
    rows = db.table("store_notices").select("*, stores(owner_id)").eq("notice_id", notice_id).execute().data or []
    if not rows:
        raise not_found("NOTICE_NOT_FOUND", "공지를 찾을 수 없습니다.")
    notice = rows[0]
    owner_id = (notice.get("stores") or {}).get("owner_id")
    if owner_id != user.id and not settings.dev_fake_auth:
        raise forbidden("본인 매장의 공지만 수정할 수 있습니다.")
    notice.pop("stores", None)
    return notice


@router.get("/stores/{store_id}/notices")
async def list_notices(store_id: int, status: NoticeStatus | None = None):
    """공지 목록. 손님에게는 PUBLISHED + 미만료만. (17)"""
    db = require_service_client()
    query = db.table("store_notices").select("*").eq("store_id", store_id).order("created_at", desc=True)
    if status is not None:
        query = query.eq("status", status.value)
    rows = query.execute().data or []
    # status 미지정(손님 기본)일 때만 만료 공지 제외. status 명시 시(사장님 관리) 전체 노출.
    if status is None:
        now = datetime.now(timezone.utc).isoformat()
        rows = [n for n in rows if not n.get("expires_at") or n["expires_at"] > now]
    return ok(rows)


@router.post("/stores/{store_id}/notices", status_code=status.HTTP_201_CREATED)
async def create_notice(store_id: int, body: NoticeCreateIn, user: CurrentUser = Depends(require_owner)):
    """공지 등록. (18)"""
    db = require_service_client()
    _assert_store_owner(db, store_id, user)
    payload = {
        "store_id": store_id,
        "content": body.content,
        "status": body.status.value,
        "expires_at": body.expires_at.isoformat() if body.expires_at else None,
    }
    res = db.table("store_notices").insert(payload).execute()
    return ok(res.data[0])


@router.patch("/notices/{notice_id}")
async def update_notice(notice_id: int, body: NoticeUpdateIn, user: CurrentUser = Depends(require_owner)):
    """공지 수정. (19)"""
    db = require_service_client()
    _get_owned_notice(db, notice_id, user)
    patch = body.model_dump(exclude_none=True, mode="json")
    if not patch:
        return ok(db.table("store_notices").select("*").eq("notice_id", notice_id).execute().data[0])
    res = db.table("store_notices").update(patch).eq("notice_id", notice_id).execute()
    return ok(res.data[0])


@router.delete("/notices/{notice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notice(notice_id: int, user: CurrentUser = Depends(require_owner)):
    """공지 삭제. (20)"""
    db = require_service_client()
    _get_owned_notice(db, notice_id, user)
    db.table("store_notices").delete().eq("notice_id", notice_id).execute()
    return None
