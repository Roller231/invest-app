import { useState, useEffect, useRef } from 'react'
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
  HelpCircle,
  Play
} from 'lucide-react'
import { marketTrends, faqItems } from '../data.js'
import Header from './ui/Header'
import LiquidGlassButton from './ui/LiquidGlassButton'
import SupportSection from './ui/SupportSection'
import DepositModal from './modals/DepositModal'
import WithdrawDepositModal from './modals/WithdrawDepositModal'
import TradingSimulationModal from './modals/TradingSimulationModal'
import { useApp } from '../context/AppContext'
import { useToast } from './ui/ToastProvider.jsx'

export default function Profile() {
  const { user, stats, tariffs, activeDeposit, toggleAutoReinvest, collectAccumulated, reinvest, withdrawDeposit, refreshUser, processPayouts } = useApp()
  const toast = useToast()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawDepositModal, setShowWithdrawDepositModal] = useState(false)
  const [showTradingModal, setShowTradingModal] = useState(false)
  const [activeTariffTab, setActiveTariffTab] = useState('current')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [loading, setLoading] = useState(false)
  
  const deposit = stats?.total_deposit || 0
  const profit = stats?.total_earned || 0
  const accumulated = stats?.accumulated || 0
  const currentTariff = tariffs?.find(t => t.name === stats?.current_tariff_name) || tariffs?.[0]
  const nextTariff = tariffs?.find(t => t.name === stats?.next_tariff_name)
  const amountToNextTariff = stats?.amount_to_next_tariff || 0

  // Calculate time left until next payout using server-provided seconds
  const timeToPayoutRef = useRef(stats?.time_to_next_payout || 0)
  const hadPositiveCountdownRef = useRef(false)
  
  useEffect(() => {
    // Update ref when stats change
    if (stats?.time_to_next_payout !== undefined) {
      timeToPayoutRef.current = stats.time_to_next_payout
      if (stats.time_to_next_payout > 0) {
        hadPositiveCountdownRef.current = true
      }
    }
  }, [stats?.time_to_next_payout])
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const seconds = timeToPayoutRef.current
      
      if (seconds <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 }
      }
      
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      return { hours, minutes, seconds: secs }
    }

    setTimeLeft(calculateTimeLeft())
    
    const timer = setInterval(() => {
      if (timeToPayoutRef.current > 0) {
        timeToPayoutRef.current -= 1
        setTimeLeft(calculateTimeLeft())
      } else if (timeToPayoutRef.current === 0 && hadPositiveCountdownRef.current) {
        // Time's up - trigger payout processing and refresh
        timeToPayoutRef.current = -1 // Prevent multiple triggers
        hadPositiveCountdownRef.current = false
        processPayouts()
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [processPayouts])

  const formatTime = (num) => num.toString().padStart(2, '0')

  return (
    <div className="space-y-6">
      <Header
        balance={user?.balance || 0}
        avatarUrl={user?.avatar_url}
        avatarName={user?.first_name || user?.username || 'U'}
      />

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface overflow-hidden"
      >
        <div className="bg-gradient-to-br from-[var(--color-primary)]/20 via-transparent to-transparent p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--color-text-sub)]">Активный вклад</p>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: currentTariff?.color ? currentTariff.color + '20' : 'var(--color-primary)/20',
                    color: currentTariff?.color || 'var(--color-primary)'
                  }}
                >
                  {currentTariff?.name || 'Нет тарифа'}
                </span>
                <span className="text-xs text-[var(--color-green)]">
                  +{currentTariff?.daily_percent || 0}% в день
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

          {deposit > 0 && stats?.time_to_next_payout > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <Timer className="h-4 w-4 text-[var(--color-text-sub)]" />
              <span className="text-sm text-[var(--color-text-sub)]">До начисления:</span>
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
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--color-bg-base)] p-3">
              <p className="text-xs text-[var(--color-text-sub)]">Накоплено</p>
              <p className="text-lg font-bold text-[var(--color-primary)]">
                {accumulated.toLocaleString()} ₽
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--color-bg-base)] p-3">
              <p className="text-xs text-[var(--color-text-sub)]">Всего заработано</p>
              <p className="text-lg font-bold text-[var(--color-green)]">
                +{profit.toLocaleString()} ₽
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex gap-3">
            <LiquidGlassButton
              variant="primary"
              fullWidth
              icon={RefreshCw}
              disabled={loading || accumulated <= 0 || deposit <= 0}
              onClick={async () => {
                setLoading(true)
                try {
                  const result = await reinvest()
                  toast.success(`Новый вклад: ${result.new_deposit_amount?.toLocaleString()}₽`, 'Реинвест выполнен')
                } catch (e) {
                  toast.error(e.message, 'Ошибка')
                } finally {
                  setLoading(false)
                }
              }}
            >
              Реинвест
            </LiquidGlassButton>
            <LiquidGlassButton
              variant="success"
              fullWidth
              icon={Download}
              disabled={loading || accumulated <= 0 || deposit <= 0}
              onClick={async () => {
                setLoading(true)
                try {
                  const result = await collectAccumulated()
                  toast.success(`+${result.collected.toFixed(2)}₽`, 'Переведено на баланс')
                } catch (e) {
                  toast.error(e.message, 'Ошибка')
                } finally {
                  setLoading(false)
                }
              }}
            >
              Собрать
            </LiquidGlassButton>
          </div>

          <motion.button
            whileHover={deposit > 0 ? { scale: 1.01 } : {}}
            whileTap={deposit > 0 ? { scale: 0.99 } : {}}
            onClick={async () => {
              if (deposit <= 0) return
              try {
                await toggleAutoReinvest()
              } catch (e) {
                toast.error(e.message, 'Ошибка')
              }
            }}
            className={`flex w-full items-center justify-between rounded-2xl bg-[var(--color-bg-base)] p-4 ${deposit <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3">
              <RefreshCw className={`h-5 w-5 ${user?.auto_reinvest ? 'text-[var(--color-green)]' : 'text-[var(--color-text-sub)]'}`} />
              <div>
                <span className="font-medium">Авто реинвест</span>
                <p className="text-xs text-[var(--color-text-sub)]">Автоматически каждые 24ч</p>
              </div>
            </div>
            {user?.auto_reinvest ? (
              <ToggleRight className="h-6 w-6 text-[var(--color-green)]" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-[var(--color-text-sub)]" />
            )}
          </motion.button>

          <LiquidGlassButton
            variant="secondary"
            fullWidth
            disabled={deposit <= 0}
            onClick={() => {
              if (deposit <= 0) return
              setShowWithdrawDepositModal(true)
            }}
          >
            Вывести вклад
          </LiquidGlassButton>

          <LiquidGlassButton
            variant="primary"
            fullWidth
            size="lg"
            icon={TrendingUp}
            onClick={() => setShowDepositModal(true)}
          >
            Инвестировать
          </LiquidGlassButton>

          <motion.button
            whileHover={deposit > 0 ? { scale: 1.02 } : {}}
            whileTap={deposit > 0 ? { scale: 0.98 } : {}}
            onClick={() => {
              if (deposit <= 0) return
              setShowTradingModal(true)
            }}
            disabled={deposit <= 0}
            className={`w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-green)]/20 p-4 border border-white/10 ${deposit <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/20">
                <Play className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Торговый терминал</p>
                <p className="text-xs text-[var(--color-text-sub)]">Смотреть процесс торговли</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--color-text-sub)]" />
          </motion.button>
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
                  <p className="font-bold text-lg">{currentTariff?.name || 'Нет тарифа'}</p>
                  <p className="text-xs text-[var(--color-text-sub)]">{currentTariff?.label}</p>
                </div>
                <div 
                  className="rounded-full px-4 py-2 text-lg font-bold"
                  style={{ backgroundColor: (currentTariff?.color || '#FCD535') + '20', color: currentTariff?.color || '#FCD535' }}
                >
                  +{currentTariff?.daily_percent || 0}%
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
                  <p className="font-bold text-lg">{nextTariff?.name || 'Максимальный тариф'}</p>
                  <p className="text-xs text-[var(--color-text-sub)]">{nextTariff?.label || 'Вы достигли максимума'}</p>
                </div>
                <div 
                  className="rounded-full px-4 py-2 text-lg font-bold"
                  style={{ backgroundColor: (nextTariff?.color || '#FCD535') + '20', color: nextTariff?.color || '#FCD535' }}
                >
                  +{nextTariff?.daily_percent || 0}%
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-[var(--color-bg-base)] p-3">
                <p className="text-xs text-[var(--color-text-sub)]">До следующего тарифа</p>
                <p className="font-semibold text-[var(--color-primary)]">
                  {amountToNextTariff.toLocaleString()} ₽
                </p>
              </div>
              {nextTariff && (
                <div className="mt-3">
                  <div className="h-2 rounded-full bg-[var(--color-bg-base)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((deposit / (nextTariff?.min_amount || 1)) * 100, 100)}%` }}
                      className="h-full bg-[var(--color-primary)]"
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-sub)] text-right">
                    {Math.min((deposit / (nextTariff?.min_amount || 1)) * 100, 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Market Trends */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-semibold">В тренде</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {marketTrends.slice(0, 6).map((asset, index) => {
            const isUp = asset.trend === 'up'
            const lineColor = isUp ? 'var(--color-green)' : 'var(--color-red)'
            // Static chart path - same for all cards (matches reference: sharp rise, jagged peaks, then drop + flatter tail)
            const staticPath = 'M 0 52 L 6 40 L 12 34 L 18 38 L 24 30 L 30 44 L 36 26 L 42 34 L 48 48 L 54 42 L 60 50 L 66 46 L 72 52 L 78 49 L 84 53 L 90 51 L 96 54 L 100 53'
            
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative overflow-hidden rounded-2xl p-3"
                style={{
                  background: 'linear-gradient(145deg, rgba(20, 20, 24, 0.95) 0%, rgba(12, 12, 14, 0.98) 100%)',
                  border: `1px solid ${lineColor}`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 20px ${isUp ? 'rgba(14, 203, 129, 0.15)' : 'rgba(246, 70, 93, 0.15)'}, 0 4px 16px rgba(0,0,0,0.25)`
                }}
              >
                {/* Static Line Chart SVG - same shape for all */}
                <div className="trend-chart absolute top-0 right-3 w-[58%] h-[56%]">
                  <svg viewBox="0 0 100 70" preserveAspectRatio="none" className="w-full h-full">
                    <path
                      d={staticPath}
                      fill="none"
                      stroke={lineColor}
                      className="trend-chart-line"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Crypto Icon */}
                  <div className="flex items-center gap-2 mb-9">
                    <img 
                      src={asset.icon || `https://cryptologos.cc/logos/${asset.name.toLowerCase()}-${asset.symbol.toLowerCase()}-logo.png`}
                      alt={asset.symbol}
                      className={`rounded-full ${(asset.id === 'eth' || asset.id === 'sol') ? 'h-9 w-9' : 'h-8 w-8'}`}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `https://ui-avatars.com/api/?name=${asset.symbol}&background=${asset.color?.replace('#', '')}&color=fff&size=32`
                      }}
                    />
                  </div>
                  
                  {/* Name and Change */}
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{asset.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      isUp 
                        ? 'bg-[var(--color-green)]/20 text-[var(--color-green)]' 
                        : 'bg-[var(--color-red)]/20 text-[var(--color-red)]'
                    }`}>
                      {isUp ? '↑' : '↓'} {Math.abs(asset.change)}%
                    </span>
                  </div>
                  
                  {/* Price */}
                  <p className="text-lg font-bold">
                    {asset.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                  </p>
                </div>
              </motion.div>
            )
          })}
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
      <TradingSimulationModal
        isOpen={showTradingModal}
        onClose={() => setShowTradingModal(false)}
        tariff={currentTariff}
        depositAmount={deposit}
      />
    </div>
  )
}
