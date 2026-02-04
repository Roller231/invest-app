export const carouselSlides = [
  {
    title: 'Промокод - NG2026',
    subtitle: 'ПОЛУЧИ НА СВОЙ СЧЕТ ПЕРВЫЕ 100₽ ДЛЯ СТАРТА',
    description: 'ВВОДИ ПРОМОКОД НА ГЛАВНОЙ СТРАНИЦЕ ДЛЯ ПОЛУЧЕНИЯ ПРИЗА!',
    cta: 'Активировать',
    image: '🎅',
  },
]

export const tariffs = [
  {
    id: 'okx',
    name: 'OKX',
    label: 'Для новых пользователей',
    apy: 3.2,
    apyDisplay: '+3.2%',
    range: 'от 100 ₽ до 10 000 ₽',
    min: 100,
    max: 10000,
    tone: 'neutral',
    color: '#848E9C',
  },
  {
    id: 'bybit',
    name: 'Bybit',
    label: 'Рекомендован',
    apy: 4.2,
    apyDisplay: '+4.2%',
    range: 'от 10 000 ₽ до 100 000 ₽',
    min: 10000,
    max: 100000,
    tone: 'accent',
    color: '#F7A600',
  },
  {
    id: 'binance',
    name: 'Binance',
    label: 'Приватный',
    apy: 5.2,
    apyDisplay: '+5.2%',
    range: 'от 100 000 ₽ до 5 000 000 ₽',
    min: 100000,
    max: 5000000,
    tone: 'primary',
    color: '#FCD535',
  },
]

export const liveTransactions = [
  { id: 1, type: 'withdraw', title: 'Вывод средств', hash: 'Ha$h: 4219', amount: -71, time: '13:19' },
  { id: 2, type: 'withdraw', title: 'Вывод средств', hash: 'Ha$h: 4221', amount: -108, time: '13:19' },
  { id: 3, type: 'withdraw', title: 'Вывод средств', hash: 'Ha$h: 4223', amount: -50, time: '13:19' },
  { id: 4, type: 'withdraw', title: 'Вывод средств', hash: 'Ha$h: 4224', amount: -716, time: '13:19' },
]

export const topUsers = [
  { id: 1, name: 'Витек', balance: 158799.71 },
  { id: 2, name: 'Константин', balance: 137633.75 },
  { id: 3, name: '89144340978', balance: 85000.00 },
  { id: 4, name: 'Александр', balance: 75000.00 },
  { id: 5, name: 'Максим', balance: 62500.00 },
]

export const paymentMethods = [
  { id: 'sbp', label: 'СБП', abbr: '⚡', color: '#8B5CF6' },
  { id: 'qr', label: 'QR-код', abbr: '📱', color: '#3B82F6' },
  { id: 'sber', label: 'Сбер', abbr: '🟢', color: '#21A038' },
  { id: 'alfa', label: 'Альфа', abbr: '🔴', color: '#EF3124' },
  { id: 'tbank', label: 'Т-Банк', abbr: '🟡', color: '#FFDD2D' },
  { id: 'cash', label: 'Наличными', abbr: '💵', color: '#10B981' },
]

export const cryptoPayments = [
  { id: 'btc', label: 'BTC', abbr: '₿', color: '#F7931A' },
  { id: 'ton', label: 'TON', abbr: '💎', color: '#0098EA' },
  { id: 'usdt', label: 'USDT', abbr: '₮', color: '#26A17B' },
  { id: 'eth', label: 'ETH', abbr: 'Ξ', color: '#627EEA' },
]

export const marketTrends = [
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 9240, change: 3.2, trend: 'up', color: '#9945FF' },
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 4912330, change: 2.8, trend: 'up', color: '#F7931A' },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', price: 54110, change: 0.9, trend: 'up', color: '#F3BA2F' },
  { id: 'usdt', name: 'Tether', symbol: 'USDT', price: 92.5, change: 0.01, trend: 'up', color: '#26A17B' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 287500, change: -1.3, trend: 'down', color: '#627EEA' },
  { id: 'ton', name: 'Toncoin', symbol: 'TON', price: 520, change: 5.2, trend: 'up', color: '#0098EA' },
]

export const faqItems = [
  {
    id: 1,
    question: 'Как начать инвестировать?',
    answer: 'Пополните баланс любым удобным способом и выберите тарифный план. Доход начисляется автоматически каждые 24 часа.',
  },
  {
    id: 2,
    question: 'Какой минимальный депозит?',
    answer: 'Минимальный депозит составляет 100 ₽ для тарифа OKX.',
  },
  {
    id: 3,
    question: 'Как вывести средства?',
    answer: 'Вывод доступен на банковские карты РФ. Время обработки — до 24 часов.',
  },
  {
    id: 4,
    question: 'Как работает реферальная программа?',
    answer: 'Приглашайте друзей по вашей ссылке и получайте до 31% от их депозитов по трем уровням.',
  },
]

export const referralLevels = [
  { level: 1, percent: 20, description: 'от пополнения депозита' },
  { level: 2, percent: 7, description: 'от пополнения депозита' },
  { level: 3, percent: 4, description: 'от пополнения депозита' },
]

export const userStats = {
  balance: 0,
  deposit: 0,
  profit: 0,
  tariff: 'okx',
  autoReinvest: false,
  referralLink: 'https://t.me/BinanceP2Pbot?start=7223264299',
  partners: 0,
  earned: 0,
  activePartners: 0,
  level1Partners: 0,
  level23Partners: 0,
  totalDeposited: 0,
}
