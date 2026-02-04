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

export default function Friends() {
  const { user, getReferralStats } = useApp()
  const [copied, setCopied] = useState(false)
  const [refStats, setRefStats] = useState(null)
  const totalUsers = 61094

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
      <Header balance={user?.balance || 0} />

      {/* Main Referral Block */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface p-5"
      >
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">
            Приглашайте партнеров по ссылке,
            <br />
            получайте <span className="text-[var(--color-primary)]">31%</span> с депозитов
          </h2>
        </div>

        {/* Total Users */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full border-2 border-[var(--color-bg-card)] bg-gradient-to-br from-purple-400 to-pink-500"
              />
            ))}
          </div>
          <span className="font-bold">{totalUsers.toLocaleString()}</span>
          <span className="text-sm text-[var(--color-text-sub)]">Всего пользователей</span>
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
            Пригласить друзей
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
            Скопировать реферальную ссылку
          </p>
          <p className="text-sm font-medium break-all">{referralLink}</p>
        </div>
      </motion.section>

      {/* Statistics */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-semibold">Статистика</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-surface p-4 text-center"
          >
            <p className="text-3xl font-bold">{stats.partners}</p>
            <p className="text-sm text-[var(--color-text-sub)]">Партнеров</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card-surface p-4 text-center"
          >
            <p className="text-3xl font-bold">{stats.earned} <span className="text-lg">₽</span></p>
            <p className="text-sm text-[var(--color-text-sub)]">Заработано</p>
          </motion.div>
        </div>

        <div className="card-surface divide-y divide-white/5">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-sm">Активных партнеров:</span>
            </div>
            <span className="font-bold">{stats.activePartners}</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[var(--color-green)]" />
              <span className="text-sm">Партнеров 1 уровня:</span>
            </div>
            <span className="font-bold">{stats.level1Partners}</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-sm">Партнеров 2-3 уровня:</span>
            </div>
            <span className="font-bold">{stats.level23Partners}</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-red)] text-xs font-bold text-white">₽</span>
              <span className="text-sm">Всего пополнено:</span>
            </div>
            <span className="font-bold">{stats.totalDeposited}₽</span>
          </div>
        </div>
      </section>

      {/* Partner Levels */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-semibold">Партнерские уровни:</p>
        </div>

        <div className="card-surface p-4">
          <p className="text-xs text-[var(--color-text-sub)] mb-4">
            Начисление происходит за каждое пополнение депозита вашего партнера/реферала на разных уровнях
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
                  <p className="mt-2 text-sm font-bold">1 уровень</p>
                  <p className="text-lg font-bold text-[var(--color-green)]">+20%</p>
                  <p className="text-xs text-[var(--color-text-sub)]">от пополнения депозита</p>
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
                    <span className="text-sm font-medium">2 уровень</span>
                  </div>
                  <p className="text-lg font-bold text-[var(--color-primary)]">+7%</p>
                  <p className="text-xs text-[var(--color-text-sub)]">от пополнения депозита</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl bg-[var(--color-bg-base)] p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-[var(--color-text-sub)]" />
                    <span className="text-sm font-medium">3 уровень</span>
                  </div>
                  <p className="text-lg font-bold text-[var(--color-primary)]">+4%</p>
                  <p className="text-xs text-[var(--color-text-sub)]">от пополнения депозита</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Instructions */}
      <section className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface p-4"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-red)] text-lg font-bold text-white">
              1
            </div>
            <div className="flex-1">
              <p className="font-semibold">Пригласите первого партнёра</p>
              <span className="inline-block mt-1 rounded-full bg-[var(--color-primary)]/20 px-2 py-0.5 text-xs text-[var(--color-primary)]">
                Ожидается
              </span>
              <p className="mt-2 text-sm text-[var(--color-text-sub)]">
                Приглашайте друзей по реферальной ссылке
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Referral Program Rules */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-semibold">Правила реферальной программы</p>
        </div>

        <div className="card-surface p-4 space-y-3">
          <p className="text-sm text-[var(--color-text-sub)]">
            Приглашайте партнеров по уникальной ссылке
          </p>
          <p className="text-sm text-[var(--color-text-sub)]">
            После активации их депозита в стейкинге вы получите <span className="text-[var(--color-primary)] font-bold">31%</span> от суммы на ваш баланс
          </p>
          <p className="text-sm text-[var(--color-text-sub)]">
            Начисления происходят автоматически
          </p>
        </div>
      </section>

      {/* Support Section */}
      <SupportSection />
    </div>
  )
}
