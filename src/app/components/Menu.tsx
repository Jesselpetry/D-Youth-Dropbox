// components/Menu.tsx
'use client'
import * as FaIcons from 'react-icons/fa'
import { FaMessage } from "react-icons/fa6";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { use } from 'react';

const navItems = [
    {
        icon: <FaIcons.FaUsers size={32} />,
        label: 'ครอบครัว',
        sublabel: 'Family',
        path: 'family',
    },
    {
        icon: <FaMessage size={32} />,
        label: 'ข้อความ',
        sublabel: 'Message',
        path: 'message',
    },
    {
        icon: <BsFillGrid3X3GapFill size={32} />,
        label: 'กำแพง',
        sublabel: 'Walls',
        path: 'walls',
    },
    {
        icon: <FaIcons.FaUser size={32} />,
        label: 'โปรไฟล์',
        sublabel: 'Profile',
        path: 'profile',
    },
]

export default function Menu() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const handleRedirect = async () => {
          const { data: sessionData } = await supabase.auth.getSession();
          const { data: userData } = await supabase.auth.getUser();
    
          const user = userData?.user;
          if (!user) return;
    
          // ดึงข้อมูลจาก table profiles (หรือชื่อที่คุณใช้จริง)
          const { data: profile, error } = await supabase
            .from("profiles") // 👈 เปลี่ยนถ้า table ไม่ชื่อ profiles
            .select("user_name")
            .eq("id", user.id)
            .single();
    
          if (user && !profile?.user_name) {
            router.push("/setup-profile");
          } 
        };
    
        handleRedirect();
      }, [router]);
 
    // ถ้า path เป็น /profile ให้ไม่ render เมนูเลย
    if ((pathname === '/login') || (pathname === '/setup-profile') || (pathname === '/auth')) {
        return null;
    }
    
    return (
        <div className="fixed bottom-5 left-0 right-0 w-full flex justify-center px-4 pb-2 z-10 max-w-screen mx-auto">
            <div className="w-full max-w-sm p-5 rounded-3xl bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light shadow-lg shadow-black/20">
            <div className="flex items-center justify-between w-full">
                {navItems.map((item, index) => {
                const isActive = pathname === `/${item.path}`;
                
                return (
                    <Link 
                        key={index} 
                        href={`/${item.path}`} 
                        className='flex flex-col items-center transition-all duration-200 hover:scale-110 group'
                    >
                        <div className={`text-sm flex flex-col items-center justify-center text-center ${isActive ? 'drop-shadow-lg' : 'opacity-50'} transition-all duration-200 group-hover:opacity-100 group-hover:drop-shadow-md space-y-2`}>
                            <div className="drop-shadow-md">
                                {item.icon}
                            </div>
                            <span className="drop-shadow-sm">{item.label}</span>
                        </div>
                    </Link>
                );
                })}
            </div>
            </div>
        </div>
    )
}