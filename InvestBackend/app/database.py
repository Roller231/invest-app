from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import create_engine
import pymysql
import asyncio
from sqlalchemy.exc import OperationalError
from app.config import settings


class Base(DeclarativeBase):
    pass


async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=3600,
)

sync_engine = create_engine(
    settings.DATABASE_URL_SYNC,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=3600,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def create_database_if_not_exists():
    """Create database if it doesn't exist"""
    db_url = settings.DATABASE_URL_SYNC
    db_name = db_url.split("/")[-1].split("?")[0]
    base_url = db_url.rsplit("/", 1)[0]
    
    temp_engine = create_engine(base_url + "/mysql")
    with temp_engine.connect() as conn:
        conn.execute(pymysql.cursors.DictCursor)
        conn.exec_driver_sql(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    temp_engine.dispose()


async def init_db():
    """Initialize database and create all tables"""
    from app.models import User, Tariff, Deposit, Transaction, Referral, FakeName, PromoCode, PromoRedemption, MarketRate

    # Wait for DB to be reachable (docker / cold start)
    for _ in range(30):
        try:
            async with async_engine.connect():
                break
        except OperationalError:
            await asyncio.sleep(1)
    
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        result = await session.execute(select(Tariff))
        tariffs = result.scalars().all()
        
        if not tariffs:
            default_tariffs = [
                Tariff(
                    name="OKX",
                    label="Для новых пользователей",
                    daily_percent=3.2,
                    min_amount=100,
                    max_amount=10000,
                    color="#848E9C",
                    is_active=True,
                    sort_order=1
                ),
                Tariff(
                    name="Bybit",
                    label="Рекомендован",
                    daily_percent=4.2,
                    min_amount=10000,
                    max_amount=100000,
                    color="#F7A600",
                    is_active=True,
                    sort_order=2
                ),
                Tariff(
                    name="Binance",
                    label="Приватный",
                    daily_percent=5.2,
                    min_amount=100000,
                    max_amount=5000000,
                    color="#FCD535",
                    is_active=True,
                    sort_order=3
                ),
            ]
            session.add_all(default_tariffs)
            
            fake_names = [
                FakeName(name="Александр"), FakeName(name="Максим"), FakeName(name="Дмитрий"),
                FakeName(name="Иван"), FakeName(name="Артём"), FakeName(name="Никита"),
                FakeName(name="Михаил"), FakeName(name="Даниил"), FakeName(name="Егор"),
                FakeName(name="Андрей"), FakeName(name="Кирилл"), FakeName(name="Илья"),
                FakeName(name="Алексей"), FakeName(name="Роман"), FakeName(name="Сергей"),
                FakeName(name="Владимир"), FakeName(name="Тимофей"), FakeName(name="Матвей"),
                FakeName(name="Арсений"), FakeName(name="Денис"), FakeName(name="Константин"),
                FakeName(name="Витек"), FakeName(name="Олег"), FakeName(name="Павел"),
            ]
            session.add_all(fake_names)
            
            await session.commit()

        rates_result = await session.execute(select(MarketRate))
        rates = rates_result.scalars().all()
        if not rates:
            session.add_all(
                [
                    MarketRate(symbol="SOL", name="Solana", price_rub=7164.80, change_24h=-6.45, trend="down", sort_order=1),
                    MarketRate(symbol="BTC", name="Bitcoin", price_rub=5607600.00, change_24h=-7.61, trend="down", sort_order=2),
                    MarketRate(symbol="BNB", name="BNB", price_rub=54280.00, change_24h=-9.47, trend="down", sort_order=3),
                    MarketRate(symbol="USDT", name="Tether", price_rub=79.86, change_24h=-0.02, trend="down", sort_order=4),
                    MarketRate(symbol="ETH", name="Ethereum", price_rub=165297.60, change_24h=-7.70, trend="down", sort_order=5),
                    MarketRate(symbol="TON", name="Toncoin", price_rub=110.40, change_24h=-0.63, trend="down", sort_order=6),
                ]
            )
            await session.commit()

        promo_result = await session.execute(select(PromoCode))
        promos = promo_result.scalars().all()
        if not promos:
            session.add(
                PromoCode(
                    code="NG2026",
                    amount=100,
                    description="Бонусный промокод",
                    is_active=True,
                    max_uses_total=None,
                    max_uses_per_user=1,
                )
            )
            await session.commit()
