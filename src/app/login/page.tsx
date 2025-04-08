'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/profile')
      }
    })
  }, [router])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setLoginError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Login failed:', error)
      setLoginError(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const LoadingIcon = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  return (
    <div className="fixed inset-0 flex items-center justify-center z-10">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0E653B] to-[#0C2A20] z-0" />
      <div className="fixed inset-0 bg-grid-pattern opacity-25 z-0" />

      {/* Content */}
      <div className="relative w-full max-w-md flex flex-col items-center justify-center z-10 p-4">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={500}
            height={500}
            priority
          />
        </div>

        <div className="w-full space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-4 px-4 rounded-lg flex items-center justify-center space-x-3 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <LoadingIcon />
                กำลังเข้าสู่ระบบ...
              </span>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  width="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
              </>
            )}
          </button>

          {loginError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-white text-center">{loginError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
