'use client'

import { motion } from 'framer-motion'

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

interface Props {
  opportunity: Opportunity
  index: number
}

export function OpportunityCard({ opportunity, index }: Props) {
  const getSpreadColor = (spread: number) => {
    if (spread > 0.7) return 'from-neon-cyan to-neon-purple'
    if (spread > 0.4) return 'from-neon-purple to-neon-pink'
    return 'from-neon-pink to-neon-cyan'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      whileHover={{ scale: 1.02, x: 10 }}
      className="group relative"
    >
      {/* Glowing background */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`absolute inset-0 bg-gradient-to-r ${getSpreadColor(opportunity.spread_percentage)} opacity-20 blur-xl rounded-xl`}
      ></motion.div>

      {/* Card */}
      <div className="relative backdrop-blur-xl bg-dark-800 bg-opacity-50 border border-neon-cyan border-opacity-10 rounded-xl p-5 hover:border-opacity-50 transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <motion.p
              className="font-semibold text-lg text-neon-cyan mb-1"
              whileHover={{ letterSpacing: '0.05em' }}
            >
              {opportunity.pair}
            </motion.p>
            <p className="text-sm text-gray-400">
              {opportunity.buy_exchange} <span className="text-neon-cyan">→</span> {opportunity.sell_exchange}
            </p>
          </div>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl"
          >
            💹
          </motion.div>
        </div>

        {/* Spread Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.1 + 0.2 }}
          className={`absolute top-5 right-5 bg-gradient-to-r ${getSpreadColor(opportunity.spread_percentage)} text-white px-3 py-1 rounded-full text-sm font-bold`}
        >
          {opportunity.spread_percentage.toFixed(3)}%
        </motion.div>

        {/* Prices Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-dark-700 bg-opacity-30 rounded-lg p-3 border border-neon-cyan border-opacity-20"
          >
            <p className="text-xs text-gray-500 mb-1">Buy Price</p>
            <p className="text-neon-cyan font-semibold">${opportunity.buy_price.toLocaleString()}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-dark-700 bg-opacity-30 rounded-lg p-3 border border-neon-purple border-opacity-20"
          >
            <p className="text-xs text-gray-500 mb-1">Sell Price</p>
            <p className="text-neon-purple font-semibold">${opportunity.sell_price.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* Confidence Score */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-400">AI Confidence</p>
            <p className="text-xs font-bold text-neon-cyan">{opportunity.confidence_score}%</p>
          </div>
          <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden border border-neon-cyan border-opacity-20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${opportunity.confidence_score}%` }}
              transition={{ duration: 1.5, delay: 0.3 + index * 0.1 }}
              className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink"
            ></motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700 border-opacity-30">
          <span className="text-sm text-gray-500">Potential Profit</span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="font-bold text-neon-green"
          >
            +${opportunity.potential_profit.toFixed(2)}
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}
