import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  Gift,
  Sparkles,
  Wifi,
} from 'lucide-react'
import { topUsers } from '../data.js'
import Header from './ui/Header'
import LiquidGlassButton from './ui/LiquidGlassButton'
import SupportSection from './ui/SupportSection'
import BannerCarousel from './ui/BannerCarousel'
import TopUpModal from './modals/TopUpModal'
import { useApp } from '../context/AppContext'
import { useToast } from './ui/ToastProvider.jsx'

const toneStyles = {
  neutral: 'border border-white/10',
  accent: 'border border-[var(--color-primary)]/50',
  primary: 'border border-[var(--color-primary)] bg-gradient-to-br from-[#2B3139] to-[#1E2329]',
}

export default function Dashboard() {
  const { user, tariffs, liveTransactions, topStrip, activatePromo } = useApp()
  const toast = useToast()
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [stripPulseKey, setStripPulseKey] = useState(0)
  const [promoLoading, setPromoLoading] = useState(false)

  const strip = topStrip && topStrip.length ? topStrip : topUsers

  // Trigger a subtle pulse when WS updates the strip balances
  const stripSig = (topStrip || []).map((u) => `${u.id}:${u.balance}`).join('|')
  useEffect(() => {
    if (topStrip && topStrip.length) {
      setStripPulseKey((k) => k + 1)
    }
  }, [stripSig, topStrip])

  return (
    <div className="space-y-6">
      <Header 
        balance={user?.balance || 0} 
        onDeposit={() => setShowTopUpModal(true)} 
      />

      {/* Top Users Infinite Marquee */}
      <section className="overflow-hidden">
        <div className="relative flex">
          <motion.div
            className="flex gap-3"
            animate={{ x: [0, '-50%'] }}
            transition={{
              x: {
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
          >
            {[...strip, ...strip].map((user, index) => (
              <motion.div
                key={`${user.id}-${index}`}
                layout
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-bg-card)] px-3 py-1.5"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium">{user.name}</span>
                <motion.span
                  key={stripPulseKey}
                  className="text-xs font-bold text-[var(--color-primary)]"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  ({user.balance.toLocaleString()}₽)
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Promo Banner Carousel */}
      <BannerCarousel />

      {/* Live Transactions */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Wifi className="h-4 w-4 text-[var(--color-primary)]" />
          Live транзакции:
        </div>
        <div className="space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {liveTransactions.map((tx) => (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="card-surface flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    tx.type === 'deposit' ? 'bg-[var(--color-green)]/20' : 'bg-[var(--color-red)]/20'
                  }`}>
                    <motion.div
                      className={`h-3 w-3 rounded-full ${
                        tx.type === 'deposit' ? 'bg-[var(--color-green)]' : 'bg-[var(--color-red)]'
                      }`}
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{tx.title}</p>
                    <p className="text-xs text-sub">{tx.hash_code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    tx.amount > 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} ₽
                  </p>
                  <p className="text-xs text-sub">{tx.time}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Tariffs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Gift className="h-4 w-4 text-[var(--color-primary)]" />
            Тарифы компании
          </div>
          <button type="button" className="text-xs text-sub">
            Подробнее <ChevronRight className="inline h-3 w-3" />
          </button>
        </div>
        <div className="grid gap-3">
          {(tariffs || []).map((tariff, index) => (
            <motion.div
              key={tariff.id || tariff.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`card-surface cursor-pointer p-4 transition-all ${
                index === 0 ? toneStyles.neutral : index === 1 ? toneStyles.accent : toneStyles.primary
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{tariff.name}</p>
                  <p className="text-xs text-sub">{tariff.label}</p>
                </div>
                <div 
                  className="rounded-full px-3 py-1 text-sm font-semibold"
                  style={{ 
                    backgroundColor: tariff.color + '20',
                    color: tariff.color
                  }}
                >
                  +{tariff.daily_percent}%
                </div>
              </div>
              <p className="mt-3 text-xs text-sub">
                от {tariff.min_amount?.toLocaleString()} ₽ до {tariff.max_amount?.toLocaleString()} ₽
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Promo Code Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface space-y-4 p-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold">Активируй промокод</p>
            <p className="text-xs text-sub">
              Получай бонусы и повышенный кэшбэк
            </p>
          </div>
          <Sparkles className="h-6 w-6 text-[var(--color-primary)]" />
        </div>
        <div className="flex gap-3">
          <input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Введите промокод"
            className="h-11 flex-1 rounded-full bg-[var(--color-bg-base)] px-4 text-sm text-[var(--color-text-main)] outline-none ring-1 ring-white/10 focus:ring-[var(--color-primary)]"
          />
          <LiquidGlassButton
            variant="primary"
            disabled={!promoCode || promoLoading}
            onClick={async () => {
              setPromoLoading(true)
              try {
                const res = await activatePromo(promoCode)
                toast.success(`Начислено +${res?.amount || 0}₽`, res?.message || 'Промокод активирован')
                setPromoCode('')
              } catch (e) {
                toast.error(e.message, 'Ошибка')
              } finally {
                setPromoLoading(false)
              }
            }}
          >
            {promoLoading ? '...' : 'Принять'}
          </LiquidGlassButton>
        </div>
      </motion.section>

      {/* Support Section */}
      <SupportSection />

      {/* Deposit Modal */}
      <TopUpModal 
        isOpen={showTopUpModal} 
        onClose={() => setShowTopUpModal(false)} 
      />
    </div>
  )
}
