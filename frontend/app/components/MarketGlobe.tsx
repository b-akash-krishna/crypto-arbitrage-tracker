'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, extend, ReactThreeFiber } from '@react-three/fiber'
import { OrbitControls, Sphere, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { HolographicMaterial } from './materials/HolographicMaterial'

extend({ HolographicMaterial })

// Add HolographicMaterial to JSX types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      holographicMaterial: any
    }
  }
}

function GlowingParticles({ count = 300 }) {
  const mesh = useRef<THREE.InstancedMesh>(null)

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const xFactor = -50 + Math.random() * 100
      const yFactor = -50 + Math.random() * 100
      const zFactor = -50 + Math.random() * 100
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return

    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle
      t = particle.t += speed / 2
      const a = Math.cos(t) + Math.sin(t * 1) / 10
      const b = Math.sin(t) + Math.cos(t * 2) / 10
      const s = Math.cos(t)

      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      )
      dummy.scale.set(s, s, s)
      dummy.rotation.set(s * 5, s * 5, s * 5)
      dummy.updateMatrix()

      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.1, 0]} />
      <meshPhongMaterial color="#00f3ff" emissive="#bc13fe" emissiveIntensity={0.8} />
    </instancedMesh>
  )
}

function DataArcs() {
  const groupRef = useRef<THREE.Group>(null)

  // Create random arcs
  const arcs = useMemo(() => {
    const curves = []
    for (let i = 0; i < 15; i++) {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ).normalize().multiplyScalar(2.2)

      const end = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ).normalize().multiplyScalar(2.2)

      const mid = start.clone().add(end).multiplyScalar(1.5)

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
      curves.push(curve)
    }
    return curves
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= 0.002
    }
  })

  return (
    <group ref={groupRef}>
      {arcs.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 20, 0.01, 8, false]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#00f3ff" : "#bc13fe"} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function Scene() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime()
    }
  })

  return (
    <>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#00f3ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff0099" />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Holographic Globe */}
      <Sphere args={[2.2, 64, 64]}>
        {/* @ts-ignore */}
        <holographicMaterial ref={materialRef} transparent />
      </Sphere>

      {/* Inner Core */}
      <Sphere args={[2, 32, 32]}>
        <meshBasicMaterial color="#000000" />
      </Sphere>

      <GlowingParticles count={200} />
      {/* <DataArcs /> */}
    </>
  )
}

export function MarketGlobe() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <Scene />
      </Canvas>
    </div>
  )
}

