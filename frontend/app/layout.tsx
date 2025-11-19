import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './context/AuthContext'

export const metadata: Metadata = {
  title: 'PrimeTrade AI - Crypto Arbitrage Tracker',
  description: 'Real-time cryptocurrency arbitrage opportunities tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
