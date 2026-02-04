from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DepositCreate(BaseModel):
    amount: float
    auto_reinvest: bool = False


class DepositResponse(BaseModel):
    id: int
    amount: float
    earned: float
    status: str
    tariff_name: str
    tariff_percent: float
    is_reinvest: bool
    auto_reinvest: bool
    started_at: Optional[datetime]
    next_payout_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True
