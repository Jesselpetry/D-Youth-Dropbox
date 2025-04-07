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
    <div className="max-w-md mx-auto mt-10 space-y-4 px-4">
      <h1 className="text-2xl font-bold">ตั้งค่าโปรไฟล์</h1>

      <input
        type="text"
        placeholder="ชื่อเล่น / ชื่อเล่นในระบบ"
        className="border p-2 w-full rounded"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />

      <input
        type="number"
        placeholder="ปีเกิด (เช่น 2006)"
        className="border p-2 w-full rounded"
        value={year ?? ''}
        onChange={(e) => setYear(parseInt(e.target.value))}
      />

      <input
        type="text"
        placeholder="จังหวัด"
        className="border p-2 w-full rounded"
        value={province}
        onChange={(e) => setProvince(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        className="border p-2 w-full rounded"
        onChange={(e) => {
          if (e.target.files?.[0]) setProfileImg(e.target.files[0])
        }}
      />

      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded w-full"
        disabled={uploading}
      >
        {uploading ? 'กำลังบันทึกโปรไฟล์...' : 'บันทึกโปรไฟล์'}
      </button>
    </div>
  )
}
