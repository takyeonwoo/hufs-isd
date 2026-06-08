"""공통 쿼리 파라미터 및 enum."""
from enum import Enum

from fastapi import Query
from pydantic import BaseModel


class StockStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    LOW = "LOW"
    SOLD_OUT = "SOLD_OUT"


class TrendStatus(str, Enum):
    HOT = "HOT"
    RISING = "RISING"
    FALLING = "FALLING"


class NoticeStatus(str, Enum):
    PUBLISHED = "PUBLISHED"
    DRAFT = "DRAFT"


class ApplicationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class EventType(str, Enum):
    VIEW_STORE = "VIEW_STORE"
    SEARCH_TREND = "SEARCH_TREND"
    CLICK_MARKER = "CLICK_MARKER"


class Pagination(BaseModel):
    page: int = 1
    page_size: int = 20


def pagination_params(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> Pagination:
    """목록 API 공통 페이지네이션 의존성."""
    return Pagination(page=page, page_size=page_size)
