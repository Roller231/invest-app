from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from typing import Optional
from models import User, Referral, Transaction
from config import settings


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_tg_id(self, tg_id: int) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.tg_id == tg_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> Optional[User]:
        clean_username = username.lstrip("@").lower()
        result = await self.db.execute(
            select(User).where(User.username.ilike(clean_username))
        )
        return result.scalar_one_or_none()
    
    async def get_by_tg_id_or_username(self, identifier: str) -> Optional[User]:
        """Find user by tg_id (if numeric) or username"""
        if identifier.isdigit():
            return await self.get_by_tg_id(int(identifier))
        else:
            return await self.get_by_username(identifier)
    
    async def user_exists(self, tg_id: int) -> bool:
        user = await self.get_by_tg_id(tg_id)
        return user is not None
    
    async def create_user(
        self,
        tg_id: int,
        username: Optional[str] = None,
        first_name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        referrer_tg_id: Optional[int] = None,
    ) -> tuple[User, bool]:
        """
        Create new user with referral logic.
        Returns (user, is_new).
        
        Referral rules:
        - Cannot refer yourself
        - Cannot refer already registered user
        - Referrer must exist
        """
        existing = await self.get_by_tg_id(tg_id)
        if existing:
            if username and username != existing.username:
                existing.username = username
            if first_name and first_name != existing.first_name:
                existing.first_name = first_name
            if avatar_url and avatar_url != existing.avatar_url:
                existing.avatar_url = avatar_url
            await self.db.commit()
            return existing, False
        
        is_admin = tg_id in settings.admin_tg_ids_list
        
        user = User(
            tg_id=tg_id,
            username=username,
            first_name=first_name,
            avatar_url=avatar_url,
            is_admin=is_admin,
            referral_link=f"https://t.me/{settings.BOT_USERNAME}?start={tg_id}",
        )
        
        if referrer_tg_id and referrer_tg_id != tg_id:
            referrer = await self.get_by_tg_id(referrer_tg_id)
            if referrer:
                user.referrer_id = referrer.id
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        if user.referrer_id:
            referral = Referral(
                referrer_id=user.referrer_id,
                referred_id=user.id,
                level=1,
            )
            self.db.add(referral)
            await self.db.commit()
            
            await self._create_chain_referrals(user)
        
        return user, True
    
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
    
    async def add_balance(self, user: User, amount: float, description: str = "Пополнение администратором") -> User:
        """Add balance to user and create transaction"""
        user.balance += amount
        
        transaction = Transaction(
            user_id=user.id,
            type="deposit",
            amount=amount,
            status="completed",
            description=description,
            is_visible=True,
        )
        self.db.add(transaction)
        
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def get_referrals_count(self, user: User) -> dict:
        """Get referral statistics for user"""
        result = await self.db.execute(
            select(Referral).where(Referral.referrer_id == user.id)
        )
        referrals = result.scalars().all()
        
        level1 = sum(1 for r in referrals if r.level == 1)
        level2 = sum(1 for r in referrals if r.level == 2)
        level3 = sum(1 for r in referrals if r.level == 3)
        
        return {
            "level1": level1,
            "level2": level2,
            "level3": level3,
            "total": len(referrals),
        }
    
    async def is_admin(self, tg_id: int) -> bool:
        """Check if user is admin (from DB or config)"""
        if tg_id in settings.admin_tg_ids_list:
            return True
        
        user = await self.get_by_tg_id(tg_id)
        return user is not None and user.is_admin
