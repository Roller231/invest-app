import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  CheckCircle, 
  Loader2, 
  TrendingUp, 
  ArrowRightLeft,
  Wallet,
  BarChart3,
  Zap,
  Shield,
  Target,
  DollarSign
} from 'lucide-react'
import Modal from '../ui/Modal'
import LiquidGlassButton from '../ui/LiquidGlassButton'

const tradingSteps = [
  { id: 1, text: 'Инициализация торгового модуля...', icon: Zap, duration: 800 },
  { id: 2, text: 'Подключение к торговому серверу...', icon: Shield, duration: 1200 },
  { id: 3, text: 'Авторизация торгового аккаунта...', icon: Wallet, duration: 900 },
  { id: 4, text: 'Перевод депозита на торговый счёт...', icon: DollarSign, duration: 1500 },
  { id: 5, text: 'Анализ рыночных условий...', icon: BarChart3, duration: 1100 },
  { id: 6, text: 'Подбор оптимальной торговой пары...', icon: ArrowRightLeft, duration: 1300 },
  { id: 7, text: 'Расчёт точки входа...', icon: Target, duration: 1000 },
  { id: 8, text: 'Торговый счёт запущен в работу!', icon: TrendingUp, duration: 500 },
]

const tradingPairs = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'TON/USDT', 'XRP/USDT'
]

const strategies = [
  'Скальпинг', 'Свинг-трейдинг', 'Арбитраж', 'Маркет-мейкинг'
]

export default function TradingSimulationModal({ isOpen, onClose, tariff, depositAmount }) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [selectedPair, setSelectedPair] = useState(null)
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [profitPreview, setProfitPreview] = useState(null)
  const [tradingActive, setTradingActive] = useState(false)
  const [liveProfit, setLiveProfit] = useState(0)
  const [trades, setTrades] = useState([])
  const logsRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setIsRunning(false)
      setCurrentStep(0)
      setCompletedSteps([])
      setSelectedPair(null)
      setSelectedStrategy(null)
      setProfitPreview(null)
      setTradingActive(false)
      setLiveProfit(0)
      setTrades([])
    }
  }, [isOpen])

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [completedSteps, currentStep])

  const startTrading = async () => {
    setIsRunning(true)
    setCompletedSteps([])
    setCurrentStep(0)
    setTradingActive(false)
    setLiveProfit(0)
    setTrades([])

    // Random pair and strategy
    const pair = tradingPairs[Math.floor(Math.random() * tradingPairs.length)]
    const strategy = strategies[Math.floor(Math.random() * strategies.length)]
    setSelectedPair(pair)
    setSelectedStrategy(strategy)

    // Calculate expected profit
    const dailyPercent = tariff?.daily_percent || 3.2
    const expectedProfit = (depositAmount || 1000) * (dailyPercent / 100)
    setProfitPreview(expectedProfit)

    // Run through steps
    for (let i = 0; i < tradingSteps.length; i++) {
      setCurrentStep(i)
      await new Promise(resolve => setTimeout(resolve, tradingSteps[i].duration))
      setCompletedSteps(prev => [...prev, tradingSteps[i].id])
    }

    setIsRunning(false)
    setTradingActive(true)

    // Start simulating live trades
    simulateLiveTrades()
  }

  const simulateLiveTrades = () => {
    const interval = setInterval(() => {
      if (!tradingActive) {
        clearInterval(interval)
        return
      }

      const tradeTypes = ['BUY', 'SELL']
      const type = tradeTypes[Math.floor(Math.random() * tradeTypes.length)]
      const amount = (Math.random() * 0.5 + 0.1).toFixed(4)
      const profit = (Math.random() * 2 - 0.5).toFixed(2)
      
      const newTrade = {
        id: Date.now(),
        type,
        pair: selectedPair,
        amount,
        profit: parseFloat(profit),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }

      setTrades(prev => [newTrade, ...prev].slice(0, 10))
      setLiveProfit(prev => prev + parseFloat(profit))
    }, 2000 + Math.random() * 3000)

    // Stop after 30 seconds
    setTimeout(() => {
      clearInterval(interval)
    }, 30000)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Торговый терминал" fullScreen topOffset={75}>
      <div className="space-y-4">
        {/* Tariff Info */}
        <div className="rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-sub)]">Тариф</p>
              <p className="font-bold text-lg">{tariff?.name || 'OKX'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--color-text-sub)]">Доходность</p>
              <p className="font-bold text-lg text-[var(--color-primary)]">+{tariff?.daily_percent || 3.2}%/день</p>
            </div>
          </div>
          {depositAmount && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-sm text-[var(--color-text-sub)]">Сумма в работе</p>
              <p className="font-bold text-xl">{depositAmount.toLocaleString()} ₽</p>
            </div>
          )}
        </div>

        {/* Trading Log */}
        <div 
          ref={logsRef}
          className="rounded-2xl bg-[var(--color-bg-base)] p-4 h-[55vh] overflow-y-auto scrollbar-hide space-y-2 font-mono text-sm"
        >
          {!isRunning && completedSteps.length === 0 && !tradingActive && (
            <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-sub)]">
              <BarChart3 className="h-12 w-12 mb-3 opacity-50" />
              <p>Нажмите "Запустить торговлю"</p>
              <p className="text-xs mt-1">для начала работы алгоритма</p>
            </div>
          )}

          <AnimatePresence>
            {tradingSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = currentStep === index && isRunning
              const isVisible = isCompleted || isCurrent

              if (!isVisible) return null

              const Icon = step.icon

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    isCompleted 
                      ? 'bg-[var(--color-green)]/20 text-[var(--color-green)]' 
                      : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                  <span className={isCompleted ? 'text-[var(--color-green)]' : 'text-[var(--color-primary)]'}>
                    {step.text}
                  </span>
                </motion.div>
              )
            })}

            {/* Additional info after steps complete */}
            {completedSteps.length === tradingSteps.length && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-3 mt-3 border-t border-white/10 space-y-2"
                >
                  <div className="flex items-center gap-2 text-[var(--color-text-sub)]">
                    <ArrowRightLeft className="h-4 w-4" />
                    <span>Торговая пара: <span className="text-[var(--color-primary)] font-semibold">{selectedPair}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--color-text-sub)]">
                    <Target className="h-4 w-4" />
                    <span>Стратегия: <span className="text-[var(--color-primary)] font-semibold">{selectedStrategy}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--color-text-sub)]">
                    <TrendingUp className="h-4 w-4" />
                    <span>Ожидаемая прибыль: <span className="text-[var(--color-green)] font-semibold">+{profitPreview?.toFixed(2)} ₽/день</span></span>
                  </div>
                </motion.div>

                {/* Live trades */}
                {trades.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-3 mt-3 border-t border-white/10"
                  >
                    <p className="text-xs text-[var(--color-text-sub)] mb-2">Последние сделки:</p>
                    {trades.slice(0, 5).map((trade) => (
                      <motion.div
                        key={trade.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <span className={trade.type === 'BUY' ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}>
                          {trade.type} {trade.amount} {trade.pair.split('/')[0]}
                        </span>
                        <span className="text-[var(--color-text-sub)]">{trade.time}</span>
                        <span className={trade.profit >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}>
                          {trade.profit >= 0 ? '+' : ''}{trade.profit} ₽
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Start Button */}
        {!tradingActive && (
          <LiquidGlassButton
            variant="primary"
            fullWidth
            size="lg"
            icon={isRunning ? Loader2 : Play}
            disabled={isRunning}
            onClick={startTrading}
          >
            {isRunning ? 'Запуск...' : 'Запустить торговлю'}
          </LiquidGlassButton>
        )}

        {tradingActive && (
          <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-green)]">
            <div className="h-2 w-2 rounded-full bg-[var(--color-green)] animate-pulse" />
            Торговля активна
          </div>
        )}
      </div>
    </Modal>
  )
}
