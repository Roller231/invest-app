from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from datetime import datetime, timedelta

from app.models import User, Deposit, Tariff
from app.models.deposit import DepositStatus
from app.services.tariff_service import TariffService
from app.services.transaction_service import TransactionService
from app.services.referral_service import ReferralService


class DepositService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.tariff_service = TariffService(db)
    
    async def create_deposit(
        self, 
        user: User, 
        amount: float, 
        auto_reinvest: bool = False,
        is_reinvest: bool = False,
        auto_activate: bool = False
    ) -> Deposit:
        """Create a new deposit or add to existing active deposit"""
        # Check if user has an active deposit - if so, add to it instead of creating new
        active_deposit = await self.get_active_deposit(user.id)
        
        if active_deposit and not is_reinvest:
            # Add to existing deposit
            return await self.add_to_deposit(user, active_deposit, amount)
        
        # Create new deposit
        tariff = await self.tariff_service.get_tariff_for_amount(user.total_deposit + amount)
        if not tariff:
            raise ValueError("No suitable tariff found")
        
        deposit = Deposit(
            user_id=user.id,
            tariff_id=tariff.id,
            amount=amount,
            is_reinvest=is_reinvest,
            auto_reinvest=auto_reinvest,
            status=DepositStatus.PENDING.value,
        )
        
        self.db.add(deposit)
        await self.db.commit()
        await self.db.refresh(deposit)
        
        if auto_activate:
            await self.activate_deposit(deposit)
        
        return deposit
    
    async def add_to_deposit(self, user: User, deposit: Deposit, amount: float) -> Deposit:
        """Add amount to existing active deposit and recalculate tariff"""
        if user.balance < amount:
            raise ValueError("Insufficient balance")
        
        # Add to deposit amount
        deposit.amount += amount
        
        # Deduct from user balance
        user.balance -= amount
        user.total_deposit += amount
        
        # Recalculate tariff based on new total
        new_tariff = await self.tariff_service.get_tariff_for_amount(user.total_deposit)
        if new_tariff and new_tariff.id != deposit.tariff_id:
            deposit.tariff_id = new_tariff.id
        
        # Update user's current tariff
        await self.tariff_service.update_user_tariff(user)
        
        await self.db.commit()
        await self.db.refresh(deposit)
        
        # Record transaction
        tx_service = TransactionService(self.db)
        await tx_service.create_transaction(
            user_id=user.id,
            tx_type="deposit",
            amount=amount,
            status="completed",
            description=f"Пополнение вклада на {amount}₽",
            is_visible=True,
        )
        
        # Process referral bonus
        referral_service = ReferralService(self.db)
        await referral_service.process_deposit_referral(user, amount)
        
        return deposit
    
    async def activate_deposit(self, deposit: Deposit) -> Deposit:
        """Activate a pending deposit (admin action or auto)"""
        if deposit.status != DepositStatus.PENDING.value:
            raise ValueError("Deposit is not pending")
        
        deposit.status = DepositStatus.ACTIVE.value
        deposit.started_at = datetime.utcnow()
        deposit.next_payout_at = datetime.utcnow() + timedelta(hours=24)
        
        user = await self.db.get(User, deposit.user_id)
        if user:
            user.total_deposit += deposit.amount
            user.balance -= deposit.amount if not deposit.is_reinvest else 0
            
            await self.tariff_service.update_user_tariff(user)
            
            referral_service = ReferralService(self.db)
            await referral_service.process_deposit_referral(user, deposit.amount)
        
        await self.db.commit()
        await self.db.refresh(deposit)
        
        tx_service = TransactionService(self.db)
        tx_type = "reinvest" if deposit.is_reinvest else "deposit"
        await tx_service.create_transaction(
            user_id=deposit.user_id,
            tx_type=tx_type,
            amount=deposit.amount,
            status="completed",
            description=f"{'Реинвест' if deposit.is_reinvest else 'Пополнение'} на сумму {deposit.amount}₽",
            is_visible=True,
        )
        
        return deposit
    
    async def get_user_deposits(self, user_id: int) -> List[Deposit]:
        result = await self.db.execute(
            select(Deposit)
            .where(Deposit.user_id == user_id)
            .order_by(Deposit.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def get_active_deposit(self, user_id: int) -> Optional[Deposit]:
        result = await self.db.execute(
            select(Deposit)
            .where(Deposit.user_id == user_id)
            .where(Deposit.status.in_([DepositStatus.ACTIVE.value, "acive"]))
            .order_by(Deposit.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def get_last_deposit(self, user_id: int) -> Optional[Deposit]:
        result = await self.db.execute(
            select(Deposit)
            .where(Deposit.user_id == user_id)
            .order_by(Deposit.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def reinvest(self, user: User) -> Optional[Deposit]:
        """Reinvest accumulated profit: add accumulated to active deposit principal"""
        active_deposit = await self.get_active_deposit(user.id)
        if not active_deposit:
            raise ValueError("No active deposit found")
        
        if user.accumulated <= 0:
            raise ValueError("No accumulated profit to reinvest")
        
        profit_to_reinvest = user.accumulated
        
        # Add accumulated profit to deposit principal
        active_deposit.amount += profit_to_reinvest
        user.total_deposit += profit_to_reinvest
        user.accumulated = 0
        
        # Recalculate tariff based on new total
        new_tariff = await self.tariff_service.get_tariff_for_amount(user.total_deposit)
        if new_tariff and new_tariff.id != active_deposit.tariff_id:
            active_deposit.tariff_id = new_tariff.id
        
        # Update user's current tariff
        await self.tariff_service.update_user_tariff(user)
        
        await self.db.commit()
        await self.db.refresh(active_deposit)
        
        # Record transaction
        tx_service = TransactionService(self.db)
        await tx_service.create_transaction(
            user_id=user.id,
            tx_type="reinvest",
            amount=profit_to_reinvest,
            status="completed",
            description=f"Реинвест прибыли {profit_to_reinvest:.2f}₽ в основной вклад",
            is_visible=True,
        )
        
        return active_deposit
    
    async def withdraw_deposit(self, user: User) -> float:
        """Withdraw user's deposit back to balance"""
        active_deposit = await self.get_active_deposit(user.id)
        if not active_deposit:
            raise ValueError("No active deposit found")
        
        withdrawn_amount = active_deposit.amount
        
        active_deposit.status = DepositStatus.COMPLETED.value
        active_deposit.completed_at = datetime.utcnow()
        
        user.balance += withdrawn_amount + user.accumulated
        user.total_deposit -= withdrawn_amount
        user.accumulated = 0
        
        await self.tariff_service.update_user_tariff(user)
        
        await self.db.commit()
        
        tx_service = TransactionService(self.db)
        await tx_service.create_transaction(
            user_id=user.id,
            tx_type="withdraw",
            amount=-withdrawn_amount,
            status="completed",
            description=f"Вывод депозита на сумму {withdrawn_amount}₽",
            is_visible=True,
        )
        
        return withdrawn_amount
    
    async def get_deposits_for_payout(self) -> List[Deposit]:
        """Get all deposits that need payout processing"""
        result = await self.db.execute(
            select(Deposit)
            .where(Deposit.status == DepositStatus.ACTIVE.value)
            .where(Deposit.next_payout_at <= datetime.utcnow())
        )
        return list(result.scalars().all())
