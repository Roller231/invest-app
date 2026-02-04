from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    tg_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    avatar_url: Optional[str] = None
    referrer_tg_id: Optional[int] = None


class UserAuthRequest(BaseModel):
    init_data: Optional[str] = None
    referrer_tg_id: Optional[int] = None
    tg_id: Optional[int] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    avatar_url: Optional[str] = None
    auto_reinvest: Optional[bool] = None


class TariffInfo(BaseModel):
    id: int
    name: str
    daily_percent: float
    color: str
    
    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    tg_id: int
    username: Optional[str]
    first_name: Optional[str]
    avatar_url: Optional[str]
    balance: float
    total_deposit: float
    total_earned: float
    accumulated: float
    auto_reinvest: bool
    referral_link: Optional[str]
    referral_earned: float
    current_tariff: Optional[TariffInfo]
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserStats(BaseModel):
    balance: float
    total_deposit: float
    total_earned: float
    accumulated: float
    current_tariff_name: Optional[str]
    current_tariff_percent: Optional[float]
    next_tariff_name: Optional[str]
    next_tariff_min: Optional[float]
    amount_to_next_tariff: Optional[float]
    partners_count: int
    active_partners_count: int
    level1_partners: int
    level23_partners: int
    referral_earned: float
    time_to_next_payout: Optional[int]  # seconds
