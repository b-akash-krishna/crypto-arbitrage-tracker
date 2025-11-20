'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

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

interface WebSocketContextType {
    opportunities: Opportunity[]
    isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([])
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        // Use local backend URL or env var
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws/market-data'

        let socket: WebSocket

        const connect = () => {
            socket = new WebSocket(wsUrl)

            socket.onopen = () => {
                console.log('WebSocket Connected')
                setIsConnected(true)
            }

            socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data)
                    if (message.type === 'update') {
                        setOpportunities(message.data)
                    }
                } catch (error) {
                    console.error('Error parsing WS message:', error)
                }
            }

            socket.onclose = () => {
                console.log('WebSocket Disconnected')
                setIsConnected(false)
                // Reconnect after 5 seconds
                setTimeout(connect, 5000)
            }

            socket.onerror = (error) => {
                console.error('WebSocket Error:', error)
                socket.close()
            }
        }

        connect()

        return () => {
            if (socket) socket.close()
        }
    }, [])

    return (
        <WebSocketContext.Provider value={{ opportunities, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    )
}

export function useWebSocket() {
    const context = useContext(WebSocketContext)
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider')
    }
    return context
}
