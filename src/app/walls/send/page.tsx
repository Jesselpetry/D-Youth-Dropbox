"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SendToWall() {
  // State variables
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paperColor, setPaperColor] = useState('#FFF69B'); // Default yellow color
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sender, setSender] = useState<{
    user_name?: string;
    profile_img?: string;
    year?: string;
    province?: string;
  }>({});

  // Available paper colors
  const paperColors = [
    { value: '#FFF69B', name: 'เหลือง' }, // Yellow
    { value: '#FFD1DC', name: 'ชมพู' },   // Pink
    { value: '#B4F8C8', name: 'เขียว' },  // Green
  ];

  // Fetch current user (sender) details
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('user_name, profile_img, year, province')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;

          setSender(data || {});
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    }

    fetchCurrentUser();
  }, []);

  // Handle message input change
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Limit to 160 characters
    if (e.target.value.length <= 160) {
      setMessage(e.target.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        setLoading(true);
        setError(null); // Reset error state
  
        // Get current user ID
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw new Error('Unable to retrieve user session.');
        }
  
        const senderId = session?.user?.id;
        if (!senderId && !isAnonymous) {
          setError('กรุณาล็อกอินเพื่อส่งข้อความ');
          return;
        }

        let submitError;

        // Insert message into the database
        if (!isAnonymous) {
          const { error } = await supabase
            .from('walls')
            .insert({
              sender_id: senderId,
              content: message,
              is_anonymous: isAnonymous,
              color: paperColor,
            });
          submitError = error;
        } else {
          const { error } = await supabase
            .from('walls')
            .insert({
              sender_id: null,
              content: message,
              is_anonymous: isAnonymous,
              color: paperColor,
            });
          submitError = error;
        }

        if (submitError) {
          console.error('Supabase error details:', submitError);
          throw submitError;
        } 
        
        // Redirect to /walls and then show success alert
        window.location.href = '/walls';
        setTimeout(() => alert('ส่งข้อความสำเร็จ!'), 100); // Show success alert after redirection
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถส่งข้อความได้ โปรดลองอีกครั้ง';
        console.error('Error sending message:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Toggle anonymous mode
  const toggleAnonymousMode = () => {
    setIsAnonymous(!isAnonymous);
  };

  const handleBack = () => {
    // Redirect to the send message page
    window.location.href = '/walls';
  };

  // Calculate remaining characters
  const remainingChars = 160 - message.length;

  if (loading) return <div className="text-center py-10">กำลังโหลด...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="text-left my-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">กำแพง</h1>
          <h2 className="text-xl font-light text-white mt-2 opacity-60">Walls</h2>
        </div>
        <button
          onClick={handleBack}
          className="bg-white text-left text-green-900 font-medium py-2 px-4 rounded-lg flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            className="h-4 w-4 mr-2 fill-current"
          >
            <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
          </svg>
          กลับ
        </button>
      </div>

      {/* Message Input Card */}
      <form onSubmit={handleSubmit} className="rounded-lg p-4 mt-6 relative" style={{ backgroundColor: paperColor }}>
        {/* User Profile Section - Hidden in Anonymous Mode */}
        <div className={`flex items-center justify-left h-auto ${isAnonymous ? 'opacity-50' : ''}`}>
          {/* Profile Image */}
          <div className="w-18 h-18 rounded-full overflow-hidden bg-gray-500">
            <img
              src={isAnonymous ? "/anonymous-avatar.png" : sender?.profile_img || "/person.png"}
              alt={isAnonymous ? "Anonymous" : "Profile"}
              className="w-full h-full object-cover"
            />
          </div>

          {/* User Info */}
          <div className="ml-4">
            <h3 className="font-medium text-gray-900 text-lg">
              {isAnonymous ? "ไม่ระบุตัวตน" : sender?.user_name || "คุณ"}
            </h3>
            <p className="text-xs font-light text-gray-900 mb-1">
              {isAnonymous ? "ไม่ระบุจังหวัด" : sender?.province || "ไม่ระบุจังหวัด"}
            </p>
            <span className="bg-gray-900 text-white text-xs px-4 py-1 rounded-lg">
              {isAnonymous ? "---" : sender?.year || "ไม่ระบุปี"}
            </span>
          </div>
        </div>

        {/* Message Input */}
        <div className="mt-4">
          <textarea
            value={message}
            onChange={handleMessageChange}
            placeholder={`พิมพ์ข้อความถึงวอลล์ (สูงสุด 160 ตัวอักษร)`}
            className="w-full p-2 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            rows={7}
          ></textarea>
        </div>

        {/* Features Section */}
        <div className="">
          <div className="flex flex-wrap justify-between items-center">
            <p className="text-gray-600 font-light text-xs">
              {remainingChars} ตัวอักษรที่เหลือ (ไม่เกิน 160 ตัวอักษร)
            </p>
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-md"
          disabled={!message.trim() || loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            fill="currentColor"
            className={`w-6 h-6 ${message.trim() && !loading ? '' : 'text-gray-400'}`}
            style={{ color: message.trim() && !loading ? paperColor : undefined }}
          >
            <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
          </svg>
        </button>
      </form>

      {/* Anonymous Mode Toggle */}
      <div className="flex items-center justify-between mt-4">
        <label htmlFor="anonymousMode" className="text-lg text-white mr-3">
          ไม่ระบุตัวตน
        </label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="anonymousMode"
            type="checkbox"
            checked={isAnonymous}
            onChange={toggleAnonymousMode}
            className="sr-only peer"
          />
          <div
            className={`w-12 h-6 rounded-full transition-colors ${isAnonymous ? 'bg-yellow-400' : 'bg-gray-500'}`}
            style={{ backgroundColor: isAnonymous ? paperColor : '#6B7280' }}
          ></div>
          <div className="absolute top-[2px] left-[2px] h-5 w-5 bg-white border border-gray-300 rounded-full transition-transform peer-checked:translate-x-6"></div>
        </label>
      </div>

      {/* Paper Color Selection */}
      <div className="flex mt-4 items-center justify-between">
        <label className="text-white text-lg mr-2">
          สีกระดาษ
        </label>
        <div className="flex space-x-2 justify-right">
          {paperColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setPaperColor(color.value)}
              className={`w-6 h-6 rounded border ${paperColor === color.value ? 'border-white ring-2 ring-white' : 'border-gray-300'}`}
              style={{ backgroundColor: color.value }}
              title={color.name}
              aria-label={`เลือกสีกระดาษ${color.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}