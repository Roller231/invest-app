import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Wallet, CheckCircle, TrendingUp, Clock, Percent } from 'lucide-react'
import Modal from '../ui/Modal'
import LiquidGlassButton from '../ui/LiquidGlassButton'
import { useApp } from '../../context/AppContext'

const quickAmounts = [500, 1000, 5000, 10000, 50000, 100000]

export default function DepositModal({ isOpen, onClose }) {
  const { createDeposit, tariffs, user, formatAmount } = useApp()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState(null)

  // Calculate tariff and profit based on entered amount
  const investmentInfo = useMemo(() => {
    const num = parseFloat(amount) || 0
    if (num < 100 || !tariffs?.length) return null
    
    // Find appropriate tariff for this amount
    const sortedTariffs = [...tariffs].sort((a, b) => a.min_amount - b.min_amount)
    let selectedTariff = sortedTariffs[0]
    
    for (const tariff of sortedTariffs) {
      if (num >= tariff.min_amount && num <= tariff.max_amount) {
        selectedTariff = tariff
        break
      } else if (num >= tariff.min_amount) {
        selectedTariff = tariff
      }
    }
    
    const dailyProfit = num * (selectedTariff.daily_percent / 100)
    
    return {
      tariff: selectedTariff,
      dailyProfit,
      totalAfter24h: num + dailyProfit
    }
  }, [amount, tariffs])
  
  const handleCreateDeposit = async () => {
    setLoading(true)
    setError(null)
    try {
      const depositAmount = parseFloat(amount)
      if (depositAmount < 100) {
        throw new Error(`Минимальная сумма ${formatAmount(100, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`)
      }
      if (depositAmount > (user?.balance || 0)) {
        throw new Error('Недостаточно средств на балансе')
      }
      await createDeposit(depositAmount)
      setStep(2)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setAmount('')
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 1 ? "Инвестировать" : "Успешно!"}>
      {step === 1 && (
        <div className="space-y-5">
          {/* Balance Info */}
          <div className="rounded-2xl bg-[var(--color-bg-base)] p-4">
            <p className="text-xs text-[var(--color-text-sub)] mb-1">Доступно для инвестиций</p>
            <p className="text-2xl font-bold">{formatAmount(user?.balance || 0, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}</p>
          </div>

          {/* Amount Input */}
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--color-text-sub)]">
              Сумма вклада
            </p>
            <div className="flex gap-2 flex-wrap mb-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  disabled={amt > (user?.balance || 0)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    amount === amt.toString()
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                      : amt > (user?.balance || 0)
                        ? 'bg-[var(--color-bg-base)] text-[var(--color-text-sub)] opacity-50'
                        : 'bg-[var(--color-bg-base)] text-[var(--color-text-sub)]'
                  }`}
                >
                  {formatAmount(amt, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Введите сумму (мин. ${formatAmount(100, { maximumFractionDigits: 0, minimumFractionDigits: 0 })})`}
              className="h-12 w-full rounded-2xl bg-[var(--color-bg-base)] px-4 text-lg font-semibold outline-none ring-1 ring-white/10 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Tariff & Profit Preview */}
          {investmentInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-sm text-[var(--color-text-sub)]">Тариф:</span>
                </div>
                <span 
                  className="font-bold px-2 py-0.5 rounded-full text-sm"
                  style={{ 
                    backgroundColor: investmentInfo.tariff.color + '20',
                    color: investmentInfo.tariff.color 
                  }}
                >
                  {investmentInfo.tariff.name}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-[var(--color-green)]" />
                  <span className="text-sm text-[var(--color-text-sub)]">Доход в день:</span>
                </div>
                <span className="font-bold text-[var(--color-green)]">
                  +{investmentInfo.tariff.daily_percent}% (+{formatAmount(investmentInfo.dailyProfit, { maximumFractionDigits: 2, minimumFractionDigits: 2 })})
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-sm text-[var(--color-text-sub)]">Через 24 часа:</span>
                </div>
                <span className="font-bold text-lg">
                  {formatAmount(investmentInfo.totalAfter24h, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                </span>
              </div>
            </motion.div>
          )}

          {error && (
            <div className="rounded-2xl bg-[var(--color-red)]/10 p-3 text-center">
              <p className="text-sm text-[var(--color-red)]">{error}</p>
            </div>
          )}

          <LiquidGlassButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleCreateDeposit}
            disabled={loading || !amount || parseFloat(amount) < 100 || parseFloat(amount) > (user?.balance || 0)}
          >
            {loading ? 'Создание вклада...' : `Инвестировать ${amount ? `${formatAmount(parseInt(amount) || 0, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}` : ''}`}
          </LiquidGlassButton>
        </div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="py-6 text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
          >
            <CheckCircle className="mx-auto h-20 w-20 text-[var(--color-green)]" />
          </motion.div>
          
          <div>
            <h3 className="text-xl font-bold">Вклад создан!</h3>
            <p className="mt-2 text-sm text-[var(--color-text-sub)]">
              {formatAmount(parseInt(amount) || 0, { maximumFractionDigits: 0, minimumFractionDigits: 0 })} успешно инвестировано
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--color-bg-base)] p-4 text-left space-y-2">
            <p className="text-sm text-[var(--color-text-sub)]">
              ⏱️ Прибыль начислится через 24 часа
            </p>
            <p className="text-sm text-[var(--color-text-sub)]">
              � Следите за балансом в разделе "Кабинет"
            </p>
          </div>

          <LiquidGlassButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleClose}
          >
            Отлично!
          </LiquidGlassButton>
        </motion.div>
      )}

    </Modal>
  )
}
