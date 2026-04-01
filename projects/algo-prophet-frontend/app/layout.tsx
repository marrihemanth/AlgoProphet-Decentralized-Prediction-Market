import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AlgoProphet — Decentralized Prediction Markets',
  description: 'Institutional-grade AI-native prediction market on Algorand',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
