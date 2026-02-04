import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

function tone(type) {
  if (type === 'success') {
    return {
      wrap: 'bg-[var(--color-green)]/12 border-[var(--color-green)]/25',
      icon: 'text-[var(--color-green)]',
    }
  }
  if (type === 'error') {
    return {
      wrap: 'bg-[var(--color-red)]/12 border-[var(--color-red)]/25',
      icon: 'text-[var(--color-red)]',
    }
  }
  return {
    wrap: 'bg-[var(--color-primary)]/10 border-white/10',
    icon: 'text-[var(--color-primary)]',
  }
}

function Icon({ type }) {
  if (type === 'success') return <CheckCircle2 className="h-5 w-5" />
  if (type === 'error') return <AlertCircle className="h-5 w-5" />
  return <Info className="h-5 w-5" />
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const tm = timersRef.current.get(id)
    if (tm) {
      clearTimeout(tm)
      timersRef.current.delete(id)
    }
  }, [])

  const notify = useCallback((opts) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
    const toast = {
      id,
      type: opts?.type || 'info',
      title: opts?.title || '',
      message: opts?.message || '',
      duration: typeof opts?.duration === 'number' ? opts.duration : 3500,
    }

    setToasts((prev) => [toast, ...prev].slice(0, 4))

    if (toast.duration > 0) {
      const tm = setTimeout(() => dismiss(id), toast.duration)
      timersRef.current.set(id, tm)
    }

    return id
  }, [dismiss])

  const api = useMemo(() => {
    return {
      notify,
      dismiss,
      success: (message, title) => notify({ type: 'success', title, message }),
      error: (message, title) => notify({ type: 'error', title, message }),
      info: (message, title) => notify({ type: 'info', title, message }),
    }
  }, [dismiss, notify])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[10000]">
        <div className="mx-auto w-full max-w-md px-4 pt-4">
          <AnimatePresence initial={false}>
            {toasts.map((t) => {
              const cls = tone(t.type)
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className={`pointer-events-auto mb-2 flex items-start gap-3 rounded-2xl border p-4 backdrop-blur-md ${cls.wrap}`}
                >
                  <div className={`${cls.icon} mt-0.5`}>
                    <Icon type={t.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    {!!t.title && <p className="text-sm font-semibold">{t.title}</p>}
                    {!!t.message && <p className="text-sm text-[var(--color-text-sub)] break-words">{t.message}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
