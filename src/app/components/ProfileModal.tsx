import React from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { FaInstagramSquare } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";

interface FamilyMember {
  id: number;
  user_name: string;
  province: string;
  year: string;
  profile_img: string;
}

interface ProfileModalProps {
  member: FamilyMember | null;
  onClose: () => void;
  onSendMessage: (memberId: number) => void;
}

export default function ProfileModal({ member, onClose, onSendMessage }: ProfileModalProps) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-[90%] max-w-md bg-black/50 backdrop-blur-md border border-white/30 rounded-2xl p-6 z-10">
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 text-white/70 hover:text-white"
          onClick={onClose}
        >
          <FaTimes size={24} />
        </button>
        
        {/* Profile content */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/30 mb-4">
            <Image
              src={member.profile_img || "/person.png"}
              alt={member.user_name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/person.png";
              }}
            />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1">{member.user_name}</h2>
          <p className="text-white/70 mb-4">{member.province}</p>
          
          <div className="bg-white/10 rounded-lg px-4 py-2 mb-6">
            <span className="text-white">ยุวชนปี {member.year}</span>
          </div>

          <button 
            onClick={() => window.open(`https://www.instagram.com/${member.user_name}`, '_blank')}
            className="cursor-pointer mb-4 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <RiInstagramFill size={20} />
            <span>Instagram</span>
          </button>

          <button 
            onClick={() => window.location.href = `/message/${member.id}`}
            className="cursor-pointer w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <IoMdSend size={20} />
            <span>ส่งข้อความ</span>
          </button>

        </div>
      </div>
    </div>
  );
}