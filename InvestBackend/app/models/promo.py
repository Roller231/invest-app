from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id = Column(Integer, primary_key=True, autoincrement=True)

    code = Column(String(50), unique=True, nullable=False, index=True, comment="Промокод")
    amount = Column(Float, nullable=False, comment="Сумма начисления")
    description = Column(String(255), nullable=True, comment="Описание")

    is_active = Column(Boolean, default=True, comment="Активен")

    max_uses_total = Column(Integer, nullable=True, comment="Макс. использований всего")
    max_uses_per_user = Column(Integer, default=1, comment="Макс. использований на пользователя")

    valid_from = Column(DateTime(timezone=True), nullable=True, comment="Дата начала")
    valid_to = Column(DateTime(timezone=True), nullable=True, comment="Дата окончания")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    redemptions = relationship("PromoRedemption", back_populates="promo_code", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<PromoCode #{self.id} {self.code}>"


class PromoRedemption(Base):
    __tablename__ = "promo_redemptions"

    id = Column(Integer, primary_key=True, autoincrement=True)

    promo_code_id = Column(Integer, ForeignKey("promo_codes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    amount = Column(Float, nullable=False, comment="Сумма начисления")

    redeemed_at = Column(DateTime(timezone=True), server_default=func.now())

    promo_code = relationship("PromoCode", back_populates="redemptions")
    user = relationship("User")

    def __repr__(self):
        return f"<PromoRedemption #{self.id} promo={self.promo_code_id} user={self.user_id}>"
