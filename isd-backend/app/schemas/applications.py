from datetime import datetime

from pydantic import BaseModel


class ApplicationCreateIn(BaseModel):
    cafe_name: str
    applicant_name: str | None = None
    address: str
    phone: str | None = None
    business_reg_no: str
    business_license_url: str
    naver_place_url: str
    terms_agreed_at: datetime
    marketing_agreed: bool = False


class RejectIn(BaseModel):
    rejection_reason: str
