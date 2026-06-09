"""Stores — API_SPEC §5"""
import random
from datetime import datetime, timezone
from math import asin, cos, radians, sin, sqrt

from fastapi import APIRouter, Depends, Query, status

from app.core.config import settings
from app.core.deps import CurrentUser, require_owner
from app.core.geocode import geocode
from app.core.responses import forbidden, not_found, ok
from app.core.supabase import require_service_client
from app.schemas.stores import StoreUpdateIn

router = APIRouter(prefix="/stores", tags=["stores"])


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """두 좌표 간 거리(km)."""
    r = 6371.0
    dlat, dlng = radians(lat2 - lat1), radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return round(2 * r * asin(sqrt(a)), 2)


def _assert_owner(db, store_id: int, user: CurrentUser) -> dict:
    """매장 존재 + 소유권 확인. dev_fake_auth 면 소유권 검사 생략."""
    rows = db.table("stores").select("*").eq("store_id", store_id).execute().data or []
    if not rows:
        raise not_found("STORE_NOT_FOUND", "매장을 찾을 수 없습니다.")
    if rows[0]["owner_id"] != user.id and not settings.dev_fake_auth:
        raise forbidden("본인 매장만 접근할 수 있습니다.")
    return rows[0]


@router.get("")
async def list_stores(
    lat: float | None = None,
    lng: float | None = None,
    radius: float = Query(1.5, gt=0),
    trend_id: int | None = None,
    stock_status: str | None = Query(None, description="AVAILABLE,LOW (CSV)"),
    sort: str = "distance",
):
    """지도/주변 매장 목록. (7)

    stores + 각 매장의 대표 상품(featured_product) + 트렌드를 묶어 반환.
    lat/lng 가 오면 거리(km) 계산 후 radius 필터 + 거리순 정렬.
    """
    db = require_service_client()
    stores = db.table("stores").select("*").execute().data or []
    if not stores:
        return ok([], meta={"total": 0, "center": {"lat": lat, "lng": lng}})

    store_ids = [s["store_id"] for s in stores]
    products = (
        db.table("products").select("*").in_("store_id", store_ids).order("created_at").execute().data or []
    )
    trends = {t["trend_id"]: t for t in (db.table("trends").select("trend_id, name").execute().data or [])}

    # 매장별 상품 목록(생성순). 대표 상품 = 가장 오래된 시그니처.
    by_store: dict[int, list[dict]] = {}
    for p in products:
        by_store.setdefault(p["store_id"], []).append(p)

    status_filter = {s.strip() for s in stock_status.split(",")} if stock_status else None

    items = []
    for s in stores:
        store_products = by_store.get(s["store_id"], [])
        # trend_id 필터: 대표상품만이 아니라 "이 매장의 어느 상품이든" 해당 트렌드를 팔면 포함.
        # featured_product 는 매칭되는 상품(가장 오래된)으로 바꿔 그 트렌드의 재고/가격이 보이게 한다.
        if trend_id is not None:
            pool = [p for p in store_products if p.get("trend_id") == trend_id]
            if not pool:
                continue
            fp = pool[0]
        else:
            pool = store_products
            fp = store_products[0] if store_products else None
        if status_filter and not (fp and fp.get("stock_status") in status_filter):
            continue

        # 카드 썸네일용: 해당(트렌드) 메뉴 중 사진 있는 것을 랜덤으로 하나.
        with_image = [p["image_url"] for p in pool if p.get("image_url")]
        sample_image_url = random.choice(with_image) if with_image else None

        item = {
            "store_id": s["store_id"],
            "name": s["name"],
            "latitude": s.get("latitude"),
            "longitude": s.get("longitude"),
            "naver_place_url": s.get("naver_place_url"),
            "sample_image_url": sample_image_url,
            "featured_product": None,
            "trend": None,
        }
        if fp:
            item["featured_product"] = {
                "product_id": fp["product_id"],
                "name": fp["name"],
                "price": fp.get("price"),
                "quantity": fp.get("quantity"),
                "stock_status": fp.get("stock_status"),
                "stock_updated_at": fp.get("stock_updated_at"),
            }
            t = trends.get(fp.get("trend_id"))
            if t:
                item["trend"] = {"trend_id": t["trend_id"], "name": t["name"]}

        if lat is not None and lng is not None and s.get("latitude") is not None and s.get("longitude") is not None:
            d = _haversine_km(lat, lng, s["latitude"], s["longitude"])
            item["distance_km"] = d
            if d > radius:
                continue
        items.append(item)

    if lat is not None and lng is not None:
        items.sort(key=lambda x: x.get("distance_km", float("inf")))

    meta = {"total": len(items)}
    if lat is not None and lng is not None:
        meta["center"] = {"lat": lat, "lng": lng}
    return ok(items, meta=meta)


@router.get("/me")
async def my_stores(user: CurrentUser = Depends(require_owner)):
    """내 매장 목록(대시보드 드롭다운). (9)"""
    db = require_service_client()
    res = db.table("stores").select("*").eq("owner_id", user.id).order("created_at").execute()
    return ok(res.data or [])


@router.get("/{store_id}")
async def get_store(store_id: int):
    """매장 상세(팝오버). stores + products + active_notice. (8)"""
    db = require_service_client()
    rows = db.table("stores").select("*").eq("store_id", store_id).execute().data or []
    if not rows:
        raise not_found("STORE_NOT_FOUND", "매장을 찾을 수 없습니다.")
    store = rows[0]

    products = (
        db.table("products").select("*").eq("store_id", store_id).order("created_at").execute().data or []
    )

    # 활성 공지: PUBLISHED + (만료 없음 또는 미래) 중 최신 1건
    now = datetime.now(timezone.utc).isoformat()
    notices = (
        db.table("store_notices")
        .select("notice_id, content, expires_at")
        .eq("store_id", store_id)
        .eq("status", "PUBLISHED")
        .order("created_at", desc=True)
        .execute()
        .data
        or []
    )
    active_notice = next((n for n in notices if not n.get("expires_at") or n["expires_at"] > now), None)

    return ok({**store, "products": products, "active_notice": active_notice})


@router.patch("/{store_id}")
async def update_store(store_id: int, body: StoreUpdateIn, user: CurrentUser = Depends(require_owner)):
    """매장 정보 수정(본인 매장만). (10)"""
    db = require_service_client()
    _assert_owner(db, store_id, user)
    patch = body.model_dump(exclude_none=True)
    if not patch:
        return ok(db.table("stores").select("*").eq("store_id", store_id).execute().data[0])
    # 주소가 바뀌면 좌표 재계산(직접 lat/lng 를 보낸 경우는 그 값 우선).
    if patch.get("address") and "latitude" not in patch:
        coords = geocode(patch["address"])
        if coords:
            patch["latitude"], patch["longitude"] = coords
    res = db.table("stores").update(patch).eq("store_id", store_id).execute()
    return ok(res.data[0])


@router.delete("/{store_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_store(store_id: int, user: CurrentUser = Depends(require_owner)):
    """매장 삭제(본인 매장만). FK cascade 로 메뉴/재고/공지도 함께 삭제. (신규)"""
    db = require_service_client()
    _assert_owner(db, store_id, user)
    db.table("stores").delete().eq("store_id", store_id).execute()
    return None
