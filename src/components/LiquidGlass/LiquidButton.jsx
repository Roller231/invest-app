import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, RoundedBox, Html } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'

export default function LiquidButton({
  children,
  onClick,
  position = [0, 0, 0],
  width = 2,
  height = 0.6,
  variant = 'primary',
  icon: Icon,
}) {
  const groupRef = useRef()
  const materialRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  const variants = {
    primary: {
      color: '#FCD535',
      emissive: '#FCD535',
      textClass: 'text-[#1E2329]',
      bgClass: 'bg-[#FCD535]',
    },
    secondary: {
      color: '#ffffff',
      emissive: '#8b5cf6',
      textClass: 'text-white',
      bgClass: 'bg-white/10',
    },
    danger: {
      color: '#F6465D',
      emissive: '#F6465D',
      textClass: 'text-white',
      bgClass: 'bg-[#F6465D]',
    },
    success: {
      color: '#0ECB81',
      emissive: '#0ECB81',
      textClass: 'text-white',
      bgClass: 'bg-[#0ECB81]',
    },
  }

  const currentVariant = variants[variant]

  const { scale, distortion, temporalDistortion } = useSpring({
    scale: clicked ? 0.95 : hovered ? 1.05 : 1,
    distortion: clicked ? 0.8 : hovered ? 0.6 : 0.3,
    temporalDistortion: hovered ? 0.4 : 0.1,
    config: { mass: 1, tension: 300, friction: 20 },
  })

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.2 + position[0]) * 0.02
    }

    if (materialRef.current) {
      materialRef.current.distortion = distortion.get()
      materialRef.current.temporalDistortion = temporalDistortion.get()
    }
  })

  const handleClick = () => {
    setClicked(true)
    setTimeout(() => setClicked(false), 150)
    onClick?.()
  }

  return (
    <animated.group
      ref={groupRef}
      position={position}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => {
        setHovered(false)
        setClicked(false)
      }}
      onClick={handleClick}
    >
      {/* Glass button mesh */}
      <RoundedBox args={[width, height, 0.15]} radius={0.1} smoothness={4}>
        <MeshTransmissionMaterial
          ref={materialRef}
          transmission={0.9}
          roughness={0.05}
          thickness={2}
          chromaticAberration={0.04}
          anisotropy={0.3}
          distortion={0.3}
          distortionScale={0.2}
          temporalDistortion={0.1}
          ior={1.4}
          color={currentVariant.color}
          attenuationColor={currentVariant.color}
          attenuationDistance={0.3}
        />
      </RoundedBox>

      {/* Glow behind button */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[width + 0.2, height + 0.2]} />
        <meshBasicMaterial
          color={currentVariant.emissive}
          transparent
          opacity={hovered ? 0.15 : 0.05}
        />
      </mesh>

      {/* Button content via HTML overlay */}
      <Html center style={{ pointerEvents: 'none' }}>
        <div
          className={`flex items-center justify-center gap-2 px-4 py-2 font-semibold text-sm ${currentVariant.textClass}`}
          style={{ 
            width: `${width * 50}px`,
            whiteSpace: 'nowrap',
          }}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {children}
        </div>
      </Html>
    </animated.group>
  )
}
