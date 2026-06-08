from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import NoticeStatus


class NoticeCreateIn(BaseModel):
    content: str
    status: NoticeStatus = NoticeStatus.PUBLISHED
    expires_at: datetime | None = None


class NoticeUpdateIn(BaseModel):
    content: str | None = None
    status: NoticeStatus | None = None
    expires_at: datetime | None = None
