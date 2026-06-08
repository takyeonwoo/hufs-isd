"""Admin — API_SPEC §9 (32)"""
from datetime import datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, require_admin
from app.core.responses import ok
from app.core.supabase import require_service_client

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/applications/summary")
async def applications_summary(_: CurrentUser = Depends(require_admin)):
    """심사 KPI 카드. (32)"""
    db = require_service_client()

    def count(builder) -> int:
        return builder.execute().count or 0

    def apps():  # 빌더 재사용 시 필터 누적을 피하려 매번 새로 만든다.
        return db.table("store_applications").select("application_id", count="exact")

    today_start = datetime.combine(datetime.now(timezone.utc).date(), time.min, tzinfo=timezone.utc).isoformat()
    week_start = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    pending = count(apps().eq("status", "PENDING"))
    approved_today = count(apps().eq("status", "APPROVED").gte("reviewed_at", today_start))
    rejected_this_week = count(apps().eq("status", "REJECTED").gte("reviewed_at", week_start))
    total_stores = count(db.table("stores").select("store_id", count="exact"))

    return ok(
        {
            "pending": pending,
            "approved_today": approved_today,
            "rejected_this_week": rejected_this_week,
            "total_stores": total_stores,
        }
    )
