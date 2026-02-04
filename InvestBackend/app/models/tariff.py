from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Tariff(Base):
    __tablename__ = "tariffs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, comment="Название тарифа")
    label = Column(String(255), nullable=True, comment="Описание/подпись")
    daily_percent = Column(Float, nullable=False, comment="Процент в день")
    min_amount = Column(Float, nullable=False, comment="Минимальная сумма")
    max_amount = Column(Float, nullable=False, comment="Максимальная сумма")
    color = Column(String(20), default="#FCD535", comment="Цвет для UI")
    is_active = Column(Boolean, default=True, comment="Активен")
    sort_order = Column(Integer, default=0, comment="Порядок сортировки")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    users = relationship("User", back_populates="current_tariff", foreign_keys="User.current_tariff_id")
    deposits = relationship("Deposit", back_populates="tariff")
    
    def __repr__(self):
        return f"<Tariff {self.name} ({self.daily_percent}%)>"
    
    def __str__(self):
        return f"{self.name} (+{self.daily_percent}%)"
