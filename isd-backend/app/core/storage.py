"""Supabase Storage 업로드 헬퍼.

service-role 클라이언트로 버킷에 파일을 올리고 공개 URL 을 반환한다.
"""
import uuid

from app.core.responses import ApiError
from app.core.supabase import get_service_client

# content-type → 확장자
_EXT = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "application/pdf": "pdf",
}


def _client():
    client = get_service_client()
    if client is None:
        raise ApiError(
            "SUPABASE_NOT_CONFIGURED",
            "서버 Supabase service key 가 설정되지 않았습니다. (.env SUPABASE_SERVICE_KEY)",
            status_code=500,
        )
    return client


def _ensure_bucket(client, bucket: str, public: bool) -> None:
    """버킷이 없으면 생성한다. 이미 있으면 무시."""
    try:
        client.storage.create_bucket(bucket, options={"public": public})
    except Exception:  # noqa: BLE001 — 이미 존재하면 에러가 나는데 무시
        pass


def upload_public(bucket: str, data: bytes, content_type: str) -> str:
    """공개 버킷에 업로드 후 공개 URL 반환."""
    client = _client()
    _ensure_bucket(client, bucket, public=True)
    ext = _EXT.get(content_type, "bin")
    path = f"{uuid.uuid4().hex}.{ext}"
    client.storage.from_(bucket).upload(
        path, data, {"content-type": content_type, "upsert": "true"}
    )
    return client.storage.from_(bucket).get_public_url(path).rstrip("?")
