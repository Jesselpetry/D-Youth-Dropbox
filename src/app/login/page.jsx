'use client'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/') // already logged in
      }
    })
  }, [])

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`, // <-- redirect endpoint after login
      }
    })

    if (error) console.error('Login failed:', error.message)
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">ยินดีต้อนรับ</h1>
      <button
        onClick={handleGoogleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Login with Google
      </button>
    </main>
  )
}
