import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.config import settings
from app.database import init_db, sync_engine
from app.live_ws import live_broadcaster
from app.admin import setup_admin
from app.routers import (
    users_router,
    tariffs_router,
    deposits_router,
    transactions_router,
    referrals_router,
    admin_router,
    ws_router,
    payment_requisites_router,
    promo_router,
    market_rates_router,
)
from app.services.payout_service import run_payout_job


scheduler = AsyncIOScheduler()
live_stop_event = asyncio.Event()
live_task: asyncio.Task | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Invest App Backend...")
    
    await init_db()
    print("✅ Database initialized")

    global live_task
    live_task = asyncio.create_task(live_broadcaster(live_stop_event))
    print("✅ Live WS broadcaster started")
    
    scheduler.add_job(
        run_payout_job,
        trigger=IntervalTrigger(minutes=1),
        id="payout_job",
        name="Process payouts every 1 minute",
        replace_existing=True,
    )
    scheduler.start()
    print("✅ Scheduler started")
    
    yield

    live_stop_event.set()
    if live_task:
        try:
            await live_task
        except Exception:
            pass
    
    scheduler.shutdown()
    print("👋 Shutting down...")


app = FastAPI(
    title="Invest App API",
    description="Backend API for Telegram Mini App Investment Simulator",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router, prefix="/api")
app.include_router(tariffs_router, prefix="/api")
app.include_router(deposits_router, prefix="/api")
app.include_router(transactions_router, prefix="/api")
app.include_router(referrals_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(ws_router, prefix="/api")
app.include_router(payment_requisites_router, prefix="/api")
app.include_router(promo_router, prefix="/api")
app.include_router(market_rates_router, prefix="/api")

setup_admin(app, sync_engine)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Invest App API is running",
        "docs": "/docs",
        "admin": "/admin",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
