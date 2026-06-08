"""Supabase 클라이언트.

- service 클라이언트: RLS 우회(서버 전용). 대부분의 서버 로직에서 사용.
- anon 클라이언트: 공개 키 기반.

환경변수가 없으면 None 을 반환하므로, 라우터에서 DB 연동 전까지는 스캐폴드로 동작한다.
"""
from functools import lru_cache

from app.core.config import settings

try:
    from supabase import Client, create_client
except ImportError:  # supabase 미설치 환경에서도 import 에러 안 나도록
    Client = None  # type: ignore
    create_client = None  # type: ignore


@lru_cache
def get_service_client():
    """RLS 우회 service-role 클라이언트 (서버 전용)."""
    if not create_client or not settings.supabase_url or not settings.supabase_service_key:
        return None
    return create_client(settings.supabase_url, settings.supabase_service_key)


@lru_cache
def get_anon_client():
    if not create_client or not settings.supabase_url or not settings.supabase_anon_key:
        return None
    return create_client(settings.supabase_url, settings.supabase_anon_key)
