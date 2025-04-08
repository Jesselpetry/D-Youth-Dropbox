'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Menu from '@/app/components/Menu' // ✅ updated import

export default function FamilyPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white">
      {/* Menu */}
      <div className="relative z-10">
        <Menu />
      </div>
    </div>
  )
}
