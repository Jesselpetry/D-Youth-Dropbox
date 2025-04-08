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
    <div className="min-h-screen p-4 flex flex-col relative overflow-hidden">
      {/* Background with gradient */}
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-[#0E653B] to-[#0C2A20] z-0"></div>
      
      {/* Grid overlay with 25% opacity */}
      <div className="fixed top-0 left-0 w-full h-full bg-grid-pattern opacity-25 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 flex-1">
        <div className="text-center my-6">
          <h1 className="text-3xl font-bold text-white">สร้างบัญชี</h1>
            <h2 className="text-xl font-light text-white mt-2 opacity-60">Creating an account</h2>
        </div>

        <div className="space-y-6 mt-2">
        <div className="space-y-2">
          <label className="text-white text-xl mb-2 block font-medium">ชื่อผู้ใช้</label>
          <input
            type="text"
            placeholder="ชื่อผู้ใช้"
            className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

          <div className="space-y-1">
            <label className="text-white text-xl mb-2 block">ชื่อเล่น</label>
            <input
              type="text"
              placeholder="ชื่อเล่น"
              className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light"
              />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 space-y-1">
              <label className="text-white text-xl mb-2 block">ยุวชน ปี</label>
              <select
                className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light"
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
              <label className="text-white text-xl mb-2 block">จังหวัด</label>
                <select
                className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                >
                <option value="">เลือกจังหวัด</option>
                <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                <option value="กระบี่">กระบี่</option>
                <option value="กาญจนบุรี">กาญจนบุรี</option>
                <option value="กาฬสินธุ์">กาฬสินธุ์</option>
                <option value="กำแพงเพชร">กำแพงเพชร</option>
                <option value="ขอนแก่น">ขอนแก่น</option>
                <option value="จันทบุรี">จันทบุรี</option>
                <option value="ฉะเชิงเทรา">ฉะเชิงเทรา</option>
                <option value="ชลบุรี">ชลบุรี</option>
                <option value="ชัยนาท">ชัยนาท</option>
                <option value="ชัยภูมิ">ชัยภูมิ</option>
                <option value="ชุมพร">ชุมพร</option>
                <option value="เชียงราย">เชียงราย</option>
                <option value="เชียงใหม่">เชียงใหม่</option>
                <option value="ตรัง">ตรัง</option>
                <option value="ตราด">ตราด</option>
                <option value="ตาก">ตาก</option>
                <option value="นครนายก">นครนายก</option>
                <option value="นครปฐม">นครปฐม</option>
                <option value="นครพนม">นครพนม</option>
                <option value="นครราชสีมา">นครราชสีมา</option>
                <option value="นครศรีธรรมราช">นครศรีธรรมราช</option>
                <option value="นครสวรรค์">นครสวรรค์</option>
                <option value="นนทบุรี">นนทบุรี</option>
                <option value="นราธิวาส">นราธิวาส</option>
                <option value="น่าน">น่าน</option>
                <option value="บึงกาฬ">บึงกาฬ</option>
                <option value="บุรีรัมย์">บุรีรัมย์</option>
                <option value="ปทุมธานี">ปทุมธานี</option>
                <option value="ประจวบคีรีขันธ์">ประจวบคีรีขันธ์</option>
                <option value="ปราจีนบุรี">ปราจีนบุรี</option>
                <option value="ปัตตานี">ปัตตานี</option>
                <option value="พระนครศรีอยุธยา">พระนครศรีอยุธยา</option>
                <option value="พังงา">พังงา</option>
                <option value="พัทลุง">พัทลุง</option>
                <option value="พิจิตร">พิจิตร</option>
                <option value="พิษณุโลก">พิษณุโลก</option>
                <option value="เพชรบุรี">เพชรบุรี</option>
                <option value="เพชรบูรณ์">เพชรบูรณ์</option>
                <option value="แพร่">แพร่</option>
                <option value="พะเยา">พะเยา</option>
                <option value="ภูเก็ต">ภูเก็ต</option>
                <option value="มหาสารคาม">มหาสารคาม</option>
                <option value="มุกดาหาร">มุกดาหาร</option>
                <option value="แม่ฮ่องสอน">แม่ฮ่องสอน</option>
                <option value="ยโสธร">ยโสธร</option>
                <option value="ยะลา">ยะลา</option>
                <option value="ร้อยเอ็ด">ร้อยเอ็ด</option>
                <option value="ระนอง">ระนอง</option>
                <option value="ระยอง">ระยอง</option>
                <option value="ราชบุรี">ราชบุรี</option>
                <option value="ลพบุรี">ลพบุรี</option>
                <option value="ลำปาง">ลำปาง</option>
                <option value="ลำพูน">ลำพูน</option>
                <option value="เลย">เลย</option>
                <option value="ศรีสะเกษ">ศรีสะเกษ</option>
                <option value="สกลนคร">สกลนคร</option>
                <option value="สงขลา">สงขลา</option>
                <option value="สตูล">สตูล</option>
                <option value="สมุทรปราการ">สมุทรปราการ</option>
                <option value="สมุทรสงคราม">สมุทรสงคราม</option>
                <option value="สมุทรสาคร">สมุทรสาคร</option>
                <option value="สระแก้ว">สระแก้ว</option>
                <option value="สระบุรี">สระบุรี</option>
                <option value="สิงห์บุรี">สิงห์บุรี</option>
                <option value="สุโขทัย">สุโขทัย</option>
                <option value="สุพรรณบุรี">สุพรรณบุรี</option>
                <option value="สุราษฎร์ธานี">สุราษฎร์ธานี</option>
                <option value="สุรินทร์">สุรินทร์</option>
                <option value="หนองคาย">หนองคาย</option>
                <option value="หนองบัวลำภู">หนองบัวลำภู</option>
                <option value="อ่างทอง">อ่างทอง</option>
                <option value="อุดรธานี">อุดรธานี</option>
                <option value="อุทัยธานี">อุทัยธานี</option>
                <option value="อุตรดิตถ์">อุตรดิตถ์</option>
                <option value="อุบลราชธานี">อุบลราชธานี</option>
                <option value="อำนาจเจริญ">อำนาจเจริญ</option>
                </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-white text-xl mb-2 block">
              รูปโปรไฟล์ <span className="text-sm font-light">*แนะนำให้ใช้รูปขนาด 1:1</span>
            </label>
            <div className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light"            >
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
