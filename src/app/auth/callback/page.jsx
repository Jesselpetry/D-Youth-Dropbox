'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()

      // ดึงข้อมูลผู้ใช้
      const { data: userData } = await supabase.auth.getUser()

      // ถ้า login สำเร็จ → ไปหน้า setup profile
      if (userData?.user) {
        router.push('/setup-profile')
      }
    }

    getSession()
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <p>กำลังเข้าสู่ระบบ...</p>
    </div>
  )
}
