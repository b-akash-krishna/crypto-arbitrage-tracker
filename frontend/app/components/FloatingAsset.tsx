'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, PerspectiveCamera, Environment } from '@react-three/drei'
import * as THREE from 'three'

function Asset() {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002
            meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1
        }
    })

    return (
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[2, 0]} />
                <meshPhysicalMaterial
                    color="#00f3ff"
                    roughness={0}
                    metalness={0.8}
                    transmission={0.6}
                    thickness={2}
                    clearcoat={1}
                />
            </mesh>
            <mesh scale={[2.2, 2.2, 2.2]}>
                <icosahedronGeometry args={[2, 0]} />
                <meshBasicMaterial color="#bc13fe" wireframe transparent opacity={0.3} />
            </mesh>
        </Float>
    )
}

export function FloatingAsset() {
    return (
        <div className="w-full h-full absolute inset-0 pointer-events-none">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#bc13fe" />
                <Asset />
                <Environment preset="city" />
            </Canvas>
        </div>
    )
}
