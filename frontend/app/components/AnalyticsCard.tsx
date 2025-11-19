'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Props {
  title: string
  value: string | number
  icon: string
  gradient: string
  delay: number
}

export function AnalyticsCard({ title, value, icon, gradient, delay }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
      className={`backdrop-blur-xl bg-gradient-to-br ${gradient} bg-opacity-10 border border-opacity-20 rounded-xl p-6 cursor-pointer group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="text-3xl group-hover:scale-110 transition-transform">{icon}</div>
      </div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: delay + 0.3, duration: 0.8 }}
        className={`h-1 rounded-full bg-gradient-to-r ${gradient}`}
      ></motion.div>
    </motion.div>
  )
}
