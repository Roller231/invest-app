from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.schemas.user import UserCreate, UserAuthRequest, UserUpdate, UserResponse, UserStats
from app.services.user_service import UserService
from app.models import Deposit
from app.utils.telegram import extract_user_from_init_data

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/auth", response_model=UserResponse)
async def auth_user(data: UserAuthRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate or register user from Telegram Mini App"""
    service = UserService(db)

    tg_user = None
    if data.init_data:
        tg_user = extract_user_from_init_data(data.init_data)

    if tg_user and tg_user.get("id"):
        create_data = UserCreate(
            tg_id=int(tg_user.get("id")),
            username=tg_user.get("username"),
            first_name=tg_user.get("first_name"),
            avatar_url=tg_user.get("photo_url"),
            referrer_tg_id=data.referrer_tg_id,
        )
    else:
        if not data.tg_id:
            raise HTTPException(status_code=400, detail="tg_id обязателен")
        create_data = UserCreate(
            tg_id=int(data.tg_id),
            username=data.username,
            first_name=data.first_name,
            avatar_url=data.avatar_url,
            referrer_tg_id=data.referrer_tg_id,
        )

    user, _is_new = await service.get_or_create(create_data)
    return user


@router.get("/{tg_id}", response_model=UserResponse)
async def get_user(tg_id: int, db: AsyncSession = Depends(get_db)):
    """Get user by Telegram ID"""
    service = UserService(db)
    user = await service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{tg_id}", response_model=UserResponse)
async def update_user(tg_id: int, data: UserUpdate, db: AsyncSession = Depends(get_db)):
    """Update user settings"""
    service = UserService(db)
    user = await service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await service.update(user, data)
    return user


@router.get("/{tg_id}/stats", response_model=UserStats)
async def get_user_stats(tg_id: int, db: AsyncSession = Depends(get_db)):
    """Get user statistics"""
    service = UserService(db)
    user = await service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    stats = await service.get_stats(user)
    return stats


@router.post("/{tg_id}/collect")
async def collect_accumulated(tg_id: int, db: AsyncSession = Depends(get_db)):
    """Collect accumulated profit to balance"""
    service = UserService(db)
    user = await service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.accumulated <= 0:
        raise HTTPException(status_code=400, detail="Nothing to collect")
    
    collected = await service.collect_accumulated(user)
    return {"collected": collected, "new_balance": user.balance}


@router.post("/{tg_id}/toggle-auto-reinvest")
async def toggle_auto_reinvest(tg_id: int, db: AsyncSession = Depends(get_db)):
    """Toggle auto-reinvest setting"""
    service = UserService(db)
    user = await service.get_by_tg_id(tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.auto_reinvest = not user.auto_reinvest
    active_deposit_result = await db.execute(
        select(Deposit)
        .where(Deposit.user_id == user.id)
        .where(Deposit.status.in_(["active", "acive"]))
        .order_by(Deposit.created_at.desc())
        .limit(1)
    )
    active_deposit = active_deposit_result.scalar_one_or_none()
    if active_deposit:
        active_deposit.auto_reinvest = user.auto_reinvest

    await db.commit()
    
    return {"auto_reinvest": user.auto_reinvest}
