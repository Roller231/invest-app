from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class TransactionType(str, enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAW = "withdraw"
    PROFIT = "profit"
    REINVEST = "reinvest"
    REFERRAL = "referral"
    BONUS = "bonus"


class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, comment="Пользователь")
    
    type = Column(String(20), nullable=False, comment="Тип транзакции")
    amount = Column(Float, nullable=False, comment="Сумма (+ или -)")
    status = Column(String(20), default=TransactionStatus.PENDING.value, comment="Статус")
    
    description = Column(String(500), nullable=True, comment="Описание")
    hash_code = Column(String(50), nullable=True, comment="Хэш транзакции")
    
    is_fake = Column(Boolean, default=False, comment="Фейковая транзакция для ленты")
    is_visible = Column(Boolean, default=True, comment="Показывать в live ленте")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="transactions")
    
    def __repr__(self):
        return f"<Transaction #{self.id} {self.type} {self.amount}₽>"
    
    def __str__(self):
        sign = "+" if self.amount > 0 else ""
        return f"{self.type}: {sign}{self.amount}₽"
