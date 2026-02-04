import asyncio
import random
from typing import Any, Dict, List, Optional, Set

from fastapi import WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User
from app.models.transaction import Transaction

from app.database import AsyncSessionLocal
from app.services.transaction_service import TransactionService


class LiveWSManager:
    def __init__(self) -> None:
        self._clients: Set[WebSocket] = set()
        self._lock = asyncio.Lock()
        self._last_payload: Optional[Dict[str, Any]] = None

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._clients.add(ws)
        # Ensure caches are seeded before sending init
        await _ensure_caches_seeded()
        await ws.send_json(_make_init_payload())

    async def disconnect(self, ws: WebSocket) -> None:
        async with self._lock:
            if ws in self._clients:
                self._clients.remove(ws)

    async def broadcast(self, payload: Dict[str, Any]) -> None:
        async with self._lock:
            self._last_payload = payload
            clients = list(self._clients)

        if not clients:
            return

        dead: List[WebSocket] = []
        for ws in clients:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)

        if dead:
            async with self._lock:
                for ws in dead:
                    self._clients.discard(ws)


live_ws_manager = LiveWSManager()

_live_cache: List[Dict[str, Any]] = []
_top_cache: List[Dict[str, Any]] = []


def _make_init_payload() -> Dict[str, Any]:
    return {
        "type": "live_init",
        "live_transactions": _live_cache[:10],
        "top_strip": _top_cache[:12],
    }


async def _broadcast_init() -> None:
    await live_ws_manager.broadcast(_make_init_payload())


def _gen_top_strip() -> List[Dict[str, Any]]:
    names = [
        "Александр",
        "Максим",
        "Дмитрий",
        "Иван",
        "Артём",
        "Никита",
        "Михаил",
        "Даниил",
        "Егор",
        "Андрей",
        "Кирилл",
        "Илья",
        "Алексей",
        "Роман",
        "Сергей",
    ]

    items: List[Dict[str, Any]] = []
    for i in range(12):
        n = random.choice(names)
        bal = random.choice([1200, 2500, 4800, 10200, 15700, 23800, 51400, 78300, 120500, 205000])
        items.append({"id": f"top_{i}", "name": n, "balance": bal})
    return items


def _gen_top_item() -> Dict[str, Any]:
    import time
    names = [
        "Александр", "Максим", "Дмитрий", "Иван", "Артём",
        "Никита", "Михаил", "Даниил", "Егор", "Андрей",
        "Кирилл", "Илья", "Алексей", "Роман", "Сергей",
    ]
    n = random.choice(names)
    bal = random.choice([1200, 2500, 4800, 10200, 15700, 23800, 51400, 78300, 120500, 205000])
    unique_id = f"top_{int(time.time() * 1000)}_{random.randint(0, 9999)}"
    return {"id": unique_id, "name": n, "balance": bal}


async def publish_top_item(item: Dict[str, Any]) -> None:
    _top_cache.insert(0, item)
    del _top_cache[12:]
    await live_ws_manager.broadcast({"type": "top_strip_item", "item": item})


async def publish_live_item(item: Dict[str, Any]) -> None:
    _live_cache.insert(0, item)
    del _live_cache[10:]
    await live_ws_manager.broadcast({"type": "live_tx_item", "item": item})


async def build_live_item(db: AsyncSession, tx: Transaction) -> Dict[str, Any]:
    user = await db.get(User, tx.user_id)
    user_name = None
    if user:
        user_name = user.first_name or user.username or f"User_{user.tg_id}"
    else:
        user_name = f"User_{tx.user_id}"

    title_map = {
        "deposit": "Пополнение",
        "withdraw": "Вывод средств",
        "reinvest": "Реинвест",
        "profit": "Начисление прибыли",
        "referral": "Реферальный бонус",
        "bonus": "Бонус",
    }

    created_at = tx.created_at
    time_str = created_at.strftime("%H:%M") if created_at else "--:--"

    return {
        "id": tx.id,
        "type": tx.type,
        "title": title_map.get(tx.type, tx.type),
        "user_name": user_name,
        "amount": tx.amount,
        "hash_code": tx.hash_code or "",
        "time": time_str,
        "is_fake": bool(getattr(tx, "is_fake", False)),
    }


async def publish_transaction(db: AsyncSession, tx: Transaction) -> None:
    item = await build_live_item(db, tx)
    await publish_live_item(item)


async def ensure_top_seeded() -> None:
    if not _top_cache:
        _top_cache.extend(_gen_top_strip())
        del _top_cache[12:]


async def ensure_live_seeded(items: List[Dict[str, Any]]) -> None:
    global _live_cache
    if not _live_cache and items:
        _live_cache = list(items)[:10]


async def _ensure_caches_seeded() -> None:
    """Ensure both caches have data before sending init to a new client."""
    # Seed top strip if empty
    if not _top_cache:
        _top_cache.extend(_gen_top_strip())
        del _top_cache[12:]
    # Seed live transactions if empty
    if not _live_cache:
        try:
            async with AsyncSessionLocal() as session:
                service = TransactionService(session)
                items = await service.get_live_transactions(limit=10)
            if items:
                _live_cache.extend(items)
                del _live_cache[10:]
        except Exception:
            pass


async def periodic_live_tick(stop_event: asyncio.Event, interval_sec: float = 5.0) -> None:
    # Seed live cache once
    try:
        async with AsyncSessionLocal() as session:
            service = TransactionService(session)
            seed = await service.get_live_transactions(limit=10)
        await ensure_live_seeded(seed)
    except Exception:
        pass

    while not stop_event.is_set():
        try:
            async with AsyncSessionLocal() as session:
                service = TransactionService(session)
                items = await service.get_live_transactions(limit=1)
            if items:
                await publish_live_item(items[0])
        except Exception:
            pass

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=interval_sec)
        except asyncio.TimeoutError:
            continue


async def periodic_top_tick(stop_event: asyncio.Event, interval_sec: float = 5.0) -> None:
    await ensure_top_seeded()
    while not stop_event.is_set():
        try:
            await publish_top_item(_gen_top_item())
        except Exception:
            pass

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=interval_sec)
        except asyncio.TimeoutError:
            continue


async def live_broadcaster(stop_event: asyncio.Event, interval_sec: float = 5.0) -> None:
    # Run both tickers; stop_event cancels both.
    await asyncio.gather(
        periodic_live_tick(stop_event, interval_sec=interval_sec),
        periodic_top_tick(stop_event, interval_sec=interval_sec),
    )
