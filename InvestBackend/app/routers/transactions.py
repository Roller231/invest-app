from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.database import get_db
from app.schemas.transaction import TransactionResponse, LiveTransactionResponse
from app.services.transaction_service import TransactionService
from app.services.user_service import UserService
from app.models import Deposit, Transaction
from app.models.deposit import DepositStatus

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/live", response_model=List[LiveTransactionResponse])
async def get_live_transactions(
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Get live transaction feed (real + fake mixed)"""
    service = TransactionService(db)
    transactions = await service.get_live_transactions(limit)
    return transactions


@router.get("/{tg_id}", response_model=List[TransactionResponse])
async def get_user_transactions(
    tg_id: int,
    tx_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get user's transaction history"""
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    service = TransactionService(db)
    transactions = await service.get_user_transactions(user.id, tx_type, limit)
    return transactions


@router.post("/{tg_id}/withdraw")
async def create_withdraw_request(
    tg_id: int,
    amount: float,
    db: AsyncSession = Depends(get_db)
):
    """Create a withdrawal request"""
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    active_deposit_result = await db.execute(
        select(Deposit.id)
        .where(Deposit.user_id == user.id)
        .where(Deposit.status.in_([DepositStatus.ACTIVE.value, "acive"]))
        .limit(1)
    )
    has_active_deposit = active_deposit_result.scalar_one_or_none() is not None

    if not has_active_deposit:
        real_deposits_result = await db.execute(
            select(func.count(Transaction.id))
            .where(Transaction.user_id == user.id)
            .where(Transaction.type == "deposit")
            .where(Transaction.status == "completed")
            .where(Transaction.is_fake == False)
            .where(Transaction.amount > 0)
        )
        real_deposits_count = int(real_deposits_result.scalar() or 0)
        if real_deposits_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Вывод доступен только после реального пополнения или активного вклада",
            )

    if amount > user.balance:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    user.balance -= amount
    await db.commit()
    
    tx_service = TransactionService(db)
    transaction = await tx_service.create_transaction(
        user_id=user.id,
        tx_type="withdraw",
        amount=-amount,
        status="pending",
        description=f"Запрос на вывод {amount}₽",
        is_visible=True,
    )
    
    return {
        "success": True,
        "transaction_id": transaction.id,
        "amount": amount,
        "new_balance": user.balance,
        "status": "pending",
    }


@router.post("/{tg_id}/game/bet")
async def create_game_bet(
    tg_id: int,
    amount: float,
    db: AsyncSession = Depends(get_db)
):
    """Deduct bet amount from user balance for Exchange mini-game"""
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    if amount > user.balance:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    user.balance -= amount
    await db.commit()

    tx_service = TransactionService(db)
    transaction = await tx_service.create_transaction(
        user_id=user.id,
        tx_type="game_bet",
        amount=-amount,
        status="completed",
        description=f"Ставка в мини-игре {amount}₽",
        is_visible=False,
    )

    return {
        "success": True,
        "transaction_id": transaction.id,
        "amount": amount,
        "new_balance": user.balance,
        "status": "completed",
    }


@router.post("/{tg_id}/game/payout")
async def create_game_payout(
    tg_id: int,
    amount: float,
    db: AsyncSession = Depends(get_db)
):
    """Add payout amount to user balance for Exchange mini-game"""
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    user.balance += amount
    await db.commit()

    tx_service = TransactionService(db)
    transaction = await tx_service.create_transaction(
        user_id=user.id,
        tx_type="game_payout",
        amount=amount,
        status="completed",
        description=f"Выигрыш в мини-игре {amount}₽",
        is_visible=False,
    )

    return {
        "success": True,
        "transaction_id": transaction.id,
        "amount": amount,
        "new_balance": user.balance,
        "status": "completed",
    }
