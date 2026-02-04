import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calculator, 
  Landmark, 
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Info
} from 'lucide-react'
import { paymentMethods, cryptoPayments } from '../data.js'
import Header from './ui/Header'
import LiquidGlassButton from './ui/LiquidGlassButton'
import SupportSection from './ui/SupportSection'
import TopUpModal from './modals/TopUpModal'
import WithdrawModal from './modals/WithdrawModal'
import CalculatorModal from './modals/CalculatorModal'
import { useApp } from '../context/AppContext'

export default function Wallet() {
  const { user, getUserTransactions } = useApp()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showCalculatorModal, setShowCalculatorModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [transactionHistory, setTransactionHistory] = useState([])
  const balance = user?.balance || 0

  useEffect(() => {
    const fetchTransactions = async () => {
      const txType = activeTab === 'deposits' ? 'deposit' : activeTab === 'withdrawals' ? 'withdraw' : null
      const data = await getUserTransactions(txType)
      setTransactionHistory(data || [])
    }
    fetchTransactions()
  }, [getUserTransactions, activeTab])

  const tabs = [
    { id: 'all', label: 'Все' },
    { id: 'deposits', label: 'Пополнения' },
    { id: 'withdrawals', label: 'Вывод' },
  ]

  const filteredHistory = transactionHistory.filter(tx => {
    if (activeTab === 'all') return true
    if (activeTab === 'deposits') return tx.type === 'deposit'
    if (activeTab === 'withdrawals') return tx.type === 'withdraw'
    return true
  })

  return (
    <div className="space-y-6">
      <Header 
        balance={balance} 
        avatarUrl={user?.avatar_url}
        avatarName={user?.first_name || user?.username || 'U'}
        onDeposit={() => setShowDepositModal(true)} 
      />

      {/* Balance Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface overflow-hidden"
      >
        <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent p-5">
          <p className="text-sm text-[var(--color-text-sub)]">Баланс кошелька</p>
          <motion.p 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mt-2 text-center text-4xl font-bold"
          >
            {balance.toLocaleString()} <span className="text-xl">₽</span>
          </motion.p>
          <p className="mt-1 text-center text-sm text-[var(--color-text-sub)]">
            ≈ {(balance / 92.5).toFixed(2)} USDT
          </p>
        </div>
        
        <div className="flex gap-3 p-4">
          <LiquidGlassButton
            variant="primary"
            fullWidth
            size="lg"
            icon={ArrowDownToLine}
            onClick={() => setShowDepositModal(true)}
          >
            Пополнить
          </LiquidGlassButton>
          <LiquidGlassButton
            variant="secondary"
            fullWidth
            size="lg"
            icon={ArrowUpFromLine}
            onClick={() => setShowWithdrawModal(true)}
          >
            Вывести
          </LiquidGlassButton>
        </div>
      </motion.section>

      {/* Calculator Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowCalculatorModal(true)}
        className="card-surface flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/20">
            <Calculator className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <div className="text-left">
            <p className="font-semibold">Калькулятор</p>
            <p className="text-xs text-[var(--color-text-sub)]">Рассчитайте доходность</p>
          </div>
        </div>
        <span className="text-[var(--color-primary)]">→</span>
      </motion.button>

      {/* Payment Methods */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-surface p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold">Платежные решения</p>
            <p className="text-xs text-sub">Доступные способы оплаты</p>
          </div>
          <Landmark className="h-6 w-6 text-[var(--color-primary)]" />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[...paymentMethods, ...cryptoPayments].map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: method.color + '20' }}
            >
              {method.abbr}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Deposit Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-start gap-3 rounded-2xl bg-[var(--color-primary)]/10 p-4"
      >
        <Info className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
        <div>
          <p className="text-sm font-medium">Пополните депозит</p>
          <p className="text-xs text-[var(--color-text-sub)]">
            Минимальная сумма пополнения — 100 ₽. Бонус +10% при депозите от 50 000 ₽
          </p>
        </div>
      </motion.div>

      {/* Transaction History */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-semibold">История транзакций</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 rounded-full bg-[var(--color-bg-card)] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-full py-2 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                  : 'text-[var(--color-text-sub)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-2">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-surface flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    tx.type === 'deposit' 
                      ? 'bg-[var(--color-green)]/20' 
                      : 'bg-[var(--color-red)]/20'
                  }`}>
                    {tx.type === 'deposit' ? (
                      <ArrowDownToLine className={`h-5 w-5 text-[var(--color-green)]`} />
                    ) : (
                      <ArrowUpFromLine className={`h-5 w-5 text-[var(--color-red)]`} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {tx.type === 'deposit' ? 'Пополнение' : tx.type === 'withdraw' ? 'Вывод' : tx.type === 'profit' ? 'Прибыль' : tx.type}
                    </p>
                    <p className="text-xs text-[var(--color-text-sub)]">
                      {tx.created_at ? new Date(tx.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.amount > 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} ₽
                  </p>
                  <p className={`text-xs ${
                    tx.status === 'completed' ? 'text-[var(--color-green)]' : 'text-[var(--color-primary)]'
                  }`}>
                    {tx.status === 'completed' ? 'Выполнено' : 'В обработке'}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-8 text-center text-[var(--color-text-sub)]">
              <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Транзакции не найдены</p>
            </div>
          )}
        </div>
      </section>

      {/* Support Section */}
      <SupportSection />

      {/* Modals */}
      <TopUpModal 
        isOpen={showDepositModal} 
        onClose={() => setShowDepositModal(false)} 
      />
      <WithdrawModal 
        isOpen={showWithdrawModal} 
        onClose={() => setShowWithdrawModal(false)}
        balance={balance}
      />
      <CalculatorModal 
        isOpen={showCalculatorModal} 
        onClose={() => setShowCalculatorModal(false)} 
      />
    </div>
  )
}
