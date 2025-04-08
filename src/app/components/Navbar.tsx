'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert('ไม่สามารถออกจากระบบได้: ' + error.message)
    } else {
      router.push('/login') // ไปที่หน้า Login หลัง logout
    }
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-lg font-semibold">Dashboard</div>

        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              <span>{user.user_metadata?.user_name || 'ผู้ใช้'}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-500 px-4 py-2 rounded text-white"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
