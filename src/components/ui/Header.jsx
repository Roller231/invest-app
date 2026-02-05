import { useState } from 'react'
import { Plus, ArrowLeft, MoreVertical, X } from 'lucide-react'
import { motion } from 'framer-motion'
import TopUpModal from '../modals/TopUpModal'
import { useApp } from '../../context/AppContext'

export default function Header({ 
  balance = 0, 
  avatarUrl,
  avatarName = 'U',
  showBack = false, 
  onBack,
  onDeposit,
  showMenu = true 
}) {
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const { currency, toggleCurrency, formatAmount } = useApp()

  const handleDeposit = onDeposit || (() => setShowTopUpModal(true))
  const balanceValue = formatAmount(balance, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
    .replace(/\s?₽$/, '')
    .replace(/^\$/, '')

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-6 mt-[75px]"
      >
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-card)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center">
                <svg viewBox="0 0 40 40" className="h-10 w-10">
                  <polygon 
                    points="20,2 38,20 20,38 2,20" 
                    fill="var(--color-primary)" 
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                  />
                  <polygon 
                    points="20,8 32,20 20,32 8,20" 
                    fill="var(--color-bg-base)" 
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="balance-glass-badge">
            <span className="balance-glass-symbol">{currency === 'USD' ? '$' : '₽'}</span>
            <span className="balance-glass-value">{balanceValue}</span>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleCurrency}
            className="flex h-10 items-center justify-center rounded-full bg-[var(--color-bg-card)] px-3 text-xs font-semibold text-[var(--color-text-main)] ring-1 ring-white/10"
          >
            {currency === 'USD' ? '$' : '₽'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeposit}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]"
          >
            <Plus className="h-5 w-5 text-[var(--color-primary-text)]" />
          </motion.button>

          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 overflow-hidden">
            {avatarUrl && !avatarFailed ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="h-full w-full object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white font-semibold">
                {(avatarName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {!onDeposit && (
        <TopUpModal
          isOpen={showTopUpModal}
          onClose={() => setShowTopUpModal(false)}
        />
      )}
    </>
  )
}
