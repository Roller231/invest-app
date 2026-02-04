from sqlalchemy import Column, BigInteger, String, Float, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tg_id = Column(BigInteger, unique=True, nullable=False, index=True, comment="Telegram ID")
    username = Column(String(255), nullable=True, comment="Telegram username")
    first_name = Column(String(255), nullable=True, comment="Имя пользователя")
    avatar_url = Column(String(512), nullable=True, comment="URL аватара")
    
    balance = Column(Float, default=0.0, comment="Текущий баланс")
    total_deposit = Column(Float, default=0.0, comment="Общая сумма депозитов")
    total_earned = Column(Float, default=0.0, comment="Всего заработано")
    accumulated = Column(Float, default=0.0, comment="Накоплено (ожидает сбора)")
    
    current_tariff_id = Column(Integer, ForeignKey("tariffs.id"), nullable=True, comment="Текущий тариф")
    auto_reinvest = Column(Boolean, default=False, comment="Авто-реинвест включен")
    
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=True, comment="Кто пригласил")
    referral_link = Column(String(255), nullable=True, comment="Реферальная ссылка")
    referral_earned = Column(Float, default=0.0, comment="Заработано с рефералов")
    
    is_banned = Column(Boolean, default=False, comment="Заблокирован")
    is_admin = Column(Boolean, default=False, comment="Администратор")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    current_tariff = relationship("Tariff", back_populates="users", foreign_keys=[current_tariff_id])
    referrer = relationship("User", remote_side=[id], back_populates="referrals", foreign_keys=[referrer_id])
    referrals = relationship("User", back_populates="referrer", foreign_keys=[referrer_id])
    
    deposits = relationship("Deposit", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    referral_records = relationship("Referral", back_populates="referrer", foreign_keys="Referral.referrer_id")
    
    def __repr__(self):
        return f"<User {self.tg_id} - {self.first_name or self.username}>"
    
    def __str__(self):
        return self.first_name or self.username or str(self.tg_id)
