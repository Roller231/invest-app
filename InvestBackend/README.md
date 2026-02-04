# Invest App Backend

Backend API для Telegram Mini App инвестиционного симулятора.

## Стек технологий

- **FastAPI** - веб-фреймворк
- **SQLAlchemy** - ORM
- **MySQL** - база данных
- **SQLAdmin** - админ-панель
- **APScheduler** - планировщик задач

## Установка

### 1. Создайте виртуальное окружение

```bash
cd InvestBackend
python -m venv venv
venv\Scripts\activate  # Windows
# или
source venv/bin/activate  # Linux/Mac
```

### 2. Установите зависимости

```bash
pip install -r requirements.txt
```

### 3. Настройте переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
DATABASE_URL=mysql+aiomysql://root:password@localhost:3306/invest_app
DATABASE_URL_SYNC=mysql+pymysql://root:password@localhost:3306/invest_app
SECRET_KEY=your-super-secret-key
BOT_TOKEN=your-telegram-bot-token
BOT_USERNAME=ggcat_game_bot
ADMIN_TG_IDS=414135760
```

### 4. Создайте базу данных MySQL

```sql
CREATE DATABASE invest_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Запустите сервер

```bash
python main.py
```

Или через uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Users
- `POST /api/users/auth` - Авторизация/регистрация пользователя
- `GET /api/users/{tg_id}` - Получить пользователя
- `PATCH /api/users/{tg_id}` - Обновить настройки
- `GET /api/users/{tg_id}/stats` - Статистика пользователя
- `POST /api/users/{tg_id}/collect` - Собрать накопленную прибыль
- `POST /api/users/{tg_id}/toggle-auto-reinvest` - Переключить авто-реинвест

### Tariffs
- `GET /api/tariffs/` - Список тарифов
- `GET /api/tariffs/{id}` - Тариф по ID

### Deposits
- `POST /api/deposits/{tg_id}` - Создать депозит
- `GET /api/deposits/{tg_id}` - История депозитов
- `POST /api/deposits/{tg_id}/reinvest` - Реинвест
- `POST /api/deposits/{tg_id}/withdraw-deposit` - Вывести депозит

### Transactions
- `GET /api/transactions/live` - Live-лента транзакций
- `GET /api/transactions/{tg_id}` - История транзакций пользователя
- `POST /api/transactions/{tg_id}/withdraw` - Запрос на вывод

### Referrals
- `GET /api/referrals/{tg_id}` - Список рефералов
- `GET /api/referrals/{tg_id}/stats` - Статистика рефералов
- `GET /api/referrals/{tg_id}/link` - Реферальная ссылка

### Admin
- `POST /api/admin/deposit/{id}/approve` - Подтвердить депозит
- `POST /api/admin/deposit/{id}/reject` - Отклонить депозит
- `POST /api/admin/withdraw/{id}/approve` - Подтвердить вывод
- `POST /api/admin/withdraw/{id}/reject` - Отклонить вывод
- `POST /api/admin/user/{id}/add-balance` - Добавить баланс
- `GET /api/admin/pending-deposits` - Ожидающие депозиты
- `GET /api/admin/pending-withdrawals` - Ожидающие выводы

## Админ-панель

Доступна по адресу: `http://localhost:8000/admin`

Логин: `admin`
Пароль: значение `SECRET_KEY` из `.env`

## Реферальная система

Уровни и проценты:
- **1 уровень**: 20% от депозита реферала
- **2 уровень**: 7% от депозита реферала
- **3 уровень**: 4% от депозита реферала

Реферальная ссылка формируется как: `https://t.me/{BOT_USERNAME}?start={tg_id}`

## Автоматические выплаты

Планировщик проверяет депозиты каждые 5 минут и начисляет проценты для тех, у кого прошло 24 часа с момента активации депозита.

При включённом авто-реинвесте автоматически создаётся новый депозит на сумму: старый депозит + заработанные проценты.
