"""Trends — API_SPEC §4"""
from datetime import datetime, timezone

from fastapi import APIRouter, Query

from app.core.responses import not_found, ok
from app.core.supabase import get_service_client
from app.schemas.common import TrendStatus

router = APIRouter(prefix="/trends", tags=["trends"])


@router.get("")
async def list_trends(
    limit: int = Query(10, ge=1, le=100),
    status: TrendStatus | None = None,
):
    """트렌드 랭킹 TOP N. (4)"""
    now = datetime.now(timezone.utc).isoformat()
    db = get_service_client()
    if db is None:
        return ok([], meta={"updated_at": now})
    query = db.table("trends").select("*").order("rank").limit(limit)
    if status is not None:
        query = query.eq("status", status.value)
    res = query.execute()
    return ok(res.data or [], meta={"updated_at": now})


@router.get("/search-ranking")
async def search_ranking():
    """실시간 인기 검색어 (Redis 집계). (6)"""
    # TODO: Redis ZSET 에서 최근 윈도우 검색어 랭킹 조회
    now = datetime.now(timezone.utc).isoformat()
    return ok([], meta={"refreshed_at": now})


@router.get("/{trend_id}")
async def get_trend(trend_id: int):
    """트렌드 상세. (5)"""
    # TODO: trends 단건 조회
    raise not_found("TREND_NOT_FOUND", "트렌드를 찾을 수 없습니다.")
