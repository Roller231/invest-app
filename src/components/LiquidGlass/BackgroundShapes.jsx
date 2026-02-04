import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function GradientSphere({ position, color1, color2, scale = 1, speed = 0.5 }) {
  const meshRef = useRef()
  const materialRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.3
    meshRef.current.position.x = position[0] + Math.cos(t * 0.7) * 0.2
    meshRef.current.rotation.x = t * 0.2
    meshRef.current.rotation.z = t * 0.1
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color1}
        emissive={color2}
        emissiveIntensity={0.5}
        metalness={0.1}
        roughness={0.3}
      />
    </mesh>
  )
}

function GradientTorus({ position, color1, color2, scale = 1, speed = 0.3 }) {
  const meshRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed
    meshRef.current.rotation.x = t
    meshRef.current.rotation.y = t * 0.5
    meshRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.2
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <torusGeometry args={[1, 0.4, 16, 32]} />
      <meshStandardMaterial
        color={color1}
        emissive={color2}
        emissiveIntensity={0.6}
        metalness={0.2}
        roughness={0.4}
      />
    </mesh>
  )
}

function FloatingCube({ position, color, scale = 0.5, speed = 0.4 }) {
  const meshRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed
    meshRef.current.rotation.x = t
    meshRef.current.rotation.y = t * 0.7
    meshRef.current.position.y = position[1] + Math.sin(t * 2) * 0.15
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        metalness={0.3}
        roughness={0.2}
      />
    </mesh>
  )
}

export default function BackgroundShapes() {
  return (
    <group>
      {/* Main colorful shapes for refraction visibility */}
      <GradientSphere
        position={[-2.5, 1, -3]}
        color1="#8b5cf6"
        color2="#a855f7"
        scale={0.8}
        speed={0.4}
      />
      <GradientSphere
        position={[2.5, 0.5, -4]}
        color1="#06b6d4"
        color2="#22d3ee"
        scale={1}
        speed={0.3}
      />
      <GradientSphere
        position={[0, 2, -5]}
        color1="#f59e0b"
        color2="#fbbf24"
        scale={0.6}
        speed={0.5}
      />
      
      <GradientTorus
        position={[-1.5, -1, -4]}
        color1="#ec4899"
        color2="#f472b6"
        scale={0.5}
        speed={0.25}
      />
      <GradientTorus
        position={[1.8, 1.5, -3.5]}
        color1="#10b981"
        color2="#34d399"
        scale={0.4}
        speed={0.35}
      />

      <FloatingCube
        position={[-3, 0, -2.5]}
        color="#6366f1"
        scale={0.3}
        speed={0.5}
      />
      <FloatingCube
        position={[3, -0.5, -3]}
        color="#f43f5e"
        scale={0.25}
        speed={0.45}
      />
      <FloatingCube
        position={[0, -1.5, -2]}
        color="#eab308"
        scale={0.2}
        speed={0.6}
      />

      {/* Ambient particles */}
      {[...Array(15)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 6,
            -2 - Math.random() * 4,
          ]}
          scale={0.05 + Math.random() * 0.1}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial
            color={`hsl(${Math.random() * 360}, 70%, 60%)`}
            emissive={`hsl(${Math.random() * 360}, 70%, 40%)`}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}
