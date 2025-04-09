"use client";
import React, { useState } from 'react';

function MessageSender() {
    // State variables
    const [message, setMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [paperColor, setPaperColor] = useState('#FFF69B'); // Default yellow color

    // Available paper colors
    const paperColors = [
        { value: '#FFF69B', name: 'เหลือง' }, // Yellow
        { value: '#FFD1DC', name: 'ชมพู' },   // Pink
        { value: '#B4F8C8', name: 'เขียว' },  // Green
        { value: '#A0E7E5', name: 'ฟ้า' },    // Blue
        { value: '#FFAEBC', name: 'แดง' },    // Red
    ];

    // Handle message input change
    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Limit to 160 characters
        if (e.target.value.length <= 160) {
            setMessage(e.target.value);
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (message.trim()) {
            // Here you would typically send the message to an API
            console.log('Sending message:', message);
            console.log('Anonymous mode:', isAnonymous);
            console.log('Paper color:', paperColor);
            // Clear the input after sending
            setMessage('');
        }
    };

    // Toggle anonymous mode
    const toggleAnonymousMode = () => {
        setIsAnonymous(!isAnonymous);
    };

    // Handle paper color change
    const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPaperColor(e.target.value);
    };

    // Calculate remaining characters
    const remainingChars = 160 - message.length;

    return (
        <div className="text-left my-6">
            <h1 className="text-3xl font-bold text-white">ส่งข้อความ</h1>
            <h2 className="text-xl font-light text-white mt-2 opacity-60">
                ถึง เพื่อน ๆ
            </h2>

            {/* Message Input Card */}
            <form onSubmit={handleSubmit} className="rounded-lg p-4 mt-6 relative" style={{ backgroundColor: paperColor }}>
                {/* User Profile Section - Hidden in Anonymous Mode */}
                <div className={`flex items-center justify-left h-auto ${isAnonymous ? 'opacity-50' : ''}`}>
                    {/* Profile Image */}
                    <div className="w-18 h-18 rounded-full overflow-hidden bg-gray-500">
                        <img
                            src={isAnonymous ? "/anonymous-avatar.png" : "profile-image-url"} // Replace with actual URLs
                            alt={isAnonymous ? "Anonymous" : "Profile"}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* User Info */}
                    <div className="ml-4">
                        <h3 className="font-medium text-gray-900 text-lg">
                            {isAnonymous ? "ไม่ระบุตัวตน" : "เจส"}
                        </h3>
                        <p className="text-xs font-light text-gray-900 mb-1">
                            {isAnonymous ? "---" : "หนองคาย"}
                        </p>
                        <span className="bg-gray-900 text-white text-xs px-4 py-1 rounded-lg">
                            {isAnonymous ? "---" : "ปี 68"}
                        </span>
                    </div>
                </div>

                {/* Message Input */}
                <div className="mt-4">
                    <textarea
                        value={message}
                        onChange={handleMessageChange}
                        placeholder="พิมพ์ข้อความของคุณที่นี่..."
                        className="w-full p-2 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        rows={7}
                    ></textarea>
                </div>

                {/* Features Section - Below Message Input */}
                <div className="">
                    {/* Feature Controls in Row */}
                    <div className="flex flex-wrap justify-between items-center">
                        {/* Character Limit - Left Side */}
                        <p className="text-gray-600 font-light text-xs">
                            {remainingChars} ตัวอักษรที่เหลือ (ไม่เกิน 160 ตัวอักษร)
                        </p>
                    </div>
                </div>

                {/* Send Button */}
                <button
                    type="submit"
                    className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-md"
                    disabled={!message.trim()}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className={`w-6 h-6 ${message.trim() ? 'text-yellow-500' : 'text-gray-400'}`}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                        />
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

export default MessageSender;