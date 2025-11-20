'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { motion } from 'framer-motion'

interface DataPoint {
    pair: string
    profit: number
}

interface ProfitChartProps {
    data?: DataPoint[]
}

// Mock data if none provided
const mockData: DataPoint[] = [
    { pair: 'BTC/USDT', profit: 120 },
    { pair: 'ETH/USDT', profit: 85 },
    { pair: 'BNB/USDT', profit: 45 },
    { pair: 'SOL/USDT', profit: 60 },
    { pair: 'ADA/USDT', profit: 30 },
]

export function ProfitChart({ data = mockData }: ProfitChartProps) {
    return (
        <div className="w-full h-[300px] p-4 glass-card rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200">Potential Profit (USD)</h3>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
                    <span className="text-xs text-neon-green">Live Estimates</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="pair"
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                            backgroundColor: 'rgba(19, 19, 43, 0.9)',
                            border: '1px solid rgba(0, 243, 255, 0.2)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#10b981' }}
                        labelStyle={{ color: '#9ca3af' }}
                    />
                    <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00f3ff' : '#bc13fe'} fillOpacity={0.8} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
