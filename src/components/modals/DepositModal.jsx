import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, QrCode, Wallet, Bitcoin } from 'lucide-react'
import Modal from '../ui/Modal'
import LiquidGlassButton from '../ui/LiquidGlassButton'

const bankMethods = [
  { id: 'sbp', label: 'СБП', icon: '⚡', color: '#8B5CF6' },
  { id: 'qr', label: 'QR-код', icon: '📱', color: '#3B82F6' },
  { id: 'sber', label: 'Сбер', icon: '🟢', color: '#21A038' },
  { id: 'alfa', label: 'Альфа', icon: '🔴', color: '#EF3124' },
  { id: 'tbank', label: 'Т-Банк', icon: '🟡', color: '#FFDD2D' },
  { id: 'cash', label: 'Наличными', icon: '💵', color: '#10B981' },
]

const cryptoMethods = [
  { id: 'btc', label: 'BTC', icon: '₿', color: '#F7931A' },
  { id: 'ton', label: 'TON', icon: '💎', color: '#0098EA' },
  { id: 'usdt', label: 'USDT', icon: '₮', color: '#26A17B' },
  { id: 'eth', label: 'ETH', icon: 'Ξ', color: '#627EEA' },
]

const quickAmounts = [500, 1000, 3000, 5000, 10000, 50000]

export default function DepositModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('deposit')
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [amount, setAmount] = useState('')

  const tabs = [
    { id: 'deposit', label: 'Депозит' },
    { id: 'withdraw', label: 'Вывод' },
    { id: 'history', label: 'История' },
  ]

  const calculateBonus = (amt) => {
    const num = parseFloat(amt) || 0
    if (num >= 50000) return num * 0.1
    if (num >= 10000) return num * 0.05
    if (num >= 5000) return num * 0.03
    return 0
  }

  const bonus = calculateBonus(amount)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Депозит">
      {/* Tabs */}
      <div className="mb-6 flex gap-2 rounded-full bg-[var(--color-bg-base)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                : 'text-[var(--color-text-sub)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'deposit' && (
        <div className="space-y-6">
          {/* Bank Methods */}
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--color-text-sub)]">
              Банковский платеж
            </p>
            <div className="grid grid-cols-3 gap-2">
              {bankMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${
                    selectedMethod === method.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-white/10 bg-[var(--color-bg-base)]'
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="text-xs font-medium">{method.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Crypto Methods */}
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--color-text-sub)]">
              Криптовалюта
            </p>
            <div className="grid grid-cols-4 gap-2">
              {cryptoMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${
                    selectedMethod === method.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-white/10 bg-[var(--color-bg-base)]'
                  }`}
                >
                  <span 
                    className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold"
                    style={{ backgroundColor: method.color + '20', color: method.color }}
                  >
                    {method.icon}
                  </span>
                  <span className="text-xs font-medium">{method.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          {selectedMethod && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <p className="mb-3 text-sm font-medium text-[var(--color-text-sub)]">
                  Сумма пополнения
                </p>
                <div className="flex gap-2 flex-wrap mb-3">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        amount === amt.toString()
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                          : 'bg-[var(--color-bg-base)] text-[var(--color-text-sub)]'
                      }`}
                    >
                      {amt.toLocaleString()} ₽
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Введите сумму"
                  className="h-12 w-full rounded-2xl bg-[var(--color-bg-base)] px-4 text-lg font-semibold outline-none ring-1 ring-white/10 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* Bonus Display */}
              {bonus > 0 && (
                <div className="rounded-2xl bg-[var(--color-green)]/10 p-3 text-center">
                  <p className="text-sm text-[var(--color-green)]">
                    🎁 Бонус: <span className="font-bold">+{bonus.toLocaleString()} ₽</span>
                  </p>
                </div>
              )}

              <LiquidGlassButton
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => {
                  alert(`Заявка на пополнение ${amount} ₽ создана!`)
                  onClose()
                }}
              >
                Пополнить {amount ? `${parseInt(amount).toLocaleString()} ₽` : ''}
              </LiquidGlassButton>
            </motion.div>
          )}
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="py-8 text-center text-[var(--color-text-sub)]">
          <Wallet className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Перейдите в раздел "Вывод" для оформления заявки</p>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="py-8 text-center text-[var(--color-text-sub)]">
          <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>История транзакций пуста</p>
        </div>
      )}
    </Modal>
  )
}
