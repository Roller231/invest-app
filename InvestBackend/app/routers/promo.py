from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import User
from app.models.promo import PromoCode, PromoRedemption
from app.schemas.promo import PromoActivateRequest, PromoActivateResponse
from app.services.transaction_service import TransactionService
from app.services.user_service import UserService


router = APIRouter(prefix="/promo", tags=["Promo"])


@router.post("/{tg_id}/activate", response_model=PromoActivateResponse)
async def activate_promo(
    tg_id: int,
    data: PromoActivateRequest,
    db: AsyncSession = Depends(get_db),
):
    user_service = UserService(db)
    user = await user_service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    code = (data.code or "").strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Введите промокод")

    res = await db.execute(select(PromoCode).where(func.upper(PromoCode.code) == code))
    promo = res.scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=404, detail="Промокод не найден")

    if not promo.is_active:
        raise HTTPException(status_code=400, detail="Промокод неактивен")

    now = datetime.utcnow()
    if promo.valid_from and now < promo.valid_from.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="Промокод еще не активен")
    if promo.valid_to and now > promo.valid_to.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="Срок действия промокода истек")

    # total uses
    if promo.max_uses_total is not None:
        total_uses_res = await db.execute(
            select(func.count(PromoRedemption.id)).where(PromoRedemption.promo_code_id == promo.id)
        )
        total_uses = int(total_uses_res.scalar() or 0)
        if total_uses >= promo.max_uses_total:
            raise HTTPException(status_code=400, detail="Лимит использований промокода исчерпан")

    # per-user uses
    per_user_res = await db.execute(
        select(func.count(PromoRedemption.id))
        .where(PromoRedemption.promo_code_id == promo.id)
        .where(PromoRedemption.user_id == user.id)
    )
    per_user_uses = int(per_user_res.scalar() or 0)
    if promo.max_uses_per_user is not None and per_user_uses >= promo.max_uses_per_user:
        raise HTTPException(status_code=400, detail="Промокод уже использован")

    amount = float(promo.amount or 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Некорректная сумма промокода")

    user.balance += amount
    db.add(
        PromoRedemption(
            promo_code_id=promo.id,
            user_id=user.id,
            amount=amount,
        )
    )
    await db.commit()

    tx_service = TransactionService(db)
    await tx_service.create_transaction(
        user_id=user.id,
        tx_type="bonus",
        amount=amount,
        status="completed",
        description=f"Промокод {promo.code} (+{amount}₽)",
        is_visible=True,
    )

    # refresh user to return correct balance
    user = await db.get(User, user.id)

    return PromoActivateResponse(
        success=True,
        code=promo.code,
        amount=amount,
        new_balance=user.balance,
        message="Промокод активирован",
    )
