import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'

export default function RatesWidget({ items = [] }) {
  const scrollerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const { formatAmount } = useApp()

  const normalized = useMemo(() => {
    return (items || []).map((it) => {
      const change = Number(it?.change_24h ?? it?.change ?? 0)
      const trend = it?.trend || (change >= 0 ? 'up' : 'down')
      const price = Number(it?.price_rub ?? it?.price ?? 0)
      return {
        ...it,
        price,
        change,
        trend,
        isUp: trend === 'up' || change >= 0,
      }
    })
  }, [items])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const onScroll = () => {
      const w = el.clientWidth || 1
      const idx = Math.round(el.scrollLeft / w)
      setActiveIndex(Math.max(0, Math.min(idx, normalized.length - 1)))
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => el.removeEventListener('scroll', onScroll)
  }, [normalized.length])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    if (normalized.length <= 1) return

    const id = setInterval(() => {
      const w = el.clientWidth || 1
      const nextIndex = activeIndex >= normalized.length - 1 ? 0 : activeIndex + 1
      el.scrollTo({ left: nextIndex * w, behavior: 'smooth' })
    }, 4000)

    return () => clearInterval(id)
  }, [activeIndex, normalized.length])

  if (!normalized.length) return null

  return (
    <div className="space-y-2 bg-[#191a1f]">
      <div
        ref={scrollerRef}
        className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth bg-[#191a1f] rounded-3xl overflow-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {normalized.map((asset, idx) => {
          const ticker = asset.symbol || asset.ticker || asset.id || ''
          const title = asset.name || ticker
          const isUp = asset.isUp

          return (
            <div key={asset.id || `${ticker}-${idx}`} className="w-full shrink-0 snap-center">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#2a3139] p-4"
                style={{
                  boxShadow: '0 10px 26px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl"
                  style={{
                    background: isUp
                      ? 'radial-gradient(circle, rgba(14,203,129,0.35) 0%, rgba(14,203,129,0) 70%)'
                      : 'radial-gradient(circle, rgba(246,70,93,0.35) 0%, rgba(246,70,93,0) 70%)',
                  }}
                />

                <div className="relative flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/85">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                      LIVE
                    </span>
                  </div>
                </div>

                <div className="relative mt-3 flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5">
                    {asset.icon ? (
                      <img src={asset.icon} alt={ticker} className="h-10 w-10 rounded-xl" draggable={false} />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-white/10" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-lg font-semibold text-white">{title}</div>
                      <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-white/80">
                        {ticker}
                      </div>
                    </div>

                    <div className="mt-1 flex items-center gap-3">
                      <div className="text-xl font-bold text-white">
                        {formatAmount(asset.price, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
                      </div>

                      <div
                        className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                          isUp
                            ? 'bg-[rgba(14,203,129,0.14)] text-[rgb(14,203,129)]'
                            : 'bg-[rgba(246,70,93,0.14)] text-[rgb(246,70,93)]'
                        }`}
                      >
                        {isUp ? '↗' : '↘'} {Math.abs(asset.change).toFixed(2)}%
                      </div>
                    </div>

                    <div className="mt-1 text-sm text-white/45">Изменение за 24ч</div>
                  </div>
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {normalized.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-[var(--color-primary)]' : 'w-1.5 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  )
}
