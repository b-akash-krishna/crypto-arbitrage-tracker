'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Stars } from '@react-three/drei'
import * as THREE from 'three'

function GlowingParticles({ count = 200 }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const light = useRef<THREE.PointLight>(null)

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
    <>
      <pointLight ref={light} distance={40} intensity={8} color="#00f3ff" />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshPhongMaterial color="#00f3ff" emissive="#bc13fe" emissiveIntensity={0.5} />
      </instancedMesh>
    </>
  )
}

function ConnectionLines() {
  const linesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y += 0.001
      linesRef.current.rotation.x += 0.0005
    }
  })

  // Create random connections on a sphere
  const lines = useMemo(() => {
    const points = []
    const radius = 2.5
    for (let i = 0; i < 20; i++) {
      const phi = Math.acos(-1 + (2 * i) / 20)
      const theta = Math.sqrt(20 * Math.PI) * phi

      const x = radius * Math.cos(theta) * Math.sin(phi)
      const y = radius * Math.sin(theta) * Math.sin(phi)
      const z = radius * Math.cos(phi)

      points.push(new THREE.Vector3(x, y, z))
    }

    const connections = []
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (Math.random() > 0.85) { // Only connect some points
          connections.push([points[i], points[j]])
        }
      }
    }
    return connections
  }, [])

  return (
    <group ref={linesRef}>
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([
                line[0].x, line[0].y, line[0].z,
                line[1].x, line[1].y, line[1].z
              ]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#bc13fe" transparent opacity={0.3} />
        </line>
      ))}
    </group>
  )
}

function Scene() {
  return (
    <>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#00f3ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff0099" />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Core Sphere */}
      <Sphere args={[2.2, 64, 64]}>
        <meshStandardMaterial
          color="#0a0a16"
          roughness={0.1}
          metalness={0.8}
          wireframe
          emissive="#1c1c3d"
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* Inner Glow Sphere */}
      <Sphere args={[2, 32, 32]}>
        <meshBasicMaterial color="#00f3ff" transparent opacity={0.05} />
      </Sphere>

      <GlowingParticles count={100} />
      <ConnectionLines />
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
