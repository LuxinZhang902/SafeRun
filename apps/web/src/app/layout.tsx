import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SafeRun - AI-Powered Secure Code Execution',
  description: 'Execute GitHub repositories securely with AI-powered analysis and multi-layer security',
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
