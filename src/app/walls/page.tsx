"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// Define interfaces for your data structures
interface Profile {
  id: number;
  user_name: string;
  profile_img: string | null;
  year: string | null;
  province: string | null;
  isAnonymous?: boolean; // Add isAnonymous as an optional property to the Profile interface
}

interface Wall {
  id: number;
  content: string;
  created_at: string;
  sender_id: number;
  color: string | null;
  profiles: Profile | Profile[];  // Updated to accept either a single Profile or an array
  isAnonymous?: boolean;
}

const Page = () => {
  const router = useRouter();
  const [walls, setWalls] = useState<Wall[]>([]); // Using Wall interface instead of any
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the paper color from the wall.color field in the database
  const getPaperColor = (wallColor: string | null) => {
    // Default color if the color is not available
    return wallColor || '#f5f5f5';
  }
  
  useEffect(() => {
    const fetchWalls = async () => {
      try {
        // ดึงข้อมูลทั้งหมดจากตาราง walls โดยการ JOIN กับ profiles เพื่อดึงชื่อผู้ส่งและรูปโปรไฟล์
        const { data, error } = await supabase
          .from('walls')
          .select('id, content, created_at, sender_id, color, profiles(id, user_name, profile_img, year, province)')  // Added id to profiles
          .order('created_at', { ascending: false }); // Sort by `created_at` in descending order (newest first)

        if (error) throw error;

        // Transform the data to ensure profiles is handled correctly
        const transformedData = data?.map(wall => ({
          ...wall,
          profiles: Array.isArray(wall.profiles) && wall.profiles.length > 0 ? wall.profiles[0] : wall.profiles
        })) || [];

        setWalls(transformedData);
      } catch (err: unknown) { // Using unknown instead of any
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
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

  const handleProfileClick = (profile: Profile) => { // Using Profile interface
    if (!profile || profile.isAnonymous) return; // Now isAnonymous is part of the Profile interface
    
    // Redirect to the profile page instead of opening a modal
    router.push(`/profile/${profile.id}`);
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
                onClick={() => !wall.isAnonymous && handleProfileClick(wall.profiles as Profile)}
              >
                {/* Profile Image */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-500">
                  <img
                    src={
                      wall.isAnonymous
                        ? "https://i.ibb.co/4nzNv3vx/anonymous-avatar.png"
                        : (wall.profiles as Profile)?.profile_img || "https://i.ibb.co/4nzNv3vx/anonymous-avatar.png"
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
                      : (wall.profiles as Profile)?.user_name || "ไม่ระบุตัวตน"}
                  </h3>
                  <p className="text-xs font-light text-gray-900 mb-1">
                    {wall.isAnonymous
                      ? "ไม่ระบุจังหวัด"
                      : (wall.profiles as Profile)?.province || "ไม่ระบุจังหวัด"}
                  </p>
                  <span className="bg-gray-900 text-white text-xs px-4 py-1 rounded-lg">
                    {wall.isAnonymous
                      ? "---"
                      : (wall.profiles as Profile)?.year || "ไม่ระบุปี"}
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
    </div>
  );
};

export default Page;