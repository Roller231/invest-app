import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Gift,
  Sparkles,
  Wifi,
} from 'lucide-react'
import { tariffs, liveTransactions, topUsers } from '../data.js'
import Header from './ui/Header'
import LiquidGlassButton from './ui/LiquidGlassButton'
import SupportSection from './ui/SupportSection'
import BannerCarousel from './ui/BannerCarousel'
import DepositModal from './modals/DepositModal'

const toneStyles = {
  neutral: 'border border-white/10',
  accent: 'border border-[var(--color-primary)]/50',
  primary: 'border border-[var(--color-primary)] bg-gradient-to-br from-[#2B3139] to-[#1E2329]',
}

export default function Dashboard() {
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [promoCode, setPromoCode] = useState('')

  return (
    <div className="space-y-6">
      <Header 
        balance={0} 
        onDeposit={() => setShowDepositModal(true)} 
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
            {[...topUsers, ...topUsers].map((user, index) => (
              <div
                key={`${user.id}-${index}`}
                className="flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-bg-card)] px-3 py-1.5"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium">{user.name}</span>
                <span className="text-xs font-bold text-[var(--color-primary)]">
                  ({user.balance.toLocaleString()}₽)
                </span>
              </div>
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
          {liveTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-surface flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-red)]/20">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-red)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{tx.title}</p>
                  <p className="text-xs text-sub">{tx.hash}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--color-red)]">
                  {tx.amount} ₽
                </p>
                <p className="text-xs text-sub">{tx.time}</p>
              </div>
            </motion.div>
          ))}
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
          {tariffs.map((tariff, index) => (
            <motion.div
              key={tariff.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`card-surface cursor-pointer p-4 transition-all ${toneStyles[tariff.tone]}`}
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
                  {tariff.apyDisplay}
                </div>
              </div>
              <p className="mt-3 text-xs text-sub">{tariff.range}</p>
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
            onClick={() => {
              if (promoCode === 'NG2026') {
                alert('🎉 Промокод активирован! +100₽ на ваш счёт!')
              } else {
                alert('❌ Неверный промокод')
              }
            }}
          >
            Принять
          </LiquidGlassButton>
        </div>
      </motion.section>

      {/* New Year Promo */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-surface overflow-hidden p-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700">
            <span className="text-3xl">🎄</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold">Новогодняя акция</p>
            <p className="text-sm text-[var(--color-text-sub)]">
              Удвоенные бонусы на первый депозит до 31 января
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-[var(--color-text-sub)]" />
        </div>
      </motion.section>

      {/* Support Section */}
      <SupportSection />

      {/* Deposit Modal */}
      <DepositModal 
        isOpen={showDepositModal} 
        onClose={() => setShowDepositModal(false)} 
      />
    </div>
  )
}
