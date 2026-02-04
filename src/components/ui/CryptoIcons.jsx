import { motion } from 'framer-motion'

const cryptos = [
  { id: 'usdt', symbol: '₮', color: '#26A17B', name: 'Tether' },
  { id: 'ton', symbol: '💎', color: '#0098EA', name: 'Toncoin' },
  { id: 'eth', symbol: 'Ξ', color: '#627EEA', name: 'Ethereum' },
  { id: 'btc', symbol: '₿', color: '#F7931A', name: 'Bitcoin' },
]

export default function CryptoIcons({ showMore = true }) {
  return (
    <div className="flex items-center gap-2">
      {cryptos.map((crypto, index) => (
        <motion.div
          key={crypto.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: crypto.color + '30', color: crypto.color }}
          title={crypto.name}
        >
          {crypto.symbol}
        </motion.div>
      ))}
      {showMore && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex h-9 items-center justify-center rounded-full bg-[var(--color-bg-card)] px-3 text-xs font-medium text-[var(--color-text-sub)]"
        >
          +5
        </motion.div>
      )}
    </div>
  )
}
