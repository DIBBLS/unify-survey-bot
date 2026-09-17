import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unify Survey Bot — WhatsApp Feedback Engine',
  description: 'Instant WhatsApp surveys and analytics for communities, campuses, and businesses.',
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
