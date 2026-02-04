from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.models import User, Referral, Deposit
from app.schemas.referral import ReferralStats, ReferralResponse
from app.config import settings


REFERRAL_PERCENTS = {
    1: 20.0,  # 20% от депозита реферала 1 уровня
    2: 7.0,   # 7% от депозита реферала 2 уровня
    3: 4.0,   # 4% от депозита реферала 3 уровня
}


class ReferralService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_user_referrals(self, user: User) -> List[ReferralResponse]:
        result = await self.db.execute(
            select(Referral)
            .where(Referral.referrer_id == user.id)
            .order_by(Referral.level.asc(), Referral.created_at.desc())
        )
        referrals = result.scalars().all()
        
        response = []
        for ref in referrals:
            referred_user = await self.db.get(User, ref.referred_id)
            if referred_user:
                is_active = referred_user.total_deposit > 0
                
                response.append(ReferralResponse(
                    id=ref.id,
                    referred_name=referred_user.first_name or referred_user.username or f"User_{referred_user.tg_id}",
                    referred_tg_id=referred_user.tg_id,
                    level=ref.level,
                    total_earned=ref.total_earned,
                    is_active=is_active,
                    created_at=ref.created_at,
                ))
        
        return response
    
    async def get_stats(self, user: User) -> ReferralStats:
        result = await self.db.execute(
            select(Referral).where(Referral.referrer_id == user.id)
        )
        referrals = list(result.scalars().all())
        
        total_partners = len(referrals)
        level1_partners = sum(1 for r in referrals if r.level == 1)
        level23_partners = sum(1 for r in referrals if r.level in [2, 3])
        
        active_partners = 0
        total_deposited = 0.0
        
        for ref in referrals:
            referred_user = await self.db.get(User, ref.referred_id)
            if referred_user and referred_user.total_deposit > 0:
                active_partners += 1
                total_deposited += referred_user.total_deposit
        
        total_earned = sum(r.total_earned for r in referrals)
        
        return ReferralStats(
            total_partners=total_partners,
            active_partners=active_partners,
            level1_partners=level1_partners,
            level23_partners=level23_partners,
            total_earned=total_earned,
            total_deposited_by_referrals=total_deposited,
            referral_link=user.referral_link or f"https://t.me/{settings.BOT_USERNAME}?start={user.tg_id}",
        )
    
    async def process_deposit_referral(self, user: User, deposit_amount: float):
        """Process referral earnings when user makes a deposit"""
        result = await self.db.execute(
            select(Referral).where(Referral.referred_id == user.id)
        )
        referral_records = list(result.scalars().all())
        
        for ref in referral_records:
            percent = REFERRAL_PERCENTS.get(ref.level, 0)
            if percent > 0:
                earning = deposit_amount * (percent / 100)
                
                ref.total_earned += earning
                
                referrer = await self.db.get(User, ref.referrer_id)
                if referrer:
                    referrer.referral_earned += earning
                    referrer.balance += earning
                    
                    from app.services.transaction_service import TransactionService
                    tx_service = TransactionService(self.db)
                    await tx_service.create_transaction(
                        user_id=referrer.id,
                        tx_type="referral",
                        amount=earning,
                        status="completed",
                        description=f"Реферальный доход уровня {ref.level} ({percent}%)",
                        is_visible=False,
                    )
        
        await self.db.commit()
