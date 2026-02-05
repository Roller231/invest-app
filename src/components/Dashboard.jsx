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
import Modal from './ui/Modal'
import { useApp } from '../context/AppContext'
import { useToast } from './ui/ToastProvider.jsx'
import { useTranslation } from '../i18n'

const toneStyles = {
  neutral: 'border border-white/10',
  accent: 'border border-[var(--color-primary)]/50',
  primary: 'border border-[var(--color-primary)] bg-gradient-to-br from-[#2B3139] to-[#1E2329]',
}

export default function Dashboard({ onAvatarClick }) {
  const { user, tariffs, liveTransactions, topStrip, activatePromo, formatAmount } = useApp()
  const toast = useToast()
  const { t } = useTranslation()
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [showTariffInfo, setShowTariffInfo] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [stripPulseKey, setStripPulseKey] = useState(0)
  const [promoLoading, setPromoLoading] = useState(false)

  const strip = topStrip && topStrip.length ? topStrip : topUsers

  const getTariffKey = (tariff) => String(tariff?.name || '').trim().toLowerCase()

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
        avatarUrl={user?.avatar_url}
        avatarName={user?.first_name || user?.username || 'U'}
        onDeposit={() => setShowTopUpModal(true)}
        onAvatarClick={onAvatarClick}
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
                  ({formatAmount(user.balance, { maximumFractionDigits: 0, minimumFractionDigits: 0 })})
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
        <div className="flex items-center gap-2 text-base font-semibold">
          <Wifi className="h-5 w-5 text-[var(--color-primary)]" />
          {t('dashboard.liveTransactions')}
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
                    <p className="text-sm font-semibold">
                      {tx.type === 'deposit'
                        ? t('dashboard.depositTitle')
                        : tx.type === 'withdraw'
                          ? t('dashboard.withdrawalTitle')
                          : tx.title}
                    </p>
                    <p className="text-xs text-sub">{tx.hash_code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    tx.amount > 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{formatAmount(Math.abs(tx.amount), { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
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
          <div className="flex items-center gap-2 text-base font-semibold">
            <Gift className="h-5 w-5 text-[var(--color-primary)]" />
            {t('dashboard.tariffs')}
          </div>
          <button type="button" className="text-xs text-sub" onClick={() => setShowTariffInfo(true)}>
            {t('dashboard.moreDetails')} <ChevronRight className="inline h-3 w-3" />
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
                  <p className="text-xs text-sub">
                    {(() => {
                      const k = getTariffKey(tariff)
                      const key = `tariffs.${k}.desc`
                      const v = t(key)
                      return v === key ? tariff.label : v
                    })()}
                  </p>
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
                {t('common.from')} {formatAmount(tariff.min_amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })} {t('common.to')} {formatAmount(tariff.max_amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
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
            <p className="text-sm font-semibold">{t('dashboard.enterPromo')}</p>
            <p className="text-xs text-sub">
              {t('toasts.promoSuccess')}
            </p>
          </div>
          <Sparkles className="h-6 w-6 text-[var(--color-primary)]" />
        </div>
        <div className="flex gap-3">
          <input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder={t('dashboard.enterPromo')}
            className="h-11 flex-1 rounded-full bg-[var(--color-bg-base)] px-4 text-sm text-[var(--color-text-main)] outline-none ring-1 ring-white/10 focus:ring-[var(--color-primary)]"
          />
          <LiquidGlassButton
            variant="primary"
            disabled={!promoCode || promoLoading}
            onClick={async () => {
              setPromoLoading(true)
              try {
                const res = await activatePromo(promoCode)
                toast.success(`${t('dashboard.credited')} +${formatAmount(res?.amount || 0, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}`, res?.message || t('toasts.promoSuccess'))
                setPromoCode('')
              } catch (e) {
                toast.error(e.message, t('common.error'))
              } finally {
                setPromoLoading(false)
              }
            }}
          >
            {promoLoading ? '...' : t('dashboard.activate')}
          </LiquidGlassButton>
        </div>
      </motion.section>

      {/* Support Section */}
      <SupportSection />

      <Modal
        isOpen={showTariffInfo}
        onClose={() => setShowTariffInfo(false)}
        title={t('modals.tariffInfo.title')}
      >
        <div className="space-y-3 text-sm text-[var(--color-text-main)]">
          <div className="card-surface p-4">
            <p className="font-semibold">Вклады</p>
            <p className="mt-1 text-sub">
              Ты выбираешь тариф и сумму депозита. Депозит начинает работать сразу после создания.
            </p>
          </div>

          <div className="card-surface p-4">
            <p className="font-semibold">Начисления</p>
            <p className="mt-1 text-sub">
              Доход начисляется каждые 24 часа по проценту тарифа. Накопления можно собирать на баланс или реинвестировать.
            </p>
          </div>

          <div className="card-surface p-4">
            <p className="font-semibold">Вывод</p>
            <p className="mt-1 text-sub">
              В любой момент можно вывести вклад. Операции отображаются в разделе транзакций.
            </p>
          </div>
        </div>
      </Modal>

      {/* Deposit Modal */}
      <TopUpModal 
        isOpen={showTopUpModal} 
        onClose={() => setShowTopUpModal(false)} 
      />
    </div>
  )
}
