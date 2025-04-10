'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const Page = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to get paper color
  const getPaperColor = (color: string | null) => {
    return color || '#f5f5f5'; // Default color
  }

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      // ถ้าไม่มี session หรือผู้ใช้ไม่ได้ล็อกอิน
      if (!session || !session.user) {
        setError('กรุณาล็อกอินเพื่อดูข้อความ')
        setLoading(false)
        return
      }

      try {
        const userId = session.user.id // ใช้ user.id จาก session

        // ดึงข้อความที่ receiver_id ตรงกับ id ของผู้ใช้
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            is_anonymous,
            color,
            profiles:user_id(user_name, profile_img, year, province)
          `)
          .eq('receiver_id', userId)
        
        if (error) throw error

        setMessages(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [])

  if (loading) return <div>กำลังโหลด...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="text-left my-6">
      <h1 className="text-3xl font-bold text-white">ข้อความ</h1>
      <h2 className="text-xl font-light text-white mt-2 opacity-60">Messages</h2>

      {messages.length === 0 ? (
        <p className="text-white mt-4">ยังไม่มีข้อความ</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="rounded-lg p-4 h-full shadow-xl"
              style={{ backgroundColor: getPaperColor(message.color) }}
            >
              {/* User Profile Section */}
              <div
                className={`flex items-center justify-left h-auto ${
                  message.is_anonymous ? "opacity-50" : ""
                }`}
              >
                {/* Profile Image */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-500">
                  <img
                    src={
                      message.is_anonymous
                        ? "/anonymous-avatar.png"
                        : message.profiles?.profile_img || "/anonymous-avatar.png"
                    }
                    alt={message.is_anonymous ? "Anonymous" : "Profile"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* User Info */}
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 text-lg">
                    {message.is_anonymous
                      ? "ไม่ระบุตัวตน"
                      : message.profiles?.user_name || "ไม่ระบุตัวตน"}
                  </h3>
                  <p className="text-xs font-light text-gray-900 mb-1">
                    {message.is_anonymous
                      ? "ไม่ระบุจังหวัด"
                      : message.profiles?.province || "ไม่ระบุจังหวัด"}
                  </p>
                  <span className="bg-gray-900 text-white text-xs px-4 py-1 rounded-lg">
                    {message.is_anonymous
                      ? "---"
                      : message.profiles?.year || "ไม่ระบุปี"}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="mt-4">
                <p className="text-gray-900 break-words">{message.content}</p>
              </div>

              {/* Timestamp */}
              <div className="mt-4">
                <span className="text-gray-600 font-light text-xs">
                  {new Date(message.created_at).toLocaleString()}
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