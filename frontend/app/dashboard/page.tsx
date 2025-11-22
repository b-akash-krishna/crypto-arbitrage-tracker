'use client'

import { useState, useEffect, useRef } from 'react'
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
import { InfoTooltip } from '../components/InfoTooltip'
import { Hero3D } from '../components/Hero3D'

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
  const contentRef = useRef<HTMLDivElement>(null)

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

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' })
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

  const simulatedOpportunities = [
    {
      pair: 'BTC/USDT',
      buy_exchange: 'Binance',
      sell_exchange: 'Kraken',
      spread_percentage: 0.85,
      potential_profit: 125.50,
      confidence_score: 92.5,
      timestamp: new Date().toISOString()
    },
    {
      pair: 'ETH/USDT',
      buy_exchange: 'Coinbase',
      sell_exchange: 'Huobi',
      spread_percentage: 1.2,
      potential_profit: 85.20,
      confidence_score: 88.0,
      timestamp: new Date().toISOString()
    },
    {
      pair: 'SOL/USDT',
      buy_exchange: 'KuCoin',
      sell_exchange: 'Bybit',
      spread_percentage: 0.65,
      potential_profit: 45.00,
      confidence_score: 75.5,
      timestamp: new Date().toISOString()
    }
  ]

  const displayOpportunities = opportunities.length > 0 ? opportunities : simulatedOpportunities

  const avgSpread = displayOpportunities.length > 0
    ? displayOpportunities.reduce((acc, opp) => acc + opp.spread_percentage, 0) / displayOpportunities.length
    : 0
  const maxSpread = displayOpportunities.length > 0
    ? Math.max(...displayOpportunities.map(o => o.spread_percentage))
    : 0

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white relative overflow-x-hidden font-sans">
      {/* Hero Section */}
      <div className="h-screen w-full relative flex flex-col items-center justify-center z-20">
        <Hero3D />

        <div className="z-30 text-center space-y-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent tracking-tighter mb-4 text-glow">
              PRIME TRADE
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 tracking-[0.2em] font-light uppercase">
              Intelligence Terminal
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="pointer-events-auto"
          >
            <button
              onClick={scrollToContent}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full backdrop-blur-md transition-all group"
            >
              <span className="text-sm uppercase tracking-widest text-neon-cyan group-hover:text-white transition-colors">
                Initialize System
              </span>
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 z-30 animate-bounce"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-neon-cyan rounded-full animate-scroll" />
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div ref={contentRef} className="relative z-10 bg-dark-900 min-h-screen">
        {/* Background Elements for Content */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('/dashboard-bg.png')" }}
          />
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-cyan/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/5 blur-[150px] rounded-full" />
        </div>

        {/* Navigation */}
        <nav className="sticky top-0 z-50 glass-card border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl shadow-lg shadow-neon-cyan/20">
                  🚀
                </div>
                <span className="font-bold text-xl tracking-wider">PRIME</span>
              </div>

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
                  <button
                    onClick={logout}
                    className="px-5 py-2 bg-dark-800 border border-white/10 rounded-xl font-medium text-gray-300 hover:text-white hover:border-neon-cyan/50 transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          {/* Top Section: Globe & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* 3D Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
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
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4"
            >
              {[
                { label: 'Active Opportunities', value: displayOpportunities.length, icon: '⚡', color: 'text-neon-cyan' },
                { label: 'Avg Spread', value: `${avgSpread.toFixed(2)}%`, icon: '📊', color: 'text-neon-purple' },
                { label: 'Max Spread', value: `${maxSpread.toFixed(2)}%`, icon: '💎', color: 'text-neon-pink' },
                { label: 'Active Alerts', value: alerts.length, icon: '🔔', color: 'text-neon-green' },
              ].map((stat, idx) => (
                <motion.div key={stat.label} variants={item}>
                  <SpotlightCard className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color} text-glow`}>{stat.value}</p>
                      </div>
                      <div className="text-2xl opacity-80">{stat.icon}</div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <SpreadChart data={displayOpportunities.map(o => ({
                time: new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                spread: o.spread_percentage
              }))} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <ProfitChart data={displayOpportunities.map(o => ({
                pair: o.pair,
                profit: o.potential_profit
              }))} />
            </motion.div>
          </div>

          {/* Opportunities List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Live Opportunities</h2>
                {opportunities.length === 0 && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold animate-pulse">
                    ⚠️ SIMULATION MODE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className={`w-2 h-2 rounded-full ${opportunities.length > 0 ? 'bg-neon-cyan' : 'bg-amber-500'} animate-pulse`} />
                {opportunities.length > 0 ? 'Auto-refreshing (5s)' : 'Simulated Data'}
              </div>
            </div>

            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {displayOpportunities.map((opp, idx) => (
                  <motion.div
                    key={`${opp.pair}-${opp.buy_exchange}-${opp.sell_exchange}-${opp.timestamp}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <SpotlightCard className={`p-6 ${opportunities.length === 0 ? 'border-amber-500/30' : ''}`}>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/10 ${opportunities.length === 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20'}`}>
                            {opportunities.length === 0 ? '🧪' : '💰'}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{opp.pair}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span className={opportunities.length === 0 ? 'text-amber-400' : 'text-neon-cyan'}>{opp.buy_exchange}</span>
                              <span>→</span>
                              <span className={opportunities.length === 0 ? 'text-orange-400' : 'text-neon-purple'}>{opp.sell_exchange}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 w-full md:w-auto">
                          <div className="flex-1 md:flex-none">
                            <div className="text-xs text-gray-500 mb-1 flex items-center">
                              Profit
                              <InfoTooltip text="Estimated profit for a $100 trade (excluding fees)." />
                            </div>
                            <p className={`text-lg font-bold ${opportunities.length === 0 ? 'text-amber-500' : 'text-neon-green'}`}>+${opp.potential_profit.toFixed(2)}</p>
                          </div>
                          <div className="flex-1 md:flex-none text-right">
                            <div className="text-xs text-gray-500 mb-1 flex items-center justify-end">
                              Confidence
                              <InfoTooltip text="AI-predicted probability of successful execution based on volatility and liquidity." />
                            </div>
                            <div className="w-24 h-2 bg-dark-900 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${opportunities.length === 0 ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-neon-cyan to-neon-purple'}`}
                                style={{ width: `${opp.confidence_score}%` }}
                              />
                            </div>
                            <p className={`text-xs mt-1 ${opportunities.length === 0 ? 'text-amber-500' : 'text-neon-cyan'}`}>{opp.confidence_score.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Alerts Sidebar */}
          <div className="mt-10">
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
