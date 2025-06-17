import './globals.css'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { FaRegLightbulb } from 'react-icons/fa'

const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'Ad Library Master',
  description: 'Aggregate and analyze ads from multiple platforms',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={roboto.className + ' min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-100 flex flex-col items-center justify-center'}>
        <header className="w-full flex flex-col items-center py-8 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-blue-600 text-3xl"><FaRegLightbulb /></span>
            <span className="text-2xl font-bold tracking-tight">Ad Library Master</span>
          </div>
        </header>
        <main className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center flex-1">
          {children}
        </main>
        <footer className="w-full text-center text-xs text-gray-400 py-6 mt-8">
          &copy; {new Date().getFullYear()} Ad Library Master. All rights reserved.
        </footer>
      </body>
    </html>
  )
}
