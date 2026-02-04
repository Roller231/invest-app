import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Dashboard from './components/Dashboard.jsx'
import WalletScreen from './components/Wallet.jsx'
import Profile from './components/Profile.jsx'
import Friends from './components/Friends.jsx'
import Exchange from './components/Exchange.jsx'
import { LiquidGlassCanvas } from './components/LiquidGlass'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')

  const screens = useMemo(
    () => ({
      home: <Dashboard />,
      wallet: <WalletScreen />,
      profile: <Profile />,
      friends: <Friends />,
      market: <Exchange />,
    }),
    []
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      {/* Main content */}
      <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-32 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {screens[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3D Liquid Glass Navigation */}
      <LiquidGlassCanvas activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
