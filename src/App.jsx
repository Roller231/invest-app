import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Dashboard from './components/Dashboard.jsx'
import WalletScreen from './components/Wallet.jsx'
import Profile from './components/Profile.jsx'
import Friends from './components/Friends.jsx'
import Exchange from './components/Exchange.jsx'
import Settings from './components/Settings.jsx'
import { LiquidGlassCanvas } from './components/LiquidGlass'
import { AppProvider, useApp } from './context/AppContext'
import { ToastProvider } from './components/ui/ToastProvider.jsx'
import { I18nProvider, useTranslation } from './i18n'

function AppContent() {
  const [activeTab, setActiveTab] = useState('home')
  const [showSettings, setShowSettings] = useState(false)
  const { loading, error } = useApp()
  const { t } = useTranslation()

  const screens = useMemo(
    () => ({
      home: <Dashboard onAvatarClick={() => setShowSettings(true)} />,
      wallet: <WalletScreen onAvatarClick={() => setShowSettings(true)} />,
      profile: <Profile onAvatarClick={() => setShowSettings(true)} />,
      friends: <Friends onAvatarClick={() => setShowSettings(true)} />,
      market: <Exchange onAvatarClick={() => setShowSettings(true)} />,
    }),
    []
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mb-4 h-12 w-12 mx-auto rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
          <p className="text-[var(--color-text-sub)]">{t('common.loading')}</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] p-4">
        <div className="text-center">
          <p className="text-[var(--color-red)] mb-2">{t('common.error')}</p>
          <p className="text-sm text-[var(--color-text-sub)]">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      {/* Main content */}
      <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-32 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={showSettings ? 'settings' : activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {showSettings ? (
              <Settings onBack={() => setShowSettings(false)} />
            ) : (
              screens[activeTab]
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3D Liquid Glass Navigation */}
      {!showSettings && (
        <LiquidGlassCanvas activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AppProvider>
    </I18nProvider>
  )
}
