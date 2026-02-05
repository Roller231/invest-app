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
import { useToast } from './ui/ToastProvider'
import { useTranslation } from '../i18n'

const ROUND_SECONDS = 6
const CHART_POINTS = 40

export default function Exchange({ onAvatarClick }) {
  const { user, currency, convertAmount, convertToRub, createGameBet, createGamePayout, formatAmount } = useApp()
  const toast = useToast()
  const { t } = useTranslation()
  const userKey = user?.id ?? user?.tg_id ?? 'dev'
  const initialBalance = useMemo(() => {
    const v = Number(user?.balance || 0)
    return Number.isFinite(v) ? v : 0
  }, [user?.balance])

  const [balance, setBalance] = useState(initialBalance)
  const [bet, setBet] = useState(() => {
    const displayBalance = convertAmount(initialBalance)
    const v = Math.floor(displayBalance * 0.05) || 1
    return Math.max(1, Math.min(Math.floor(displayBalance) || 1, v))
  })
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
    setBet(() => {
      const displayBalance = convertAmount(initialBalance)
      const v = Math.floor(displayBalance * 0.05) || 1
      return Math.max(1, Math.min(Math.floor(displayBalance) || 1, v))
    })
    setRound({
      status: 'idle',
      secondsLeft: ROUND_SECONDS,
      direction: null,
      startPrice: null,
      endPrice: null,
      result: null,
      payout: 0,
    })
  }, [convertAmount, initialBalance, userKey])

  useEffect(() => {
    setBet((b) => {
      const next = Number(b) || 0
      const displayBalance = convertAmount(balance)
      if (displayBalance <= 0) return 1
      if (next < 1) return 1
      return Math.min(next, Math.floor(displayBalance))
    })
  }, [balance, convertAmount])

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

  const startRound = async (direction) => {
    const displayStake = Number(bet) || 0
    const stake = Math.floor(convertToRub(displayStake))
    if (stake < 1) return
    if (stake > balance) return

    if (timerRef.current) clearInterval(timerRef.current)
    if (tickRef.current) clearInterval(tickRef.current)

    const start = price
    try {
      const res = await createGameBet(stake)
      if (typeof res?.new_balance === 'number') setBalance(res.new_balance)
    } catch (e) {
      toast.error(e.message || t('exchange.betError'), t('common.error'))
      return
    }
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
        if (payout > 0) {
          createGamePayout(payout)
            .then((res) => {
              if (typeof res?.new_balance === 'number') setBalance(res.new_balance)
            })
            .catch(() => {})
        }

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
      <Header
        balance={balance}
        avatarUrl={user?.avatar_url}
        avatarName={user?.first_name || user?.username || 'U'}
        onAvatarClick={onAvatarClick}
      />

      <section className="card-surface p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-text-sub)]">{t('exchange.pair')}</p>
            <p className="text-sm font-semibold">TON/USDT</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-sub)]">{t('exchange.price')}</p>
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
            {t('exchange.up')}
          </LiquidGlassButton>

          <LiquidGlassButton
            variant="danger"
            fullWidth
            size="lg"
            icon={TrendingDown}
            disabled={round.status === 'running' || balance < 10}
            onClick={() => startRound('down')}
          >
            {t('exchange.down')}
          </LiquidGlassButton>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[var(--color-bg-base)] p-3">
            <p className="text-xs text-[var(--color-text-sub)]">{t('exchange.gameBalance')}</p>
            <p className="text-lg font-bold">
              {currency === 'USD' ? '$' : '₽'}{convertAmount(Math.max(0, Math.floor(balance))).toLocaleString(currency === 'USD' ? 'en-US' : 'ru-RU', {
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              })}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-bg-base)] p-3">
            <p className="text-xs text-[var(--color-text-sub)]">{t('exchange.bet')}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-lg font-bold">{currency === 'USD' ? '$' : '₽'}</span>
              <input
                type="number"
                value={bet}
                min={10}
                max={Math.max(10, Math.floor(balance))}
                onChange={(e) => setBet(e.target.value)}
                className="w-full bg-transparent text-lg font-bold outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[var(--color-bg-base)] p-3">
          <div>
            <p className="text-xs text-[var(--color-text-sub)]">{t('exchange.round')}</p>
            <p className="text-sm font-semibold">
              {round.status === 'idle' && t('exchange.waiting')}
              {round.status === 'running' && t('exchange.running')}
              {round.status === 'finished' && (round.result === 'win' ? t('exchange.win') : t('exchange.lose'))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-sub)]">{t('exchange.timer')}</p>
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
                    {round.result === 'win' ? `+${formatAmount(round.payout, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}` : t('exchange.lose')}
                  </p>
                </div>
                <LiquidGlassButton variant="secondary" icon={RotateCcw} onClick={resetRound}>
                  {t('exchange.tryAgain')}
                </LiquidGlassButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {round.status === 'idle' && (
          <div className="text-xs text-[var(--color-text-sub)] text-center">
            {t('exchange.round')} {ROUND_SECONDS}s
          </div>
        )}
      </section>
    </div>
  )
}
