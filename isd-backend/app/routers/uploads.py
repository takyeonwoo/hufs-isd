"""Uploads — API_SPEC §8 (27)"""
from fastapi import APIRouter, Depends, File, UploadFile, status

from app.core.deps import CurrentUser, require_owner
from app.core.responses import ApiError, ok

router = APIRouter(prefix="/uploads", tags=["uploads"])

_MAX_BYTES = 10 * 1024 * 1024  # 10MB
_ALLOWED = {"application/pdf", "image/jpeg", "image/png"}


@router.post("/business-license", status_code=status.HTTP_201_CREATED)
async def upload_business_license(
    file: UploadFile = File(...),
    user: CurrentUser = Depends(require_owner),
):
    """사업자등록증 업로드(PDF/JPG/PNG, 최대 10MB). (27)"""
    if file.content_type not in _ALLOWED:
        raise ApiError("INVALID_FILE_TYPE", "PDF/JPG/PNG 만 허용됩니다.", status_code=422)
    blob = await file.read()
    if len(blob) > _MAX_BYTES:
        raise ApiError("FILE_TOO_LARGE", "파일은 최대 10MB 입니다.", status_code=422)
    # TODO: Supabase Storage 버킷에 업로드 후 공개/서명 URL 반환
    return ok({"business_license_url": "https://storage.foorendy.co/biz/<uuid>"})
