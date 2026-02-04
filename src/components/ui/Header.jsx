import { Plus, ArrowLeft, MoreVertical, X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header({ 
  balance = 0, 
  showBack = false, 
  onBack,
  onDeposit,
  showMenu = true 
}) {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between mb-6"
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
            <span className="text-lg font-bold tracking-tight">
              <span className="text-[var(--color-primary)]">BINANCE</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-full bg-[var(--color-bg-card)] px-3 py-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-red)] text-xs font-bold text-white">
            ₽
          </span>
          <span className="text-sm font-semibold">
            {balance.toFixed(2)}
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDeposit}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]"
        >
          <Plus className="h-5 w-5 text-[var(--color-primary-text)]" />
        </motion.button>

        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 overflow-hidden">
          <div className="h-full w-full flex items-center justify-center text-white font-semibold">
            U
          </div>
        </div>
      </div>
    </motion.header>
  )
}
