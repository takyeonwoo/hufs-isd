"""Applications(입점 신청) — API_SPEC §8"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, status

from app.core.deps import CurrentUser, require_admin, require_owner
from app.core.geocode import geocode
from app.core.responses import conflict, not_found, ok, page_meta
from app.core.supabase import require_service_client
from app.schemas.applications import ApplicationCreateIn, RejectIn
from app.schemas.common import ApplicationStatus, Pagination, pagination_params

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_application(body: ApplicationCreateIn, user: CurrentUser = Depends(require_owner)):
    """입점 신청 제출. 동일 사업자번호 PENDING 중복 시 409. (21)"""
    db = require_service_client()
    dup = (
        db.table("store_applications")
        .select("application_id")
        .eq("business_reg_no", body.business_reg_no)
        .eq("status", "PENDING")
        .execute()
        .data
        or []
    )
    if dup:
        raise conflict("DUPLICATE_APPLICATION", "이미 심사 중인 동일 사업자번호 신청이 있습니다.")

    payload = {
        "applicant_id": user.id,
        "applicant_name": body.applicant_name,
        "cafe_name": body.cafe_name,
        "address": body.address,
        "phone": body.phone,
        "business_reg_no": body.business_reg_no,
        "business_license_url": body.business_license_url,
        "terms_agreed_at": body.terms_agreed_at.isoformat(),
        "marketing_agreed": body.marketing_agreed,
        "status": "PENDING",
    }
    res = db.table("store_applications").insert(payload).execute()
    return ok(res.data[0])


@router.get("/me")
async def my_applications(user: CurrentUser = Depends(require_owner)):
    """내 신청 현황. (22)"""
    db = require_service_client()
    res = (
        db.table("store_applications")
        .select("*")
        .eq("applicant_id", user.id)
        .order("submitted_at", desc=True)
        .execute()
    )
    return ok(res.data or [])


@router.get("")
async def list_applications(
    status: ApplicationStatus | None = None,
    q: str | None = Query(None, description="매장명/사업자번호 검색"),
    sort: str = "-submitted_at",
    page: Pagination = Depends(pagination_params),
    _: CurrentUser = Depends(require_admin),
):
    """신청 목록(심사). (23)"""
    db = require_service_client()
    query = db.table("store_applications").select("*", count="exact")
    if status is not None:
        query = query.eq("status", status.value)
    if q:
        query = query.or_(f"cafe_name.ilike.%{q}%,business_reg_no.ilike.%{q}%")

    desc = sort.startswith("-")
    query = query.order(sort.lstrip("-"), desc=desc)

    start = (page.page - 1) * page.page_size
    res = query.range(start, start + page.page_size - 1).execute()
    total = res.count or 0
    return ok(res.data or [], meta=page_meta(page.page, page.page_size, total))


@router.get("/{application_id}")
async def get_application(application_id: int, _: CurrentUser = Depends(require_admin)):
    """신청 상세(서류 URL + 신청자 email 포함). (24)"""
    db = require_service_client()
    rows = (
        db.table("store_applications")
        .select("*, owners(email)")
        .eq("application_id", application_id)
        .execute()
        .data
        or []
    )
    if not rows:
        raise not_found("APPLICATION_NOT_FOUND", "신청서를 찾을 수 없습니다.")
    app = rows[0]
    app["email"] = (app.pop("owners", None) or {}).get("email")
    return ok(app)


@router.post("/{application_id}/approve")
async def approve(application_id: int, admin: CurrentUser = Depends(require_admin)):
    """승인 → stores 자동 생성. (25)

    단일 SQL 트랜잭션은 아니지만, store 생성 성공 후에만 신청서를 APPROVED 로 갱신한다.
    """
    db = require_service_client()
    rows = db.table("store_applications").select("*").eq("application_id", application_id).execute().data or []
    if not rows:
        raise not_found("APPLICATION_NOT_FOUND", "신청서를 찾을 수 없습니다.")
    app = rows[0]
    if app["status"] == "APPROVED" and app.get("store_id"):
        return ok({"application_id": application_id, "status": "APPROVED", "store_id": app["store_id"], "reviewed_at": app.get("reviewed_at")})

    # 주소 → 좌표(위경도) 변환. 실패하면 좌표 없이 생성(지도에는 안 뜸).
    coords = geocode(app.get("address"))
    store_row = {
        "owner_id": app["applicant_id"],
        "name": app["cafe_name"],
        "address": app.get("address"),
        "phone": app.get("phone"),
        "business_reg_no": app.get("business_reg_no"),
    }
    if coords:
        store_row["latitude"], store_row["longitude"] = coords
    store = db.table("stores").insert(store_row).execute().data[0]

    now = datetime.now(timezone.utc).isoformat()
    db.table("store_applications").update(
        {"status": "APPROVED", "store_id": store["store_id"], "reviewed_by": admin.id, "reviewed_at": now}
    ).eq("application_id", application_id).execute()

    return ok({"application_id": application_id, "status": "APPROVED", "store_id": store["store_id"], "reviewed_at": now})


@router.post("/{application_id}/reject")
async def reject(application_id: int, body: RejectIn, admin: CurrentUser = Depends(require_admin)):
    """반려. (26)"""
    db = require_service_client()
    rows = db.table("store_applications").select("application_id").eq("application_id", application_id).execute().data or []
    if not rows:
        raise not_found("APPLICATION_NOT_FOUND", "신청서를 찾을 수 없습니다.")

    now = datetime.now(timezone.utc).isoformat()
    db.table("store_applications").update(
        {"status": "REJECTED", "rejection_reason": body.rejection_reason, "reviewed_by": admin.id, "reviewed_at": now}
    ).eq("application_id", application_id).execute()

    return ok(
        {
            "application_id": application_id,
            "status": "REJECTED",
            "rejection_reason": body.rejection_reason,
            "reviewed_at": now,
        }
    )
