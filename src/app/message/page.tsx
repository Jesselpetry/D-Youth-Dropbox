'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Make sure this path is correct
import PaperWall from '@/app/components/PaperWall';

const MessagesPage = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current date and username as specified
  const currentDate = "2025-04-11 11:38:32";

  useEffect(() => {
    // Get the current user ID on component mount
    const fetchCurrentUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error('Failed to get user session');
        }
        
        if (session?.user) {
          setUserId(session.user.id);
        } else {
          // If no user is logged in, redirect to login page
          router.push('/login');
        }
      } catch (err) {
        console.error('Error getting user:', err);
        setError(err instanceof Error ? err.message : 'An error occurred fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [router]);

  // Custom filter for messages - only show messages where the current user is sender or recipient
  const messageFilter = (wall: any) => {
    if (!userId) return false;
    
    // For messages, we filter by both sender and recipient
    return wall.sender_id === userId || wall.recipient_id === userId;
  };

  // Handle click on "New Message" button
  const handleNewMessage = () => {
    router.push('/family');
  };

  // Custom header for the messages page
  const messageHeader = (
    <div className="flex space-x-4">
      <button
        onClick={handleNewMessage}
        className="bg-white text-green-900 font-medium py-2 px-4 rounded-lg flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="h-4 w-4 mr-2 fill-current"
        >
          <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
        </svg>
        ส่งข้อความใหม่
      </button>
      
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-xl">กำลังโหลด...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <PaperWall
      title="ข้อความ"
      subtitle="Messages"
      showButton={false} // We use custom header instead
      headerRight={messageHeader}
      currentDate={currentDate}
      customFilter={messageFilter}
    />
  );
};

export default MessagesPage;