import { motion } from 'framer-motion'

import usdtPng from '../../assets/bottom-icons/usdt.png'
import tonPng from '../../assets/bottom-icons/ton.png'
import ethPng from '../../assets/bottom-icons/eth.png'
import btcPng from '../../assets/bottom-icons/bitcoin.png'

import sbpPng from '../../assets/bottom-icons/sbp.png'
import sberPng from '../../assets/bottom-icons/sber.png'
import vtbPng from '../../assets/bottom-icons/vtb.png'

import bybitPng from '../../assets/bottom-icons/bybit.png'
import okxPng from '../../assets/bottom-icons/okx.png'
import binancePng from '../../assets/bottom-icons/binance.png'

const topIcons = [
  { id: 'usdt', name: 'USDT', src: usdtPng },
  { id: 'ton', name: 'TON', src: tonPng },
  { id: 'eth', name: 'ETH', src: ethPng },
  { id: 'btc', name: 'BTC', src: btcPng },
    { id: 'bybit', name: 'Bybit', src: bybitPng },
  { id: 'okx', name: 'OKX', src: okxPng },
  { id: 'binance', name: 'Binance', src: binancePng },
]

const bottomIcons = [
  { id: 'sbp', name: 'СБП', src: sbpPng },
  { id: 'vtb', name: 'ВТБ', src: vtbPng, imgClassName: 'scale-[1.1] -translate-x-[1px]' },
  { id: 'sber', name: 'Сбер', src: sberPng },

]

function IconCircle({ src, alt, index, imgClassName = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white"
      title={alt}
    >
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-contain p-[0px] ${imgClassName}`}
        draggable={false}
      />
    </motion.div>
  )
}

export default function CryptoIcons() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {topIcons.map((item, index) => (
          <IconCircle key={item.id} src={item.src} alt={item.name} index={index} />
        ))}
      </div>

      <div className="flex items-center gap-2">
        {bottomIcons.map((item, index) => (
          <IconCircle
            key={item.id}
            src={item.src}
            alt={item.name}
            index={index}
            imgClassName={item.imgClassName}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-card)] text-xs font-semibold text-[var(--color-text-sub)]"
        >
          +5
        </motion.div>
      </div>
    </div>
  )
}
