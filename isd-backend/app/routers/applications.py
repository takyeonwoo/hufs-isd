"""Applications(입점 신청) — API_SPEC §8"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, status

from app.core.deps import CurrentUser, require_admin, require_owner
from app.core.responses import not_found, ok, page_meta
from app.schemas.applications import ApplicationCreateIn, RejectIn
from app.schemas.common import ApplicationStatus, Pagination, pagination_params

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_application(body: ApplicationCreateIn, user: CurrentUser = Depends(require_owner)):
    """입점 신청 제출. 동일 사업자번호 PENDING 중복 시 409. (21)"""
    # TODO: 중복 PENDING 검사(409) 후 insert. applicant_id = user.id
    now = datetime.now(timezone.utc).isoformat()
    return ok({"application_id": 0, "status": "PENDING", "submitted_at": now})


@router.get("/me")
async def my_applications(user: CurrentUser = Depends(require_owner)):
    """내 신청 현황. (22)"""
    # TODO: applicant_id = user.id 조회
    return ok([])


@router.get("")
async def list_applications(
    status: ApplicationStatus | None = None,
    q: str | None = Query(None, description="매장명/사업자번호 검색"),
    sort: str = "-submitted_at",
    page: Pagination = Depends(pagination_params),
    _: CurrentUser = Depends(require_admin),
):
    """신청 목록(심사). (23)"""
    # TODO: 필터/검색/정렬/페이지네이션
    return ok([], meta=page_meta(page.page, page.page_size, 0))


@router.get("/{application_id}")
async def get_application(application_id: int, _: CurrentUser = Depends(require_admin)):
    """신청 상세(서류 URL 포함). (24)"""
    raise not_found("APPLICATION_NOT_FOUND", "신청서를 찾을 수 없습니다.")


@router.post("/{application_id}/approve")
async def approve(application_id: int, admin: CurrentUser = Depends(require_admin)):
    """승인 → stores 자동 생성(단일 트랜잭션). (25)"""
    # TODO: 트랜잭션으로 status=APPROVED + stores insert + store_id/reviewed_by/reviewed_at 기록
    now = datetime.now(timezone.utc).isoformat()
    return ok({"application_id": application_id, "status": "APPROVED", "store_id": 0, "reviewed_at": now})


@router.post("/{application_id}/reject")
async def reject(application_id: int, body: RejectIn, admin: CurrentUser = Depends(require_admin)):
    """반려. (26)"""
    now = datetime.now(timezone.utc).isoformat()
    return ok(
        {
            "application_id": application_id,
            "status": "REJECTED",
            "rejection_reason": body.rejection_reason,
            "reviewed_at": now,
        }
    )
