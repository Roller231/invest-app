from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PromoActivateRequest(BaseModel):
    code: str


class PromoActivateResponse(BaseModel):
    success: bool
    code: str
    amount: float
    new_balance: float
    message: Optional[str] = None


class PromoCodeResponse(BaseModel):
    id: int
    code: str
    amount: float
    description: Optional[str]
    is_active: bool
    max_uses_total: Optional[int]
    max_uses_per_user: int
    valid_from: Optional[datetime]
    valid_to: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
