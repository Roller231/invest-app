import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function Modal({ isOpen, onClose, title, children, fullScreen = false, className = '' }) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={
              fullScreen
                ? `fixed inset-0 z-[9999] mx-auto max-w-none rounded-none bg-[var(--color-bg-card)] ${className}`
                : `fixed inset-x-4 bottom-0 z-[9999] mx-auto max-w-md rounded-t-3xl bg-[var(--color-bg-card)] ${className}`
            }
            style={
              fullScreen
                ? { height: '100dvh', overflow: 'hidden' }
                : { maxHeight: '90dvh', overflow: 'hidden' }
            }
          >
            <div className="h-full overflow-y-auto p-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-base)] transition-colors hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
