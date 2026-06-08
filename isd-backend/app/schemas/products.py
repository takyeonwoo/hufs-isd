from pydantic import BaseModel, model_validator


class ProductCreateIn(BaseModel):
    trend_id: int
    name: str
    price: int | None = None
    quantity: int = 0
    image_url: str | None = None


class ProductUpdateIn(BaseModel):
    name: str | None = None
    price: int | None = None
    trend_id: int | None = None
    image_url: str | None = None


class QuantityUpdateIn(BaseModel):
    """절대값(quantity) 또는 증감(delta) 중 하나."""
    quantity: int | None = None
    delta: int | None = None

    @model_validator(mode="after")
    def _exactly_one(self):
        if (self.quantity is None) == (self.delta is None):
            raise ValueError("quantity 또는 delta 중 정확히 하나를 보내야 합니다.")
        return self
