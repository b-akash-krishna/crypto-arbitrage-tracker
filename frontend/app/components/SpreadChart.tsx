'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

interface DataPoint {
    time: string
    spread: number
}

interface SpreadChartProps {
    data?: DataPoint[]
}

// Mock data if none provided
const mockData: DataPoint[] = [
    { time: '00:00', spread: 0.2 },
    { time: '04:00', spread: 0.5 },
    { time: '08:00', spread: 1.2 },
    { time: '12:00', spread: 0.8 },
    { time: '16:00', spread: 1.5 },
    { time: '20:00', spread: 0.9 },
    { time: '24:00', spread: 1.1 },
]

export function SpreadChart({ data = mockData }: SpreadChartProps) {
    return (
        <div className="w-full h-[300px] p-4 glass-card rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200">Spread Trend (24h)</h3>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
                    <span className="text-xs text-neon-cyan">Live</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorSpread" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="time"
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
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(19, 19, 43, 0.9)',
                            border: '1px solid rgba(0, 243, 255, 0.2)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#00f3ff' }}
                        labelStyle={{ color: '#9ca3af' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="spread"
                        stroke="#00f3ff"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSpread)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
