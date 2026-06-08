"""Trends — API_SPEC §4"""
from datetime import datetime, timezone

from fastapi import APIRouter, Query

from app.core.responses import not_found, ok
from app.schemas.common import TrendStatus

router = APIRouter(prefix="/trends", tags=["trends"])


@router.get("")
async def list_trends(
    limit: int = Query(10, ge=1, le=100),
    status: TrendStatus | None = None,
):
    """트렌드 랭킹 TOP N. (4)"""
    # TODO: trends 테이블에서 rank 순 조회, store_count 파생 계산
    now = datetime.now(timezone.utc).isoformat()
    return ok([], meta={"updated_at": now})


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
