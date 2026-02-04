from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from typing import List

from app.models import User, Deposit, Tariff
from app.models.deposit import DepositStatus
from app.services.transaction_service import TransactionService
from app.database import AsyncSessionLocal


class PayoutService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def process_payouts(self) -> int:
        """Process all pending payouts. Returns number of processed payouts."""
        result = await self.db.execute(
            select(Deposit)
            .where(Deposit.status.in_([DepositStatus.ACTIVE.value, "acive"]))
            .where(Deposit.next_payout_at <= datetime.utcnow())
        )
        deposits = list(result.scalars().all())
        
        processed = 0
        
        for deposit in deposits:
            try:
                await self._process_single_payout(deposit)
                processed += 1
            except Exception as e:
                print(f"Error processing payout for deposit {deposit.id}: {e}")
        
        await self.db.commit()
        return processed
    
    async def _process_single_payout(self, deposit: Deposit):
        """Process payout for a single deposit"""
        tariff = await self.db.get(Tariff, deposit.tariff_id)
        if not tariff:
            return
        
        user = await self.db.get(User, deposit.user_id)
        if not user:
            return
        
        # Calculate profit based on tariff percentage
        profit = deposit.amount * (tariff.daily_percent / 100)
        
        # Update deposit earned
        deposit.earned += profit
        
        # Update user stats
        user.accumulated += profit
        user.total_earned += profit
        
        # Record profit transaction
        tx_service = TransactionService(self.db)
        await tx_service.create_transaction(
            user_id=user.id,
            tx_type="profit",
            amount=profit,
            status="completed",
            description=f"Прибыль по тарифу {tariff.name} (+{tariff.daily_percent}%)",
            is_visible=True,
        )
        
        # Check if auto-reinvest is enabled (reinvest profit automatically)
        if deposit.auto_reinvest or user.auto_reinvest:
            # Auto-reinvest: add profit to deposit principal and continue
            await self._auto_reinvest(user, deposit, profit)
        else:
            # No auto-reinvest: profit stays in accumulated, principal continues for next 24h
            # User can collect profit to balance or manually reinvest it
            deposit.next_payout_at = datetime.utcnow() + timedelta(hours=24)
    
    async def _auto_reinvest(self, user: User, deposit: Deposit, profit: float):
        """Perform auto-reinvest: add profit to existing deposit principal"""
        from app.services.tariff_service import TariffService
        tariff_service = TariffService(self.db)
        
        # Add profit to deposit principal (don't create new deposit)
        deposit.amount += profit
        user.total_deposit += profit
        user.accumulated = 0
        
        # Recalculate tariff based on new total
        new_tariff = await tariff_service.get_tariff_for_amount(user.total_deposit)
        if new_tariff and new_tariff.id != deposit.tariff_id:
            deposit.tariff_id = new_tariff.id
        
        await tariff_service.update_user_tariff(user)
        
        # Schedule next payout
        deposit.next_payout_at = datetime.utcnow() + timedelta(hours=24)
        
        tx_service = TransactionService(self.db)
        await tx_service.create_transaction(
            user_id=user.id,
            tx_type="reinvest",
            amount=profit,
            status="completed",
            description=f"Авто-реинвест: +{profit:.2f}₽ к основному вкладу",
            is_visible=True,
        )


async def run_payout_job():
    """Scheduled job to process payouts"""
    async with AsyncSessionLocal() as db:
        service = PayoutService(db)
        processed = await service.process_payouts()
        print(f"[PayoutJob] Processed {processed} payouts at {datetime.utcnow()}")
