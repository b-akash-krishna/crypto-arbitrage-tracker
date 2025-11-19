'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei'

function AnimatedSphere({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) {
  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[0.5, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.6}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  )
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ec4899" />
      <AnimatedSphere position={[-1.5, 0, 0]} color="#00d9ff" speed={2} />
      <AnimatedSphere position={[1.5, 0, 0]} color="#a855f7" speed={3} />
      <AnimatedSphere position={[0, 1.5, 0]} color="#ec4899" speed={2.5} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
    </>
  )
}

function FloatingParticles() {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }, [])

  return (
    <>
      {[...Array(30)].map((_, i) => {
        const startX = Math.random() * dimensions.width
        const endX = Math.random() * dimensions.width
        const startY = Math.random() * dimensions.height
        const endY = Math.random() * dimensions.height
        const leftPos = Math.random() * 100
        const topPos = Math.random() * 100

        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan rounded-full"
            animate={{
              x: [startX, endX],
              y: [startY, endY],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: leftPos + '%',
              top: topPos + '%',
              filter: 'blur(1px)',
            }}
          />
        )
      })}
    </>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,217,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_70%)]" />
      </div>

      {/* Floating particles */}
      <FloatingParticles />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(0, 217, 255, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0, 217, 255, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - 3D Visual */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block"
        >
          <div className="relative">
            {/* 3D Canvas */}
            <div className="h-[600px] rounded-3xl overflow-hidden backdrop-blur-xl bg-dark-800/30 border border-white/10 shadow-2xl">
              <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <Suspense fallback={null}>
                  <Scene3D />
                </Suspense>
              </Canvas>
            </div>

            {/* Floating info cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-8 left-8 backdrop-blur-xl bg-dark-900/80 px-6 py-4 rounded-2xl border border-neon-cyan/30 shadow-lg"
            >
              <p className="text-sm text-gray-400 mb-1">Active Trading Pairs</p>
              <p className="text-3xl font-black text-neon-cyan">1,247</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-8 right-8 backdrop-blur-xl bg-dark-900/80 px-6 py-4 rounded-2xl border border-neon-purple/30 shadow-lg"
            >
              <p className="text-sm text-gray-400 mb-1">Total Volume</p>
              <p className="text-3xl font-black text-neon-purple">$2.4B</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="relative group">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-3xl opacity-50 group-hover:opacity-100 blur-xl transition duration-1000" />
            
            {/* Form container */}
            <div className="relative backdrop-blur-2xl bg-dark-800/70 border border-white/10 rounded-3xl p-10 shadow-2xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-10 text-center"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🚀
                </motion.div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-3">
                  PrimeTrade AI
                </h1>
                <p className="text-gray-400 text-lg font-medium">Crypto Arbitrage Intelligence</p>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-sm backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}

              <div onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple opacity-0 group-focus-within:opacity-10 blur transition duration-300 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-5 py-4 bg-dark-900/80 border border-neon-cyan/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/50 transition-all duration-300 font-medium relative z-10"
                      placeholder="your@email.com"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink opacity-0 group-focus-within:opacity-10 blur transition duration-300 pointer-events-none" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-5 py-4 bg-dark-900/80 border border-neon-purple/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/50 transition-all duration-300 font-medium relative z-10"
                      placeholder="••••••••"
                    />
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(0, 217, 255, 0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full mt-8 py-4 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-xl font-black text-lg text-dark-900 shadow-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full"
                        />
                        Logging in...
                      </div>
                    ) : (
                      'Login to Dashboard'
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ opacity: 0.3 }}
                  />
                </motion.button>
              </div>

              <div className="my-8 flex items-center">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-30" />
                <span className="px-4 text-gray-500 text-sm font-semibold">OR</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-neon-purple to-transparent opacity-30" />
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center text-gray-400"
              >
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-neon-cyan hover:text-neon-purple transition-all duration-300 font-bold hover:underline"
                >
                  Sign up here
                </Link>
              </motion.p>

              {/* Feature highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 pt-8 border-t border-white/5"
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { icon: '⚡', label: 'Real-time' },
                    { icon: '🔒', label: 'Secure' },
                    { icon: '🤖', label: 'AI-Powered' },
                  ].map((feature, idx) => (
                    <motion.div
                      key={feature.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + idx * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                      className="cursor-pointer"
                    >
                      <div className="text-3xl mb-2">{feature.icon}</div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">{feature.label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}