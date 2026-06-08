"""Analytics — API_SPEC §9"""
from collections import Counter
from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends, Query, status

from app.core.deps import CurrentUser, require_owner
from app.core.responses import ok
from app.core.supabase import require_service_client
from app.schemas.analytics import AnalyticsEventIn

router = APIRouter(tags=["analytics"])


def _day_bounds(d: date) -> tuple[str, str]:
    """해당 날짜의 [00:00, 다음날 00:00) UTC ISO 경계."""
    start = datetime.combine(d, time.min, tzinfo=timezone.utc)
    return start.isoformat(), (start + timedelta(days=1)).isoformat()


@router.post("/analytics/events", status_code=status.HTTP_202_ACCEPTED)
async def log_event(body: AnalyticsEventIn):
    """손님 익명 이벤트 로그 수집. (28)"""
    db = require_service_client()
    db.table("analytics_logs").insert(
        {
            "visitor_id": body.visitor_id,
            "event_type": body.event_type.value,
            "store_id": body.store_id,
            "product_id": body.product_id,
            "trend_id": body.trend_id,
        }
    ).execute()
    # TODO: SEARCH_TREND 는 Redis ZSET 인기검색어 카운트도 증가
    return ok({"logged": True})


@router.get("/stores/{store_id}/analytics/summary")
async def summary(
    store_id: int,
    date: date | None = Query(None),
    user: CurrentUser = Depends(require_owner),
):
    """대시보드 KPI 카드. (29)"""
    db = require_service_client()
    target = date or datetime.now(timezone.utc).date()
    today_s, today_e = _day_bounds(target)
    yday_s, yday_e = _day_bounds(target - timedelta(days=1))

    def view_count(start: str, end: str) -> int:
        res = (
            db.table("analytics_logs")
            .select("log_id", count="exact")
            .eq("store_id", store_id)
            .eq("event_type", "VIEW_STORE")
            .gte("created_at", start)
            .lt("created_at", end)
            .execute()
        )
        return res.count or 0

    views_today = view_count(today_s, today_e)
    views_yday = view_count(yday_s, yday_e)
    delta = views_today - views_yday
    change_pct = round(delta / views_yday * 100) if views_yday else 0

    # 대표 상품의 트렌드 정보
    products = db.table("products").select("trend_id, stock_updated_at").eq("store_id", store_id).order("created_at").execute().data or []
    featured_trend = None
    last_stock_update = max((p["stock_updated_at"] for p in products if p.get("stock_updated_at")), default=None)
    if products and products[0].get("trend_id"):
        t = db.table("trends").select("*").eq("trend_id", products[0]["trend_id"]).execute().data or []
        featured_trend = t[0] if t else None

    # 오늘 재고 변경 건수 (이 매장 상품들의 inventory_logs)
    product_ids = [p for p in (db.table("products").select("product_id").eq("store_id", store_id).execute().data or [])]
    pids = [p["product_id"] for p in product_ids]
    stock_changes_today = 0
    if pids:
        res = (
            db.table("inventory_logs")
            .select("log_id", count="exact")
            .in_("product_id", pids)
            .gte("updated_at", today_s)
            .lt("updated_at", today_e)
            .execute()
        )
        stock_changes_today = res.count or 0

    return ok(
        {
            "store_views_today": views_today,
            "store_views_delta": delta,
            "store_views_change_pct": change_pct,
            "search_entry_trend": (
                {"name": featured_trend["name"], "rank": featured_trend.get("rank")}
                if featured_trend
                else None
            ),
            "stock_changes_today": stock_changes_today,
            "last_stock_update": last_stock_update,
            "trend_score": featured_trend.get("trend_score") if featured_trend else None,
            "trend_score_change_pct": featured_trend.get("score_change_pct") if featured_trend else 0,
            "trend_percentile": featured_trend.get("rank") if featured_trend else None,
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
    db = require_service_client()
    days = int(range.rstrip("d")) if range.rstrip("d").isdigit() else 7
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    logs = (
        db.table("analytics_logs")
        .select("trend_id, created_at")
        .eq("store_id", store_id)
        .eq("event_type", "VIEW_STORE")
        .gte("created_at", since)
        .execute()
        .data
        or []
    )

    if metric == "by_trend":
        by_trend = Counter(l["trend_id"] for l in logs if l.get("trend_id"))
        if not by_trend:
            return ok([])
        names = {
            t["trend_id"]: t["name"]
            for t in (db.table("trends").select("trend_id, name").in_("trend_id", list(by_trend)).execute().data or [])
        }
        top = max(by_trend.values())
        data = [
            {"trend_id": tid, "name": names.get(tid, "?"), "views": cnt, "pct": round(cnt / top * 100)}
            for tid, cnt in by_trend.most_common()
        ]
        return ok(data)

    # metric=views: 시간(hour)대별 버킷
    buckets_map: Counter = Counter()
    for l in logs:
        hour = l["created_at"][11:13]  # ISO 'YYYY-MM-DDTHH:...'
        buckets_map[hour] += 1
    buckets = [{"hour": h, "views": buckets_map[h]} for h in sorted(buckets_map)]
    total = sum(buckets_map.values())
    peak_hour = max(buckets_map, key=buckets_map.get) if buckets_map else None
    peak = {"from": f"{peak_hour}:00", "to": f"{int(peak_hour) + 1:02d}:00"} if peak_hour else None
    return ok({"range": range, "buckets": buckets, "total": total, "peak": peak})


@router.get("/stores/{store_id}/analytics/events")
async def recent_events(store_id: int, user: CurrentUser = Depends(require_owner)):
    """최근 이벤트 로그(이벤트 타입별 집계). (31)"""
    db = require_service_client()
    rows = (
        db.table("analytics_logs")
        .select("event_type, created_at")
        .eq("store_id", store_id)
        .order("created_at", desc=True)
        .limit(100)
        .execute()
        .data
        or []
    )
    counts = Counter(r["event_type"] for r in rows)
    latest: dict[str, str] = {}
    for r in rows:  # rows 가 desc → 첫 등장이 최신. 이미 있으면 덮어쓰지 않는다.
        latest.setdefault(r["event_type"], r["created_at"])
    data = [{"event_type": et, "count": cnt, "created_at": latest[et]} for et, cnt in counts.most_common()]
    return ok(data)
