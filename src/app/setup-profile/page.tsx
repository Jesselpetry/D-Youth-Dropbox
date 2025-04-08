'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SetupProfile() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [year, setYear] = useState<number | null>(null)
  const [province, setProvince] = useState('')
  const [profileImg, setProfileImg] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  
  // Create an array of Buddhist Era years from 2545 to 2568 (current year 2025 + 543)
  const currentBuddhistYear = 2568
  const buddhistYears = Array.from(
    { length: currentBuddhistYear - 2545 + 1 }, 
    (_, i) => currentBuddhistYear - i
  )

  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
      } else {
        router.push('/login') // หากไม่ได้ล็อกอินจะรีไดเรคไปหน้าแรก
      }
    })
  }, [])

  const uploadProfileImage = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}.${fileExt}`
    const filePath = `avatars/${fileName}`
  
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })
  
    if (error) {
      console.error('Error uploading image:', error)
      return null
    }
  
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
  
    return publicUrl
  }
  
  const handleSubmit = async () => {
    if (!userId || !userName || !year || !province) {
      alert('กรอกข้อมูลให้ครบก่อนน้า!')
      return
    }

    let imageUrl = null

    if (profileImg) {
      setUploading(true)
      imageUrl = await uploadProfileImage(profileImg, userId)
      setUploading(false)
      if (!imageUrl) {
        alert('อัปโหลดรูปไม่สำเร็จ')
        return
      }
    }

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      user_name: userName,
      year,
      province,
      profile_img: imageUrl,
    })

    if (error) {
      console.error(error)
      alert('บันทึกโปรไฟล์ไม่สำเร็จ')
    } else {
      router.push('/profile') // ไปหน้า profile
    }
  }

  return (
    <div className="min-h-screen p-4 flex flex-col relative">
      {/* Background with gradient */}
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-[#0E653B] to-[#0C2A20] z-0"></div>
      
      {/* Grid overlay with 25% opacity */}
      <div className="fixed top-0 left-0 w-full h-full bg-grid-pattern opacity-25 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 flex-1">
        <h1 className="text-3xl font-bold text-white text-center my-6">สร้างบัญชี</h1>

        <div className="space-y-6 mt-2">
          <div className="space-y-1">
            <label className="text-white text-xl">ชื่อผู้ใช้</label>
            <input
              type="text"
              placeholder="ชื่อผู้ใช้"
              className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-white text-xl">ชื่อเล่น</label>
            <input
              type="text"
              placeholder="ชื่อเล่น"
              className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg"
              />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 space-y-1">
              <label className="text-white text-xl">ยุวชน ปี</label>
              <select
                className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg"
                value={year || ''}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                <option value="">2568</option>
                {buddhistYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-white text-xl">จังหวัด</label>
              <select
                className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value="">กรุงเทพ</option>
                <option value="กรุงเทพ">กรุงเทพ</option>
                <option value="เชียงใหม่">เชียงใหม่</option>
                <option value="ขอนแก่น">ขอนแก่น</option>
                <option value="ภูเก็ต">ภูเก็ต</option>
                {/* Add more provinces as needed */}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-white text-xl">รูปโปรไฟล์ <span className="text-sm">*แนะนำให้ใช้รูปขนาด 1:1</span></label>
            <div className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg"            >
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setProfileImg(e.target.files[0])
                  }}
                />
              </label>
            </div>
          </div>

          <div className="mt-10">
            <button
              onClick={handleSubmit}
              className="w-full bg-green-700 hover:bg-green-600 text-white text-xl py-4 rounded-lg font-bold"
              disabled={uploading}
            >
              {uploading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
