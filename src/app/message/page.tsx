'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProfileModal from "@/app/components/ProfileModal"

// Define interfaces for our data types
interface Profile {
  id: string
  user_name: string
  profile_img?: string
  year?: string
  province?: string
  is_anonymous?: boolean
}

interface Message {
  id: number
  content: string
  created_at: string
  sender_id: string
  is_anonymous: boolean
  color: string | null
  profiles: Profile | null
}

interface FamilyMember {
  id: string
  user_name: string
  province?: string
  year?: string
  profile_img?: string
}

const Page = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<FamilyMember | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Function to get paper color
  const getPaperColor = (color: string | null) => {
    return color || '#f5f5f5' // Default color
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
          profiles:sender_id(id, user_name, profile_img, year, province)
        `)
          .eq('receiver_id', userId)
          .order('created_at', { ascending: false }) // Sort by created_at in descending order (newest first)

        if (error) throw error

        // Process the data to ensure it matches our Message type
        const processedMessages: Message[] = [];

        if (data) {
          for (const msg of data) {
            // Safe handling of profiles data
            let profileData: Profile | null = null;
            
            if (msg.profiles) {
              // Check what type of data we're dealing with
              // In Supabase joins, the data can come in different formats
              if (Array.isArray(msg.profiles) && msg.profiles.length > 0) {
                // If profiles is an array, take the first element
                const profile = msg.profiles[0];
                profileData = {
                  id: profile.id,
                  user_name: profile.user_name,
                  profile_img: profile.profile_img,
                  year: profile.year,
                  province: profile.province
                };
              } else if (typeof msg.profiles === 'object') {
                // If profiles is a single object
                const profile = msg.profiles;
                // Type guard to ensure the object has the expected shape
                if ('id' in profile && 'user_name' in profile) {
                  profileData = {
                    id: profile.id,
                    user_name: profile.user_name,
                    profile_img: profile.profile_img,
                    year: profile.year,
                    province: profile.province
                  };
                }
              }
            }
            
            // Create a properly typed message object
            processedMessages.push({
              id: msg.id,
              content: msg.content,
              created_at: msg.created_at,
              sender_id: msg.sender_id,
              is_anonymous: msg.is_anonymous,
              color: msg.color,
              profiles: profileData
            });
          }
        }

        setMessages(processedMessages);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [])

  // Handle profile click function from the wall component
  const handleProfileClick = (profile: Profile | null) => {
    if (!profile || profile.is_anonymous) return // Don't open modal for anonymous profiles
    
    // Convert profile data to the format expected by the ProfileModal
    const familyMember: FamilyMember = {
      id: profile.id,
      user_name: profile.user_name,
      province: profile.province,
      year: profile.year,
      profile_img: profile.profile_img
    }
    
    setSelectedProfile(familyMember)
    setIsModalOpen(true)
  }
  
  // Handle modal close function
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProfile(null)
  }
  
  // Handle send message function
  const handleSendMessage = (memberId: string | number) => {
    window.location.href = `/message/${memberId}`
  }

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
              className="rounded-lg p-4 h-full shadow-xl flex-col flex justify-between"
              style={{ backgroundColor: getPaperColor(message.color) }}
            >
              <div>
              {/* User Profile Section - Now Clickable */}
              <div
                className={`flex items-center justify-left h-auto ${
                  message.is_anonymous ? "opacity-100" : "cursor-pointer hover:opacity-80"
                }`}
                onClick={() => !message.is_anonymous && handleProfileClick(message.profiles)}
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
                  <h3 className="font-medium text-gray-900 text-base">
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
                      ? "ไม่ระบุปี"
                      : message.profiles?.year || "ไม่ระบุปี"}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="mt-4">
                <p className="text-blue-950 break-words font-medium">{message.content}</p>
              </div>
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

      {/* Profile Modal */}
      {isModalOpen && selectedProfile && (
        <ProfileModal 
          member={selectedProfile} 
          onClose={handleCloseModal}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  )
}

export default Page