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
        <div className="fixed bottom-5 left-0 right-0 w-full flex justify-center px-4 pb-2 z-10 max-w-screen-lg mx-auto">
            <div className="w-full max-w-xl p-5 rounded-3xl bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light">
                <div className="flex items-center justify-between w-full">
                    {navItems.map((item, index) => {
                        const isActive = pathname === `/${item.path}`;
                        
                        return (
                            <div key={index} className="flex flex-col items-center">
                                <Link href={`/${item.path}`} className='flex flex-col items-center justify-center'>
                                    <div className={`text-xl flex justify-center ${isActive ? '' : 'opacity-50'}`}>
                                        {item.icon}
                                    </div>
                                    <div className="mt-3 text-center">
                                        <div className={`text-l font-medium text-white ${isActive ? '' : 'opacity-50'} leading-none`}>
                                            {item.label}
                                        </div>
                                        <div className="text-xs font-light text-white opacity-60 mt-0.5">
                                            {item.sublabel}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}