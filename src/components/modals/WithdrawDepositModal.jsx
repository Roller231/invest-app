import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, MessageCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import Modal from '../ui/Modal'
import LiquidGlassButton from '../ui/LiquidGlassButton'
import { useApp } from '../../context/AppContext'
import { useToast } from '../ui/ToastProvider.jsx'

const steps = [
  {
    number: 1,
    title: 'Напишите менеджеру',
    description: 'Укажите сумму и реквизиты для вывода',
  },
  {
    number: 2,
    title: 'Подтверждение операции',
    description: 'Менеджер проверит условия вашего тарифа',
  },
  {
    number: 3,
    title: 'Получение средств',
    description: 'Деньги будут переведены в течение 24 часов',
  },
]

export default function WithdrawDepositModal({ isOpen, onClose }) {
  const { stats, withdrawDeposit, formatAmount } = useApp()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const depositAmount = stats?.total_deposit || 0
  const isEligible = depositAmount >= 100000

  const handleWithdrawDeposit = async () => {
    setLoading(true)
    setError(null)
    try {
      await withdrawDeposit()
      toast.success('Заявка создана', 'Вывод депозита')
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Вывод вклада">
      <div className="space-y-5">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent p-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/20">
              <Wallet className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="font-semibold">Вывод вклада</p>
              <p className="text-sm text-[var(--color-text-sub)]">
                Доступно при депозите от {formatAmount(100000, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Process Steps */}
        <div>
          <p className="mb-4 text-sm font-medium text-[var(--color-text-sub)]">
            Процесс вывода вклада
          </p>
          <p className="mb-4 text-sm text-[var(--color-text-sub)]">
            Для вывода вклада необходимо связаться с менеджером
          </p>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-[var(--color-primary-text)]">
                  {step.number}
                </div>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm text-[var(--color-text-sub)]">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Requirements Warning */}
        <div className="rounded-2xl border border-[var(--color-red)]/30 bg-[var(--color-red)]/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--color-red)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-red)]">Требования</p>
              <p className="mt-1 text-sm text-[var(--color-text-sub)]">
                Вывод доступен только клиентам на тарифе Binance с депозитом от {formatAmount(100000, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="rounded-2xl bg-[var(--color-bg-base)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-sub)]">Ваш депозит:</span>
            <span className={`font-bold ${isEligible ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
              {formatAmount(depositAmount, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {isEligible ? (
              <>
                <CheckCircle className="h-4 w-4 text-[var(--color-green)]" />
                <span className="text-sm text-[var(--color-green)]">Вывод доступен</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-[var(--color-red)]" />
                <span className="text-sm text-[var(--color-red)]">
                  Необходимо ещё {formatAmount(Math.max(0, 100000 - depositAmount), { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
                </span>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-[var(--color-red)]/10 p-3 text-center">
            <p className="text-sm text-[var(--color-red)]">{error}</p>
          </div>
        )}

        <LiquidGlassButton
          variant={isEligible ? 'primary' : 'secondary'}
          fullWidth
          size="lg"
          icon={MessageCircle}
          disabled={!isEligible || loading}
          onClick={handleWithdrawDeposit}
        >
          {loading ? 'Обработка...' : 'Запросить вывод депозита'}
        </LiquidGlassButton>
      </div>
    </Modal>
  )
}
