from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, Deposit, Transaction
from app.models.deposit import DepositStatus
from app.models.transaction import TransactionStatus
from app.services.deposit_service import DepositService
from app.services.transaction_service import TransactionService
from app.services.user_service import UserService
from app.config import settings

router = APIRouter(prefix="/admin", tags=["Admin"])


async def verify_admin(tg_id: int, db: AsyncSession):
    """Verify if user is admin"""
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    
    if not user or not user.is_admin:
        if tg_id not in settings.admin_tg_ids_list:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return user


@router.post("/deposit/{deposit_id}/approve")
async def approve_deposit(
    deposit_id: int,
    admin_tg_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Approve a pending deposit"""
    await verify_admin(admin_tg_id, db)
    
    deposit = await db.get(Deposit, deposit_id)
    if not deposit:
        raise HTTPException(status_code=404, detail="Deposit not found")
    
    if deposit.status != DepositStatus.PENDING.value:
        raise HTTPException(status_code=400, detail="Deposit is not pending")
    
    deposit_service = DepositService(db)
    await deposit_service.activate_deposit(deposit)
    
    return {"success": True, "deposit_id": deposit_id, "status": deposit.status}


@router.post("/deposit/{deposit_id}/reject")
async def reject_deposit(
    deposit_id: int,
    admin_tg_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Reject a pending deposit"""
    await verify_admin(admin_tg_id, db)
    
    deposit = await db.get(Deposit, deposit_id)
    if not deposit:
        raise HTTPException(status_code=404, detail="Deposit not found")
    
    deposit.status = DepositStatus.CANCELLED.value
    await db.commit()
    
    return {"success": True, "deposit_id": deposit_id, "status": "cancelled"}


@router.post("/withdraw/{transaction_id}/approve")
async def approve_withdraw(
    transaction_id: int,
    admin_tg_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Approve a pending withdrawal"""
    await verify_admin(admin_tg_id, db)
    
    transaction = await db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.type != "withdraw":
        raise HTTPException(status_code=400, detail="Not a withdrawal transaction")
    
    if transaction.status != TransactionStatus.PENDING.value:
        raise HTTPException(status_code=400, detail="Transaction is not pending")
    
    transaction.status = TransactionStatus.COMPLETED.value
    await db.commit()

    try:
        from app.live_ws import publish_transaction
        await publish_transaction(db, transaction)
    except Exception:
        pass
    
    return {"success": True, "transaction_id": transaction_id, "status": "completed"}


@router.post("/withdraw/{transaction_id}/reject")
async def reject_withdraw(
    transaction_id: int,
    admin_tg_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Reject a pending withdrawal and refund user"""
    await verify_admin(admin_tg_id, db)
    
    transaction = await db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.type != "withdraw":
        raise HTTPException(status_code=400, detail="Not a withdrawal transaction")
    
    if transaction.status != TransactionStatus.PENDING.value:
        raise HTTPException(status_code=400, detail="Transaction is not pending")
    
    user = await db.get(User, transaction.user_id)
    if user:
        user.balance += abs(transaction.amount)
    
    transaction.status = TransactionStatus.REJECTED.value
    await db.commit()

    try:
        from app.live_ws import publish_transaction
        await publish_transaction(db, transaction)
    except Exception:
        pass
    
    return {"success": True, "transaction_id": transaction_id, "status": "rejected"}


@router.post("/user/{user_id}/add-balance")
async def add_user_balance(
    user_id: int,
    amount: float,
    admin_tg_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Add balance to user (admin action for manual deposits)"""
    await verify_admin(admin_tg_id, db)
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.balance += amount
    await db.commit()
    
    tx_service = TransactionService(db)
    await tx_service.create_transaction(
        user_id=user.id,
        tx_type="deposit",
        amount=amount,
        status="completed",
        description=f"Пополнение администратором",
        is_visible=True,
    )
    
    return {"success": True, "user_id": user_id, "new_balance": user.balance}


@router.get("/pending-deposits")
async def get_pending_deposits(
    admin_tg_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get all pending deposits"""
    await verify_admin(admin_tg_id, db)
    
    result = await db.execute(
        select(Deposit)
        .where(Deposit.status == DepositStatus.PENDING.value)
        .order_by(Deposit.created_at.desc())
    )
    deposits = result.scalars().all()
    
    return [
        {
            "id": d.id,
            "user_id": d.user_id,
            "amount": d.amount,
            "created_at": d.created_at.isoformat(),
        }
        for d in deposits
    ]


@router.get("/pending-withdrawals")
async def get_pending_withdrawals(
    admin_tg_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get all pending withdrawals"""
    await verify_admin(admin_tg_id, db)
    
    result = await db.execute(
        select(Transaction)
        .where(Transaction.type == "withdraw")
        .where(Transaction.status == TransactionStatus.PENDING.value)
        .order_by(Transaction.created_at.desc())
    )
    transactions = result.scalars().all()
    
    return [
        {
            "id": t.id,
            "user_id": t.user_id,
            "amount": abs(t.amount),
            "created_at": t.created_at.isoformat(),
        }
        for t in transactions
    ]
