"""Uploads — API_SPEC §8 (27) + 상품 이미지 업로드(신규)"""
from fastapi import APIRouter, Depends, File, UploadFile, status

from app.core.deps import CurrentUser, require_owner
from app.core.responses import ApiError, ok
from app.core.storage import upload_public

router = APIRouter(prefix="/uploads", tags=["uploads"])

_MAX_BYTES = 10 * 1024 * 1024  # 10MB
_DOC_TYPES = {"application/pdf", "image/jpeg", "image/png"}
_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


async def _read_validated(file: UploadFile, allowed: set[str], label: str) -> bytes:
    if file.content_type not in allowed:
        raise ApiError("INVALID_FILE_TYPE", f"{label} 형식만 허용됩니다.", status_code=422)
    blob = await file.read()
    if len(blob) > _MAX_BYTES:
        raise ApiError("FILE_TOO_LARGE", "파일은 최대 10MB 입니다.", status_code=422)
    return blob


@router.post("/business-license", status_code=status.HTTP_201_CREATED)
async def upload_business_license(
    file: UploadFile = File(...),
    user: CurrentUser = Depends(require_owner),
):
    """사업자등록증 업로드(PDF/JPG/PNG, 최대 10MB). (27)"""
    blob = await _read_validated(file, _DOC_TYPES, "PDF/JPG/PNG")
    url = upload_public("business-licenses", blob, file.content_type)
    return ok({"business_license_url": url})


@router.post("/product-image", status_code=status.HTTP_201_CREATED)
async def upload_product_image(
    file: UploadFile = File(...),
    user: CurrentUser = Depends(require_owner),
):
    """메뉴(상품) 사진 업로드(JPG/PNG/WebP, 최대 10MB). 신규.

    반환된 image_url 을 POST /stores/{id}/products 의 image_url 로 넘기면 된다.
    """
    blob = await _read_validated(file, _IMAGE_TYPES, "JPG/PNG/WebP")
    url = upload_public("product-images", blob, file.content_type)
    return ok({"image_url": url})
