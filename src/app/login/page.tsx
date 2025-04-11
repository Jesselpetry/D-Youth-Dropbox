'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function LoginPage() {
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showCredits, setShowCredits] = useState<boolean>(false)



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

  // Toggle credits popup
  const toggleCredits = () => {
    setShowCredits(!showCredits)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-0">
      {/* Content */}
      <div className="relative w-full max-w-md flex flex-col items-center justify-center z-10 p-4">
        <div className="mb-8 flex justify-center">
          <Image
            src="https://lh3.googleusercontent.com/fife/ALs6j_H1gtvAqd3hnB0X2duMnULwzEQDu0wXthOkqGrjVYPVjh9UQvljANR4RHqwZTb05K5iNbefaS3FefRLZ_1h64Q1Ruyo4ZCGTqseMy8Vv00KsU6GAquWBWozgtPHgjkZ3DJ01icbL5y2Yd0XF1PuwCKfbOjrdw8KifloFgdnUWqxMEQs5mJfYC_GpbbkMmsaJWBrzQbrgTVF_zWBKl4LFutohVknnDafkT0FCEYcPoqwauLUA-MRUjj3509wmY6kr8Dx1uMQgSIuoNGCrxQ1pofEjuQy5ueXkxKbDvCLD_X1xdqlfutfCGUoUl-Kfa4vCOfAj2IkiE9vnSa3LH4RMMUR_77xkfccVNv18i72AwEivM5RGqchez92Gyr-yr5D0SjyFZGongBay8Tgr8ebY9lb4RjMvJ1XsWQGE2JipkqDWt3m1_57cLveVS8ncwsJ4I-3Vi9fQjp3A61EWhyX24PdTiNtz5z3beofFbNdp7r-MiW80r5gmdMCxJCrWm0hz6-YD72hRhO2XPjKcT_8ok_B120xyzAa-4Ug2PhFqHQznn72w2XKdVdhh6Gn2rr4KGdNTJeE93ma7tWYCzMSDEfHBdY1ipt95G-aaO437YqCPznSwDgfHMsL2Ws42prZ1WoUNwat_rJdY1eQbSOC9K4pKHFsrHeYRzOnWwX7ZeuNIT2cpJCzeQHlDymokrCGlc-k0YBccvq0fjIKACj6B1AfWyQz29_Zq-R8alleXSuLyIrTbKk9mZnLVkLzfibB3ngtVg7PVDT-WTYjfwuKd-TjB4lpyOtA7s8xus1daXZIV7i37z6hCI1vzXCHSu31IC_qWatbmZwvhmf4P42AJW2koZTPnXMgVtcbrZshfOeYk3RUrLozYceZw2R0SdCPvoQDR-3sbQ7Sp8KaK8MiDEEkqa-BpdpfZ14FQjPTlx-HsP5OGWeSADjIQr4ulqgf_PnxD0O4ieEhcwJO6lYawdw2FFYylrWGa3HRc5itnXOmLaROUnXkCGNlReQimsxr7vSNocqA1wtJtOXcPevt_apBRyMWrj8q5r7nQQ_AmrS1GYLotQiqoK2TEzq9Inf6SPqATHYoHZyCZpnWtTctNmuPup--jbo3ZC2jg-NRIvGAXpnCttpKOeWmo6cKlvoBw6CdVkrsHtXZ32v75WhdSUesgJa8diB8uqOTXQ_rPoWbcpAQ0kW6gAEjK4ppOIUJWR9vSQGKdKZWlIKlOFu-EbdAEsJG4GgSI6nqk92Dmzh3amYcfxJIh2LbGBOvH6of53k-EVlLbJFiNZ_zAJZvMyu4PgQ565iE8TbAD_1HNWeir0lIHMrED35iy8lCjV0RL5EICAE8Bzwvk66aUURbqUeSPfY_mbqCIrCgiHDTjsihbh6lXLnNGM8GtVRsPkJC54SwMFVALDa4itB6ERNN1_ysg33whD_HQRpr0jnY-HjieSSVmnoaKdUp0YXRbTgpzccSBwgYxJTdHF3XPoQSHUVgMI23r2tdL9Vc5ze4_FLQvFwjM90vYerfTAcHNJtXrYQ_hEWmT3TUR6LuSqTa5NZhRUyDmUoWniMYLlDp9qIr7ZxM5yLVcOXVT3fw-S5GNnXhhCswGEdnXCIBL29V3O8PSJ81bpx8iaEJcwhBLzCe3VwS0bIPvO_KeQXl4RWdSKUMzTZfsAJ3_rGhUQDM3QrX7hY=w2559-h1316"
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
              className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-4 px-4 rounded-lg flex items-center justify-center space-x-3 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5"
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
          
          {/* Credits link */}
          <div className="text-center mt-4">
            <button 
              onClick={toggleCredits}
              className="text-white/70 hover:text-white text-sm underline transition-colors cursor-pointer"
            >
              ผู้พัฒนา
            </button>
          </div>
        </div>
      </div>

      {/* Credits Popup */}
      {showCredits && (
        <div className="fixed inset-0 flex items-center justify-center z-20">
          <div 
            className="fixed inset-0 bg-black/50 z-0"
            onClick={toggleCredits}
          />
            <div className="w-[70%] p-5 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light">
            <h3 className="text-xl font-bold mb-4 text-white-800 dark:text-white text-center">Credits</h3>
            <div className="space-y-3 text-white-600 dark:text-gray-300 flex flex-col items-center">
              <Image
              src="/logo.png"
              alt="Logo"
              width={250}
              height={250}
              priority
              className="mb-4"
              />
              <p><strong>พัฒนาโดย :</strong></p>
           
              <a href="https://www.instagram.com/chatann_/" target="_blank" className='underline'>เจส - ยุวชน 68 จ.หนองคาย</a>
              <a href="https://vinniel.in.th"  target="_blank" className='underline'>วิน - ว่าที่ยุวชน 69 จ.กรุงเทพ</a>
              <p><strong>อัพเดทล่าสุด :</strong> 2025-04-08</p>
              <p><strong>เวอร์ชั่น :</strong> 1.0.0</p>
              <div className="mt-4">
              <p className="text-sm">Special thanks to everyone who contributed to this project.</p>
              </div>
            </div>
            <button 
              onClick={toggleCredits}
              className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
