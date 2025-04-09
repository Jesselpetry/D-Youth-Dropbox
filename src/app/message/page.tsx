'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const Page = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      // ใช้ getSession() แทน session()
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
          .select('*')
          .eq('receiver_id', userId) // กรองข้อความที่ส่งไปยังผู้ใช้
        
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
        <div className="mt-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="p-4 bg-gray-800 rounded-lg">
              <p className="text-white">{message.content}</p>
              
              <span className="text-gray-400 text-sm">{new Date(message.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Page
