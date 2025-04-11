import React, { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Make sure this path is correct

// Define interfaces for type safety
interface Profile {
  id: number;
  user_name: string;
  profile_img: string;
  year?: string;
  province?: string;
  isAnonymous?: boolean;
}

interface Wall {
  id: number;
  content: string;
  created_at: string;
  sender_id: number;
  color: string | null;
  is_anonymous?: boolean;
  profiles: Profile | Profile[];
  isAnonymous?: boolean;
}

interface PaperWallProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonAction?: () => void;
  showButton?: boolean;
  customFilter?: (wall: Wall) => boolean;
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

// Wall Paper component that displays an individual wall post
const WallPaper: React.FC<{
  wall: Wall;
  color: string;
  onProfileClick: (profile: Profile) => void;
}> = ({ wall, color, onProfileClick }) => {
  // Safely handle profiles property
  const isAnonymous = wall.isAnonymous || wall.is_anonymous || false;
  
  // Safe access to profiles
  const profile = !isAnonymous && wall.profiles ? 
    (Array.isArray(wall.profiles) && wall.profiles.length > 0 ? wall.profiles[0] : wall.profiles) 
    : null;
  
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
          onClick={() => !isAnonymous && profile && onProfileClick(Array.isArray(profile) ? profile[0] : profile)}
        >
          {/* Profile Image */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-500">
            <img
              src={
                isAnonymous
                  ? "https://i.ibb.co/4nzNv3vx/anonymous-avatar.png"
                  : (profile?.profile_img || "https://i.ibb.co/4nzNv3vx/anonymous-avatar.png")
              }
              alt={isAnonymous ? "Anonymous" : "Profile"}
              className="w-full h-full object-cover"
            />
          </div>

          {/* User Info */}
          <div className="ml-4">
            <h3 className="font-medium text-gray-900 text-base">
              {isAnonymous ? "ไม่ระบุตัวตน" : (profile?.user_name || "ไม่ระบุตัวตน")}
            </h3>
            <p className="text-xs font-light text-gray-900 mb-1">
              {isAnonymous ? "ไม่ระบุจังหวัด" : (profile?.province || "ไม่ระบุจังหวัด")}
            </p>
            <span className="bg-gray-900 text-white text-xs px-4 py-1 rounded-lg">
              {isAnonymous ? "---" : (profile?.year || "ไม่ระบุปี")}
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
          {wall.created_at ? getTimeElapsed(wall.created_at) : "No date available"}
        </span>
      </div>
    </div>
  );
};

// Main PaperWall component that fetches and displays wall posts
const PaperWall: React.FC<PaperWallProps> = ({
  title,
  subtitle,
  buttonText = 'เขียนข้อความ',
  buttonAction,
  showButton = true,
  customFilter,
  headerRight,
  currentDate = "2025-04-11 11:33:04", // Your specified current date
}) => {
  const router = useRouter();
  const [walls, setWalls] = useState<Wall[]>([]);
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
        // Fetch data from walls table with JOIN to profiles
        const { data, error } = await supabase
          .from('walls')
          .select(`
            id, 
            content, 
            created_at, 
            sender_id, 
            color, 
            is_anonymous,
            profiles:sender_id (id, user_name, profile_img, year, province)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data with better error handling
        let transformedData = data?.map(wall => {
          const isAnonymous = wall.is_anonymous || false;
          
          // If anonymous or no profiles, provide default/empty values
          let profileData = null;
          
          if (!isAnonymous && wall.profiles) {
            // Handle both array and single object cases
            profileData = Array.isArray(wall.profiles) ? 
              (wall.profiles.length > 0 ? wall.profiles[0] : null) : 
              wall.profiles;
          }
          
          return {
            ...wall,
            isAnonymous,
            profiles: profileData,
          };
        }) || [];

        // Apply custom filter if provided
        if (customFilter) {
          transformedData = transformedData.filter(customFilter);
        }

        setWalls(transformedData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error fetching walls:", err.message);
        } else {
          setError("An unknown error occurred");
          console.error("Unknown error fetching walls:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWalls();
  }, [customFilter]);

  const handleProfileClick = (profile: Profile) => {
    if (!profile) return;
    router.push(`/profile/${profile.id}`);
  };

  const handleDefaultButtonAction = () => {
    router.push('/walls/send');
  };

  if (loading) return <div className="text-center py-8 text-white">กำลังโหลด...</div>;
  if (error) return <div className="text-center py-8 text-white text-red-500">{error}</div>;

  return (
    <div className="text-left my-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && (
            <h2 className="text-xl font-light text-white mt-2 opacity-60">
              {subtitle}
            </h2>
          )}
          {currentDate && (
            <div className="text-sm text-white mt-1 opacity-75">{currentDate}</div>
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
                <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
              </svg>
              {buttonText}
            </button>
          )
        )}
      </div>

      {walls.length === 0 ? (
        <p className="text-white mt-6">ยังไม่มีข้อความ</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {walls.map((wall) => (
            <WallPaper
              key={wall.id}
              wall={wall}
              color={getPaperColor(wall.color)}
              onProfileClick={handleProfileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaperWall;