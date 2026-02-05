from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse

from app.models import User, Tariff, Deposit, Transaction, Referral, FakeName, PaymentRequisite, PromoCode, PromoRedemption, MarketRate
from app.config import settings


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
        
        if username == "admin" and password == settings.SECRET_KEY:
            request.session.update({"authenticated": True})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return request.session.get("authenticated", False)


class UserAdmin(ModelView, model=User):
    name = "Пользователь"
    name_plural = "Пользователи"
    icon = "fa-solid fa-user"
    
    column_list = [
        User.id, User.tg_id, User.first_name, User.username,
        User.balance, User.total_deposit, User.total_earned,
        User.current_tariff, User.auto_reinvest, User.is_admin, User.created_at
    ]
    
    column_searchable_list = [User.tg_id, User.username, User.first_name]
    column_sortable_list = [User.id, User.tg_id, User.balance, User.total_deposit, User.created_at]
    column_default_sort = [("created_at", True)]
    
    column_labels = {
        User.id: "ID",
        User.tg_id: "Telegram ID",
        User.first_name: "Имя",
        User.username: "Username",
        User.avatar_url: "Аватар URL",
        User.balance: "Баланс",
        User.total_deposit: "Всего депозитов",
        User.total_earned: "Всего заработано",
        User.accumulated: "Накоплено",
        User.current_tariff: "Текущий тариф",
        User.auto_reinvest: "Авто-реинвест",
        User.referrer: "Пригласил",
        User.referral_link: "Реф. ссылка",
        User.referral_earned: "Заработок с рефералов",
        User.is_banned: "Заблокирован",
        User.is_admin: "Админ",
        User.created_at: "Создан",
        User.updated_at: "Обновлён",
    }
    
    form_columns = [
        User.tg_id, User.username, User.first_name, User.avatar_url,
        User.balance, User.total_deposit, User.total_earned, User.accumulated,
        User.current_tariff, User.auto_reinvest, User.referrer,
        User.is_banned, User.is_admin
    ]
    
    can_create = True
    can_edit = True
    can_delete = True


class MarketRateAdmin(ModelView, model=MarketRate):
    name = "Курс"
    name_plural = "Курсы"
    icon = "fa-solid fa-chart-line"

    column_list = [
        MarketRate.id,
        MarketRate.symbol,
        MarketRate.name,
        MarketRate.price_rub,
        MarketRate.change_24h,
        MarketRate.trend,
        MarketRate.is_active,
        MarketRate.sort_order,
        MarketRate.updated_at,
    ]

    column_searchable_list = [MarketRate.symbol, MarketRate.name]
    column_sortable_list = [MarketRate.id, MarketRate.symbol, MarketRate.price_rub, MarketRate.sort_order, MarketRate.updated_at]
    column_default_sort = [("sort_order", False)]

    form_columns = [
        MarketRate.symbol,
        MarketRate.name,
        MarketRate.price_rub,
        MarketRate.change_24h,
        MarketRate.trend,
        MarketRate.is_active,
        MarketRate.sort_order,
    ]

    can_create = True
    can_edit = True
    can_delete = True


class PromoCodeAdmin(ModelView, model=PromoCode):
    name = "Промокод"
    name_plural = "Промокоды"
    icon = "fa-solid fa-ticket"

    column_list = [
        PromoCode.id,
        PromoCode.code,
        PromoCode.amount,
        PromoCode.is_active,
        PromoCode.max_uses_total,
        PromoCode.max_uses_per_user,
        PromoCode.valid_from,
        PromoCode.valid_to,
        PromoCode.created_at,
    ]

    column_searchable_list = [PromoCode.code]
    column_sortable_list = [PromoCode.id, PromoCode.amount, PromoCode.created_at]
    column_default_sort = [("created_at", True)]

    form_columns = [
        PromoCode.code,
        PromoCode.amount,
        PromoCode.description,
        PromoCode.is_active,
        PromoCode.max_uses_total,
        PromoCode.max_uses_per_user,
        PromoCode.valid_from,
        PromoCode.valid_to,
    ]

    can_create = True
    can_edit = True
    can_delete = True


class PromoRedemptionAdmin(ModelView, model=PromoRedemption):
    name = "Активация промокода"
    name_plural = "Активации промокодов"
    icon = "fa-solid fa-clipboard-check"

    column_list = [
        PromoRedemption.id,
        PromoRedemption.promo_code,
        PromoRedemption.user,
        PromoRedemption.amount,
        PromoRedemption.redeemed_at,
    ]

    column_sortable_list = [PromoRedemption.id, PromoRedemption.amount, PromoRedemption.redeemed_at]
    column_default_sort = [("redeemed_at", True)]

    can_create = False
    can_edit = False
    can_delete = False
    can_view_details = True


class TariffAdmin(ModelView, model=Tariff):
    name = "Тариф"
    name_plural = "Тарифы"
    icon = "fa-solid fa-percent"
    
    column_list = [
        Tariff.id, Tariff.name, Tariff.label, Tariff.daily_percent,
        Tariff.min_amount, Tariff.max_amount, Tariff.color, 
        Tariff.is_active, Tariff.sort_order
    ]
    
    column_sortable_list = [Tariff.id, Tariff.sort_order, Tariff.daily_percent, Tariff.min_amount]
    column_default_sort = [("sort_order", False)]
    
    column_labels = {
        Tariff.id: "ID",
        Tariff.name: "Название",
        Tariff.label: "Описание",
        Tariff.daily_percent: "% в день",
        Tariff.min_amount: "Мин. сумма",
        Tariff.max_amount: "Макс. сумма",
        Tariff.color: "Цвет",
        Tariff.is_active: "Активен",
        Tariff.sort_order: "Порядок",
        Tariff.created_at: "Создан",
        Tariff.updated_at: "Обновлён",
    }
    
    form_columns = [
        Tariff.name, Tariff.label, Tariff.daily_percent,
        Tariff.min_amount, Tariff.max_amount, Tariff.color,
        Tariff.is_active, Tariff.sort_order
    ]
    
    can_create = True
    can_edit = True
    can_delete = True


class DepositAdmin(ModelView, model=Deposit):
    name = "Депозит"
    name_plural = "Депозиты"
    icon = "fa-solid fa-money-bill-trend-up"
    
    column_list = [
        Deposit.id, Deposit.user, Deposit.tariff, Deposit.amount,
        Deposit.earned, Deposit.status, Deposit.is_reinvest,
        Deposit.auto_reinvest, Deposit.next_payout_at, Deposit.created_at
    ]
    
    column_searchable_list = [Deposit.status]
    column_sortable_list = [Deposit.id, Deposit.amount, Deposit.created_at, Deposit.next_payout_at]
    column_default_sort = [("created_at", True)]
    
    column_labels = {
        Deposit.id: "ID",
        Deposit.user: "Пользователь",
        Deposit.tariff: "Тариф",
        Deposit.amount: "Сумма",
        Deposit.earned: "Заработано",
        Deposit.status: "Статус",
        Deposit.is_reinvest: "Реинвест",
        Deposit.auto_reinvest: "Авто-реинвест",
        Deposit.started_at: "Начат",
        Deposit.next_payout_at: "След. выплата",
        Deposit.completed_at: "Завершён",
        Deposit.created_at: "Создан",
        Deposit.updated_at: "Обновлён",
    }
    
    form_columns = [
        Deposit.user, Deposit.tariff, Deposit.amount, Deposit.earned,
        Deposit.status, Deposit.is_reinvest, Deposit.auto_reinvest,
        Deposit.started_at, Deposit.next_payout_at, Deposit.completed_at
    ]
    
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True


class TransactionAdmin(ModelView, model=Transaction):
    name = "Транзакция"
    name_plural = "Транзакции"
    icon = "fa-solid fa-exchange-alt"
    
    column_list = [
        Transaction.id, Transaction.user, Transaction.type, 
        Transaction.amount, Transaction.status, Transaction.hash_code,
        Transaction.is_fake, Transaction.is_visible, Transaction.created_at
    ]
    
    column_searchable_list = [Transaction.type, Transaction.status, Transaction.hash_code]
    column_sortable_list = [Transaction.id, Transaction.amount, Transaction.created_at]
    column_default_sort = [("created_at", True)]
    
    column_labels = {
        Transaction.id: "ID",
        Transaction.user: "Пользователь",
        Transaction.type: "Тип",
        Transaction.amount: "Сумма",
        Transaction.status: "Статус",
        Transaction.description: "Описание",
        Transaction.hash_code: "Хэш",
        Transaction.is_fake: "Фейк",
        Transaction.is_visible: "Видимый",
        Transaction.created_at: "Создан",
        Transaction.updated_at: "Обновлён",
    }
    
    form_columns = [
        Transaction.user, Transaction.type, Transaction.amount,
        Transaction.status, Transaction.description, Transaction.hash_code,
        Transaction.is_fake, Transaction.is_visible
    ]
    
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True


class ReferralAdmin(ModelView, model=Referral):
    name = "Реферал"
    name_plural = "Рефералы"
    icon = "fa-solid fa-users"
    
    column_list = [
        Referral.id, Referral.referrer, Referral.referred,
        Referral.level, Referral.total_earned, Referral.created_at
    ]
    
    column_sortable_list = [Referral.id, Referral.level, Referral.total_earned, Referral.created_at]
    column_default_sort = [("created_at", True)]
    
    column_labels = {
        Referral.id: "ID",
        Referral.referrer: "Пригласил",
        Referral.referred: "Приглашённый",
        Referral.level: "Уровень",
        Referral.total_earned: "Заработано",
        Referral.created_at: "Создан",
        Referral.updated_at: "Обновлён",
    }
    
    form_columns = [
        Referral.referrer, Referral.referred, Referral.level, Referral.total_earned
    ]
    
    can_create = True
    can_edit = True
    can_delete = True


class FakeNameAdmin(ModelView, model=FakeName):
    name = "Фейк-имя"
    name_plural = "Фейк-имена"
    icon = "fa-solid fa-mask"
    
    column_list = [FakeName.id, FakeName.name, FakeName.is_active]
    column_sortable_list = [FakeName.id, FakeName.name]
    
    column_labels = {
        FakeName.id: "ID",
        FakeName.name: "Имя",
        FakeName.is_active: "Активно",
    }
    
    form_columns = [FakeName.name, FakeName.is_active]
    
    can_create = True
    can_edit = True
    can_delete = True


class PaymentRequisiteAdmin(ModelView, model=PaymentRequisite):
    name = "Реквизит"
    name_plural = "Реквизиты для оплаты"
    icon = "fa-solid fa-credit-card"
    
    column_list = [
        PaymentRequisite.id, PaymentRequisite.name, PaymentRequisite.type,
        PaymentRequisite.details, PaymentRequisite.holder_name, PaymentRequisite.bank_name,
        PaymentRequisite.is_active, PaymentRequisite.sort_order
    ]
    
    column_sortable_list = [PaymentRequisite.id, PaymentRequisite.sort_order, PaymentRequisite.name]
    column_default_sort = [("sort_order", False)]
    
    column_labels = {
        PaymentRequisite.id: "ID",
        PaymentRequisite.name: "Название",
        PaymentRequisite.type: "Тип (card/sbp/crypto)",
        PaymentRequisite.details: "Реквизиты",
        PaymentRequisite.holder_name: "Имя получателя",
        PaymentRequisite.bank_name: "Банк",
        PaymentRequisite.icon: "Иконка",
        PaymentRequisite.color: "Цвет",
        PaymentRequisite.is_active: "Активен",
        PaymentRequisite.sort_order: "Порядок",
        PaymentRequisite.created_at: "Создан",
        PaymentRequisite.updated_at: "Обновлён",
    }
    
    form_columns = [
        PaymentRequisite.name, PaymentRequisite.type, PaymentRequisite.details,
        PaymentRequisite.holder_name, PaymentRequisite.bank_name,
        PaymentRequisite.icon, PaymentRequisite.color,
        PaymentRequisite.is_active, PaymentRequisite.sort_order
    ]
    
    can_create = True
    can_edit = True
    can_delete = True


def setup_admin(app, engine):
    """Setup SQLAdmin with all models"""
    authentication_backend = AdminAuth(secret_key=settings.SECRET_KEY)
    
    admin = Admin(
        app, 
        engine,
        authentication_backend=authentication_backend,
        title="Invest App Admin",
        base_url="/admin",
    )
    
    admin.add_view(UserAdmin)
    admin.add_view(TariffAdmin)
    admin.add_view(DepositAdmin)
    admin.add_view(TransactionAdmin)
    admin.add_view(ReferralAdmin)
    admin.add_view(FakeNameAdmin)
    admin.add_view(PaymentRequisiteAdmin)
    admin.add_view(MarketRateAdmin)
    admin.add_view(PromoCodeAdmin)
    admin.add_view(PromoRedemptionAdmin)
    
    return admin
