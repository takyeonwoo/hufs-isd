"""환경설정 — .env 에서 읽어온다 (pydantic-settings)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # API
    api_v1_prefix: str = "/v1"
    project_name: str = "Foorendy API"

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""
    supabase_jwt_secret: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # CORS (콤마 구분 문자열 → 리스트)
    cors_origins: str = "http://localhost:5173"

    # 개발 편의 인증 우회
    dev_fake_auth: bool = False

    # 관리자(심사자) 고정 계정 — Supabase 미사용. POST /auth/admin-login 으로 JWT 발급.
    admin_username: str = "admin"
    admin_password: str = "admin"

    # 카카오 Local API REST 키 — 주소 → 좌표(geocoding)용. 승인 시 매장 좌표 자동 생성.
    kakao_rest_api_key: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
