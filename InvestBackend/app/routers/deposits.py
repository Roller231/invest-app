from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.deposit import DepositCreate, DepositResponse
from app.services.deposit_service import DepositService
from app.services.user_service import UserService

router = APIRouter(prefix="/deposits", tags=["Deposits"])


@router.post("/{tg_id}", response_model=DepositResponse)
async def create_deposit(
    tg_id: int,
    data: DepositCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create and immediately activate a deposit (user invests from balance)"""
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.amount < 100:
        raise HTTPException(status_code=400, detail="Minimum deposit is 100₽")
    
    if user.balance < data.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    deposit_service = DepositService(db)
    deposit = await deposit_service.create_deposit(
        user=user,
        amount=data.amount,
        auto_reinvest=data.auto_reinvest,
        auto_activate=True,  # Immediately activate - no admin approval needed
    )
    
    tariff = await db.get(deposit.tariff.__class__, deposit.tariff_id)
    
    return DepositResponse(
        id=deposit.id,
        amount=deposit.amount,
        earned=deposit.earned,
        status=deposit.status,
        tariff_name=tariff.name if tariff else "Unknown",
        tariff_percent=tariff.daily_percent if tariff else 0,
        is_reinvest=deposit.is_reinvest,
        auto_reinvest=deposit.auto_reinvest,
        started_at=deposit.started_at,
        next_payout_at=deposit.next_payout_at,
        created_at=deposit.created_at,
    )


@router.get("/{tg_id}", response_model=List[DepositResponse])
async def get_user_deposits(tg_id: int, db: AsyncSession = Depends(get_db)):
    """Get all user deposits"""
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    deposit_service = DepositService(db)
    deposits = await deposit_service.get_user_deposits(user.id)
    
    from app.models import Tariff
    
    result = []
    for deposit in deposits:
        tariff = await db.get(Tariff, deposit.tariff_id)
        result.append(DepositResponse(
            id=deposit.id,
            amount=deposit.amount,
            earned=deposit.earned,
            status=deposit.status,
            tariff_name=tariff.name if tariff else "Unknown",
            tariff_percent=tariff.daily_percent if tariff else 0,
            is_reinvest=deposit.is_reinvest,
            auto_reinvest=deposit.auto_reinvest,
            started_at=deposit.started_at,
            next_payout_at=deposit.next_payout_at,
            created_at=deposit.created_at,
        ))
    
    return result


@router.post("/{tg_id}/reinvest")
async def reinvest(tg_id: int, db: AsyncSession = Depends(get_db)):
    """Reinvest last deposit + accumulated earnings"""
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    deposit_service = DepositService(db)
    
    try:
        deposit = await deposit_service.reinvest(user)
        return {"success": True, "new_deposit_amount": deposit.amount}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{tg_id}/withdraw-deposit")
async def withdraw_deposit(tg_id: int, db: AsyncSession = Depends(get_db)):
    """Withdraw active deposit back to balance"""
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    deposit_service = DepositService(db)
    
    try:
        withdrawn = await deposit_service.withdraw_deposit(user)
        return {"success": True, "withdrawn": withdrawn, "new_balance": user.balance}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/process-payouts")
async def process_payouts_manual(db: AsyncSession = Depends(get_db)):
    """Manually trigger payout processing (for testing)"""
    from app.services.payout_service import PayoutService
    
    service = PayoutService(db)
    processed = await service.process_payouts()
    return {"processed": processed}
