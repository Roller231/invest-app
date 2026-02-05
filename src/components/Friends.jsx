import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Share2, 
  Copy, 
  Users, 
  TrendingUp, 
  Zap,
  Award,
  CheckCircle,
  Clock
} from 'lucide-react'
import { referralLevels } from '../data.js'
import Header from './ui/Header'
import LiquidGlassButton from './ui/LiquidGlassButton'
import SupportSection from './ui/SupportSection'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../i18n'

export default function Friends({ onAvatarClick }) {
  const { user, getReferralStats, formatAmount, currency } = useApp()
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [refStats, setRefStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getReferralStats()
      if (data) setRefStats(data)
    }
    fetchStats()
  }, [getReferralStats])

  const stats = {
    partners: refStats?.total_partners || 0,
    earned: refStats?.total_earned || 0,
    activePartners: refStats?.active_partners || 0,
    level1Partners: refStats?.level1_partners || 0,
    level23Partners: refStats?.level23_partners || 0,
    totalDeposited: refStats?.total_deposited_by_referrals || 0,
  }

  const referralLink = refStats?.referral_link || user?.referral_link || `https://t.me/ggcat_game_bot?start=${user?.tg_id || ''}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'BINANCE - Инвестиционная платформа',
        text: 'Присоединяйся и получай до 31% от депозитов партнёров!',
        url: referralLink,
      })
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="space-y-6">
      <Header
        balance={user?.balance || 0}
        avatarUrl={user?.avatar_url}
        avatarName={user?.first_name || user?.username || 'U'}
        onAvatarClick={onAvatarClick}
      />

      {/* Main Referral Block */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface p-5"
      >
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">
            {t('friends.howItWorksDesc')}
          </h2>
        </div>

        {/* Invite Button */}
        <div className="flex gap-3 mb-4">
          <LiquidGlassButton
            variant="primary"
            fullWidth
            size="lg"
            icon={Share2}
            onClick={shareLink}
          >
            {t('friends.inviteFriend')}
          </LiquidGlassButton>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-base)]"
          >
            {copied ? (
              <CheckCircle className="h-5 w-5 text-[var(--color-green)]" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        {/* Referral Link */}
        <div className="rounded-2xl bg-[var(--color-bg-base)] p-4">
          <p className="text-xs text-[var(--color-text-sub)] mb-2">
            {t('friends.copyLink')}
          </p>
          <p className="text-sm font-medium break-all">{referralLink}</p>
        </div>
      </motion.section>

      {/* Statistics */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-semibold">{t('profile.statistics')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-surface p-4 text-center"
          >
            <p className="text-3xl font-bold">{stats.partners}</p>
            <p className="text-sm text-[var(--color-text-sub)]">{t('friends.partners')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card-surface p-4 text-center"
          >
            <p className="text-3xl font-bold">{formatAmount(stats.earned, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}</p>
            <p className="text-sm text-[var(--color-text-sub)]">{t('friends.earned')}</p>
          </motion.div>
        </div>

        <div className="card-surface divide-y divide-white/5">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-sm">{t('friends.partners')}:</span>
            </div>
            <span className="font-bold">{stats.activePartners}</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[var(--color-green)]" />
              <span className="text-sm">{t('friends.level')} 1:</span>
            </div>
            <span className="font-bold">{stats.level1Partners}</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-sm">{t('friends.level')} 2-3:</span>
            </div>
            <span className="font-bold">{stats.level23Partners}</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-red)] text-xs font-bold text-white">{currency === 'USD' ? '$' : '₽'}</span>
              <span className="text-sm">{t('friends.deposited')}:</span>
            </div>
            <span className="font-bold">{formatAmount(stats.totalDeposited, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}</span>
          </div>
        </div>
      </section>

      {/* Partner Levels */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-semibold">{t('friends.referralLevels')}:</p>
        </div>

        <div className="card-surface p-4">
          <p className="text-xs text-[var(--color-text-sub)] mb-4">
            {t('friends.howItWorksDesc')}
          </p>

          <div className="relative">
            {/* Level diagram */}
            <div className="flex items-center justify-center gap-4">
              {/* Level 1 - Main */}
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-base)] border-2 border-[var(--color-text-sub)]">
                    <Users className="h-8 w-8 text-[var(--color-text-sub)]" />
                  </div>
                  <p className="mt-2 text-sm font-bold">{t('friends.level')} 1</p>
                  <p className="text-lg font-bold text-[var(--color-green)]">+20%</p>
                  <p className="text-xs text-[var(--color-text-sub)]">{t('friends.fromDeposits')}</p>
                </motion.div>
              </div>

              {/* Level 2-3 */}
              <div className="flex flex-col gap-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl bg-[var(--color-bg-base)] p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-[var(--color-text-sub)]" />
                    <span className="text-sm font-medium">{t('friends.level')} 2</span>
                  </div>
                  <p className="text-lg font-bold text-[var(--color-primary)]">+7%</p>
                  <p className="text-xs text-[var(--color-text-sub)]">{t('friends.fromDeposits')}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl bg-[var(--color-bg-base)] p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-[var(--color-text-sub)]" />
                    <span className="text-sm font-medium">{t('friends.level')} 3</span>
                  </div>
                  <p className="text-lg font-bold text-[var(--color-primary)]">+4%</p>
                  <p className="text-xs text-[var(--color-text-sub)]">{t('friends.fromDeposits')}</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <SupportSection />
    </div>
  )
}
