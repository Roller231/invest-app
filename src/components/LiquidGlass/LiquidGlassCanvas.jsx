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
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+8px)]">
      <div className="apple-glass-navbar">
        <div className="apple-glass-inner">
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id
            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                whileTap={{ scale: 0.95 }}
                className="apple-tab-item"
              >
                {isActive && (
                  <motion.div
                    layoutId="apple-tab-capsule"
                    className="apple-tab-capsule"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <Icon
                  className={`apple-tab-icon ${isActive ? 'active' : ''}`}
                  strokeWidth={1.8}
                />
                <span className={`apple-tab-label ${isActive ? 'active' : ''}`}>
                  {label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
