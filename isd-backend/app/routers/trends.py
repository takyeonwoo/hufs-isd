"""Trends — API_SPEC §4"""
import random
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

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
    rows = query.execute().data or []

    # 트렌드별 대표 이미지: 해당 트렌드 판매 상품들의 image_url 중 랜덤 1장
    ids = [t["trend_id"] for t in rows]
    if ids:
        prods = db.table("products").select("trend_id, image_url").in_("trend_id", ids).execute().data or []
        imgs = defaultdict(list)
        for p in prods:
            if p.get("image_url"):
                imgs[p["trend_id"]].append(p["image_url"])
        for t in rows:
            pool = imgs.get(t["trend_id"]) or []
            t["image_url"] = random.choice(pool) if pool else None

    return ok(rows, meta={"updated_at": now})


@router.get("/search-ranking")
async def search_ranking(
    limit: int = Query(5, ge=1, le=20),
    window_hours: int = Query(24, ge=1, le=168),
):
    """실시간 인기 검색어. (6)

    손님의 SEARCH_TREND 이벤트(analytics_logs)를 최근 window_hours 동안 trend 별로 집계해
    상위 N개를 반환한다. 직전 동일 길이 윈도우의 순위와 비교해 순위 변동(delta/direction)도 계산.
    (Redis 없이 DB 집계로 구현 — 추후 트래픽이 커지면 Redis ZSET 캐싱으로 최적화 가능.)
    """
    now = datetime.now(timezone.utc)
    db = get_service_client()
    if db is None:
        return ok([], meta={"refreshed_at": now.isoformat()})

    window = timedelta(hours=window_hours)
    cur_start = (now - window).isoformat()
    prev_start = (now - window * 2).isoformat()

    def counts(start: str, end: str) -> Counter:
        rows = (
            db.table("analytics_logs")
            .select("trend_id")
            .eq("event_type", "SEARCH_TREND")
            .gte("created_at", start)
            .lt("created_at", end)
            .execute()
            .data
            or []
        )
        return Counter(r["trend_id"] for r in rows if r.get("trend_id") is not None)

    cur = counts(cur_start, now.isoformat())
    prev = counts(prev_start, cur_start)

    # 직전 윈도우 순위 맵 (trend_id -> rank)
    prev_rank = {tid: i for i, (tid, _) in enumerate(prev.most_common(), start=1)}

    top = cur.most_common(limit)
    trend_ids = [tid for tid, _ in top]
    info = {}
    if trend_ids:
        trs = db.table("trends").select("trend_id, name, emoji").in_("trend_id", trend_ids).execute().data or []
        info = {t["trend_id"]: t for t in trs}

    ranking = []
    for rank, (tid, cnt) in enumerate(top, start=1):
        t = info.get(tid, {})
        pr = prev_rank.get(tid)
        delta = (pr - rank) if pr is not None else 0  # +면 순위 상승
        ranking.append(
            {
                "rank": rank,
                "trend_id": tid,
                "name": t.get("name"),
                "emoji": t.get("emoji"),
                "count": cnt,
                "delta": abs(delta),
                "direction": "up" if delta >= 0 else "down",
            }
        )
    return ok(ranking, meta={"refreshed_at": now.isoformat(), "window_hours": window_hours})


@router.get("/{trend_id}")
async def get_trend(trend_id: int):
    """트렌드 상세 + 판매 매장 수(store_count). (5)"""
    db = get_service_client()
    if db is None:
        raise not_found("TREND_NOT_FOUND", "트렌드를 찾을 수 없습니다.")
    rows = db.table("trends").select("*").eq("trend_id", trend_id).execute().data or []
    if not rows:
        raise not_found("TREND_NOT_FOUND", "트렌드를 찾을 수 없습니다.")

    # 해당 트렌드를 판매하는 매장 수(파생). 상품의 distinct store_id 집계.
    products = db.table("products").select("store_id").eq("trend_id", trend_id).execute().data or []
    store_count = len({p["store_id"] for p in products})
    return ok({**rows[0], "store_count": store_count})
