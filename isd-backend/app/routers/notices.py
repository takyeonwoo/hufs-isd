"""Notices(공지) — API_SPEC §7"""
from fastapi import APIRouter, Depends, status

from app.core.deps import CurrentUser, require_owner
from app.core.responses import ok
from app.schemas.common import NoticeStatus
from app.schemas.notices import NoticeCreateIn, NoticeUpdateIn

router = APIRouter(tags=["notices"])


@router.get("/stores/{store_id}/notices")
async def list_notices(store_id: int, status: NoticeStatus | None = None):
    """공지 목록. 손님에게는 PUBLISHED + 미만료만. (17)"""
    # TODO: status 필터 + 만료 필터
    return ok([])


@router.post("/stores/{store_id}/notices", status_code=status.HTTP_201_CREATED)
async def create_notice(store_id: int, body: NoticeCreateIn, user: CurrentUser = Depends(require_owner)):
    """공지 등록. (18)"""
    # TODO: 소유권 확인 후 insert
    return ok({"store_id": store_id, **body.model_dump(mode="json")})


@router.patch("/notices/{notice_id}")
async def update_notice(notice_id: int, body: NoticeUpdateIn, user: CurrentUser = Depends(require_owner)):
    """공지 수정. (19)"""
    return ok({"notice_id": notice_id, **body.model_dump(mode="json", exclude_none=True)})


@router.delete("/notices/{notice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notice(notice_id: int, user: CurrentUser = Depends(require_owner)):
    """공지 삭제. (20)"""
    return None
