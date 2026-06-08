from pydantic import BaseModel

from app.schemas.common import EventType


class AnalyticsEventIn(BaseModel):
    visitor_id: str
    event_type: EventType
    store_id: int | None = None
    product_id: int | None = None
    trend_id: int | None = None
