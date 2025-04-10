"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProfileModal from "@/app/components/ProfileModal"; // Adjust the import path as needed
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [walls, setWalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get the paper color from the wall.color field in the database
  const getPaperColor = (wallColor: string | null) => {
    // Default color if the color is not available
    return wallColor || '#f5f5f5';
  }
  
  useEffect(() => {
    const fetchWalls = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      try {
        // ดึงข้อมูลทั้งหมดจากตาราง walls โดยการ JOIN กับ profiles เพื่อดึงชื่อผู้ส่งและรูปโปรไฟล์
        const { data, error } = await supabase
          .from('walls')
          .select('id, content, created_at, sender_id, color, profiles(id, user_name, profile_img, year, province)')  // Added id to profiles
          .order('created_at', { ascending: false }); // Sort by `created_at` in descending order (newest first)

        if (error) throw error;

        setWalls(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWalls();
  }, []);

  const handleAddMessage = () => {
    // Redirect to the send message page
    router.push('/walls/send')
  };

  const handleProfileClick = (profile: any) => {
    if (!profile || profile.isAnonymous) return; // Don't open modal for anonymous profiles
    
    // Convert profile data to the format expected by the ProfileModal
    const familyMember = {
      id: profile.id,
      user_name: profile.user_name,
      province: profile.province,
      year: profile.year,
      profile_img: profile.profile_img
    };
    
    setSelectedProfile(familyMember);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProfile(null);
  };
  
  const handleSendMessage = (memberId: number) => {
    window.location.href = `/message/${memberId}`;
  };

  if (loading) return <div>กำลังโหลด...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="text-left my-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">กำแพง</h1>
          <h2 className="text-xl font-light text-white mt-2 opacity-60">
            Walls
          </h2>
        </div>
        <button
          onClick={handleAddMessage}
          className="bg-white text-left text-green-900 font-medium py-2 px-4 rounded-lg flex items-center cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            className="h-4 w-4 mr-2 fill-current"
          >
            <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />
          </svg>
          ข้อความ
        </button>
      </div>

      {walls.length === 0 ? (
        <p className="text-white mt-6">ยังไม่มีข้อความ</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {walls.map((wall) => (
            <div
              key={wall.id}
              className="rounded-lg p-4 h-full shadow-xl flex-col flex justify-between"
              style={{ backgroundColor: getPaperColor(wall.color) }}
            >
              <div>
              {/* User Profile Section - Now Clickable */}
              <div
                className={`flex items-center justify-left h-auto ${
                  wall.isAnonymous ? "opacity-50" : "cursor-pointer hover:opacity-80"
                }`}
                onClick={() => !wall.isAnonymous && handleProfileClick(wall.profiles)}
              >
                {/* Profile Image */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-500">
                  <img
                    src={
                      wall.isAnonymous
                        ? "https://i.ibb.co/4nzNv3vx/anonymous-avatar.png"
                        : wall.profiles?.profile_img || "https://i.ibb.co/4nzNv3vx/anonymous-avatar.png"
                    }
                    alt={wall.isAnonymous ? "Anonymous" : "Profile"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* User Info */}
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 text-base">
                    {wall.isAnonymous
                      ? "ไม่ระบุตัวตน"
                      : wall.profiles?.user_name || "ไม่ระบุตัวตน"}
                  </h3>
                  <p className="text-xs font-light text-gray-900 mb-1">
                    {wall.isAnonymous
                      ? "ไม่ระบุจังหวัด"
                      : wall.profiles?.province || "ไม่ระบุจังหวัด"}
                  </p>
                  <span className="bg-gray-900 text-white text-xs px-4 py-1 rounded-lg">
                    {wall.isAnonymous
                      ? "---"
                      : wall.profiles?.year || "ไม่ระบุปี"}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="mt-4">
                <p className="text-blue-950 break-words font-medium">{wall.content}</p>
              </div>
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

      {/* Profile Modal */}
      {isModalOpen && selectedProfile && (
        <ProfileModal 
          member={selectedProfile} 
          onClose={handleCloseModal}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};

export default Page;