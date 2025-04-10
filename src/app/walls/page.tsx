'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const Page = () => {
  const [walls, setWalls] = useState<any[]>([]) // เปลี่ยนจาก messages เป็น walls
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const paperColor = '#f5f5f5' // Define paperColor here (example: light gray color)

  useEffect(() => {
    const fetchWalls = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      // ถ้าไม่มี session หรือผู้ใช้ไม่ได้ล็อกอิน
      if (!session || !session.user) {
        setError('กรุณาล็อกอินเพื่อดูข้อความ')
        setLoading(false)
        return
      }

      try {
        // ดึงข้อมูลทั้งหมดจากตาราง walls โดยการ JOIN กับ profiles เพื่อดึงชื่อผู้ส่งและรูปโปรไฟล์
        const { data, error } = await supabase
          .from('walls')
          .select('id, content, created_at, sender_id, profiles(user_name, profile_img, year, province)')  // ตรวจสอบว่า `profiles` มี `user_name` และ `profile_img`

        if (error) throw error

        setWalls(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWalls()
  }, [])

  if (loading) return <div>กำลังโหลด...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="text-left my-6">
      <h1 className="text-3xl font-bold text-white">กำแพง</h1>
      <h2 className="text-xl font-light text-white mt-2 opacity-60">Walls</h2>

      {walls.length === 0 ? (
        <p className="text-white mt-4">ยังไม่มีข้อความ</p>
      ) : (
        <div className="mt-4 space-y-4">
          {walls.map((wall) => (
            <div key={wall.id} className="rounded-lg p-4 mt-6 relative" style={{ backgroundColor: paperColor }}>
              {/* User Profile Section */}
              <div className={`flex items-center justify-left h-auto ${wall.isAnonymous ? 'opacity-50' : ''}`}>
                {/* Profile Image */}
                <div className="w-18 h-18 rounded-full overflow-hidden bg-gray-500">
                  <img
                    src={wall.isAnonymous ? "/anonymous-avatar.png" : wall.profiles.profile_img || "/person.png"}
                    alt={wall.isAnonymous ? "Anonymous" : "Profile"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* User Info */}
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 text-lg">
                    {wall.isAnonymous ? "ไม่ระบุตัวตน" : wall.profiles.user_name || "คุณ"}
                  </h3>
                  <p className="text-xs font-light text-gray-900 mb-1">
                    {wall.isAnonymous ? "ไม่ระบุจังหวัด" : wall.profiles.province || "ไม่ระบุจังหวัด"}
                  </p>
                  <span className="bg-gray-900 text-white text-xs px-4 py-1 rounded-lg">
                    {wall.isAnonymous ? "---" : wall.profiles.year || "ไม่ระบุปี"}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="mt-4">
                <p className="text-gray-900">{wall.content}</p>
              </div>

              {/* Timestamp */}
              <div className="mt-4">
                <span className="text-gray-600 font-light text-xs">
                  {new Date(wall.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Page