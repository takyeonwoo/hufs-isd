"""Products & 재고 — API_SPEC §6

재고 상태 규칙: 0 → SOLD_OUT, 1~5 → LOW, 그 외 → AVAILABLE.
수량 변경 시 inventory_logs 자동 기록 + stock_status/stock_updated_at 갱신.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, status

from app.core.config import settings
from app.core.deps import CurrentUser, require_owner
from app.core.responses import forbidden, not_found, ok
from app.core.supabase import require_service_client
from app.schemas.common import StockStatus
from app.schemas.products import ProductCreateIn, ProductUpdateIn, QuantityUpdateIn

router = APIRouter(tags=["products"])


def stock_status_for(quantity: int) -> StockStatus:
    if quantity <= 0:
        return StockStatus.SOLD_OUT
    if quantity <= 5:
        return StockStatus.LOW
    return StockStatus.AVAILABLE


def _get_owned_product(db, product_id: int, user: CurrentUser) -> dict:
    """상품 존재 + (store 경유) 소유권 확인. dev_fake_auth 면 소유권 생략."""
    rows = db.table("products").select("*, stores(owner_id)").eq("product_id", product_id).execute().data or []
    if not rows:
        raise not_found("PRODUCT_NOT_FOUND", "상품을 찾을 수 없습니다.")
    product = rows[0]
    owner_id = (product.get("stores") or {}).get("owner_id")
    if owner_id != user.id and not settings.dev_fake_auth:
        raise forbidden("본인 매장의 상품만 수정할 수 있습니다.")
    product.pop("stores", None)
    return product


@router.get("/stores/{store_id}/products")
async def list_products(store_id: int, q: str | None = None, stock_status: str | None = None):
    """매장 상품 목록. (11)"""
    db = require_service_client()
    query = db.table("products").select("*").eq("store_id", store_id).order("created_at", desc=True)
    if q:
        query = query.ilike("name", f"%{q}%")
    if stock_status:
        query = query.eq("stock_status", stock_status)
    res = query.execute()
    return ok(res.data or [])


@router.post("/stores/{store_id}/products", status_code=status.HTTP_201_CREATED)
async def create_product(store_id: int, body: ProductCreateIn, user: CurrentUser = Depends(require_owner)):
    """상품 등록. stock_status 는 quantity 기준 자동 계산. (12)"""
    db = require_service_client()
    payload = {
        "store_id": store_id,
        "trend_id": body.trend_id,
        "name": body.name,
        "price": body.price,
        "quantity": body.quantity,
        "stock_status": stock_status_for(body.quantity).value,
        "image_url": body.image_url,
        "stock_updated_at": datetime.now(timezone.utc).isoformat(),
    }
    res = db.table("products").insert(payload).execute()
    return ok(res.data[0])


@router.patch("/products/{product_id}")
async def update_product(product_id: int, body: ProductUpdateIn, user: CurrentUser = Depends(require_owner)):
    """상품 수정(이름/가격/트렌드/이미지). (13)"""
    db = require_service_client()
    _get_owned_product(db, product_id, user)
    patch = body.model_dump(exclude_none=True)
    if not patch:
        return ok(db.table("products").select("*").eq("product_id", product_id).execute().data[0])
    res = db.table("products").update(patch).eq("product_id", product_id).execute()
    return ok(res.data[0])


@router.patch("/products/{product_id}/quantity")
async def update_quantity(product_id: int, body: QuantityUpdateIn, user: CurrentUser = Depends(require_owner)):
    """재고 수량 변경(+/-). inventory_logs 자동 기록. (14)"""
    db = require_service_client()
    product = _get_owned_product(db, product_id, user)

    old_qty = product.get("quantity") or 0
    new_qty = body.quantity if body.quantity is not None else old_qty + body.delta
    new_qty = max(0, new_qty)
    now = datetime.now(timezone.utc).isoformat()

    db.table("products").update(
        {
            "quantity": new_qty,
            "stock_status": stock_status_for(new_qty).value,
            "stock_updated_at": now,
        }
    ).eq("product_id", product_id).execute()

    # 변경 이력 자동 기록
    db.table("inventory_logs").insert(
        {"product_id": product_id, "old_quantity": old_qty, "new_quantity": new_qty, "updated_at": now}
    ).execute()

    return ok(
        {
            "product_id": product_id,
            "quantity": new_qty,
            "stock_status": stock_status_for(new_qty).value,
            "stock_updated_at": now,
        }
    )


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, user: CurrentUser = Depends(require_owner)):
    """상품 삭제. (15)"""
    db = require_service_client()
    _get_owned_product(db, product_id, user)
    db.table("products").delete().eq("product_id", product_id).execute()
    return None


@router.get("/products/{product_id}/inventory-logs")
async def inventory_logs(product_id: int, limit: int = Query(50, ge=1, le=200)):
    """재고 변경 이력. (16)"""
    db = require_service_client()
    res = (
        db.table("inventory_logs")
        .select("*")
        .eq("product_id", product_id)
        .order("updated_at", desc=True)
        .limit(limit)
        .execute()
    )
    return ok(res.data or [])
