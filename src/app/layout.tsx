// ✅ app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'

import Menu from '@/app/components/Menu'

export const metadata = {
  title: 'ข้อความ Dropbox',
  description: 'โพสต์และดูข้อความของคุณแบบง่าย ๆ',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className="overflow-hidden h-full">
      <body className="bg-gray-50 text-gray-900 overflow-hidden h-full">

        <Menu /> {/* Menu จะถูกแสดงในทุกหน้าปกติ */}
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
        <div className="fixed inset-0 -z-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0E653B] to-[#0C2A20]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-25" />
        </div>
      </body>
    </html>
  )
}
