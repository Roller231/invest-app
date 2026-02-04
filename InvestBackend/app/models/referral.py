from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Referral(Base):
    __tablename__ = "referrals"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=False, comment="Кто пригласил")
    referred_id = Column(Integer, ForeignKey("users.id"), nullable=False, comment="Кого пригласили")
    level = Column(Integer, default=1, comment="Уровень реферала (1, 2 или 3)")
    
    total_earned = Column(Float, default=0.0, comment="Всего заработано с этого реферала")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    referrer = relationship("User", foreign_keys=[referrer_id], back_populates="referral_records")
    referred = relationship("User", foreign_keys=[referred_id])
    
    def __repr__(self):
        return f"<Referral {self.referrer_id} -> {self.referred_id} (L{self.level})>"
    
    def __str__(self):
        return f"Реферал уровня {self.level}"
