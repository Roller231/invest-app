from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base


class MarketRate(Base):
    __tablename__ = "market_rates"

    id = Column(Integer, primary_key=True, autoincrement=True)

    symbol = Column(String(32), unique=True, nullable=False, index=True, comment="Symbol, e.g. BTC")
    name = Column(String(100), nullable=True, comment="Display name")

    price_rub = Column(Float, nullable=False, default=0.0, comment="Price in RUB")
    change_24h = Column(Float, nullable=False, default=0.0, comment="Change percent over 24h")
    trend = Column(String(10), nullable=False, default="up", comment="up/down")

    is_active = Column(Boolean, default=True, comment="Active")
    sort_order = Column(Integer, default=0, comment="Sort order")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<MarketRate {self.symbol} {self.price_rub}₽>"

    def __str__(self):
        return f"{self.symbol}: {self.price_rub}₽"
