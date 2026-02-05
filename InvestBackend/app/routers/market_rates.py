from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.market_rate import MarketRate

router = APIRouter(prefix="/market-rates", tags=["MarketRates"])


@router.get("")
async def get_market_rates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MarketRate)
        .where(MarketRate.is_active == True)  # noqa: E712
        .order_by(MarketRate.sort_order.asc(), MarketRate.symbol.asc())
    )
    items = result.scalars().all()
    return [
        {
            "id": i.id,
            "symbol": i.symbol,
            "name": i.name,
            "price_rub": i.price_rub,
            "change_24h": i.change_24h,
            "trend": i.trend,
            "updated_at": i.updated_at.isoformat() if i.updated_at else None,
        }
        for i in items
    ]
