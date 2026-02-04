import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, 
  ChevronDown,
  TrendingUp,
  Timer,
  Wallet,
  RefreshCw,
  Download,
  ToggleLeft,
  ToggleRight,
  HelpCircle
} from 'lucide-react'
import { tariffs, marketTrends, faqItems } from '../data.js'
import Header from './ui/Header'
import LiquidGlassButton from './ui/LiquidGlassButton'
import SupportSection from './ui/SupportSection'
import DepositModal from './modals/DepositModal'
import WithdrawDepositModal from './modals/WithdrawDepositModal'

export default function Profile() {
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawDepositModal, setShowWithdrawDepositModal] = useState(false)
  const [autoReinvest, setAutoReinvest] = useState(false)
  const [activeTariffTab, setActiveTariffTab] = useState('current')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 32 })
  
  const deposit = 15000
  const profit = 480
  const accumulated = 1250
  const currentTariff = tariffs.find(t => t.id === 'okx')
  const nextTariff = tariffs.find(t => t.id === 'bybit')
  const amountToNextTariff = nextTariff.min - deposit

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { hours: 23, minutes: 59, seconds: 59 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (num) => num.toString().padStart(2, '0')

  return (
    <div className="space-y-6">
      <Header 
        balance={deposit + accumulated} 
        onDeposit={() => setShowDepositModal(true)} 
      />

      {/* Deposit Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface overflow-hidden"
      >
        <div className="bg-gradient-to-br from-[var(--color-primary)]/20 via-transparent to-transparent p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--color-text-sub)]">Ваш депозит</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                  {currentTariff.name}
                </span>
                <span className="text-xs text-[var(--color-green)]">
                  {currentTariff.apyDisplay}
                </span>
              </div>
            </div>
            <Wallet className="h-6 w-6 text-[var(--color-primary)]" />
          </div>

          <motion.p 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold"
          >
            {deposit.toLocaleString()} ₽
          </motion.p>

          {/* Timer */}
          <div className="mt-4 flex items-center gap-3">
            <Timer className="h-4 w-4 text-[var(--color-text-sub)]" />
            <div className="flex gap-1 font-mono text-lg">
              <span className="rounded bg-[var(--color-bg-base)] px-2 py-1">
                {formatTime(timeLeft.hours)}
              </span>
              <span>:</span>
              <span className="rounded bg-[var(--color-bg-base)] px-2 py-1">
                {formatTime(timeLeft.minutes)}
              </span>
              <span>:</span>
              <span className="rounded bg-[var(--color-bg-base)] px-2 py-1">
                {formatTime(timeLeft.seconds)}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--color-bg-base)] p-3">
              <p className="text-xs text-[var(--color-text-sub)]">Накоплено</p>
              <p className="text-lg font-bold text-[var(--color-primary)]">
                {accumulated.toLocaleString()} ₽
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--color-bg-base)] p-3">
              <p className="text-xs text-[var(--color-text-sub)]">Прибыль</p>
              <p className="text-lg font-bold text-[var(--color-green)]">
                +{profit.toLocaleString()} ₽
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-3">
          <div className="flex gap-3">
            <LiquidGlassButton
              variant="primary"
              fullWidth
              icon={RefreshCw}
              onClick={() => alert('Реинвест выполнен!')}
            >
              Реинвест
            </LiquidGlassButton>
            <LiquidGlassButton
              variant="success"
              fullWidth
              icon={Download}
              onClick={() => alert('Прибыль собрана!')}
            >
              Собрать
            </LiquidGlassButton>
          </div>

          {/* Auto Reinvest Toggle */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setAutoReinvest(!autoReinvest)}
            className="flex w-full items-center justify-between rounded-2xl bg-[var(--color-bg-base)] p-4"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className={`h-5 w-5 ${autoReinvest ? 'text-[var(--color-green)]' : 'text-[var(--color-text-sub)]'}`} />
              <span className="font-medium">Авто реинвест</span>
            </div>
            {autoReinvest ? (
              <ToggleRight className="h-6 w-6 text-[var(--color-green)]" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-[var(--color-text-sub)]" />
            )}
          </motion.button>

          <LiquidGlassButton
            variant="secondary"
            fullWidth
            onClick={() => setShowWithdrawDepositModal(true)}
          >
            Вывести вклад
          </LiquidGlassButton>
        </div>
      </motion.section>

      {/* Tariff Plans */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-semibold">Тарифные планы</p>
        </div>

        {/* Tariff Tabs */}
        <div className="flex gap-2 rounded-full bg-[var(--color-bg-card)] p-1">
          <button
            onClick={() => setActiveTariffTab('current')}
            className={`flex-1 rounded-full py-2 text-xs font-medium transition-all ${
              activeTariffTab === 'current'
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                : 'text-[var(--color-text-sub)]'
            }`}
          >
            Текущий тариф
          </button>
          <button
            onClick={() => setActiveTariffTab('next')}
            className={`flex-1 rounded-full py-2 text-xs font-medium transition-all ${
              activeTariffTab === 'next'
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                : 'text-[var(--color-text-sub)]'
            }`}
          >
            Следующий тариф
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTariffTab === 'current' ? (
            <motion.div
              key="current"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="card-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">{currentTariff.name}</p>
                  <p className="text-xs text-[var(--color-text-sub)]">{currentTariff.label}</p>
                </div>
                <div 
                  className="rounded-full px-4 py-2 text-lg font-bold"
                  style={{ backgroundColor: currentTariff.color + '20', color: currentTariff.color }}
                >
                  {currentTariff.apyDisplay}
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-[var(--color-bg-base)] p-3">
                <p className="text-xs text-[var(--color-text-sub)]">Ваш депозит</p>
                <p className="font-semibold">{deposit.toLocaleString()} ₽</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="next"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">{nextTariff.name}</p>
                  <p className="text-xs text-[var(--color-text-sub)]">{nextTariff.label}</p>
                </div>
                <div 
                  className="rounded-full px-4 py-2 text-lg font-bold"
                  style={{ backgroundColor: nextTariff.color + '20', color: nextTariff.color }}
                >
                  {nextTariff.apyDisplay}
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-[var(--color-bg-base)] p-3">
                <p className="text-xs text-[var(--color-text-sub)]">До следующего тарифа</p>
                <p className="font-semibold text-[var(--color-primary)]">
                  {amountToNextTariff.toLocaleString()} ₽
                </p>
              </div>
              <div className="mt-3">
                <div className="h-2 rounded-full bg-[var(--color-bg-base)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(deposit / nextTariff.min) * 100}%` }}
                    className="h-full bg-[var(--color-primary)]"
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-sub)] text-right">
                  {((deposit / nextTariff.min) * 100).toFixed(0)}%
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Market Trends */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
            <p className="text-sm font-semibold">В тренде</p>
          </div>
          <button className="text-xs text-[var(--color-text-sub)]">
            Все <ChevronRight className="inline h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {marketTrends.slice(0, 6).map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-surface p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: asset.color + '20', color: asset.color }}
                >
                  {asset.symbol.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-medium">{asset.name}</p>
                  <p className="text-[10px] text-[var(--color-text-sub)]">{asset.symbol}</p>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-sm font-semibold">
                  {asset.price.toLocaleString()} ₽
                </p>
                <p className={`text-xs font-semibold ${
                  asset.trend === 'up' ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'
                }`}>
                  {asset.change > 0 ? '+' : ''}{asset.change}%
                </p>
              </div>
              {/* Mini chart placeholder */}
              <div className="mt-2 h-8 flex items-end gap-0.5">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${20 + Math.random() * 80}%`,
                      backgroundColor: asset.trend === 'up' 
                        ? 'var(--color-green)' 
                        : 'var(--color-red)',
                      opacity: 0.3 + (i / 12) * 0.7
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-semibold">FAQ</p>
        </div>

        <div className="space-y-2">
          {faqItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-surface overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-sm">{item.question}</span>
                <ChevronDown 
                  className={`h-4 w-4 text-[var(--color-text-sub)] transition-transform ${
                    expandedFaq === item.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {expandedFaq === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-[var(--color-text-sub)]">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Support Section */}
      <SupportSection />

      {/* Modals */}
      <DepositModal 
        isOpen={showDepositModal} 
        onClose={() => setShowDepositModal(false)} 
      />
      <WithdrawDepositModal
        isOpen={showWithdrawDepositModal}
        onClose={() => setShowWithdrawDepositModal(false)}
        depositAmount={deposit}
      />
    </div>
  )
}
