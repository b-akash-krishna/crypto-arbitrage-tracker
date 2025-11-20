'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { SpotlightCard } from '../components/SpotlightCard'
import Link from 'next/link'

interface Trade {
    id: number
    crypto_pair: string
    entry_price: number
    exit_price: number | null
    quantity: number
    profit_loss: number | null
    status: string
}

export default function Portfolio() {
    const { user, token, logout, loading: authLoading } = useAuth()
    const router = useRouter()

    const [trades, setTrades] = useState<Trade[]>([])
    const [newTradePair, setNewTradePair] = useState('BTC/USDT')
    const [newTradePrice, setNewTradePrice] = useState('')
    const [newTradeQty, setNewTradeQty] = useState('')
    const [showTradeForm, setShowTradeForm] = useState(false)
    const [loading, setLoading] = useState(true)

    const API_URL = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api`
        : 'http://127.0.0.1:8000/api'

    useEffect(() => {
        if (!token && !authLoading) {
            router.push('/')
        }
    }, [token, router, authLoading])

    const fetchTrades = async () => {
        try {
            const response = await axios.get(`${API_URL}/trades`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setTrades(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Failed to fetch trades:', error)
            setLoading(false)
        }
    }

    useEffect(() => {
        if (token) {
            fetchTrades()
        }
    }, [token, API_URL])

    const handleCreateTrade = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await axios.post(
                `${API_URL}/trades`,
                {
                    crypto_pair: newTradePair,
                    entry_price: parseFloat(newTradePrice),
                    quantity: parseFloat(newTradeQty)
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            fetchTrades()
            setNewTradePair('BTC/USDT')
            setNewTradePrice('')
            setNewTradeQty('')
            setShowTradeForm(false)
        } catch (error) {
            console.error('Failed to create trade:', error)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
            </div>
        )
    }

    const totalValue = trades.reduce((acc, trade) => acc + (trade.quantity * trade.entry_price), 0)
    const activeTrades = trades.filter(t => t.status === 'OPEN').length

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
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-dark-800 border border-white/10 flex items-center justify-center text-xl group-hover:border-neon-cyan/50 transition-colors">
                                ←
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Portfolio</h1>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400">Trading Terminal</p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] uppercase tracking-widest text-gray-500">Total Value</p>
                                <p className="text-sm font-semibold text-neon-green text-glow">${totalValue.toFixed(2)}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center text-dark-900 font-bold">
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">

                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Active Trades</h2>
                    <button
                        onClick={() => setShowTradeForm(true)}
                        className="px-4 py-2 bg-neon-cyan text-dark-900 font-bold rounded-lg hover:bg-white transition-colors shadow-lg shadow-neon-cyan/20"
                    >
                        + New Trade
                    </button>
                </div>

                <AnimatePresence>
                    {showTradeForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8"
                        >
                            <SpotlightCard className="p-6 max-w-2xl mx-auto border-neon-cyan/30">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-neon-cyan">Execute Trade</h3>
                                    <button onClick={() => setShowTradeForm(false)} className="text-gray-400 hover:text-white">✕</button>
                                </div>
                                <form onSubmit={handleCreateTrade} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Pair</label>
                                        <select
                                            value={newTradePair}
                                            onChange={(e) => setNewTradePair(e.target.value)}
                                            className="w-full px-3 py-2 bg-dark-900/50 border border-white/10 rounded-lg text-sm focus:border-neon-cyan outline-none"
                                        >
                                            <option>BTC/USDT</option>
                                            <option>ETH/USDT</option>
                                            <option>BNB/USDT</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Entry Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newTradePrice}
                                            onChange={(e) => setNewTradePrice(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full px-3 py-2 bg-dark-900/50 border border-white/10 rounded-lg text-sm focus:border-neon-cyan outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={newTradeQty}
                                            onChange={(e) => setNewTradeQty(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full px-3 py-2 bg-dark-900/50 border border-white/10 rounded-lg text-sm focus:border-neon-cyan outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-900 font-bold rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Confirm Trade
                                        </button>
                                    </div>
                                </form>
                            </SpotlightCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-4">
                    {trades.length === 0 ? (
                        <div className="text-center py-20 glass-card rounded-2xl border-dashed border-white/10">
                            <div className="text-4xl mb-4 opacity-30">💼</div>
                            <p className="text-gray-400">No active trades found</p>
                            <button
                                onClick={() => setShowTradeForm(true)}
                                className="mt-4 text-neon-cyan hover:underline"
                            >
                                Start Trading
                            </button>
                        </div>
                    ) : (
                        trades.map((trade) => (
                            <SpotlightCard key={trade.id} className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="w-12 h-12 rounded-full bg-dark-900 flex items-center justify-center border border-white/10 text-lg font-bold text-white">
                                            {trade.crypto_pair.split('/')[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white">{trade.crypto_pair}</h4>
                                            <p className="text-xs text-gray-400">ID: #{trade.id}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-8 w-full md:w-auto text-center md:text-left">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Entry Price</p>
                                            <p className="font-mono text-white">${trade.entry_price.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Quantity</p>
                                            <p className="font-mono text-white">{trade.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Total Value</p>
                                            <p className="font-mono text-neon-cyan">${(trade.entry_price * trade.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${trade.status === 'OPEN'
                                                ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                                                : 'bg-gray-800 text-gray-400'
                                            }`}>
                                            {trade.status}
                                        </span>
                                    </div>
                                </div>
                            </SpotlightCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
