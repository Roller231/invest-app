from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List

from app.models import Tariff, User


class TariffService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_all_active(self) -> List[Tariff]:
        result = await self.db.execute(
            select(Tariff)
            .where(Tariff.is_active == True)
            .order_by(Tariff.sort_order.asc())
        )
        return list(result.scalars().all())
    
    async def get_by_id(self, tariff_id: int) -> Optional[Tariff]:
        result = await self.db.execute(
            select(Tariff).where(Tariff.id == tariff_id)
        )
        return result.scalar_one_or_none()
    
    async def get_tariff_for_amount(self, amount: float) -> Optional[Tariff]:
        """Get the appropriate tariff based on deposit amount"""
        result = await self.db.execute(
            select(Tariff)
            .where(Tariff.is_active == True)
            .where(Tariff.min_amount <= amount)
            .where(Tariff.max_amount >= amount)
            .order_by(Tariff.daily_percent.desc())
            .limit(1)
        )
        tariff = result.scalar_one_or_none()
        
        if not tariff:
            result = await self.db.execute(
                select(Tariff)
                .where(Tariff.is_active == True)
                .where(Tariff.min_amount <= amount)
                .order_by(Tariff.daily_percent.desc())
                .limit(1)
            )
            tariff = result.scalar_one_or_none()
        
        if not tariff:
            result = await self.db.execute(
                select(Tariff)
                .where(Tariff.is_active == True)
                .order_by(Tariff.min_amount.asc())
                .limit(1)
            )
            tariff = result.scalar_one_or_none()
        
        return tariff
    
    async def get_next_tariff(self, current_amount: float) -> Optional[Tariff]:
        """Get the next tariff user can upgrade to"""
        result = await self.db.execute(
            select(Tariff)
            .where(Tariff.is_active == True)
            .where(Tariff.min_amount > current_amount)
            .order_by(Tariff.min_amount.asc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def update_user_tariff(self, user: User) -> Optional[Tariff]:
        """Update user's tariff based on their total deposit"""
        tariff = await self.get_tariff_for_amount(user.total_deposit)
        if tariff and (not user.current_tariff_id or user.current_tariff_id != tariff.id):
            user.current_tariff_id = tariff.id
            await self.db.commit()
            await self.db.refresh(user)
        return tariff
