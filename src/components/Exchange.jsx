import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
} from 'lucide-react'
import Header from './ui/Header'
import LiquidGlassButton from './ui/LiquidGlassButton'
import { useApp } from '../context/AppContext'

const ROUND_SECONDS = 6
const CHART_POINTS = 40

export default function Exchange() {
  const { user } = useApp()
  const userKey = user?.id ?? user?.tg_id ?? 'dev'
  const initialBalance = useMemo(() => {
    const v = Number(user?.balance || 0)
    return Number.isFinite(v) ? v : 0
  }, [user?.balance])

  const [balance, setBalance] = useState(initialBalance)
  const [bet, setBet] = useState(() => Math.max(50, Math.min(500, Math.floor(initialBalance * 0.05) || 100)))
  const [price, setPrice] = useState(2.4458)
  const [chart, setChart] = useState(() => Array.from({ length: CHART_POINTS }, () => 2.4458))
  const [round, setRound] = useState({
    status: 'idle',
    secondsLeft: ROUND_SECONDS,
    direction: null,
    startPrice: null,
    endPrice: null,
    result: null,
    payout: 0,
  })

  const timerRef = useRef(null)
  const tickRef = useRef(null)
  const initRef = useRef(null)

  useEffect(() => {
    if (initRef.current === userKey) return
    initRef.current = userKey
    setBalance(initialBalance)
    setBet(Math.max(50, Math.min(500, Math.floor(initialBalance * 0.05) || 100)))
    setRound({
      status: 'idle',
      secondsLeft: ROUND_SECONDS,
      direction: null,
      startPrice: null,
      endPrice: null,
      result: null,
      payout: 0,
    })
  }, [initialBalance, userKey])

  useEffect(() => {
    setBet((b) => {
      const next = Number(b) || 0
      if (next <= 0) return 100
      return Math.min(next, Math.max(0, balance))
    })
  }, [balance])

  useEffect(() => {
    const stop = () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (tickRef.current) clearInterval(tickRef.current)
      timerRef.current = null
      tickRef.current = null
    }
    return stop
  }, [])

  const randomWalk = (base) => {
    const drift = 0
    const volatility = 0.004
    const shock = (Math.random() - 0.5) * volatility
    const next = Math.max(0.01, base * (1 + drift + shock))
    return Number(next.toFixed(5))
  }

  const resetRound = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (tickRef.current) clearInterval(tickRef.current)
    timerRef.current = null
    tickRef.current = null
    setRound({
      status: 'idle',
      secondsLeft: ROUND_SECONDS,
      direction: null,
      startPrice: null,
      endPrice: null,
      result: null,
      payout: 0,
    })
  }

  const startRound = (direction) => {
    const stake = Math.max(10, Math.floor(Number(bet) || 0))
    if (stake <= 0) return
    if (stake > balance) return

    if (timerRef.current) clearInterval(timerRef.current)
    if (tickRef.current) clearInterval(tickRef.current)

    const start = price
    setBalance((b) => b - stake)
    setRound({
      status: 'running',
      secondsLeft: ROUND_SECONDS,
      direction,
      startPrice: start,
      endPrice: null,
      result: null,
      payout: 0,
    })

    tickRef.current = setInterval(() => {
      setPrice((p) => {
        const next = randomWalk(p)
        setChart((prev) => {
          const arr = [...prev, next]
          return arr.length > CHART_POINTS ? arr.slice(arr.length - CHART_POINTS) : arr
        })
        return next
      })
    }, 250)

    timerRef.current = setInterval(() => {
      setRound((r) => {
        if (r.status !== 'running') return r
        const nextLeft = r.secondsLeft - 1
        if (nextLeft > 0) return { ...r, secondsLeft: nextLeft }

        if (timerRef.current) clearInterval(timerRef.current)
        if (tickRef.current) clearInterval(tickRef.current)
        timerRef.current = null
        tickRef.current = null

        const end = price
        const isUp = end > start
        const win = direction === 'up' ? isUp : !isUp
        const payout = win ? Math.floor(stake * 1.85) : 0
        if (payout > 0) setBalance((b) => b + payout)

        return {
          ...r,
          status: 'finished',
          secondsLeft: 0,
          endPrice: end,
          result: win ? 'win' : 'lose',
          payout,
        }
      })
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <Header balance={balance} />

      <section className="card-surface p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-text-sub)]">Пара</p>
            <p className="text-sm font-semibold">TON/USDT</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-sub)]">Цена</p>
            <p className="text-lg font-bold">{price.toFixed(5)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-2xl bg-[var(--color-bg-base)] p-3">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-24 w-full">
            {(() => {
              const min = Math.min(...chart)
              const max = Math.max(...chart)
              const range = Math.max(0.00001, max - min)
              const points = chart
                .map((v, i) => {
                  const x = (i / (chart.length - 1)) * 100
                  const y = 38 - ((v - min) / range) * 36
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                })
                .join(' ')
              const up = chart[chart.length - 1] >= chart[0]
              const stroke = up ? 'var(--color-green)' : 'var(--color-red)'
              return (
                <>
                  <path d={points} fill="none" stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </>
              )
            })()}
          </svg>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <LiquidGlassButton
            variant="success"
            fullWidth
            size="lg"
            icon={TrendingUp}
            disabled={round.status === 'running' || balance < 10}
            onClick={() => startRound('up')}
          >
            Вверх
          </LiquidGlassButton>

          <LiquidGlassButton
            variant="danger"
            fullWidth
            size="lg"
            icon={TrendingDown}
            disabled={round.status === 'running' || balance < 10}
            onClick={() => startRound('down')}
          >
            Вниз
          </LiquidGlassButton>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[var(--color-bg-base)] p-3">
            <p className="text-xs text-[var(--color-text-sub)]">Баланс игры</p>
            <p className="text-lg font-bold">{Math.max(0, Math.floor(balance)).toLocaleString()} ₽</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-bg-base)] p-3">
            <p className="text-xs text-[var(--color-text-sub)]">Ставка</p>
            <input
              type="number"
              value={bet}
              min={10}
              max={Math.max(10, Math.floor(balance))}
              onChange={(e) => setBet(e.target.value)}
              className="mt-1 w-full bg-transparent text-lg font-bold outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[var(--color-bg-base)] p-3">
          <div>
            <p className="text-xs text-[var(--color-text-sub)]">Раунд</p>
            <p className="text-sm font-semibold">
              {round.status === 'idle' && 'Ожидание'}
              {round.status === 'running' && 'Идёт'}
              {round.status === 'finished' && (round.result === 'win' ? 'Победа' : 'Проигрыш')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-sub)]">Таймер</p>
            <p className="text-sm font-semibold">{round.status === 'running' ? `${round.secondsLeft}s` : '—'}</p>
          </div>
        </div>

        <AnimatePresence>
          {round.status === 'finished' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`rounded-2xl p-4 ${
                round.result === 'win'
                  ? 'bg-[var(--color-green)]/10 text-[var(--color-green)]'
                  : 'bg-[var(--color-red)]/10 text-[var(--color-red)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {round.result === 'win' ? `+${round.payout} ₽` : 'Ставка не сыграла'}
                  </p>
                </div>
                <LiquidGlassButton variant="secondary" icon={RotateCcw} onClick={resetRound}>
                  Ещё
                </LiquidGlassButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {round.status === 'idle' && (
          <div className="text-xs text-[var(--color-text-sub)] text-center">
            Выбери направление. Раунд длится {ROUND_SECONDS} секунд.
          </div>
        )}
      </section>
    </div>
  )
}
