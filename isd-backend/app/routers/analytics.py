"""Analytics — API_SPEC §9"""
from datetime import date

from fastapi import APIRouter, Depends, Query, status

from app.core.deps import CurrentUser, require_owner
from app.core.responses import ok
from app.schemas.analytics import AnalyticsEventIn

router = APIRouter(tags=["analytics"])


@router.post("/analytics/events", status_code=status.HTTP_202_ACCEPTED)
async def log_event(body: AnalyticsEventIn):
    """손님 익명 이벤트 로그 수집. (28)"""
    # TODO: analytics_logs insert (+ SEARCH_TREND 는 Redis 인기검색어 카운트 증가)
    return ok({"logged": True})


@router.get("/stores/{store_id}/analytics/summary")
async def summary(
    store_id: int,
    date: date | None = Query(None),
    user: CurrentUser = Depends(require_owner),
):
    """대시보드 KPI 카드. (29)"""
    # TODO: 당일 조회수/재고변경/트렌드 점수 등 집계
    return ok(
        {
            "store_views_today": 0,
            "store_views_delta": 0,
            "store_views_change_pct": 0,
            "search_entry_trend": None,
            "stock_changes_today": 0,
            "last_stock_update": None,
            "trend_score": None,
            "trend_score_change_pct": 0,
            "trend_percentile": None,
        }
    )


@router.get("/stores/{store_id}/analytics/timeseries")
async def timeseries(
    store_id: int,
    range: str = Query("7d"),
    metric: str = Query("views", pattern="^(views|by_trend)$"),
    user: CurrentUser = Depends(require_owner),
):
    """시간대별 조회 / 트렌드별 조회수. (30)"""
    # TODO: analytics_logs 시간 버킷 집계
    if metric == "by_trend":
        return ok([])
    return ok({"range": range, "buckets": [], "total": 0, "peak": None})


@router.get("/stores/{store_id}/analytics/events")
async def recent_events(store_id: int, user: CurrentUser = Depends(require_owner)):
    """최근 이벤트 로그. (31)"""
    # TODO: 최근 이벤트 집계/그룹핑
    return ok([])
