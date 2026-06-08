"""Stores — API_SPEC §5"""
from fastapi import APIRouter, Depends, Query

from app.core.deps import CurrentUser, require_owner
from app.core.responses import not_found, ok
from app.schemas.stores import StoreUpdateIn

router = APIRouter(prefix="/stores", tags=["stores"])


@router.get("")
async def list_stores(
    lat: float | None = None,
    lng: float | None = None,
    radius: float = Query(1.5, gt=0),
    trend_id: int | None = None,
    stock_status: str | None = Query(None, description="AVAILABLE,LOW (CSV)"),
    sort: str = "distance",
):
    """지도/주변 매장 목록. (7)"""
    # TODO: 위치 반경 + 트렌드/재고 필터로 stores+products 조인 조회
    return ok([], meta={"total": 0, "center": {"lat": lat, "lng": lng}})


@router.get("/me")
async def my_stores(user: CurrentUser = Depends(require_owner)):
    """내 매장 목록(대시보드 드롭다운). (9)"""
    # TODO: owner_id = user.id 인 stores 조회
    return ok([])


@router.get("/{store_id}")
async def get_store(store_id: int):
    """매장 상세(팝오버). (8)"""
    # TODO: stores + products + active_notice 조회
    raise not_found("STORE_NOT_FOUND", "매장을 찾을 수 없습니다.")


@router.patch("/{store_id}")
async def update_store(store_id: int, body: StoreUpdateIn, user: CurrentUser = Depends(require_owner)):
    """매장 정보 수정(본인 매장만). (10)"""
    # TODO: 소유권 확인 후 부분 수정
    return ok({"store_id": store_id, **body.model_dump(exclude_none=True)})
