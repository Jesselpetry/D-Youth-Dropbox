'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Auth error:', authError)
        router.push('/login') // ถ้าไม่ได้ login ให้ redirect กลับ
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        return
      }

      setUserData(data)
      setLoading(false)
    }

    fetchProfile()
  }, [])

  if (loading) return <div className="p-4">กำลังโหลดโปรไฟล์...</div>

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">โปรไฟล์ของคุณ</h1>

      <div className="text-center">
        <img
          src={userData?.profile_img || '/default-profile.png'}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h2 className="text-xl font-semibold">{userData?.user_name}</h2>
        <p className="text-gray-600">{userData?.year} | {userData?.province}</p>
      </div>
    </div>
  )
}
