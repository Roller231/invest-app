from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReferralResponse(BaseModel):
    id: int
    referred_name: str
    referred_tg_id: int
    level: int
    total_earned: float
    is_active: bool
    created_at: datetime


class ReferralStats(BaseModel):
    total_partners: int
    active_partners: int
    level1_partners: int
    level23_partners: int
    total_earned: float
    total_deposited_by_referrals: float
    referral_link: str
