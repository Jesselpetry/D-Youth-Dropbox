// components/Menu.tsx
import * as FaIcons from 'react-icons/fa'
import { FaMessage } from "react-icons/fa6";
import { BsFillGrid3X3GapFill } from "react-icons/bs";

const navItems = [
    {
        icon: <FaIcons.FaUsers size={42} />,
        label: 'ครอบครัว',
        sublabel: 'Family',
    },
    {
        icon: <FaMessage size={41} />,
        label: 'ข้อความ',
        sublabel: 'Message',
    },
    {
        icon: <BsFillGrid3X3GapFill size={42} />,
        label: 'กำแพง',
        sublabel: 'Walls',
    },
    {
        icon: <FaIcons.FaUser size={42} />,
        label: 'โปรไฟล์',
        sublabel: 'Profile',
    },
]

export default function Menu() {
    return (
        <div className="fixed bottom-5 left-0 right-0 w-full flex justify-center px-4 pb-2 z-10 max-w-screen-lg mx-auto">
            <div className="w-full max-w-xl p-5 rounded-3xl bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light">
                <div className="flex items-center justify-between w-full space-between 50%">
                    {navItems.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <div className="text-xl"> {item.icon}</div>
                            <div className="text-l font-medium text-white mt-2 opacity-100">{item.label}</div>
                            <div className="text-xs font-light text-white mt-1 opacity-60">{item.sublabel}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
