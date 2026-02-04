from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime, timedelta

from app.models import User, Tariff, Deposit, Referral
from app.schemas.user import UserCreate, UserUpdate, UserStats
from app.config import settings


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_tg_id(self, tg_id: int) -> Optional[User]:
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.current_tariff))
            .where(User.tg_id == tg_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.current_tariff))
            .where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def create(self, data: UserCreate) -> User:
        user = User(
            tg_id=data.tg_id,
            username=data.username,
            first_name=data.first_name,
            avatar_url=data.avatar_url,
            is_admin=data.tg_id in settings.admin_tg_ids_list,
        )
        
        user.referral_link = f"https://t.me/{settings.BOT_USERNAME}?start={data.tg_id}"
        
        if data.referrer_tg_id and data.referrer_tg_id != data.tg_id:
            referrer = await self.get_by_tg_id(data.referrer_tg_id)
            if referrer:
                user.referrer_id = referrer.id
                
                referral = Referral(
                    referrer_id=referrer.id,
                    referred_id=0,
                    level=1,
                )
                self.db.add(referral)
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        if data.referrer_tg_id and user.referrer_id:
            result = await self.db.execute(
                select(Referral)
                .where(Referral.referrer_id == user.referrer_id)
                .where(Referral.referred_id == 0)
                .order_by(Referral.id.desc())
                .limit(1)
            )
            referral = result.scalar_one_or_none()
            if referral:
                referral.referred_id = user.id
                await self.db.commit()
            
            await self._create_chain_referrals(user)
        
        return user
    
    async def _create_chain_referrals(self, user: User):
        """Create level 2 and level 3 referral records"""
        if not user.referrer_id:
            return
        
        referrer = await self.get_by_id(user.referrer_id)
        if referrer and referrer.referrer_id:
            level2_referral = Referral(
                referrer_id=referrer.referrer_id,
                referred_id=user.id,
                level=2,
            )
            self.db.add(level2_referral)
            
            level2_referrer = await self.get_by_id(referrer.referrer_id)
            if level2_referrer and level2_referrer.referrer_id:
                level3_referral = Referral(
                    referrer_id=level2_referrer.referrer_id,
                    referred_id=user.id,
                    level=3,
                )
                self.db.add(level3_referral)
        
        await self.db.commit()
    
    async def update(self, user: User, data: UserUpdate) -> User:
        if data.username is not None:
            user.username = data.username
        if data.first_name is not None:
            user.first_name = data.first_name
        if data.avatar_url is not None:
            user.avatar_url = data.avatar_url
        if data.auto_reinvest is not None:
            user.auto_reinvest = data.auto_reinvest
        
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def get_or_create(self, data: UserCreate) -> tuple[User, bool]:
        user = await self.get_by_tg_id(data.tg_id)
        if user:
            if data.username and data.username != user.username:
                user.username = data.username
            if data.first_name and data.first_name != user.first_name:
                user.first_name = data.first_name
            if data.avatar_url and data.avatar_url != user.avatar_url:
                user.avatar_url = data.avatar_url
            await self.db.commit()
            return user, False
        
        user = await self.create(data)
        return user, True
    
    async def update_balance(self, user: User, amount: float) -> User:
        user.balance += amount
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def get_stats(self, user: User) -> UserStats:
        from app.services.tariff_service import TariffService
        from app.services.referral_service import ReferralService
        
        tariff_service = TariffService(self.db)
        referral_service = ReferralService(self.db)
        
        current_tariff = user.current_tariff
        next_tariff = await tariff_service.get_next_tariff(user.total_deposit)
        
        result = await self.db.execute(
            select(Deposit)
            .where(Deposit.user_id == user.id)
            .where(Deposit.status.in_(["active", "acive"]))
            .order_by(Deposit.created_at.desc())
            .limit(1)
        )
        active_deposit = result.scalar_one_or_none()
        
        time_to_next_payout = None
        if active_deposit:
            if active_deposit.next_payout_at:
                delta = active_deposit.next_payout_at - datetime.utcnow()
                time_to_next_payout = max(0, int(delta.total_seconds()))
            else:
                time_to_next_payout = 0
        
        ref_stats = await referral_service.get_stats(user)
        
        return UserStats(
            balance=user.balance,
            total_deposit=user.total_deposit,
            total_earned=user.total_earned,
            accumulated=user.accumulated,
            current_tariff_name=current_tariff.name if current_tariff else None,
            current_tariff_percent=current_tariff.daily_percent if current_tariff else None,
            next_tariff_name=next_tariff.name if next_tariff else None,
            next_tariff_min=next_tariff.min_amount if next_tariff else None,
            amount_to_next_tariff=(next_tariff.min_amount - user.total_deposit) if next_tariff else None,
            partners_count=ref_stats.total_partners,
            active_partners_count=ref_stats.active_partners,
            level1_partners=ref_stats.level1_partners,
            level23_partners=ref_stats.level23_partners,
            referral_earned=user.referral_earned,
            time_to_next_payout=time_to_next_payout,
        )
    
    async def add_to_accumulated(self, user: User, amount: float) -> User:
        user.accumulated += amount
        user.total_earned += amount
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def collect_accumulated(self, user: User) -> float:
        collected = user.accumulated
        user.balance += collected
        user.accumulated = 0
        await self.db.commit()
        await self.db.refresh(user)
        return collected
    
    async def get_random_users(self, limit: int = 10) -> list[User]:
        result = await self.db.execute(
            select(User)
            .where(User.is_banned == False)
            .order_by(func.random())
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_total_users_count(self) -> int:
        result = await self.db.execute(select(func.count(User.id)))
        return result.scalar() or 0
