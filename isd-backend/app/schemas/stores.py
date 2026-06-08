from pydantic import BaseModel


class StoreUpdateIn(BaseModel):
    name: str | None = None
    address: str | None = None
    phone: str | None = None
    naver_place_url: str | None = None
    latitude: float | None = None
    longitude: float | None = None
