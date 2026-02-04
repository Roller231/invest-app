import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus
} from 'lucide-react'
import Header from './ui/Header'
import LiquidGlassButton from './ui/LiquidGlassButton'

const tradingPairs = [
  { id: 'ton', base: 'TON', quote: 'USDT', price: 1.58, change: -1.49, volume: 91570.1 },
  { id: 'btc', base: 'BTC', quote: 'USDT', price: 43250.00, change: 2.35, volume: 1250000 },
  { id: 'eth', base: 'ETH', quote: 'USDT', price: 2650.00, change: 1.12, volume: 890000 },
]

const orderBook = {
  sells: [
    { price: 1.4228, amount: 289.15 },
    { price: 1.4257, amount: 108.18 },
    { price: 1.4285, amount: 275.55 },
    { price: 1.4314, amount: 221.00 },
  ],
  buys: [
    { price: 1.4172, amount: 147.40 },
    { price: 1.4143, amount: 143.44 },
    { price: 1.4115, amount: 258.00 },
    { price: 1.4086, amount: 101.04 },
  ],
}

export default function Exchange() {
  const [selectedPair, setSelectedPair] = useState(tradingPairs[0])
  const [orderType, setOrderType] = useState('buy')
  const [limitType, setLimitType] = useState('limit')
  const [price, setPrice] = useState(selectedPair.price.toString())
  const [amount, setAmount] = useState('')
  const [showPairSelector, setShowPairSelector] = useState(false)
  const [sliderValue, setSliderValue] = useState(0)

  const percentButtons = [0, 25, 50, 75, 100]
  const availableBalance = 238.479

  const totalSells = orderBook.sells.reduce((acc, o) => acc + o.amount, 0)
  const totalBuys = orderBook.buys.reduce((acc, o) => acc + o.amount, 0)

  return (
    <div className="space-y-4">
      <Header balance={0} />

      {/* Pair Selector */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowPairSelector(!showPairSelector)}
        className="flex items-center gap-2 rounded-full bg-[var(--color-bg-card)] px-4 py-2"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0098EA]/20">
          <span className="text-xs">💎</span>
        </div>
        <span className="font-semibold">{selectedPair.base}/{selectedPair.quote}</span>
        <ChevronDown className="h-4 w-4" />
      </motion.button>

      {/* Price Info */}
      <div className="flex justify-between text-sm">
        <div>
          <p className="text-[var(--color-text-sub)]">Изменение 24ч</p>
          <p className={selectedPair.change >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}>
            {selectedPair.change >= 0 ? '+' : ''}{selectedPair.change}% ({selectedPair.change >= 0 ? '+' : ''}{(selectedPair.price * selectedPair.change / 100).toFixed(4)})
          </p>
        </div>
        <div className="text-right">
          <p className="text-[var(--color-text-sub)]">Объем 24ч (USDT)</p>
          <p className="font-semibold">${selectedPair.volume.toLocaleString()}K</p>
        </div>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="flex gap-2 rounded-xl bg-[var(--color-bg-card)] p-1">
        <button
          onClick={() => setOrderType('buy')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            orderType === 'buy'
              ? 'bg-[var(--color-green)] text-white'
              : 'text-[var(--color-text-sub)]'
          }`}
        >
          Купить
        </button>
        <button
          onClick={() => setOrderType('sell')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            orderType === 'sell'
              ? 'bg-[var(--color-red)] text-white'
              : 'text-[var(--color-text-sub)]'
          }`}
        >
          Продать
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Order Form */}
        <div className="space-y-3">
          {/* Order Type Dropdown */}
          <button className="flex w-full items-center justify-between rounded-xl bg-[var(--color-bg-card)] px-4 py-3 text-sm">
            <span>Лимитный ордер</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Price Input */}
          <div className="rounded-xl bg-[var(--color-bg-card)] p-3">
            <p className="text-xs text-[var(--color-text-sub)] mb-1">Цена (USDT)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 bg-transparent text-xl font-semibold outline-none"
              />
              <div className="flex gap-1">
                <button 
                  onClick={() => setPrice((parseFloat(price) + 0.01).toFixed(2))}
                  className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-bg-base)]"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button 
                  onClick={() => setPrice((parseFloat(price) - 0.01).toFixed(2))}
                  className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-bg-base)]"
                >
                  <Minus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="rounded-xl bg-[var(--color-bg-card)] p-3">
            <p className="text-xs text-[var(--color-text-sub)] mb-1">Сумма</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-xl font-semibold outline-none"
            />
          </div>

          {/* Percentage Slider */}
          <div className="flex items-center gap-2">
            {percentButtons.map((pct) => (
              <button
                key={pct}
                onClick={() => setSliderValue(pct)}
                className={`flex-1 rounded py-1 text-xs font-medium transition-all ${
                  sliderValue === pct
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                    : 'bg-[var(--color-bg-card)] text-[var(--color-text-sub)]'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="relative h-1 rounded-full bg-[var(--color-bg-card)]">
            <div 
              className="absolute left-0 top-0 h-full rounded-full bg-[var(--color-primary)]"
              style={{ width: `${sliderValue}%` }}
            />
            <div 
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[var(--color-primary)] border-2 border-white"
              style={{ left: `calc(${sliderValue}% - 6px)` }}
            />
          </div>

          {/* Total */}
          <div className="rounded-xl bg-[var(--color-bg-card)] p-3">
            <p className="text-xs text-[var(--color-text-sub)] mb-1">Сумма</p>
            <p className="text-xl font-semibold">0.00</p>
          </div>

          {/* Available Balance */}
          <div className="text-xs text-[var(--color-text-sub)]">
            <p>Доступно <span className="text-[var(--color-text-main)]">0</span> / {availableBalance} USDT</p>
            <p>Макс. покупка <span className="text-[var(--color-text-main)]">0 TON</span></p>
          </div>

          {/* Submit Button */}
          <LiquidGlassButton
            variant={orderType === 'buy' ? 'success' : 'danger'}
            fullWidth
            size="lg"
          >
            Скоро
          </LiquidGlassButton>
        </div>

        {/* Order Book */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 text-xs text-[var(--color-text-sub)] px-2">
            <span>Цена</span>
            <span className="text-right">Кол-во</span>
          </div>

          {/* Sells (Red) */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-[var(--color-red)] px-2">Продажа</p>
            {orderBook.sells.map((order, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative grid grid-cols-2 text-xs py-1 px-2"
              >
                <div 
                  className="absolute inset-y-0 right-0 bg-[var(--color-red)]/10"
                  style={{ width: `${(order.amount / 300) * 100}%` }}
                />
                <span className="relative text-[var(--color-red)]">${order.price.toFixed(4)}</span>
                <span className="relative text-right">{order.amount.toFixed(2)}</span>
              </motion.div>
            ))}
            <div className="flex items-center justify-between px-2 py-1 text-xs">
              <span className="text-[var(--color-text-sub)]">Итого продажа</span>
              <span className="text-[var(--color-red)] font-semibold">{totalSells.toFixed(2)}</span>
            </div>
          </div>

          {/* Buys (Green) */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-[var(--color-green)] px-2">Покупка</p>
            {orderBook.buys.map((order, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative grid grid-cols-2 text-xs py-1 px-2"
              >
                <div 
                  className="absolute inset-y-0 right-0 bg-[var(--color-green)]/10"
                  style={{ width: `${(order.amount / 300) * 100}%` }}
                />
                <span className="relative text-[var(--color-green)]">${order.price.toFixed(4)}</span>
                <span className="relative text-right">{order.amount.toFixed(2)}</span>
              </motion.div>
            ))}
            <div className="flex items-center justify-between px-2 py-1 text-xs">
              <span className="text-[var(--color-text-sub)]">Итого покупка</span>
              <span className="text-[var(--color-green)] font-semibold">{totalBuys.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Tabs */}
      <div className="flex gap-4 border-b border-white/10 text-sm">
        <button className="border-b-2 border-[var(--color-primary)] pb-2 font-medium text-[var(--color-primary)]">
          Открытые ордера
        </button>
        <button className="pb-2 text-[var(--color-text-sub)]">
          История ордеров
        </button>
        <button className="pb-2 text-[var(--color-text-sub)]">
          Сделки
        </button>
      </div>

      {/* Empty State */}
      <div className="py-8 text-center">
        <p className="text-sm text-[var(--color-text-sub)]">Нет открытых ордеров</p>
      </div>
    </div>
  )
}
