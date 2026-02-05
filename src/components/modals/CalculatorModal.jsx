import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp } from 'lucide-react'
import Modal from '../ui/Modal'
import LiquidGlassButton from '../ui/LiquidGlassButton'
import { useApp } from '../../context/AppContext'

const tariffs = [
  { id: 'okx', name: 'OKX', apy: 3.2, min: 100, max: 10000, color: '#FCD535' },
  { id: 'bybit', name: 'Bybit', apy: 4.2, min: 10000, max: 100000, color: '#F7A600' },
  { id: 'binance', name: 'Binance', apy: 5.2, min: 100000, max: 5000000, color: '#FCD535' },
]

export default function CalculatorModal({ isOpen, onClose }) {
  const { formatAmount } = useApp()
  const [selectedTariff, setSelectedTariff] = useState('okx')
  const [amount, setAmount] = useState('1000')

  const tariff = tariffs.find(t => t.id === selectedTariff)
  
  const calculations = useMemo(() => {
    const amt = parseFloat(amount) || 0
    const dailyRate = tariff.apy / 100
    
    return {
      daily: amt * dailyRate,
      monthly: amt * dailyRate * 30,
      yearly: amt * dailyRate * 365,
    }
  }, [amount, tariff])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Калькулятор доходности">
      <div className="space-y-5">
        {/* Tariff Selection */}
        <div>
          <p className="mb-3 text-sm font-medium text-[var(--color-text-sub)]">
            Выберите тариф
          </p>
          <div className="grid grid-cols-3 gap-2">
            {tariffs.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTariff(t.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl border p-3 transition-all ${
                  selectedTariff === t.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-white/10 bg-[var(--color-bg-base)]'
                }`}
              >
                <span className="text-sm font-bold">{t.name}</span>
                <span className="text-xs text-[var(--color-green)]">+{t.apy}%</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-text-sub)]">
            Сумма вложения (мин. {formatAmount(tariff.min, { maximumFractionDigits: 0, minimumFractionDigits: 0 })})
          </p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={tariff.min}
            placeholder={`От ${formatAmount(tariff.min, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`}
            className="h-14 w-full rounded-2xl bg-[var(--color-bg-base)] px-4 text-xl font-bold outline-none ring-1 ring-white/10 focus:ring-[var(--color-primary)]"
          />
          <p className="mt-2 text-xs text-[var(--color-text-sub)]">
            Диапазон: {formatAmount(tariff.min, { maximumFractionDigits: 0, minimumFractionDigits: 0 })} — {formatAmount(tariff.max, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
          </p>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--color-text-sub)]">
            Ваш доход
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-3"
          >
            <div className="flex items-center justify-between rounded-2xl bg-[var(--color-bg-base)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-green)]/20">
                  <TrendingUp className="h-5 w-5 text-[var(--color-green)]" />
                </div>
                <span className="text-sm text-[var(--color-text-sub)]">За 24 часа</span>
              </div>
              <span className="text-lg font-bold text-[var(--color-green)]">
                +{formatAmount(calculations.daily, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[var(--color-bg-base)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/20">
                  <Calculator className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <span className="text-sm text-[var(--color-text-sub)]">За месяц</span>
              </div>
              <span className="text-lg font-bold text-[var(--color-primary)]">
                +{formatAmount(calculations.monthly, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]">
                  <span className="text-lg">🚀</span>
                </div>
                <span className="text-sm font-medium">За год</span>
              </div>
              <span className="text-xl font-bold text-[var(--color-primary)]">
                +{formatAmount(calculations.yearly, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
              </span>
            </div>
          </motion.div>
        </div>

        <LiquidGlassButton
          variant="primary"
          fullWidth
          size="lg"
          onClick={onClose}
        >
          Начать инвестировать
        </LiquidGlassButton>
      </div>
    </Modal>
  )
}
