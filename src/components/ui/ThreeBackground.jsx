import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function FloatingParticles({ count = 50 }) {
  const mesh = useRef()
  const light = useRef()

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const time = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const x = Math.random() * 2000 - 1000
      const y = Math.random() * 2000 - 1000
      const z = Math.random() * 2000 - 1000

      temp.push({ time, factor, speed, x, y, z })
    }
    return temp
  }, [count])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    particles.forEach((particle, i) => {
      let { factor, speed, x, y, z } = particle
      const t = (particle.time += speed)

      dummy.position.set(
        x + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        y + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        z + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      )

      const s = Math.cos(t)
      dummy.scale.set(s, s, s)
      dummy.rotation.set(s * 5, s * 5, s * 5)
      dummy.updateMatrix()

      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <pointLight ref={light} distance={40} intensity={7} color="#22D3EE" />
      <ambientLight intensity={0.1} />
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <dodecahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color="#22D3EE" transparent opacity={0.12} />
      </instancedMesh>
    </>
  )
}

function GlowingSphere() {
  const meshRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    meshRef.current.rotation.x = Math.sin(t / 4) / 2
    meshRef.current.rotation.y = Math.sin(t / 2) / 2
    meshRef.current.position.y = Math.sin(t / 1.5) * 50
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -500]}>
      <sphereGeometry args={[100, 32, 32]} />
      <meshStandardMaterial
        color="#22D3EE"
        emissive="#22D3EE"
        emissiveIntensity={0.16}
        transparent
        opacity={0.1}
      />
    </mesh>
  )
}

export default function ThreeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
      <Canvas
        camera={{ position: [0, 0, 500], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <FloatingParticles />
        <GlowingSphere />
      </Canvas>
    </div>
  )
}
