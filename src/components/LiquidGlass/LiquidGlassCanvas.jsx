import { motion } from 'framer-motion'
import { Home, Wallet, User, Users, LineChart } from 'lucide-react'
import { useTranslation } from '../../i18n'

const getNavTabs = (t) => [
  { id: 'home', label: t('nav.home'), Icon: Home },
  { id: 'wallet', label: t('nav.wallet'), Icon: Wallet },
  { id: 'profile', label: t('nav.profile'), Icon: User },
  { id: 'friends', label: t('nav.friends'), Icon: Users },
  { id: 'market', label: t('nav.exchange'), Icon: LineChart },
]

export default function LiquidGlassCanvas({ activeTab, onTabChange }) {
  const { t } = useTranslation()
  const tabs = getNavTabs(t)
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
