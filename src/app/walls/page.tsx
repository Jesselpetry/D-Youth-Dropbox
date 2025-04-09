'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const Page = () => {
  const [walls, setWalls] = useState<any[]>([]) // เปลี่ยนจาก messages เป็น walls
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          .select('id, content, created_at, sender_id, profiles(user_name, profile_img)')  // ตรวจสอบว่า `profiles` มี `user_name` และ `profile_img`

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
      <h1 className="text-3xl font-bold text-white">ข้อความ</h1>
      <h2 className="text-xl font-light text-white mt-2 opacity-60">Messages</h2>

      {walls.length === 0 ? (
        <p className="text-white mt-4">ยังไม่มีข้อความ</p>
      ) : (
        <div className="mt-4 space-y-4">
          {walls.map((wall) => (
            <div key={wall.id} className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center mb-2">
                <img src={wall.profiles.profile_img} alt={wall.profiles.user_name} className="w-8 h-8 rounded-full mr-2" />
                <span className="text-white font-semibold">{wall.profiles.user_name}</span>
              </div>
              <p className="text-white">{wall.content}</p>
              <span className="text-gray-400 text-sm">{new Date(wall.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Page
