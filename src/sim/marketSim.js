import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function round(n, digits = 2) {
  const p = 10 ** digits
  return Math.round(n * p) / p
}

function formatPairId(pair) {
  return `${pair.base}_${pair.quote}`
}

function nowTs() {
  return Date.now()
}

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function computeTickSize(price) {
  if (price >= 1000) return 1
  if (price >= 100) return 0.1
  if (price >= 10) return 0.01
  return 0.0001
}

function stepTo(price, tick, dir) {
  const p = Math.round(price / tick) * tick
  return round(p + dir * tick, tick >= 1 ? 0 : tick >= 0.1 ? 1 : tick >= 0.01 ? 2 : 4)
}

function genOrderBook(mid, levels = 6) {
  const tick = computeTickSize(mid)
  const spreadTicks = clamp(Math.round(3 + Math.random() * 6), 2, 10)
  const bestAsk = stepTo(mid, tick, +Math.max(1, Math.round(spreadTicks / 2)))
  const bestBid = stepTo(mid, tick, -Math.max(1, Math.round(spreadTicks / 2)))

  const sells = []
  const buys = []

  let base = 60 + Math.random() * 140
  for (let i = 0; i < levels; i += 1) {
    const price = stepTo(bestAsk, tick, +i)
    const amount = round(base * (0.6 + Math.random() * 0.9) * (1 + i * 0.15), 2)
    sells.push({ price, amount })
    base *= 0.92 + Math.random() * 0.06
  }

  base = 60 + Math.random() * 140
  for (let i = 0; i < levels; i += 1) {
    const price = stepTo(bestBid, tick, -i)
    const amount = round(base * (0.6 + Math.random() * 0.9) * (1 + i * 0.15), 2)
    buys.push({ price, amount })
    base *= 0.92 + Math.random() * 0.06
  }

  return { sells, buys }
}

function chooseMood(prevMood) {
  const r = Math.random()
  if (prevMood === 'pump' || prevMood === 'dump') {
    return r < 0.75 ? 'calm' : prevMood
  }
  if (r < 0.62) return 'calm'
  if (r < 0.82) return 'trend_up'
  if (r < 0.97) return 'trend_down'
  return Math.random() < 0.5 ? 'pump' : 'dump'
}

function moodParams(mood) {
  switch (mood) {
    case 'trend_up':
      return { drift: 0.00025, vol: 0.0016 }
    case 'trend_down':
      return { drift: -0.00025, vol: 0.0016 }
    case 'pump':
      return { drift: 0.0015, vol: 0.0045 }
    case 'dump':
      return { drift: -0.0015, vol: 0.0045 }
    default:
      return { drift: 0.0, vol: 0.0012 }
  }
}

function safeParse(json) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function normalizeNumber(n, fallback = 0) {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : fallback
  return v
}

function normalizeState(raw, defaults) {
  if (!raw || typeof raw !== 'object') return defaults
  return {
    balances: {
      usdt: normalizeNumber(raw.balances?.usdt, defaults.balances.usdt),
      ton: normalizeNumber(raw.balances?.ton, defaults.balances.ton),
      reservedUsdt: normalizeNumber(raw.balances?.reservedUsdt, defaults.balances.reservedUsdt),
      reservedTon: normalizeNumber(raw.balances?.reservedTon, defaults.balances.reservedTon),
    },
    openOrders: Array.isArray(raw.openOrders) ? raw.openOrders : defaults.openOrders,
    orderHistory: Array.isArray(raw.orderHistory) ? raw.orderHistory : defaults.orderHistory,
    trades: Array.isArray(raw.trades) ? raw.trades : defaults.trades,
    market: {
      mid: normalizeNumber(raw.market?.mid, defaults.market.mid),
      open24h: normalizeNumber(raw.market?.open24h, defaults.market.open24h),
      volume24h: normalizeNumber(raw.market?.volume24h, defaults.market.volume24h),
      mood: typeof raw.market?.mood === 'string' ? raw.market.mood : defaults.market.mood,
      moodUntil: normalizeNumber(raw.market?.moodUntil, defaults.market.moodUntil),
      lastTs: normalizeNumber(raw.market?.lastTs, defaults.market.lastTs),
    },
  }
}

export function useMarketSim({ pair, storageKey, initialUsdt = 0 }) {
  const defaults = useMemo(() => {
    const basePrice = pair.price
    const startUsdt = Math.max(0, Number(initialUsdt) || 0)
    return {
      balances: { usdt: startUsdt, ton: 0, reservedUsdt: 0, reservedTon: 0 },
      openOrders: [],
      orderHistory: [],
      trades: [],
      market: {
        mid: basePrice,
        open24h: basePrice / (1 + (pair.change || 0) / 100),
        volume24h: pair.volume || 50000,
        mood: 'calm',
        moodUntil: nowTs() + 60_000,
        lastTs: nowTs(),
      },
    }
  }, [pair.change, pair.price, pair.volume, initialUsdt])

  const [state, setState] = useState(() => {
    if (!storageKey) return defaults
    const raw = safeParse(localStorage.getItem(storageKey))
    return normalizeState(raw, defaults)
  })

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    if (!storageKey) return
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state, storageKey])

  const reset = useCallback(() => {
    setState(defaults)
  }, [defaults])

  const available = useMemo(() => {
    const usdt = Math.max(0, state.balances.usdt - state.balances.reservedUsdt)
    const ton = Math.max(0, state.balances.ton - state.balances.reservedTon)
    return { usdt: round(usdt, 2), ton: round(ton, 6) }
  }, [state.balances])

  const change24h = useMemo(() => {
    const open = state.market.open24h
    if (!open) return { pct: 0, abs: 0 }
    const abs = state.market.mid - open
    const pct = (abs / open) * 100
    return { pct: round(pct, 2), abs: round(abs, 4) }
  }, [state.market.mid, state.market.open24h])

  const orderBook = useMemo(() => genOrderBook(state.market.mid, 6), [state.market.mid])

  const placeLimitOrder = useCallback((side, price, amount) => {
    const p = Number(price)
    const a = Number(amount)
    if (!Number.isFinite(p) || !Number.isFinite(a) || p <= 0 || a <= 0) {
      throw new Error('Некорректные параметры ордера')
    }

    const mid = stateRef.current.market.mid
    const tick = computeTickSize(mid)
    const snapped = Math.round(p / tick) * tick
    const px = round(snapped, tick >= 1 ? 0 : tick >= 0.1 ? 1 : tick >= 0.01 ? 2 : 4)

    const id = makeId()
    const createdAt = nowTs()

    setState((prev) => {
      const next = { ...prev }
      const balances = { ...next.balances }

      if (side === 'buy') {
        const cost = px * a
        const free = balances.usdt - balances.reservedUsdt
        if (cost > free + 1e-9) {
          throw new Error('Недостаточно USDT для размещения ордера')
        }
        balances.reservedUsdt = round(balances.reservedUsdt + cost, 6)
      } else {
        const free = balances.ton - balances.reservedTon
        if (a > free + 1e-9) {
          throw new Error('Недостаточно TON для размещения ордера')
        }
        balances.reservedTon = round(balances.reservedTon + a, 6)
      }

      next.balances = balances

      next.openOrders = [
        {
          id,
          pair: formatPairId(pair),
          side,
          price: px,
          amount: round(a, 6),
          remaining: round(a, 6),
          status: 'open',
          createdAt,
        },
        ...next.openOrders,
      ]

      return next
    })

    return id
  }, [pair])

  const cancelOrder = useCallback((orderId) => {
    setState((prev) => {
      const target = prev.openOrders.find((o) => o.id === orderId)
      if (!target) return prev

      const balances = { ...prev.balances }
      if (target.side === 'buy') {
        const reserved = target.price * target.remaining
        balances.reservedUsdt = round(Math.max(0, balances.reservedUsdt - reserved), 6)
      } else {
        balances.reservedTon = round(Math.max(0, balances.reservedTon - target.remaining), 6)
      }

      const updatedOpen = prev.openOrders.filter((o) => o.id !== orderId)
      const historyItem = { ...target, status: 'cancelled', closedAt: nowTs() }

      return {
        ...prev,
        balances,
        openOrders: updatedOpen,
        orderHistory: [historyItem, ...prev.orderHistory].slice(0, 50),
      }
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const ts = nowTs()
        const dtMs = Math.max(200, ts - (prev.market.lastTs || ts))
        const dt = dtMs / 1000

        let mood = prev.market.mood
        let moodUntil = prev.market.moodUntil
        if (!moodUntil || ts >= moodUntil) {
          mood = chooseMood(mood)
          const duration = mood === 'pump' || mood === 'dump' ? 12_000 + Math.random() * 10_000 : 25_000 + Math.random() * 45_000
          moodUntil = ts + duration
        }

        const { drift, vol } = moodParams(mood)
        const noise = (Math.random() - 0.5) * 2
        const shock = noise * vol * Math.sqrt(dt)
        const driftMove = drift * dt

        const mid = Math.max(0.0001, prev.market.mid * (1 + driftMove + shock))
        const newMid = round(mid, computeTickSize(prev.market.mid) >= 1 ? 0 : mid >= 10 ? 2 : 4)

        const volumePulse = Math.abs(shock) * (1200 + Math.random() * 3500)
        const volume24h = round((prev.market.volume24h || 0) + volumePulse, 2)

        const nextMarket = {
          ...prev.market,
          mid: newMid,
          volume24h,
          mood,
          moodUntil,
          lastTs: ts,
        }

        let balances = prev.balances
        let openOrders = prev.openOrders
        let orderHistory = prev.orderHistory
        let trades = prev.trades

        if (openOrders.length) {
          const filledOrders = []
          const remainingOrders = []

          for (const order of openOrders) {
            const shouldFill = order.side === 'buy' ? newMid <= order.price : newMid >= order.price
            if (!shouldFill) {
              remainingOrders.push(order)
              continue
            }

            const liquidity = clamp(0.25 + Math.random() * 0.9, 0.25, 1)
            const fillQty = round(Math.min(order.remaining, order.remaining * liquidity), 6)
            const restQty = round(order.remaining - fillQty, 6)

            if (fillQty <= 0) {
              remainingOrders.push(order)
              continue
            }

            const execPrice = order.price

            balances = { ...balances }
            trades = [{
              id: makeId(),
              pair: order.pair,
              side: order.side,
              price: execPrice,
              amount: fillQty,
              ts,
            }, ...trades].slice(0, 60)

            if (order.side === 'buy') {
              const cost = execPrice * fillQty
              balances.reservedUsdt = round(Math.max(0, balances.reservedUsdt - cost), 6)
              balances.usdt = round(balances.usdt - cost, 6)
              balances.ton = round(balances.ton + fillQty, 6)
            } else {
              balances.reservedTon = round(Math.max(0, balances.reservedTon - fillQty), 6)
              balances.ton = round(balances.ton - fillQty, 6)
              balances.usdt = round(balances.usdt + execPrice * fillQty, 6)
            }

            if (restQty > 0) {
              remainingOrders.push({ ...order, remaining: restQty })
            } else {
              filledOrders.push({ ...order, remaining: 0, status: 'filled', closedAt: ts })
            }
          }

          if (filledOrders.length) {
            orderHistory = [...filledOrders, ...orderHistory].slice(0, 50)
          }
          openOrders = remainingOrders
        }

        return {
          ...prev,
          balances,
          openOrders,
          orderHistory,
          trades,
          market: nextMarket,
        }
      })
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return {
    midPrice: state.market.mid,
    volume24h: state.market.volume24h,
    mood: state.market.mood,
    change24h,
    orderBook,
    balances: state.balances,
    available,
    openOrders: state.openOrders,
    orderHistory: state.orderHistory,
    trades: state.trades,
    placeLimitOrder,
    cancelOrder,
    reset,
  }
}
