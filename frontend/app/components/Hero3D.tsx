'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Float } from '@react-three/drei'
import * as THREE from 'three'

function FloatingParticles({ count = 500 }) {
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
            t = particle.t += speed / 4
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
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshPhongMaterial color="#00f3ff" emissive="#bc13fe" emissiveIntensity={0.5} />
        </instancedMesh>
    )
}

function DigitalRings() {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.002
            groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
        }
    })

    return (
        <group ref={groupRef}>
            {[2.5, 3.5, 4.5].map((radius, i) => (
                <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[radius, 0.02, 16, 100]} />
                    <meshBasicMaterial color={i % 2 === 0 ? "#00f3ff" : "#bc13fe"} transparent opacity={0.3} />
                </mesh>
            ))}
            {[2.6, 3.6, 4.6].map((radius, i) => (
                <mesh key={`dash-${i}`} rotation={[Math.PI / 2, 0, (i + 1) * 0.5]}>
                    <torusGeometry args={[radius, 0.03, 16, 30, Math.PI / 3]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
                </mesh>
            ))}
        </group>
    )
}

function Scene({ showRings }: { showRings: boolean }) {
    return (
        <>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} color="#00f3ff" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#ff0099" />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {showRings && (
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <DigitalRings />
                </Float>
            )}

            <FloatingParticles count={300} />
        </>
    )
}

interface Hero3DProps {
    showRings?: boolean
}

export function Hero3D({ showRings = true }: Hero3DProps) {
    return (
        <div className="w-full h-full absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <Scene showRings={showRings} />
            </Canvas>
        </div>
    )
}
