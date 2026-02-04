from app.models.user import User
from app.models.tariff import Tariff
from app.models.deposit import Deposit
from app.models.transaction import Transaction
from app.models.referral import Referral
from app.models.fake_name import FakeName
from app.models.payment_requisite import PaymentRequisite
from app.models.promo import PromoCode, PromoRedemption

__all__ = [
    "User",
    "Tariff",
    "Deposit",
    "Transaction",
    "Referral",
    "FakeName",
    "PaymentRequisite",
    "PromoCode",
    "PromoRedemption",
]
