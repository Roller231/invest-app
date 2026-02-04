from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from typing import List, Optional
from datetime import datetime, timedelta
import random

from app.models import Transaction, User, FakeName
from app.models.transaction import TransactionType, TransactionStatus


class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_transaction(
        self,
        user_id: int,
        tx_type: str,
        amount: float,
        status: str = "pending",
        description: Optional[str] = None,
        is_visible: bool = True,
        is_fake: bool = False,
    ) -> Transaction:
        hash_code = f"Ha$h: {random.randint(1000, 9999)}"
        
        transaction = Transaction(
            user_id=user_id,
            type=tx_type,
            amount=amount,
            status=status,
            description=description,
            hash_code=hash_code,
            is_visible=is_visible,
            is_fake=is_fake,
        )
        
        self.db.add(transaction)
        await self.db.commit()
        await self.db.refresh(transaction)

        # Best-effort: push real transactions to global WS feed
        if is_visible and not is_fake:
            try:
                from app.live_ws import publish_transaction
                await publish_transaction(self.db, transaction)
            except Exception:
                pass
        
        return transaction
    
    async def get_user_transactions(
        self, 
        user_id: int, 
        tx_type: Optional[str] = None,
        limit: int = 50
    ) -> List[Transaction]:
        query = select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.is_fake == False,
        )
        
        if tx_type:
            query = query.where(Transaction.type == tx_type)
        
        query = query.order_by(Transaction.created_at.desc()).limit(limit)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_live_transactions(self, limit: int = 20) -> List[dict]:
        """Get mix of real and fake transactions for live feed"""
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.is_visible == True)
            .where(Transaction.status == TransactionStatus.COMPLETED.value)
            .where(Transaction.type.in_(["deposit", "withdraw"]))
            .order_by(Transaction.created_at.desc())
            .limit(limit // 2)
        )
        real_transactions = list(result.scalars().all())
        
        fake_transactions = await self._generate_fake_transactions(limit - len(real_transactions))
        
        all_transactions = []
        
        for tx in real_transactions:
            user = await self.db.get(User, tx.user_id)
            user_name = user.first_name or user.username or f"User_{user.tg_id}"
            
            all_transactions.append({
                "id": tx.id,
                "type": tx.type,
                "title": "Пополнение" if tx.type == "deposit" else "Вывод средств",
                "user_name": user_name,
                "amount": tx.amount,
                "hash_code": tx.hash_code,
                "time": tx.created_at.strftime("%H:%M"),
                "is_fake": False,
            })
        
        all_transactions.extend(fake_transactions)
        
        random.shuffle(all_transactions)
        
        return all_transactions[:limit]
    
    async def _generate_fake_transactions(self, count: int) -> List[dict]:
        """Generate fake transactions using user names or fake names"""
        result = await self.db.execute(
            select(User)
            .where(User.is_banned == False)
            .order_by(func.random())
            .limit(count // 2)
        )
        users = list(result.scalars().all())
        
        result = await self.db.execute(
            select(FakeName)
            .where(FakeName.is_active == True)
            .order_by(func.random())
            .limit(count - len(users))
        )
        fake_names = list(result.scalars().all())
        
        fake_transactions = []
        # Use timestamp + random to ensure unique IDs across calls
        import time
        base_id = int(time.time() * 1000) + random.randint(0, 999999)
        
        for i, user in enumerate(users):
            amount = random.choice([50, 71, 100, 108, 150, 200, 300, 500, 716, 1000, 2000, 5000])
            tx_type = random.choice(["deposit", "withdraw"])
            
            fake_transactions.append({
                "id": base_id + i,
                "type": tx_type,
                "title": "Пополнение" if tx_type == "deposit" else "Вывод средств",
                "user_name": user.first_name or user.username or f"User_{user.tg_id}",
                "amount": amount if tx_type == "deposit" else -amount,
                "hash_code": f"Ha$h: {random.randint(1000, 9999)}",
                "time": (datetime.utcnow() - timedelta(minutes=random.randint(1, 60))).strftime("%H:%M"),
                "is_fake": True,
            })
        
        for i, fake_name in enumerate(fake_names):
            amount = random.choice([50, 71, 100, 108, 150, 200, 300, 500, 716, 1000, 2000, 5000])
            tx_type = random.choice(["deposit", "withdraw"])
            
            fake_transactions.append({
                "id": base_id + len(users) + i,
                "type": tx_type,
                "title": "Пополнение" if tx_type == "deposit" else "Вывод средств",
                "user_name": fake_name.name,
                "amount": amount if tx_type == "deposit" else -amount,
                "hash_code": f"Ha$h: {random.randint(1000, 9999)}",
                "time": (datetime.utcnow() - timedelta(minutes=random.randint(1, 60))).strftime("%H:%M"),
                "is_fake": True,
            })
        
        return fake_transactions
    
    async def update_status(self, transaction_id: int, status: str) -> Optional[Transaction]:
        result = await self.db.execute(
            select(Transaction).where(Transaction.id == transaction_id)
        )
        transaction = result.scalar_one_or_none()
        
        if transaction:
            transaction.status = status
            await self.db.commit()
            await self.db.refresh(transaction)
        
        return transaction
