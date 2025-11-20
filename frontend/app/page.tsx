'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'

function BackgroundScene() {
  return (
    <Canvas camera={{ position: [0, 0, 1] }}>
      <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </Canvas>
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
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <BackgroundScene />
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 text-center"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-2 tracking-tight">
              PrimeTrade
            </h1>
            <p className="text-gray-400 font-light tracking-wide">AI-Powered Arbitrage Intelligence</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center gap-2"
            >
              <span className="text-lg">⚠️</span> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all duration-300"
                placeholder="name@example.com"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all duration-300"
                placeholder="••••••••"
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0, 243, 255, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl font-bold text-dark-900 shadow-lg shadow-neon-cyan/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">{loading ? 'Authenticating...' : 'Access Terminal'}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </motion.button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10"></div>
            <span className="text-gray-600 text-xs font-medium uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10"></div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-gray-400 text-sm"
          >
            New to PrimeTrade?{' '}
            <Link
              href="/signup"
              className="text-neon-cyan hover:text-neon-purple transition-colors duration-300 font-medium"
            >
              Create an account
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
