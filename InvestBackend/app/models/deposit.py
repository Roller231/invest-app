from sqlalchemy import Column, Integer, Float, Boolean, DateTime, ForeignKey, String, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class DepositStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Deposit(Base):
    __tablename__ = "deposits"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, comment="Пользователь")
    tariff_id = Column(Integer, ForeignKey("tariffs.id"), nullable=False, comment="Тариф")
    
    amount = Column(Float, nullable=False, comment="Сумма депозита")
    earned = Column(Float, default=0.0, comment="Заработано с этого депозита")
    status = Column(String(20), default=DepositStatus.PENDING.value, comment="Статус")
    
    is_reinvest = Column(Boolean, default=False, comment="Это реинвест")
    auto_reinvest = Column(Boolean, default=False, comment="Авто-реинвест после завершения")
    
    started_at = Column(DateTime(timezone=True), nullable=True, comment="Когда начался")
    next_payout_at = Column(DateTime(timezone=True), nullable=True, comment="Следующая выплата")
    completed_at = Column(DateTime(timezone=True), nullable=True, comment="Когда завершён")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="deposits")
    tariff = relationship("Tariff", back_populates="deposits")
    
    def __repr__(self):
        return f"<Deposit #{self.id} - {self.amount}₽ ({self.status})>"
    
    def __str__(self):
        return f"Депозит #{self.id} - {self.amount}₽"
