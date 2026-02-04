import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Wallet } from 'lucide-react'
import Modal from '../ui/Modal'
import LiquidGlassButton from '../ui/LiquidGlassButton'

const banks = [
  { id: 'sber', label: 'Сбербанк', color: '#21A038' },
  { id: 'alfa', label: 'Альфа-Банк', color: '#EF3124' },
  { id: 'tbank', label: 'Т-Банк', color: '#FFDD2D' },
  { id: 'vtb', label: 'ВТБ', color: '#009FDF' },
  { id: 'ozon', label: 'Ozon Банк', color: '#005BFF' },
  { id: 'raiff', label: 'Райффайзен', color: '#FEE600' },
]

export default function WithdrawModal({ isOpen, onClose, balance = 0 }) {
  const [selectedBank, setSelectedBank] = useState(null)
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('+7')
  const [cardNumber, setCardNumber] = useState('')
  const [step, setStep] = useState(1)

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 1) return '+7'
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
  }

  const formatCard = (value) => {
    const digits = value.replace(/\D/g, '')
    return digits.replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
  }

  const handleSubmit = () => {
    setStep(2)
  }

  const handleClose = () => {
    setStep(1)
    setSelectedBank(null)
    setAmount('')
    setPhone('+7')
    setCardNumber('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 1 ? 'Вывод средств' : 'Успешно!'}>
      {step === 1 ? (
        <div className="space-y-5">
          {/* Balance Display */}
          <div className="rounded-2xl bg-[var(--color-bg-base)] p-4 text-center">
            <p className="text-sm text-[var(--color-text-sub)]">Доступно для вывода</p>
            <p className="text-2xl font-bold text-[var(--color-primary)]">
              {balance.toLocaleString()} ₽
            </p>
          </div>

          {/* Bank Selection */}
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--color-text-sub)]">
              Выберите банк
            </p>
            <div className="grid grid-cols-3 gap-2">
              {banks.map((bank) => (
                <motion.button
                  key={bank.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedBank(bank.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${
                    selectedBank === bank.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-white/10 bg-[var(--color-bg-base)]'
                  }`}
                >
                  <span 
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: bank.color }}
                  />
                  <span className="text-xs font-medium">{bank.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--color-text-sub)]">
              Сумма вывода
            </p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="h-12 w-full rounded-2xl bg-[var(--color-bg-base)] px-4 text-lg font-semibold outline-none ring-1 ring-white/10 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Phone Input */}
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--color-text-sub)]">
              Номер телефона
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="+7 (999) 999-99-99"
              className="h-12 w-full rounded-2xl bg-[var(--color-bg-base)] px-4 text-lg font-semibold outline-none ring-1 ring-white/10 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Card Number Input */}
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--color-text-sub)]">
              Номер карты
            </p>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCard(e.target.value))}
              placeholder="0000 0000 0000 0000"
              className="h-12 w-full rounded-2xl bg-[var(--color-bg-base)] px-4 text-lg font-semibold outline-none ring-1 ring-white/10 focus:ring-[var(--color-primary)]"
            />
          </div>

          <LiquidGlassButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedBank || !amount || !cardNumber}
          >
            Готово
          </LiquidGlassButton>
        </div>
      ) : (
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
            <h3 className="text-xl font-bold">Успешно!</h3>
            <p className="mt-2 text-sm text-[var(--color-text-sub)]">
              Запрос на вывод {parseInt(amount).toLocaleString()} ₽ создан
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--color-bg-base)] p-4 text-left">
            <p className="text-sm text-[var(--color-text-sub)]">
              ⏱️ Обработка займет до 24 часов
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent p-4 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]">
                <span className="text-lg">💬</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Поддержка 24/7</p>
                <p className="text-xs text-[var(--color-text-sub)]">
                  Свяжитесь с нами при возникновении вопросов
                </p>
              </div>
            </div>
          </div>

          <LiquidGlassButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleClose}
          >
            Понятно
          </LiquidGlassButton>
        </motion.div>
      )}
    </Modal>
  )
}
