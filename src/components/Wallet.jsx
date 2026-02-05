import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Calculator, 
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Info
} from 'lucide-react'
import Header from './ui/Header'
import LiquidGlassButton from './ui/LiquidGlassButton'
import SupportSection from './ui/SupportSection'
import TopUpModal from './modals/TopUpModal'
import WithdrawModal from './modals/WithdrawModal'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../i18n'

const tariffs = [
  { id: 'okx', name: 'OKX', apy: 3.2, min: 100, max: 10000, color: '#22D3EE' },
  { id: 'bybit', name: 'Bybit', apy: 4.2, min: 10000, max: 100000, color: '#38BDF8' },
  { id: 'binance', name: 'Binance', apy: 5.2, min: 100000, max: 5000000, color: '#22D3EE' },
]

export default function Wallet({ onAvatarClick }) {
  const { user, getUserTransactions, formatAmount } = useApp()
  const { t, language } = useTranslation()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [transactionHistory, setTransactionHistory] = useState([])
  const [selectedTariff, setSelectedTariff] = useState('okx')
  const [amount, setAmount] = useState('1000')
  const balance = user?.balance || 0

  const tariff = tariffs.find(t => t.id === selectedTariff)

  const calculations = useMemo(() => {
    const amt = parseFloat(amount) || 0
    const dailyRate = (tariff?.apy || 0) / 100

    return {
      daily: amt * dailyRate,
      monthly: amt * dailyRate * 30,
      yearly: amt * dailyRate * 365,
    }
  }, [amount, tariff])

  useEffect(() => {
    const fetchTransactions = async () => {
      const txType = activeTab === 'deposits' ? 'deposit' : activeTab === 'withdrawals' ? 'withdraw' : null
      const data = await getUserTransactions(txType)
      setTransactionHistory(data || [])
    }
    fetchTransactions()
  }, [getUserTransactions, activeTab])

  const tabs = [
    { id: 'all', label: t('wallet.all') },
    { id: 'deposits', label: t('wallet.deposits') },
    { id: 'withdrawals', label: t('wallet.withdrawals') },
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
        onAvatarClick={onAvatarClick}
      />

      {/* Balance Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface overflow-hidden"
      >
        <div className="bg-gradient-to-b from-[var(--color-primary)]/15 via-transparent to-transparent p-5 pb-3">
          <p className="text-sm text-[var(--color-text-sub)]">{t('wallet.walletBalance')}</p>
          <motion.p 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mt-2 text-center text-4xl font-bold"
          >
            {formatAmount(balance, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
          </motion.p>
        </div>
        
        <div className="flex gap-3 p-4">
          <LiquidGlassButton
            variant="primary"
            fullWidth
            size="lg"
            icon={ArrowDownToLine}
            onClick={() => setShowDepositModal(true)}
          >
            {t('wallet.topUp')}
          </LiquidGlassButton>
          <LiquidGlassButton
            variant="secondary"
            fullWidth
            size="lg"
            icon={ArrowUpFromLine}
            onClick={() => setShowWithdrawModal(true)}
          >
            {t('wallet.withdraw')}
          </LiquidGlassButton>
        </div>
      </motion.section>

      {/* Calculator Button */}
      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="card-surface p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/20">
            <Calculator className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <div className="text-left">
            <p className="font-semibold">{t('wallet.investmentCalc')}</p>
            <p className="text-xs text-[var(--color-text-sub)]">{t('wallet.calcDesc')}</p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--color-text-sub)]">
              {t('modals.deposit.tariff')}
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

          <div>
            <p className="mb-2 text-sm font-medium text-[var(--color-text-sub)]">
              {t('common.amount')} ({t('common.min')} {formatAmount(tariff?.min || 0, { maximumFractionDigits: 0, minimumFractionDigits: 0 })})
            </p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={tariff?.min}
              placeholder={tariff?.min ? `${t('common.from')} ${formatAmount(tariff.min, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}` : t('common.amount')}
              className="h-14 w-full rounded-2xl bg-[var(--color-bg-base)] px-4 text-xl font-bold outline-none ring-1 ring-white/10 focus:ring-[var(--color-primary)]"
            />
            <p className="mt-2 text-xs text-[var(--color-text-sub)]">
              {t('common.from')} {formatAmount(tariff?.min || 0, { maximumFractionDigits: 0, minimumFractionDigits: 0 })} {t('common.to')} {formatAmount(tariff?.max || 0, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--color-text-sub)]">{t('common.profit')}</p>

            <div className="flex items-center justify-between rounded-2xl bg-[var(--color-bg-base)] p-4">
              <span className="text-sm text-[var(--color-text-sub)]">{t('common.day')}</span>
              <span className="text-lg font-bold text-[var(--color-green)]">+{formatAmount(calculations.daily, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[var(--color-bg-base)] p-4">
              <span className="text-sm text-[var(--color-text-sub)]">{t('modals.calculator.days')} 30</span>
              <span className="text-lg font-bold text-[var(--color-primary)]">+{formatAmount(calculations.monthly, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent p-4">
              <span className="text-sm font-medium">{t('modals.calculator.days')} 365</span>
              <span className="text-xl font-bold text-[var(--color-primary)]">
                +{formatAmount(calculations.yearly, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Payment Methods */}
      {null}

      {/* Deposit Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-start gap-3 rounded-2xl bg-[var(--color-primary)]/10 p-4"
      >
        <Info className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
        <div>
          <p className="text-sm font-medium">{t('wallet.minDeposit')}</p>
          <p className="text-xs text-[var(--color-text-sub)]">
            {t('wallet.bonusFrom')} {formatAmount(50000, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
          </p>
        </div>
      </motion.div>

      {/* Transaction History */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-semibold">{t('wallet.history')}</p>
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
                      {tx.type === 'deposit' ? t('dashboard.deposit') : tx.type === 'withdraw' ? t('dashboard.withdrawal') : tx.type === 'profit' ? t('common.profit') : tx.type}
                    </p>
                    <p className="text-xs text-[var(--color-text-sub)]">
                      {tx.created_at ? new Date(tx.created_at).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.amount > 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'
                  }`}>
                    {tx.amount > 0 ? '+' : '-'}{formatAmount(Math.abs(tx.amount), { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
                  </p>
                  <p className={`text-xs ${
                    tx.status === 'completed' ? 'text-[var(--color-green)]' : 'text-[var(--color-primary)]'
                  }`}>
                    {tx.status === 'completed' ? t('common.completed') : t('common.pending')}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-8 text-center text-[var(--color-text-sub)]">
              <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t('wallet.noTransactions')}</p>
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
    </div>
  )
}
