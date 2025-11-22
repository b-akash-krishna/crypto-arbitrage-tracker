'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface InfoTooltipProps {
    text: string
    className?: string
}

export function InfoTooltip({ text, className = '' }: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <span
            className={`relative inline-block ml-2 ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <span className="w-4 h-4 rounded-full border border-gray-500 text-gray-500 flex items-center justify-center text-[10px] cursor-help hover:border-neon-cyan hover:text-neon-cyan transition-colors">
                ?
            </span>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-dark-800 border border-white/10 rounded-lg text-xs text-gray-300 shadow-xl z-50 backdrop-blur-md"
                    >
                        {text}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark-800" />
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    )
}
