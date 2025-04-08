'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import ProvinceSelector from './components/provinceSelector'
import YearSelector from './components/yearSelector'

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [year, setYear] = useState('')
  const [province, setProvince] = useState('')
  const [profileImg, setProfileImg] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Auth error:', authError)
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        return
      }

      setUserName(data.user_name || '')
      setYear(data.year || '')
      setProvince(data.province || '')
      setPreviewUrl(data.profile_img || null)
      setLoading(false)
    }

    fetchProfile()
  }, [])

  useEffect(() => {
    if (profileImg) {
      const objectUrl = URL.createObjectURL(profileImg)
      setPreviewUrl(objectUrl)

      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [profileImg])

  const uploadProfileImage = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }

      setProfileImg(file);
    }
  };


  const handleSubmit = async () => {
    if (!userId || !userName || !year || !province || !previewUrl) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    let imageUrl = previewUrl

    if (profileImg) {
      const uploadedUrl = await uploadProfileImage(profileImg, userId)
      if (!uploadedUrl) {
        alert('อัปโหลดรูปไม่สำเร็จ')
        return
      }
      imageUrl = uploadedUrl
    }

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      user_name: userName,
      year,
      province,
      profile_img: imageUrl,
    })

    if (error) {
      console.error('Update error:', error)
      alert('ไม่สามารถบันทึกได้')
    } else {
      alert('บันทึกข้อมูลเรียบร้อยแล้ว')
    }
  }

  if (loading) return <div className="p-4">กำลังโหลดโปรไฟล์...</div>

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">แก้ไขโปรไฟล์</h1>


      <div className="space-y-1">
          

            {/* Image preview area */}
            {previewUrl ? (
              <div className="mb-4 flex flex-col items-center">
                  <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setProfileImg(null);
                  }}
                  className="mt-2 text-white/80 hover:text-white text-sm cursor-pointer"
                >
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/50">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                   <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                </div>
              
               
                </button>
              </div>
            ) : (
              <div
                className="w-full p-8 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light cursor-pointer"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-12 h-12 text-white/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  <span className="mt-2 text-white/70">
                    คลิกเพื่อเลือกรูปภาพ
                  </span>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

      

      <div className="space-y-6 mt-2">
        <div className="space-y-2">
          <label className="text-white text-xl mb-2 block font-medium">
        ชื่อผู้ใช้
          </label>
          <input
        type="text"
        placeholder="ชื่อผู้ใช้"
        className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-white text-xl mb-2 block">ปี</label>
          <YearSelector year={year} setYear={setYear} />
        </div>
        <div className="flex-1">
          <label className="text-white text-xl mb-2 block">จังหวัด</label>
          <ProvinceSelector province={province} setProvince={setProvince} />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-green-700 hover:bg-green-600 text-white text-xl py-4 rounded-lg font-medium transition-colors"
      >
        บันทึกการเปลี่ยนแปลง
      </button>
    </div>
  )
}
