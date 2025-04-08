// ✅ app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
// Remove Inter import
import Navbar from '@/app/components/Navbar'

export const metadata = {
  title: 'ข้อความ Dropbox',
  description: 'โพสต์และดูข้อความของคุณแบบง่าย ๆ',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-gray-50 text-gray-900">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}