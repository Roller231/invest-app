from app.routers.users import router as users_router
from app.routers.tariffs import router as tariffs_router
from app.routers.deposits import router as deposits_router
from app.routers.transactions import router as transactions_router
from app.routers.referrals import router as referrals_router
from app.routers.admin import router as admin_router
from app.routers.ws import router as ws_router
from app.routers.payment_requisites import router as payment_requisites_router
from app.routers.promo import router as promo_router

__all__ = [
    "users_router",
    "tariffs_router",
    "deposits_router",
    "transactions_router",
    "referrals_router",
    "admin_router",
    "ws_router",
    "payment_requisites_router",
    "promo_router",
]
