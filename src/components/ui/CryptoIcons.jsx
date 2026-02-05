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

import gptPng from '../../assets/bottom-icons/gpt.png'
import geminiPng from '../../assets/bottom-icons/gemini.png'
import grokPng from '../../assets/bottom-icons/grok.png'

const paymentIcons = [
  { id: 'usdt', name: 'USDT', src: usdtPng },
  { id: 'ton', name: 'TON', src: tonPng },
  { id: 'btc', name: 'BTC', src: btcPng },
]

const bankIcons = [
  { id: 'sbp', name: 'СБП', src: sbpPng },
  { id: 'vtb', name: 'ВТБ', src: vtbPng, imgClassName: 'scale-[1.1] -translate-x-[1px]' },
  { id: 'sber', name: 'Сбер', src: sberPng },
]

const exchangeIcons = [
  { id: 'binance', name: 'Binance', src: binancePng },
  { id: 'okx', name: 'OKX', src: okxPng, imgClassName: 'scale-[1.08]' },
  { id: 'bybit', name: 'Bybit', src: bybitPng, imgClassName: 'scale-[1.08]' },
]

const aiChatIcons = [
  { id: 'gpt', name: 'GPT', src: gptPng, imgClassName: 'scale-[0.82]' },
  { id: 'gemini', name: 'Gemini', src: geminiPng, imgClassName: 'scale-[0.82]' },
  { id: 'grok', name: 'Grok', src: grokPng },
]

function IconCircle({ src, alt, index, imgClassName = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white"
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

function TextCircle({ label, title, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white text-[10px] font-semibold text-[var(--color-text)]"
      title={title}
    >
      {label}
    </motion.div>
  )
}

function PlusCircle({ value = '+10', delay = 0.4 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-card)] text-[10px] font-semibold text-[var(--color-text-sub)]"
    >
      {value}
    </motion.div>
  )
}

export default function CryptoIcons() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-[var(--color-text-sub)]">Принимаем платежи:</div>

        <div className="flex items-center gap-2">
          {paymentIcons.map((item, index) => (
            <IconCircle key={item.id} src={item.src} alt={item.name} index={index} />
          ))}
          <PlusCircle value="+10" delay={0.25} />
        </div>

        <div className="flex items-center gap-2">
          {bankIcons.map((item, index) => (
            <IconCircle
              key={item.id}
              src={item.src}
              alt={item.name}
              index={index}
              imgClassName={item.imgClassName}
            />
          ))}
          <PlusCircle value="+10" delay={0.25} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-[var(--color-text-sub)]">Работаем с:</div>

        <div className="flex items-center gap-2">
          {exchangeIcons.map((item, index) => (
            <IconCircle
              key={item.id}
              src={item.src}
              alt={item.name}
              index={index}
              imgClassName={item.imgClassName}
            />
          ))}
          <PlusCircle value="+3" delay={0.25} />
        </div>

        <div className="flex items-center gap-2">
          {aiChatIcons.map((item, index) => (
            item.src ? (
              <IconCircle
                key={item.id}
                src={item.src}
                alt={item.name}
                index={index}
                imgClassName={item.imgClassName}
              />
            ) : (
              <TextCircle key={item.id} label={item.label} title={item.name} index={index} />
            )
          ))}
          <PlusCircle value="+5" delay={0.25} />
        </div>
      </div>
    </div>
  )
}
