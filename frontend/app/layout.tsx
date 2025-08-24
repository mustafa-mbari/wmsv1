import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'My Full-Stack App',
  description: 'Built with Next.js, Express, and TypeScript',
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