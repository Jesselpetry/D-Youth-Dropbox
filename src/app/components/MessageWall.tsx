'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import React, { ReactNode } from 'react';
import ProfileModal from "./ProfileModal";

// Interfaces for TypeScript typing
interface Profile {
  id?: string;
  user_name?: string;
  profile_img?: string;
  year?: string;
  province?: string;
  isAnonymous?: boolean;
}

interface Message {
  id: number;
  content: string;
  created_at: string;
  sender_id: string | null;
  receiver_id: string;
  color: string | null;
  is_anonymous?: boolean;
  sender: Profile | null;
  receiver: Profile | null;
}

interface MessageWallProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonAction?: () => void;
  showButton?: boolean;
  customFilter?: (message: Message) => boolean;
  headerRight?: ReactNode;
  currentDate?: string;
}

// Helper function to get time elapsed since a date
const getTimeElapsed = (dateString: string): string => {
  try {
    const now = new Date();
    const past = new Date(dateString);
    
    // Calculate the difference in milliseconds
    const diff = now.getTime() - past.getTime();
    
    // Convert to seconds, minutes, hours, days
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    // Return appropriate string based on the time difference
    if (days > 30) {
      return new Date(dateString).toLocaleDateString(); // Return the full date for older posts
    } else if (days >= 1) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (hours >= 1) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (minutes >= 1) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    console.error('Error calculating time elapsed:', error);
    return dateString; // Return the original string if there's an error
  }
};

// Message Paper component that displays an individual message
const MessagePaper: React.FC<{
  message: Message;
  color: string;
  onProfileClick: (profile: Profile) => void;
}> = ({ message, color, onProfileClick }) => {
  // Check if message is anonymous
  const isAnonymous = message.is_anonymous || false;
  
  // Sender profile info
  const sender = !isAnonymous && message.sender ? message.sender : null;
  
  return (
    <div
      className="rounded-lg p-4 h-full shadow-xl flex-col flex justify-between"
      style={{ backgroundColor: color }}
    >
      <div>
        {/* User Profile Section - Now Clickable */}
        <div
          className={`flex items-center justify-left h-auto ${
            isAnonymous ? "opacity-50" : "cursor-pointer hover:opacity-80"
          }`}
          onClick={() => !isAnonymous && sender && onProfileClick(sender)}
        >
          {/* Profile Image */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-500">
            <img
              src={
                isAnonymous
                  ? "https://i.ibb.co/4nzNv3vx/anonymous-avatar.png"
                  : (sender?.profile_img || "https://i.ibb.co/4nzNv3vx/anonymous-avatar.png")
              }
              alt={isAnonymous ? "Anonymous" : "Profile"}
              className="w-full h-full object-cover"
            />
          </div>

          {/* User Info */}
          <div className="ml-4">
            <h3 className="font-medium text-gray-900 text-base">
              {isAnonymous ? "ไม่ระบุตัวตน" : (sender?.user_name || "ไม่ระบุตัวตน")}
            </h3>
            <p className="text-xs font-light text-gray-900 mb-1">
              {isAnonymous ? "ไม่ระบุจังหวัด" : (sender?.province || "ไม่ระบุจังหวัด")}
            </p>
            <span className="bg-gray-900 text-white text-xs px-4 py-1 rounded-lg">
              {isAnonymous ? "---" : (sender?.year || "ไม่ระบุปี")}
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
          {message.created_at ? getTimeElapsed(message.created_at) : "No date available"}
        </span>
      </div>
    </div>
  );
};

// Main MessageWall component that fetches and displays messages
const MessageWall: React.FC<MessageWallProps> = ({
  title,
  subtitle,
  buttonText = 'เขียนข้อความ',
  buttonAction,
  showButton = true,
  customFilter,
  headerRight,
}) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Get the paper color from the message.color field in the database
  const getPaperColor = (messageColor: string | null) => {
    // Default color if the color is not available
    return messageColor || '#f5f5f5';
  }

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login')
      }
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId) return;
      
      try {
        // Fetch messages where current user is the receiver
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id, 
            content, 
            created_at, 
            sender_id, 
            receiver_id,
            color, 
            is_anonymous,
            sender:sender_id (id, user_name, profile_img, year, province),
            receiver:receiver_id (id, user_name, profile_img, year, province)
          `)
          .eq('receiver_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data with better error handling
        let transformedData = data?.map(message => {
          return {
            ...message,
            sender: Array.isArray(message.sender) ? message.sender[0] : message.sender || null,
            receiver: Array.isArray(message.receiver) ? message.receiver[0] : message.receiver || null
          };
        }) || [];

        // Apply custom filter if provided
        if (customFilter) {
          transformedData = transformedData.filter(customFilter);
        }

        setMessages(transformedData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error fetching messages:", err.message);
        } else {
          setError("An unknown error occurred");
          console.error("Unknown error fetching messages:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMessages();
    }
  }, [userId, customFilter]);

  const handleProfileClick = (profile: Profile) => {
    if (!profile || !profile.id) return;
    // Instead of router.push, set the selected profile
    setSelectedProfile(profile);
  };

  const handleDefaultButtonAction = () => {
    router.push('/family');
  };
  
  if (loading) return <div className="text-center py-8 text-white">กำลังโหลด...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="text-left my-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-medium text-white">{title}</h1>
          {subtitle && (
            <h2 className="text-xl font-light text-white mt-2 opacity-60">
              {subtitle}
            </h2>
          )}
        </div>
        
        {headerRight || (
          showButton && (
            <button
              onClick={buttonAction || handleDefaultButtonAction}
              className="bg-white text-left text-green-900 font-medium py-2 px-4 rounded-lg flex items-center cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                className="h-4 w-4 mr-2 fill-current"
              >
                <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192v144c0 17.7 14.3 32 32 32s32-14.3 32-32V288h144c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
              </svg>
              {buttonText}
            </button>
          )
        )}
      </div>

      {/* Messages Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {messages.length === 0 ? (
          <div className="text-white col-span-full text-center py-8">
            ไม่พบข้อความ
          </div>
        ) : (
          messages.map((message) => (
            <MessagePaper
              key={message.id}
              message={message}
              color={getPaperColor(message.color)}
              onProfileClick={handleProfileClick}
            />
          ))
        )}
      </div>
      
      {/* Add the ProfileModal component here */}
      {selectedProfile && (
        <ProfileModal 
          member={{
            id: parseInt(selectedProfile.id || "0"),
            user_name: selectedProfile.user_name || "",
            province: selectedProfile.province || "",
            year: selectedProfile.year || "",
            profile_img: selectedProfile.profile_img || ""
          }}
          onClose={() => setSelectedProfile(null)}
          onSendMessage={(id) => router.push(`/message/${id}`)}
        />
      )}
    </div>
  );
};

export default MessageWall;