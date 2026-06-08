from typing import Literal

from pydantic import BaseModel


class AuthCallbackIn(BaseModel):
    provider: Literal["google", "kakao", "naver"]
    code: str
    role: Literal["owner", "admin"] = "owner"
