'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei'

interface Opportunity {
  pair: string
  buy_exchange: string
  sell_exchange: string
  buy_price: number
  sell_price: number
  spread_percentage: number
  potential_profit: number
  confidence_score: number
  timestamp: string
}

interface Alert {
  id: number
  crypto_pair: string
  min_spread: number
  is_active: boolean
}

function FloatingOrb({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[0.3, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.4}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  )
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ec4899" />
      <FloatingOrb position={[-2, 1, 0]} color="#00d9ff" />
      <FloatingOrb position={[2, -1, 0]} color="#a855f7" />
      <FloatingOrb position={[0, 0, -2]} color="#ec4899" />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
    </>
  )
}

export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const router = useRouter()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [newAlertPair, setNewAlertPair] = useState('BTC/USDT')
  const [newAlertSpread, setNewAlertSpread] = useState(0.5)
  const [showAlertForm, setShowAlertForm] = useState(false)

  const API_URL = 'http://localhost:8000/api'

  useEffect(() => {
    if (!token && !loading) {
      router.push('/')
    }
  }, [token, router, loading])

  useEffect(() => {
    if (token) {
      fetchData()
      const interval = setInterval(fetchData, 5000)
      return () => clearInterval(interval)
    }
  }, [token])

  const fetchData = async () => {
    try {
      const [oppResponse, alertsResponse] = await Promise.all([
        axios.get(`${API_URL}/arbitrage-opportunities`),
        axios.get(`${API_URL}/alerts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      setOpportunities(oppResponse.data.opportunities || [])
      setAlerts(alertsResponse.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(
        `${API_URL}/alerts`,
        { crypto_pair: newAlertPair, min_spread: newAlertSpread },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewAlertPair('BTC/USDT')
      setNewAlertSpread(0.5)
      setShowAlertForm(false)
      fetchData()
    } catch (error) {
      console.error('Failed to create alert:', error)
    }
  }

  const handleDeleteAlert = async (alertId: number) => {
    try {
      await axios.delete(`${API_URL}/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchData()
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <motion.div className="relative w-32 h-32">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-neon-cyan border-r-neon-purple"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-4 border-transparent border-b-neon-pink border-l-neon-cyan"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center text-4xl"
          >
            🚀
          </motion.div>
        </motion.div>
      </div>
    )
  }

  const avgSpread = opportunities.length > 0
    ? opportunities.reduce((acc, opp) => acc + opp.spread_percentage, 0) / opportunities.length
    : 0
  const maxSpread = opportunities.length > 0
    ? Math.max(...opportunities.map(o => o.spread_percentage))
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white relative overflow-hidden">
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,217,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.1),transparent_50%)]" />
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-neon-cyan rounded-full"
          animate={{
            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
            y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
          }}
        />
      ))}

      {/* Navigation with glassmorphism */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-dark-900/30 border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-4xl"
              >
                🚀
              </motion.div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
                  PrimeTrade AI
                </h1>
                <p className="text-xs text-gray-400 font-medium">Advanced Arbitrage Intelligence</p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-6">
              <motion.div
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/20"
                whileHover={{ scale: 1.05, borderColor: 'rgba(0, 217, 255, 0.5)' }}
              >
                <p className="text-xs text-gray-400">Logged in as</p>
                <p className="text-sm font-bold text-neon-cyan">{user?.username}</p>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 217, 255, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl font-bold text-dark-900 shadow-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Logout</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-pink"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Hero Section with 3D */}
        <div className="mb-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.h2
              className="text-8xl font-black mb-4 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Live Intelligence
            </motion.h2>
            <p className="text-2xl text-gray-300 font-light">Real-time arbitrage powered by quantum algorithms</p>
          </motion.div>

          {/* 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[400px] rounded-3xl overflow-hidden relative backdrop-blur-xl bg-dark-800/30 border border-white/10 shadow-2xl"
          >
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <Suspense fallback={null}>
                <Scene3D />
              </Suspense>
            </Canvas>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <motion.div
                className="backdrop-blur-xl bg-dark-900/50 px-6 py-4 rounded-2xl border border-neon-cyan/30"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-sm text-gray-400 mb-1">Network Status</p>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-3 h-3 bg-neon-cyan rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <p className="text-lg font-bold text-neon-cyan">Online</p>
                </div>
              </motion.div>
              <motion.div
                className="backdrop-blur-xl bg-dark-900/50 px-6 py-4 rounded-2xl border border-neon-purple/30"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-sm text-gray-400 mb-1">Exchanges</p>
                <p className="text-2xl font-black text-neon-purple">4 Active</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid with Advanced Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { 
              label: 'Active Opportunities', 
              value: opportunities.length, 
              icon: '💹', 
              gradient: 'from-blue-500 via-cyan-500 to-teal-500',
              glow: '0 0 40px rgba(0, 217, 255, 0.3)'
            },
            { 
              label: 'Your Alerts', 
              value: alerts.length, 
              icon: '🔔', 
              gradient: 'from-purple-500 via-pink-500 to-rose-500',
              glow: '0 0 40px rgba(168, 85, 247, 0.3)'
            },
            { 
              label: 'Avg Spread', 
              value: `${avgSpread.toFixed(2)}%`, 
              icon: '📊', 
              gradient: 'from-pink-500 via-rose-500 to-red-500',
              glow: '0 0 40px rgba(236, 72, 153, 0.3)'
            },
            { 
              label: 'Max Spread', 
              value: `${maxSpread.toFixed(3)}%`, 
              icon: '🎯', 
              gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
              glow: '0 0 40px rgba(16, 185, 129, 0.3)'
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ 
                y: -10, 
                boxShadow: stat.glow,
              }}
              className="relative group cursor-pointer"
            >
              {/* Glowing border effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500`} />
              
              {/* Card content */}
              <div className="relative backdrop-blur-xl bg-dark-800/50 rounded-2xl p-6 border border-white/10 overflow-hidden">
                {/* Animated background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10`}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</p>
                    <motion.span
                      className="text-4xl"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {stat.icon}
                    </motion.span>
                  </div>
                  <motion.p
                    className={`text-5xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Opportunities List */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.5, 1], 
                  opacity: [0.5, 1, 0.5],
                  boxShadow: ['0 0 0px rgba(0, 217, 255, 0)', '0 0 20px rgba(0, 217, 255, 0.8)', '0 0 0px rgba(0, 217, 255, 0)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-4 h-4 bg-neon-cyan rounded-full"
              />
              <h3 className="text-4xl font-black bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Top Opportunities
              </h3>
            </div>

            <AnimatePresence mode="popLayout">
              {opportunities.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="backdrop-blur-xl bg-dark-800/50 rounded-3xl p-16 text-center border border-white/10"
                >
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-8xl mb-6"
                  >
                    📉
                  </motion.div>
                  <p className="text-2xl text-gray-400 font-semibold">No opportunities available</p>
                  <p className="text-sm text-gray-500 mt-2">The market is stabilizing...</p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {opportunities.map((opp, idx) => (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, x: -50, rotateY: -15 }}
                      animate={{ opacity: 1, x: 0, rotateY: 0 }}
                      exit={{ opacity: 0, x: 50, rotateY: 15 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ 
                        scale: 1.03, 
                        x: 15,
                        boxShadow: '0 20px 60px rgba(0, 217, 255, 0.3)',
                      }}
                      className="relative group cursor-pointer"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Glowing effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-3xl opacity-0 group-hover:opacity-75 blur-xl transition duration-500" />
                      
                      {/* Card */}
                      <div className="relative backdrop-blur-2xl bg-dark-800/60 rounded-3xl p-8 border border-white/10 overflow-hidden">
                        {/* Animated gradient overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-neon-purple/5 to-neon-pink/5"
                          animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                          }}
                          transition={{ duration: 8, repeat: Infinity }}
                          style={{ backgroundSize: '200% 200%' }}
                        />

                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <motion.h4
                                className="text-3xl font-black text-neon-cyan mb-2"
                                whileHover={{ letterSpacing: '0.1em' }}
                              >
                                {opp.pair}
                              </motion.h4>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="px-3 py-1 bg-neon-cyan/20 rounded-full font-semibold">
                                  {opp.buy_exchange}
                                </span>
                                <motion.span
                                  animate={{ x: [0, 5, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="text-neon-cyan text-xl"
                                >
                                  →
                                </motion.span>
                                <span className="px-3 py-1 bg-neon-purple/20 rounded-full font-semibold">
                                  {opp.sell_exchange}
                                </span>
                              </div>
                            </div>
                            <motion.div
                              className="text-right"
                              whileHover={{ scale: 1.2 }}
                            >
                              <div className="text-5xl font-black bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
                                {opp.spread_percentage.toFixed(3)}%
                              </div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Spread</p>
                            </motion.div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <motion.div
                              whileHover={{ scale: 1.05, rotateY: 5 }}
                              className="bg-gradient-to-br from-neon-cyan/20 to-dark-900/50 rounded-2xl p-4 border border-neon-cyan/30"
                              style={{ transformStyle: 'preserve-3d' }}
                            >
                              <p className="text-xs text-gray-400 mb-2 uppercase">Buy Price</p>
                              <p className="text-2xl font-black text-neon-cyan">
                                ${opp.buy_price.toLocaleString()}
                              </p>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.05, rotateY: -5 }}
                              className="bg-gradient-to-br from-neon-purple/20 to-dark-900/50 rounded-2xl p-4 border border-neon-purple/30"
                              style={{ transformStyle: 'preserve-3d' }}
                            >
                              <p className="text-xs text-gray-400 mb-2 uppercase">Sell Price</p>
                              <p className="text-2xl font-black text-neon-purple">
                                ${opp.sell_price.toLocaleString()}
                              </p>
                            </motion.div>
                          </div>

                          <div className="flex justify-between items-center gap-6">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase font-semibold">
                                <span>AI Confidence</span>
                                <span className="text-neon-cyan">{opp.confidence_score}%</span>
                              </div>
                              <div className="h-3 bg-dark-900/80 rounded-full overflow-hidden border border-neon-cyan/30 relative">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${opp.confidence_score}%` }}
                                  transition={{ duration: 1.5, delay: idx * 0.1 }}
                                  className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink relative"
                                >
                                  <motion.div
                                    className="absolute inset-0 bg-white"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    style={{ opacity: 0.3 }}
                                  />
                                </motion.div>
                              </div>
                            </div>
                            <motion.div
                              className="text-right"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <p className="text-xs text-gray-500 uppercase mb-1">Profit</p>
                              <p className="text-3xl font-black text-green-400">
                                +${opp.potential_profit.toFixed(2)}
                              </p>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Alerts Sidebar */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.5, 1], 
                  opacity: [0.5, 1, 0.5],
                  rotate: [0, 15, -15, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="w-4 h-4 bg-neon-purple rounded-full"
              />
              <h3 className="text-3xl font-black bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                Your Alerts
              </h3>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-2xl bg-dark-800/50 rounded-3xl p-6 border border-white/10 overflow-hidden relative"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-neon-pink/5" />
              
              <div className="relative z-10">
                {alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      🔔
                    </motion.div>
                    <p className="text-gray-400 text-lg font-semibold">No alerts yet</p>
                    <p className="text-gray-500 text-sm mt-2">Create one to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {alerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotateX: 15 }}
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        className="bg-gradient-to-br from-dark-900/80 to-dark-800/80 border border-neon-purple/30 rounded-2xl p-5 relative overflow-hidden group"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-black text-xl text-neon-purple">{alert.crypto_pair}</p>
                              <p className="text-xs text-gray-500 mt-1">Min Spread: {alert.min_spread}%</p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.3, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="text-red-400 hover:text-red-300 text-2xl"
                            >
                              ✕
                            </motion.button>
                          </div>
                          <div className="h-2 bg-dark-900 rounded-full overflow-hidden border border-neon-purple/20">
                            <motion.div
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="h-full w-1/3 bg-gradient-to-r from-transparent via-neon-purple to-transparent"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAlertForm(!showAlertForm)}
                  className="w-full py-4 bg-gradient-to-r from-neon-purple to-neon-pink rounded-2xl font-black text-lg relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {showAlertForm ? '✕ Cancel' : '+ New Alert'}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-purple"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                <AnimatePresence>
                  {showAlertForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0, rotateX: -15 }}
                      animate={{ opacity: 1, height: 'auto', rotateX: 0 }}
                      exit={{ opacity: 0, height: 0, rotateX: 15 }}
                      onSubmit={handleCreateAlert}
                      className="mt-6 space-y-4 overflow-hidden"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div>
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
                          Crypto Pair
                        </label>
                        <select
                          value={newAlertPair}
                          onChange={(e) => setNewAlertPair(e.target.value)}
                          className="w-full px-5 py-4 bg-dark-900/80 border border-neon-purple/30 rounded-xl text-white font-semibold focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/50 transition-all"
                        >
                          <option>BTC/USDT</option>
                          <option>ETH/USDT</option>
                          <option>BNB/USDT</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
                          Min Spread %
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={newAlertSpread}
                          onChange={(e) => setNewAlertSpread(parseFloat(e.target.value))}
                          className="w-full px-5 py-4 bg-dark-900/80 border border-neon-purple/30 rounded-xl text-white font-semibold focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/50 transition-all"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-neon-purple to-neon-pink rounded-xl font-black text-lg shadow-lg"
                      >
                        Create Alert
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}