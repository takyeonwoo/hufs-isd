"""공통 응답 봉투 / 에러 / 페이지네이션 — API_SPEC '공통 사항' 준수."""
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse


def ok(data: Any, meta: dict | None = None) -> dict:
    """성공 응답: { "data": ..., "meta": ... }"""
    body: dict = {"data": data}
    if meta is not None:
        body["meta"] = meta
    return body


def page_meta(page: int, page_size: int, total: int) -> dict:
    return {"page": page, "page_size": page_size, "total": total}


class ApiError(Exception):
    """도메인 에러. 핸들러가 { "error": { "code", "message" } } 로 직렬화."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


# 자주 쓰는 에러 팩토리
def not_found(code: str, message: str) -> ApiError:
    return ApiError(code, message, status_code=404)


def conflict(code: str, message: str) -> ApiError:
    return ApiError(code, message, status_code=409)


def forbidden(message: str = "권한이 없습니다.") -> ApiError:
    return ApiError("FORBIDDEN", message, status_code=403)


def unauthorized(message: str = "인증이 필요합니다.") -> ApiError:
    return ApiError("UNAUTHORIZED", message, status_code=401)


async def api_error_handler(_: Request, exc: ApiError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )
