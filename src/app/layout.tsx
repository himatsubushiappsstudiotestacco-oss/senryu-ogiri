import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: '川柳大喜利',
  description: '上の句を出して、下の句で笑わせろ。',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[#fafaf9]">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
