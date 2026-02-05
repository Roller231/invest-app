import asyncio
import logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command, CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties

from config import settings
from database import AsyncSessionLocal
from services import UserService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(token=settings.BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()


def get_main_keyboard(user_tg_id: int) -> InlineKeyboardMarkup:
    """Main keyboard with WebApp button"""
    buttons = [
        [InlineKeyboardButton(
            text="🚀 Открыть приложение",
            web_app=WebAppInfo(url=f"{settings.WEBAPP_URL}?ref={user_tg_id}")
        )],
        [InlineKeyboardButton(
            text="👥 Мои рефералы",
            callback_data="my_referrals"
        )],
        [InlineKeyboardButton(
            text="🔗 Моя реферальная ссылка",
            callback_data="my_ref_link"
        )],
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    """
    Handle /start command with optional referral parameter.
    
    /start - regular start
    /start 123456789 - start with referral (123456789 is referrer's tg_id)
    """
    tg_user = message.from_user
    referrer_tg_id = None
    
    args = message.text.split(maxsplit=1)
    if len(args) > 1:
        ref_param = args[1].strip()
        if ref_param.isdigit():
            referrer_tg_id = int(ref_param)
    
    async with AsyncSessionLocal() as db:
        service = UserService(db)
        
        existing_user = await service.get_by_tg_id(tg_user.id)
        
        if existing_user:
            await message.answer(
                f"👋 С возвращением, <b>{existing_user.first_name or existing_user.username or 'друг'}</b>!\n\n"
                f"💰 Ваш баланс: <b>{existing_user.balance:,.2f} ₽</b>\n\n"
                "Нажмите кнопку ниже, чтобы открыть приложение:",
                reply_markup=get_main_keyboard(tg_user.id)
            )
            return
        
        if referrer_tg_id:
            if referrer_tg_id == tg_user.id:
                referrer_tg_id = None
                logger.info(f"User {tg_user.id} tried to refer themselves")
        
        user, is_new = await service.create_user(
            tg_id=tg_user.id,
            username=tg_user.username,
            first_name=tg_user.first_name,
            avatar_url=None,
            referrer_tg_id=referrer_tg_id,
        )
        
        if is_new:
            welcome_text = (
                f"🎉 Добро пожаловать, <b>{user.first_name or user.username or 'друг'}</b>!\n\n"
                "Вы успешно зарегистрированы в нашей инвестиционной платформе.\n\n"
            )
            
            if user.referrer_id:
                referrer = await service.get_by_id(user.referrer_id)
                if referrer:
                    welcome_text += f"👤 Вас пригласил: <b>{referrer.first_name or referrer.username or referrer.tg_id}</b>\n\n"
                    
                    try:
                        await bot.send_message(
                            referrer.tg_id,
                            f"🎊 У вас новый реферал!\n\n"
                            f"👤 <b>{user.first_name or user.username or user.tg_id}</b> зарегистрировался по вашей ссылке."
                        )
                    except Exception as e:
                        logger.warning(f"Could not notify referrer {referrer.tg_id}: {e}")
            
            welcome_text += (
                "💡 <b>Что вы можете делать:</b>\n"
                "• Инвестировать и получать до 5.2% в день\n"
                "• Приглашать друзей и получать до 31% с их депозитов\n"
                "• Выводить средства на карту\n\n"
                "Нажмите кнопку ниже, чтобы начать:"
            )
            
            await message.answer(welcome_text, reply_markup=get_main_keyboard(tg_user.id))
        else:
            await message.answer(
                f"👋 С возвращением, <b>{user.first_name or user.username or 'друг'}</b>!\n\n"
                f"💰 Ваш баланс: <b>{user.balance:,.2f} ₽</b>\n\n"
                "Нажмите кнопку ниже, чтобы открыть приложение:",
                reply_markup=get_main_keyboard(tg_user.id)
            )


@dp.callback_query(F.data == "my_referrals")
async def callback_my_referrals(callback: types.CallbackQuery):
    """Show user's referral statistics"""
    async with AsyncSessionLocal() as db:
        service = UserService(db)
        user = await service.get_by_tg_id(callback.from_user.id)
        
        if not user:
            await callback.answer("Пользователь не найден", show_alert=True)
            return
        
        stats = await service.get_referrals_count(user)
        
        text = (
            "👥 <b>Ваши рефералы:</b>\n\n"
            f"📊 Уровень 1: <b>{stats['level1']}</b> чел. (15%)\n"
            f"📊 Уровень 2: <b>{stats['level2']}</b> чел. (10%)\n"
            f"📊 Уровень 3: <b>{stats['level3']}</b> чел. (6%)\n\n"
            f"👤 Всего рефералов: <b>{stats['total']}</b>\n"
            f"💰 Заработано с рефералов: <b>{user.referral_earned:,.2f} ₽</b>"
        )
        
        await callback.message.edit_text(
            text,
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_main")]
            ])
        )
        await callback.answer()


@dp.callback_query(F.data == "my_ref_link")
async def callback_my_ref_link(callback: types.CallbackQuery):
    """Show user's referral link"""
    async with AsyncSessionLocal() as db:
        service = UserService(db)
        user = await service.get_by_tg_id(callback.from_user.id)
        
        if not user:
            await callback.answer("Пользователь не найден", show_alert=True)
            return
        
        ref_link = f"https://t.me/{settings.BOT_USERNAME}?start={user.tg_id}"
        
        text = (
            "🔗 <b>Ваша реферальная ссылка:</b>\n\n"
            f"<code>{ref_link}</code>\n\n"
            "📋 Нажмите на ссылку, чтобы скопировать.\n\n"
            "💡 Делитесь ссылкой с друзьями и получайте:\n"
            "• 15% с депозитов рефералов 1 уровня\n"
            "• 10% с депозитов рефералов 2 уровня\n"
            "• 6% с депозитов рефералов 3 уровня"
        )
        
        await callback.message.edit_text(
            text,
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="📤 Поделиться", switch_inline_query=f"Присоединяйся к инвестиционной платформе! {ref_link}")],
                [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_main")]
            ])
        )
        await callback.answer()


@dp.callback_query(F.data == "back_to_main")
async def callback_back_to_main(callback: types.CallbackQuery):
    """Return to main menu"""
    async with AsyncSessionLocal() as db:
        service = UserService(db)
        user = await service.get_by_tg_id(callback.from_user.id)
        
        if not user:
            await callback.answer("Пользователь не найден", show_alert=True)
            return
        
        await callback.message.edit_text(
            f"👋 <b>{user.first_name or user.username or 'Друг'}</b>\n\n"
            f"💰 Ваш баланс: <b>{user.balance:,.2f} ₽</b>\n\n"
            "Выберите действие:",
            reply_markup=get_main_keyboard(callback.from_user.id)
        )
        await callback.answer()


@dp.message(Command("balance"))
async def cmd_balance(message: types.Message):
    """Show user balance"""
    async with AsyncSessionLocal() as db:
        service = UserService(db)
        user = await service.get_by_tg_id(message.from_user.id)
        
        if not user:
            await message.answer("❌ Вы не зарегистрированы. Используйте /start")
            return
        
        await message.answer(
            f"💰 <b>Ваш баланс:</b> {user.balance:,.2f} ₽\n"
            f"📈 <b>Всего заработано:</b> {user.total_earned:,.2f} ₽\n"
            f"💎 <b>Накоплено:</b> {user.accumulated:,.2f} ₽\n"
            f"👥 <b>С рефералов:</b> {user.referral_earned:,.2f} ₽"
        )


@dp.message(Command("addbalance"))
async def cmd_add_balance(message: types.Message):
    """
    Admin command to add balance to user.
    Usage: /addbalance <tg_id or @username> <amount>
    
    Examples:
    /addbalance 123456789 1000
    /addbalance @username 500
    """
    async with AsyncSessionLocal() as db:
        service = UserService(db)
        
        is_admin = await service.is_admin(message.from_user.id)
        if not is_admin:
            await message.answer("❌ У вас нет прав для выполнения этой команды.")
            return
        
        args = message.text.split()
        if len(args) != 3:
            await message.answer(
                "❌ <b>Неверный формат команды.</b>\n\n"
                "Использование:\n"
                "<code>/addbalance &lt;tg_id или @username&gt; &lt;сумма&gt;</code>\n\n"
                "Примеры:\n"
                "<code>/addbalance 123456789 1000</code>\n"
                "<code>/addbalance @username 500</code>"
            )
            return
        
        identifier = args[1]
        try:
            amount = float(args[2])
        except ValueError:
            await message.answer("❌ Неверная сумма. Укажите число.")
            return
        
        if amount <= 0:
            await message.answer("❌ Сумма должна быть положительной.")
            return
        
        target_user = await service.get_by_tg_id_or_username(identifier)
        
        if not target_user:
            await message.answer(f"❌ Пользователь <code>{identifier}</code> не найден.")
            return
        
        old_balance = target_user.balance
        await service.add_balance(target_user, amount, f"Пополнение от админа @{message.from_user.username or message.from_user.id}")
        
        await message.answer(
            f"✅ <b>Баланс успешно пополнен!</b>\n\n"
            f"👤 Пользователь: <b>{target_user.first_name or target_user.username or target_user.tg_id}</b>\n"
            f"🆔 TG ID: <code>{target_user.tg_id}</code>\n"
            f"💰 Было: <b>{old_balance:,.2f} ₽</b>\n"
            f"➕ Добавлено: <b>{amount:,.2f} ₽</b>\n"
            f"💎 Стало: <b>{target_user.balance:,.2f} ₽</b>"
        )
        
        try:
            await bot.send_message(
                target_user.tg_id,
                f"💰 <b>Ваш баланс пополнен!</b>\n\n"
                f"➕ Сумма: <b>{amount:,.2f} ₽</b>\n"
                f"💎 Новый баланс: <b>{target_user.balance:,.2f} ₽</b>"
            )
        except Exception as e:
            logger.warning(f"Could not notify user {target_user.tg_id}: {e}")


@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    """Show help message"""
    async with AsyncSessionLocal() as db:
        service = UserService(db)
        is_admin = await service.is_admin(message.from_user.id)
    
    text = (
        "📚 <b>Доступные команды:</b>\n\n"
        "/start - Начать работу с ботом\n"
        "/balance - Показать баланс\n"
        "/help - Показать эту справку\n"
    )
    
    if is_admin:
        text += (
            "\n👑 <b>Админ-команды:</b>\n\n"
            "/addbalance &lt;tg_id/@username&gt; &lt;сумма&gt; - Пополнить баланс пользователя\n"
        )
    
    await message.answer(text)


async def main():
    logger.info("Starting bot...")
    
    if not settings.BOT_TOKEN:
        logger.error("BOT_TOKEN is not set!")
        return
    
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
