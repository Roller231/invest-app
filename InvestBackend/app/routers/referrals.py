from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.referral import ReferralResponse, ReferralStats
from app.services.referral_service import ReferralService
from app.services.user_service import UserService

router = APIRouter(prefix="/referrals", tags=["Referrals"])


@router.get("/{tg_id}", response_model=List[ReferralResponse])
async def get_user_referrals(tg_id: int, db: AsyncSession = Depends(get_db)):
    """Get user's referrals"""
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    service = ReferralService(db)
    referrals = await service.get_user_referrals(user)
    return referrals


@router.get("/{tg_id}/stats", response_model=ReferralStats)
async def get_referral_stats(tg_id: int, db: AsyncSession = Depends(get_db)):
    """Get user's referral statistics"""
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    service = ReferralService(db)
    stats = await service.get_stats(user)
    return stats


@router.get("/{tg_id}/link")
async def get_referral_link(tg_id: int, db: AsyncSession = Depends(get_db)):
    """Get user's referral link"""
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"referral_link": user.referral_link}
