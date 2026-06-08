"""Admin — API_SPEC §9 (32)"""
from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, require_admin
from app.core.responses import ok

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/applications/summary")
async def applications_summary(_: CurrentUser = Depends(require_admin)):
    """심사 KPI 카드. (32)"""
    # TODO: pending/approved_today/rejected_this_week/total_stores 집계
    return ok({"pending": 0, "approved_today": 0, "rejected_this_week": 0, "total_stores": 0})
