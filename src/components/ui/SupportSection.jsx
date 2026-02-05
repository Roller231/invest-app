import { motion } from 'framer-motion'
import LiquidGlassButton from './LiquidGlassButton'
import CryptoIcons from './CryptoIcons'
import { useTranslation } from '../../i18n'

export default function SupportSection({ showTransferButton = true }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <span className="text-[var(--color-primary)]">BINANCE</span>
      </div>

      <p className="text-sm text-[var(--color-text-sub)]">{t('dashboard.support')}</p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface p-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-red-400 to-red-600">
            <div className="absolute inset-0 flex items-center justify-center text-3xl">
              👩‍💼
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{t('dashboard.support')}</p>
              <span className="rounded-full bg-[var(--color-green)] px-2 py-0.5 text-xs font-bold text-white">
                24/7
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-sub)]">
              {t('dashboard.supportDesc')}
            </p>
          </div>
        </div>

        <LiquidGlassButton
          variant="secondary"
          fullWidth
          className="mt-4"
          onClick={() => window.open('https://t.me/support', '_blank')}
        >
          {t('dashboard.contactSupport')}
        </LiquidGlassButton>
      </motion.div>

      <div className="p-1.5">
        <CryptoIcons />
      </div>

      <p className="text-center text-xs text-[var(--color-text-sub)]">
        © 2026 BINANCE. {t('footer.rightsReserved')}
      </p>
    </div>
  )
}
