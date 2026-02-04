import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function LiquidGlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  fullWidth = false,
  icon: Icon,
}) {
  const buttonRef = useRef(null)
  const [ripples, setRipples] = useState([])

  const variants = {
    primary: 'bg-[var(--color-primary)] text-[var(--color-primary-text)]',
    secondary: 'bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-white/10',
    danger: 'bg-[var(--color-red)] text-white',
    success: 'bg-[var(--color-green)] text-white',
    ghost: 'bg-transparent text-[var(--color-text-main)] hover:bg-white/5',
  }

  const sizes = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
    xl: 'h-14 px-8 text-lg',
  }

  const handleClick = (e) => {
    if (disabled) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples((prev) => [...prev, { x, y, id }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 600)

    onClick?.(e)
  }

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        relative overflow-hidden rounded-full font-semibold
        transition-all duration-300 ease-out
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* Liquid glass overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)',
        }}
      />

      {/* Animated border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          boxShadow: variant === 'primary' 
            ? '0 0 20px rgb(var(--color-primary-rgb) / 0.40), inset 0 0 20px rgb(var(--color-primary-rgb) / 0.12)'
            : '0 0 20px rgba(255, 255, 255, 0.1)',
        }}
      />

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 100,
            height: 100,
            marginLeft: -50,
            marginTop: -50,
            background: variant === 'primary'
              ? 'radial-gradient(circle, rgba(30,35,41,0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgb(var(--color-primary-rgb) / 0.22) 0%, transparent 70%)',
          }}
        />
      ))}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {Icon && <Icon className="h-5 w-5" />}
        {children}
      </span>
    </motion.button>
  )
}
