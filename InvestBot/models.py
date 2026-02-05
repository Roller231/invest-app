from sqlalchemy import Column, BigInteger, String, Float, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Tariff(Base):
    __tablename__ = "tariffs"

    id = Column(Integer, primary_key=True, autoincrement=True)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tg_id = Column(BigInteger, unique=True, nullable=False, index=True)
    username = Column(String(255), nullable=True)
    first_name = Column(String(255), nullable=True)
    avatar_url = Column(String(512), nullable=True)
    
    balance = Column(Float, default=0.0)
    total_deposit = Column(Float, default=0.0)
    total_earned = Column(Float, default=0.0)
    accumulated = Column(Float, default=0.0)
    
    current_tariff_id = Column(Integer, ForeignKey("tariffs.id"), nullable=True)
    auto_reinvest = Column(Boolean, default=False)
    
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    referral_link = Column(String(255), nullable=True)
    referral_earned = Column(Float, default=0.0)
    
    is_banned = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Referral(Base):
    __tablename__ = "referrals"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    referred_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    level = Column(Integer, default=1)
    total_earned = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="pending")
    description = Column(String(512), nullable=True)
    hash_code = Column(String(255), nullable=True)
    is_fake = Column(Boolean, default=False)
    is_visible = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
