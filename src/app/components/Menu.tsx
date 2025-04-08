// components/Menu.tsx
'use client'
import * as FaIcons from 'react-icons/fa'
import { FaMessage } from "react-icons/fa6";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    
    return (
        <div className="fixed bottom-5 left-0 right-0 w-full flex justify-center px-4 pb-2 z-10 max-w-screen mx-auto">
            <div className="w-full max-w-xl p-5 rounded-3xl bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light shadow-lg shadow-black/20">
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