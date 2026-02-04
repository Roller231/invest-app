import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, RoundedBox, Html } from '@react-three/drei'
import { useSpring } from '@react-spring/three'
import { Home, Wallet, User, Users, LineChart } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Главная', Icon: Home },
  { id: 'wallet', label: 'Кошелек', Icon: Wallet },
  { id: 'profile', label: 'Кабинет', Icon: User },
  { id: 'friends', label: 'Друзья', Icon: Users },
  { id: 'market', label: 'Биржа', Icon: LineChart },
]

export default function LiquidNavBar({ activeTab, onTabChange }) {
  const groupRef = useRef()
  const materialRef = useRef()
  const [transitionActive, setTransitionActive] = useState(false)
  const prevTab = useRef(activeTab)

  useEffect(() => {
    if (prevTab.current !== activeTab) {
      setTransitionActive(true)
      const timer = setTimeout(() => setTransitionActive(false), 500)
      prevTab.current = activeTab
      return () => clearTimeout(timer)
    }
  }, [activeTab])

  const { distortion, chromaticAberration } = useSpring({
    distortion: transitionActive ? 0.8 : 0.4,
    chromaticAberration: transitionActive ? 0.12 : 0.06,
    config: { mass: 1, tension: 180, friction: 20 },
  })

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.015
    }

    if (materialRef.current) {
      materialRef.current.distortion = distortion.get()
      materialRef.current.chromaticAberration = chromaticAberration.get()
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Liquid Glass Navigation Bar */}
      <RoundedBox args={[5.2, 0.9, 0.15]} radius={0.18} smoothness={4}>
        <MeshTransmissionMaterial
          ref={materialRef}
          transmission={1}
          roughness={0.01}
          thickness={3}
          chromaticAberration={0.06}
          anisotropy={0.5}
          distortion={0.4}
          distortionScale={0.35}
          temporalDistortion={0.2}
          ior={1.5}
          color="#ffffff"
          attenuationColor="#88ccff"
          attenuationDistance={0.4}
          backside
          samples={16}
          resolution={512}
        />
      </RoundedBox>

      {/* HTML overlay for navigation icons */}
      <Html center style={{ pointerEvents: 'auto' }}>
        <div className="flex items-center justify-between gap-1 px-4" style={{ width: '360px' }}>
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className="flex flex-1 flex-col items-center gap-1 py-1"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] scale-105'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span
                className={`text-[9px] font-medium transition-colors ${
                  activeTab === id ? 'text-[var(--color-primary)]' : 'text-white/40'
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </Html>
    </group>
  )
}
