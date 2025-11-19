'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { MarketGlobe } from '../components/MarketGlobe'

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
        <motion.div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full"
          ></motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-16 h-16 border-4 border-neon-purple border-b-transparent rounded-full"
          ></motion.div>
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
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-neon-cyan opacity-10 blur-3xl rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-1/2 right-0 w-96 h-96 bg-neon-purple opacity-10 blur-3xl rounded-full"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-neon-pink opacity-10 blur-3xl rounded-full"
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="text-3xl">🚀</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent animate-gradient">
                  PrimeTrade AI
                </h1>
                <p className="text-xs text-gray-400">Advanced Arbitrage Tracker</p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Logged in as</p>
                <p className="text-sm font-semibold text-neon-cyan">{user?.username}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="px-5 py-2.5 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl font-semibold text-dark-900 hover:shadow-lg hover:shadow-neon-cyan/50 transition-all"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-6xl font-black mb-3 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
            Live Market Intelligence
          </h2>
          <p className="text-xl text-gray-300">Real-time arbitrage opportunities powered by AI</p>
        </motion.div>

        {/* 3D Globe Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-10 glass-card rounded-3xl overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="h-[400px] relative">
            <MarketGlobe />
            <div className="absolute bottom-6 left-6 glass-card px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-400">Global Exchange Network</p>
              <p className="text-lg font-bold text-neon-cyan">Live Tracking</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Active Opportunities', value: opportunities.length, icon: '💹', color: 'from-blue-500 to-cyan-500', glow: 'glow-cyan' },
            { label: 'Your Alerts', value: alerts.length, icon: '🔔', color: 'from-purple-500 to-pink-500', glow: 'glow-purple' },
            { label: 'Avg Spread', value: `${avgSpread.toFixed(2)}%`, icon: '📊', color: 'from-pink-500 to-rose-500' },
            { label: 'Max Spread', value: `${maxSpread.toFixed(3)}%`, icon: '🎯', color: 'from-emerald-500 to-cyan-500' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              whileHover={{ y: -5 }}
              className={`glass-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer ${stat.glow || ''}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                  <span className="text-3xl">{stat.icon}</span>
                </div>
                <p className="text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Opportunities */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-neon-cyan rounded-full"
              />
              <h3 className="text-3xl font-bold">Top Opportunities</h3>
            </div>

            <AnimatePresence mode="popLayout">
              {opportunities.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card rounded-2xl p-12 text-center"
                >
                  <div className="text-6xl mb-4">📉</div>
                  <p className="text-xl text-gray-400">No opportunities available</p>
                  <p className="text-sm text-gray-500 mt-2">Check back in a moment</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {opportunities.map((opp, idx) => (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="glass-card rounded-2xl p-6 group cursor-pointer relative overflow-hidden"
                    >
                      {/* Animated gradient background */}
                      <motion.div
                        animate={{ 
                          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                          opacity: [0.05, 0.1, 0.05]
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink"
                        style={{ backgroundSize: '200% 200%' }}
                      />

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-2xl font-bold text-neon-cyan mb-1">{opp.pair}</h4>
                            <p className="text-sm text-gray-400">
                              Buy {opp.buy_exchange} <span className="text-neon-cyan">→</span> Sell {opp.sell_exchange}
                            </p>
                          </div>
                          <div className="text-right">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-3xl font-black bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent"
                            >
                              {opp.spread_percentage.toFixed(3)}%
                            </motion.div>
                            <p className="text-xs text-gray-500">Spread</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-dark-900/50 rounded-xl p-3 border border-neon-cyan/20">
                            <p className="text-xs text-gray-500 mb-1">Buy Price</p>
                            <p className="text-lg font-bold text-neon-cyan">${opp.buy_price.toLocaleString()}</p>
                          </div>
                          <div className="bg-dark-900/50 rounded-xl p-3 border border-neon-purple/20">
                            <p className="text-xs text-gray-500 mb-1">Sell Price</p>
                            <p className="text-lg font-bold text-neon-purple">${opp.sell_price.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>AI Confidence</span>
                              <span className="font-bold text-neon-cyan">{opp.confidence_score}%</span>
                            </div>
                            <div className="h-2 bg-dark-900/50 rounded-full overflow-hidden border border-neon-cyan/20">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${opp.confidence_score}%` }}
                                transition={{ duration: 1.5, delay: idx * 0.1 }}
                                className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink"
                              />
                            </div>
                          </div>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="ml-6 text-right"
                          >
                            <p className="text-xs text-gray-500">Profit</p>
                            <p className="text-xl font-black text-green-400">+${opp.potential_profit.toFixed(2)}</p>
                          </motion.div>
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
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="w-3 h-3 bg-neon-purple rounded-full"
              />
              <h3 className="text-2xl font-bold">Your Alerts</h3>
            </div>

            <div className="glass-card rounded-2xl p-6 mb-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">🔔</div>
                  <p className="text-gray-400 text-sm">No alerts yet</p>
                  <p className="text-gray-500 text-xs mt-1">Create one to get started</p>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-dark-900/50 border border-neon-purple/20 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-neon-purple text-lg">{alert.crypto_pair}</p>
                          <p className="text-xs text-gray-500">Min Spread: {alert.min_spread}%</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.2, rotate: 90 }}
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-red-400 hover:text-red-300 text-xl"
                        >
                          ✕
                        </motion.button>
                      </div>
                      <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="h-full w-1/3 bg-gradient-to-r from-transparent via-neon-purple to-transparent"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAlertForm(!showAlertForm)}
                className="w-full py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-xl font-bold hover:shadow-lg hover:shadow-neon-purple/50 transition-all"
              >
                {showAlertForm ? '✕ Cancel' : '+ New Alert'}
              </motion.button>

              <AnimatePresence>
                {showAlertForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCreateAlert}
                    className="mt-4 space-y-3 overflow-hidden"
                  >
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">Crypto Pair</label>
                      <select
                        value={newAlertPair}
                        onChange={(e) => setNewAlertPair(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-900/50 border border-neon-purple/30 rounded-xl text-white focus:border-neon-purple focus:outline-none"
                      >
                        <option>BTC/USDT</option>
                        <option>ETH/USDT</option>
                        <option>BNB/USDT</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">Min Spread %</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newAlertSpread}
                        onChange={(e) => setNewAlertSpread(parseFloat(e.target.value))}
                        className="w-full px-4 py-3 bg-dark-900/50 border border-neon-purple/30 rounded-xl text-white focus:border-neon-purple focus:outline-none"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-xl font-bold hover:shadow-lg hover:shadow-neon-purple/50 transition-all"
                    >
                      Create Alert
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
