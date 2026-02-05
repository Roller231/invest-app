import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Copy, 
  CheckCircle, 
  CreditCard, 
  Smartphone, 
  MessageCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import Modal from '../ui/Modal'
import LiquidGlassButton from '../ui/LiquidGlassButton'
import api from '../../api/client'
import { useTranslation } from '../../i18n'

export default function TopUpModal({ isOpen, onClose }) {
  const { t } = useTranslation()
  const [requisites, setRequisites] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [selectedRequisite, setSelectedRequisite] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadRequisites()
    }
  }, [isOpen])

  const loadRequisites = async () => {
    setLoading(true)
    try {
      const data = await api.getPaymentRequisites()
      setRequisites(data || [])
    } catch (error) {
      console.error('Failed to load requisites:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />
      case 'sbp':
        return <Smartphone className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const openTelegramSupport = () => {
    window.open('https://t.me/your_manager', '_blank')
  }

  const handleClose = () => {
    setSelectedRequisite(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('modals.topUp.title')}>
      <div className="space-y-5">
        {/* Instructions */}
        <div className="rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold text-sm">
              1
            </div>
            <div>
              <p className="font-medium text-sm">{t('modals.topUp.step1')}</p>
              <p className="text-xs text-[var(--color-text-sub)]">{t('modals.topUp.step1Desc')}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold text-sm">
              2
            </div>
            <div>
              <p className="font-medium text-sm">{t('modals.topUp.step2')}</p>
              <p className="text-xs text-[var(--color-text-sub)]">{t('modals.topUp.step2Desc')}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold text-sm">
              3
            </div>
            <div>
              <p className="font-medium text-sm">{t('modals.topUp.step3')}</p>
              <p className="text-xs text-[var(--color-text-sub)]">{t('modals.topUp.step3Desc')}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-green)]/20 text-[var(--color-green)] font-bold text-sm">
              ✓
            </div>
            <div>
              <p className="font-medium text-sm">{t('modals.topUp.step4')}</p>
              <p className="text-xs text-[var(--color-text-sub)]">{t('modals.topUp.step4Desc')}</p>
            </div>
          </div>
        </div>

        {/* Requisites List */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--color-text-sub)]">{t('modals.topUp.requisites')}</p>
          
          {loading ? (
            <div className="py-8 text-center text-[var(--color-text-sub)]">
              <div className="animate-spin h-8 w-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm">{t('common.loading')}</p>
            </div>
          ) : requisites.length === 0 ? (
            <div className="py-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-[var(--color-text-sub)] opacity-50" />
              <p className="text-sm text-[var(--color-text-sub)]">
                {t('modals.topUp.noRequisites')}
              </p>
              <p className="text-xs text-[var(--color-text-sub)] mt-1">
                {t('modals.topUp.contactManager')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {requisites.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-[var(--color-bg-base)] overflow-hidden"
                >
                  <button
                    onClick={() => setSelectedRequisite(selectedRequisite === req.id ? null : req.id)}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ 
                          backgroundColor: (req.color || '#8B5CF6') + '20',
                          color: req.color || '#8B5CF6'
                        }}
                      >
                        {req.icon || getIcon(req.type)}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{req.name}</p>
                        {req.bank_name && (
                          <p className="text-xs text-[var(--color-text-sub)]">{req.bank_name}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight 
                      className={`h-5 w-5 text-[var(--color-text-sub)] transition-transform ${
                        selectedRequisite === req.id ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  
                  {selectedRequisite === req.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10 p-4 space-y-3"
                    >
                      {/* Details */}
                      <div className="rounded-xl bg-[var(--color-bg-card)] p-3">
                        <p className="text-xs text-[var(--color-text-sub)] mb-1">
                          {req.type === 'card' ? t('modals.topUp.cardNumber') : req.type === 'sbp' ? t('modals.topUp.phoneNumber') : t('modals.topUp.requisites')}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="font-mono font-bold text-lg">{req.details}</p>
                          <button
                            onClick={() => copyToClipboard(req.details, req.id)}
                            aria-label={copiedId === req.id ? t('common.copied') : t('common.copy')}
                            className="flex items-center justify-center text-[var(--color-primary)]"
                          >
                            {copiedId === req.id ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Copy className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Holder name */}
                      {req.holder_name && (
                        <div className="rounded-xl bg-[var(--color-bg-card)] p-3">
                          <p className="text-xs text-[var(--color-text-sub)] mb-1">{t('modals.topUp.recipient')}</p>
                          <p className="font-medium">{req.holder_name}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Manager Button */}
        <LiquidGlassButton
          variant="primary"
          fullWidth
          size="lg"
          icon={MessageCircle}
          onClick={openTelegramSupport}
        >
          {t('modals.topUp.writeManager')}
        </LiquidGlassButton>

        {/* Warning */}
        <div className="flex items-start gap-2 text-xs text-[var(--color-text-sub)]">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            {t('modals.topUp.warning')}
          </p>
        </div>
      </div>
    </Modal>
  )
}
