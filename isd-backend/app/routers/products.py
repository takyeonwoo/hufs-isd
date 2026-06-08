"""Products & 재고 — API_SPEC §6

재고 상태 규칙: 0 → SOLD_OUT, 1~5 → LOW, 그 외 → AVAILABLE.
수량 변경 시 inventory_logs 자동 기록 + stock_status/stock_updated_at 갱신.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, status

from app.core.deps import CurrentUser, require_owner
from app.core.responses import not_found, ok
from app.schemas.common import StockStatus
from app.schemas.products import ProductCreateIn, ProductUpdateIn, QuantityUpdateIn

router = APIRouter(tags=["products"])


def stock_status_for(quantity: int) -> StockStatus:
    if quantity <= 0:
        return StockStatus.SOLD_OUT
    if quantity <= 5:
        return StockStatus.LOW
    return StockStatus.AVAILABLE


@router.get("/stores/{store_id}/products")
async def list_products(store_id: int, q: str | None = None, stock_status: str | None = None):
    """매장 상품 목록. (11)"""
    # TODO: products + trend 조인, q/stock_status 필터
    return ok([])


@router.post("/stores/{store_id}/products", status_code=status.HTTP_201_CREATED)
async def create_product(store_id: int, body: ProductCreateIn, user: CurrentUser = Depends(require_owner)):
    """상품 등록. (12)"""
    # TODO: 소유권 확인 후 insert. stock_status 는 quantity 기준 자동 계산
    return ok(
        {
            "store_id": store_id,
            "stock_status": stock_status_for(body.quantity).value,
            **body.model_dump(),
        }
    )


@router.patch("/products/{product_id}")
async def update_product(product_id: int, body: ProductUpdateIn, user: CurrentUser = Depends(require_owner)):
    """상품 수정(이름/가격/트렌드/이미지). (13)"""
    # TODO: 소유권 확인 후 부분 수정
    return ok({"product_id": product_id, **body.model_dump(exclude_none=True)})


@router.patch("/products/{product_id}/quantity")
async def update_quantity(product_id: int, body: QuantityUpdateIn, user: CurrentUser = Depends(require_owner)):
    """재고 수량 변경(+/-). inventory_logs 자동 기록. (14)"""
    # TODO: 현재 수량 조회 → 신규 수량 계산(delta or 절대값) → update + inventory_logs insert
    new_qty = body.quantity if body.quantity is not None else 0  # placeholder
    now = datetime.now(timezone.utc).isoformat()
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
    # TODO: 소유권 확인 후 delete
    return None


@router.get("/products/{product_id}/inventory-logs")
async def inventory_logs(product_id: int, limit: int = Query(50, ge=1, le=200)):
    """재고 변경 이력. (16)"""
    # TODO: inventory_logs 최신순 조회
    return ok([])
