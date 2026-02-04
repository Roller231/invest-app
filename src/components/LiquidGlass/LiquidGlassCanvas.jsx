import { motion } from 'framer-motion'
import { Home, Wallet, User, Users, LineChart } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Главная', Icon: Home },
  { id: 'wallet', label: 'Кошелек', Icon: Wallet },
  { id: 'profile', label: 'Кабинет', Icon: User },
  { id: 'friends', label: 'Друзья', Icon: Users },
  { id: 'market', label: 'Биржа', Icon: LineChart },
]

export default function LiquidGlassCanvas({ activeTab, onTabChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <div 
        className="liquid-glass-nav relative flex h-[74px] w-full items-stretch justify-between"
      >
        {/* Animated glass indicator */}
        <div />

        {/* Navigation buttons */}
        {tabs.map(({ id, label, Icon }) => (
          <motion.button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1 h-full"
          >
            {activeTab === id ? (
              <motion.div
                layoutId="liquid-active-pill"
                className="liquid-nav-pill"
                transition={{
                  type: 'spring',
                  stiffness: 520,
                  damping: 42,
                  mass: 0.6,
                }}
              />
            ) : null}

            <motion.span
              animate={{
                scale: activeTab === id ? 1.05 : 1,
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors duration-200 ${
                activeTab === id
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-main)]'
              }`}
            >
              <Icon className="h-5 w-5" />
            </motion.span>
            <span
              className={`text-[11px] font-medium transition-colors duration-200 ${
                activeTab === id ? 'text-[var(--color-primary)]' : 'text-sub'
              }`}
            >
              {label}
            </span>
          </motion.button>
        ))}
      </div>
    </nav>
  )
}
