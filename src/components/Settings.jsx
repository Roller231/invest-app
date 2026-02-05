import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, CheckCircle, ChevronLeft, Globe, DollarSign } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../i18n'
import { useToast } from './ui/ToastProvider'

export default function Settings({ onBack }) {
  const { user, currency, toggleCurrency } = useApp()
  const { t, language, toggleLanguage } = useTranslation()
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)

  const tgId = user?.tg_id || user?.id || '—'

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(String(tgId))
      setCopied(true)
      toast.success(t('settings.idCopied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-3 mt-[75px]"
      >
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-card)]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{t('settings.title')}</h1>
      </motion.header>

      {/* Avatar & ID */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface p-6 flex flex-col items-center"
      >
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 overflow-hidden mb-4">
          {user?.avatar_url && !avatarFailed ? (
            <img
              src={user.avatar_url}
              alt="avatar"
              className="h-full w-full object-cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white text-3xl font-bold">
              {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <p className="text-lg font-semibold mb-1">
          {user?.first_name || user?.username || 'User'}
        </p>

        <button
          onClick={copyId}
          className="flex items-center gap-2 text-sm text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] transition-colors"
        >
          <span>{t('settings.userId')}: {tgId}</span>
          {copied ? (
            <CheckCircle className="h-4 w-4 text-[var(--color-green)]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
        <p className="text-xs text-[var(--color-text-sub)] mt-1">{t('settings.tapToCopy')}</p>
      </motion.section>

      {/* Settings */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-surface divide-y divide-white/10"
      >
        {/* Currency */}
        <button
          onClick={toggleCurrency}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium">{t('settings.currency')}</p>
              <p className="text-xs text-[var(--color-text-sub)]">
                {currency === 'RUB' ? '₽ Рубль' : '$ Dollar'}
              </p>
            </div>
          </div>
          <div className="balance-glass-badge px-3 py-1 text-sm font-semibold">
            {currency === 'RUB' ? '₽' : '$'}
          </div>
        </button>

        {/* Language */}
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium">{t('settings.language')}</p>
              <p className="text-xs text-[var(--color-text-sub)]">
                {language === 'ru' ? t('settings.russian') : t('settings.english')}
              </p>
            </div>
          </div>
          <div className="balance-glass-badge px-3 py-1 text-sm font-semibold">
            {language.toUpperCase()}
          </div>
        </button>
      </motion.section>
    </div>
  )
}
