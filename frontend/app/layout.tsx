import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './context/AuthContext'
import { WebSocketProvider } from './context/WebSocketContext'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PrimeTrade | AI Arbitrage Tracker',
  description: 'Real-time crypto arbitrage opportunities powered by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} bg-dark-900 text-white custom-scrollbar`}>
        <AuthProvider>
          <WebSocketProvider>
            {children}
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
