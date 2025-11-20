'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useWebSocket } from '../context/WebSocketContext'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { MarketGlobe } from '../components/MarketGlobe'
import { SpotlightCard } from '../components/SpotlightCard'
import { SpreadChart } from '../components/SpreadChart'
import { ProfitChart } from '../components/ProfitChart'

interface Alert {
  id: number
  crypto_pair: string
  min_spread: number
  is_active: boolean
}

export default function Dashboard() {
  const { user, token, logout, loading: authLoading } = useAuth()
  const { opportunities, isConnected } = useWebSocket()
  const router = useRouter()

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [newAlertPair, setNewAlertPair] = useState('BTC/USDT')
  const [newAlertSpread, setNewAlertSpread] = useState(0.5)
  const [showAlertForm, setShowAlertForm] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : 'http://127.0.0.1:8000/api'

  useEffect(() => {
    if (!token && !authLoading) {
      router.push('/')
    }
  }, [token, router, authLoading])

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get(`${API_URL}/alerts`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setAlerts(response.data)
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
      }
    }

    if (token) {
      fetchAlerts()
    }
  }, [token, API_URL])

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(
        `${API_URL}/alerts`,
        { crypto_pair: newAlertPair, min_spread: newAlertSpread },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Refresh alerts
      const response = await axios.get(`${API_URL}/alerts`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAlerts(response.data)

      setNewAlertPair('BTC/USDT')
      setNewAlertSpread(0.5)
      setShowAlertForm(false)
    } catch (error) {
      console.error('Failed to create alert:', error)
    }
  }

  const handleDeleteAlert = async (alertId: number) => {
    try {
      await axios.delete(`${API_URL}/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAlerts(alerts.filter(a => a.id !== alertId))
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <motion.div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full"
          ></motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-20 h-20 border-4 border-neon-purple/30 border-b-neon-purple rounded-full scale-75"
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
    <div className="min-h-screen bg-dark-900 text-white relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-cyan/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/5 blur-[150px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl shadow-lg shadow-neon-cyan/20">
                🚀
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
                  PrimeTrade
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Intelligence Terminal</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-6">
              <Link href="/portfolio" className="text-sm font-medium text-gray-400 hover:text-neon-cyan transition-colors">
                Portfolio
              </Link>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-dark-800 border border-white/10">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-xs text-gray-400">{isConnected ? 'Live Feed' : 'Connecting...'}</span>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">Operator</p>
                  <p className="text-sm font-semibold text-neon-cyan text-glow">{user?.username}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="px-5 py-2 bg-dark-800 border border-white/10 rounded-xl font-medium text-gray-300 hover:text-white hover:border-neon-cyan/50 transition-all"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">

        {/* Top Section: Globe & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* 3D Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 h-[400px] relative rounded-3xl overflow-hidden border border-white/10 bg-dark-800/30 backdrop-blur-sm group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-900/80 z-10 pointer-events-none" />
            <MarketGlobe />
            <div className="absolute bottom-8 left-8 z-20">
              <h2 className="text-3xl font-bold text-white mb-2">Global Arbitrage Network</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <span className="text-neon-green text-sm font-medium">System Online</span>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {[
              { label: 'Active Opportunities', value: opportunities.length, icon: '⚡', color: 'text-neon-cyan' },
              { label: 'Avg Spread', value: `${avgSpread.toFixed(2)}%`, icon: '📊', color: 'text-neon-purple' },
              { label: 'Max Spread', value: `${maxSpread.toFixed(2)}%`, icon: '💎', color: 'text-neon-pink' },
              { label: 'Active Alerts', value: alerts.length, icon: '🔔', color: 'text-neon-green' },
            ].map((stat, idx) => (
              <SpotlightCard key={stat.label} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color} text-glow`}>{stat.value}</p>
                  </div>
                  <div className="text-2xl opacity-80">{stat.icon}</div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10"
        >
          <SpreadChart />
          <ProfitChart />
        </motion.div>

        {/* Bottom Section: Opportunities & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Opportunities List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-neon-cyan">Live</span> Opportunities
              </h3>
              <span className="text-xs text-gray-500 bg-dark-800 px-3 py-1 rounded-full border border-white/5">
                Auto-refreshing every 3s
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              {opportunities.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card rounded-2xl p-12 text-center border-dashed border-2 border-white/10"
                >
                  <div className="text-4xl mb-4 opacity-30">📡</div>
                  <p className="text-gray-400">Scanning market data...</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {opportunities.map((opp, idx) => (
                    <motion.div
                      key={`${opp.pair}-${opp.timestamp}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <SpotlightCard className="p-6 group cursor-pointer hover:border-neon-cyan/30 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-dark-900 flex items-center justify-center border border-white/10 text-lg font-bold text-white">
                              {opp.pair.split('/')[0]}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                {opp.pair}
                                <span className="text-xs bg-neon-cyan/10 text-neon-cyan px-2 py-0.5 rounded text-glow">
                                  {opp.spread_percentage.toFixed(2)}% Spread
                                </span>
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                <span className="text-neon-cyan">{opp.buy_exchange}</span>
                                <span>→</span>
                                <span className="text-neon-purple">{opp.sell_exchange}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-8 w-full md:w-auto">
                            <div className="flex-1 md:flex-none">
                              <p className="text-xs text-gray-500 mb-1">Profit</p>
                              <p className="text-lg font-bold text-neon-green">+${opp.potential_profit.toFixed(2)}</p>
                            </div>
                            <div className="flex-1 md:flex-none text-right">
                              <p className="text-xs text-gray-500 mb-1">Confidence</p>
                              <div className="w-24 h-2 bg-dark-900 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                                  style={{ width: `${opp.confidence_score}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Alerts Sidebar */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Alerts</h3>
              <button
                onClick={() => setShowAlertForm(!showAlertForm)}
                className="text-xs bg-neon-purple/10 text-neon-purple px-3 py-1 rounded-full hover:bg-neon-purple/20 transition-colors"
              >
                {showAlertForm ? 'Cancel' : '+ New'}
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {showAlertForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCreateAlert}
                    className="glass-card p-4 rounded-xl overflow-hidden mb-4"
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Pair</label>
                        <select
                          value={newAlertPair}
                          onChange={(e) => setNewAlertPair(e.target.value)}
                          className="w-full px-3 py-2 bg-dark-900/50 border border-white/10 rounded-lg text-sm focus:border-neon-purple outline-none"
                        >
                          <option>BTC/USDT</option>
                          <option>ETH/USDT</option>
                          <option>BNB/USDT</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Min Spread %</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newAlertSpread}
                          onChange={(e) => setNewAlertSpread(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 bg-dark-900/50 border border-white/10 rounded-lg text-sm focus:border-neon-purple outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-neon-purple text-dark-900 font-bold rounded-lg text-sm hover:bg-neon-pink transition-colors"
                      >
                        Create Alert
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card p-4 rounded-xl group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{alert.crypto_pair}</p>
                      <p className="text-xs text-gray-400">Target Spread: &gt;{alert.min_spread}%</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}

              {alerts.length === 0 && !showAlertForm && (
                <div className="text-center py-8 glass-card rounded-xl border-dashed border-white/10">
                  <p className="text-gray-500 text-sm">No active alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
