import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const banners = [
  {
    id: 1,
    gradient: 'from-[#1a1f2e] via-[#2a1f3d] to-[#1a2a3d]',
    tag: 'Промокод',
    tagValue: 'NG2026',
    emoji: '🎁',
    title: 'ПОЛУЧИ НА СВОЙ СЧЕТ',
    highlight: 'ПЕРВЫЕ 100₽',
    subtitle: 'ДЛЯ СТАРТА',
    description: 'ВВОДИ ПРОМОКОД НА ГЛАВНОЙ СТРАНИЦЕ ДЛЯ ПОЛУЧЕНИЯ ПРИЗА!',
    icon: '🎅',
  },
  {
    id: 2,
    gradient: 'from-[#1a2a1f] via-[#1f3d2a] to-[#1a3d2a]',
    tag: 'Акция',
    tagValue: 'x2',
    emoji: '💰',
    title: 'УДВОЕННЫЙ КЭШБЭК',
    highlight: 'ДО 4%',
    subtitle: 'НА ВСЕ ДЕПОЗИТЫ',
    description: 'ТОЛЬКО ДО КОНЦА МЕСЯЦА! УСПЕЙ ПОЛУЧИТЬ МАКСИМАЛЬНУЮ ВЫГОДУ',
    icon: '💎',
  },
  {
    id: 3,
    gradient: 'from-[#2a1f1a] via-[#3d2a1f] to-[#3d2a1a]',
    tag: 'VIP',
    tagValue: 'СТАТУС',
    emoji: '👑',
    title: 'ПОЛУЧИ VIP СТАТУС',
    highlight: 'БЕСПЛАТНО',
    subtitle: 'ПРИ ДЕПОЗИТЕ ОТ 50 000₽',
    description: 'ПЕРСОНАЛЬНЫЙ МЕНЕДЖЕР И ПОВЫШЕННЫЕ ЛИМИТЫ',
    icon: '🏆',
  },
  {
    id: 4,
    gradient: 'from-[#1f1a2a] via-[#2a1f3d] to-[#1f2a3d]',
    tag: 'Партнёрка',
    tagValue: '31%',
    emoji: '🤝',
    title: 'ПРИГЛАШАЙ ДРУЗЕЙ',
    highlight: 'ДО 31%',
    subtitle: 'ОТ ДЕПОЗИТОВ',
    description: '3 УРОВНЯ ПАРТНЁРСКОЙ ПРОГРАММЫ. ПОЛУЧАЙ ПАССИВНЫЙ ДОХОД!',
    icon: '🚀',
  },
]

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
    zIndex: 0,
  }),
}

export default function BannerCarousel() {
  const [[page, direction], setPage] = useState([0, 0])
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const currentIndex = ((page % banners.length) + banners.length) % banners.length

  const paginate = useCallback((newDirection) => {
    setPage([page + newDirection, newDirection])
  }, [page])

  const goToSlide = useCallback((index) => {
    const newDirection = index > currentIndex ? 1 : -1
    setPage([index, newDirection])
  }, [currentIndex])

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      paginate(1)
    }, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, paginate])

  const banner = banners[currentIndex]

  return (
    <section 
      className="relative overflow-hidden rounded-3xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="relative h-[180px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x
              if (swipe < -10000) {
                paginate(1)
              } else if (swipe > 10000) {
                paginate(-1)
              }
            }}
            className={`absolute inset-0 cursor-grab active:cursor-grabbing`}
          >
            <div className={`relative h-full overflow-hidden rounded-3xl bg-gradient-to-r ${banner.gradient} p-5`}>
              {/* Animated lights */}
              <div className="absolute left-0 right-0 top-0 flex justify-around py-1">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      opacity: [0.4, 1, 0.4],
                      scale: [0.8, 1.1, 0.8]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: i * 0.12,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: ['#F0B90B', '#00ff88', '#00aaff', '#ff00aa', '#ffaa00'][i % 5],
                      boxShadow: `0 0 8px ${['#F0B90B', '#00ff88', '#00aaff', '#ff00aa', '#ffaa00'][i % 5]}`
                    }}
                  />
                ))}
              </div>

              <div className="flex h-full items-center justify-between pt-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--color-text-sub)]">{banner.tag} -</span>
                    <span className="font-bold text-[var(--color-primary)]">{banner.tagValue}</span>
                    <span className="text-lg">{banner.emoji}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold leading-tight">
                    {banner.title}
                    <br />
                    <span className="text-[var(--color-primary)]">{banner.highlight}</span> {banner.subtitle}
                  </h3>
                  <p className="mt-2 text-xs text-[var(--color-text-sub)]">
                    {banner.description}
                  </p>
                </div>
                <motion.div 
                  className="relative h-24 w-24 shrink-0"
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {banner.icon}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={() => paginate(-1)}
          className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => paginate(1)}
          className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-3 flex justify-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex 
                ? 'w-6 bg-[var(--color-primary)]' 
                : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
