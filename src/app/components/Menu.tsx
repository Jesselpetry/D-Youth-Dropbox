"use client";
import * as FaIcons from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

const navItems = [
  {
    icon: <BsFillGrid3X3GapFill size={32} />,
    label: "กำแพง",
    sublabel: "Walls",
    path: "",
  },
  {
    icon: <FaIcons.FaUsers size={32} />,
    label: "ครอบครัว",
    sublabel: "Family",
    path: "family",
  },
  {
    icon: <FaMessage size={32} />,
    label: "ข้อความ",
    sublabel: "Message",
    path: "message",
  },
];

export default function Menu() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true once the component is mounted on the client
    setMounted(true);
    
    const handleRedirect = async () => {
      await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user;
      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_name")
          .eq("id", currentUser.id)
          .single();

        if (!profile?.user_name && pathname !== "/setup-profile") {
          router.push("/setup-profile");
        }
      }
    };

    handleRedirect();
  }, [pathname, router]);

  if (
    pathname === "/login" ||
    pathname === "/setup-profile" ||
    pathname === "/auth"
  ) {
    return null;
  }

  const isProfileActive = pathname === "/profile";

  // Don't render user-dependent content until client-side hydration is complete
  const authButton = mounted ? (
    <Link
      href={user ? "/profile" : "/login"}
      className={`flex flex-col items-center transition-all duration-200 hover:scale-110 group ${
        !user ? "bg-white p-2 rounded-xl" : ""
      }`}
    >
      <div
        className={`text-sm flex flex-col items-center justify-center text-center   
        ${isProfileActive ? "drop-shadow-lg" : ""}
        ${user && !isProfileActive ? "opacity-50" : "opacity-100"} 
        ${user ? "text-white" : "text-green-900 font-medium"}
        transition-all duration-200 group-hover:opacity-100 group-hover:drop-shadow-md space-y-2`}
      >
        <div className={`drop-shadow-md`}>
          <FaIcons.FaUser size={32} />
        </div>
        <span
          className={`drop-shadow-sm ${isProfileActive ? "font-medium" : ""} ${
            !user ? "drop-shadow-none opacity-100" : ""
          }`}
        >
          {user ? "โปรไฟล์" : "เข้าสู่ระบบ"}
        </span>
      </div>
    </Link>
  ) : (
    // Show a placeholder during server-side rendering
    <div className="flex flex-col items-center">
      <div className="text-sm flex flex-col items-center justify-center text-center opacity-50 space-y-2">
        <div className="drop-shadow-md">
          <FaIcons.FaUser size={32} />
        </div>
        <span className="drop-shadow-sm invisible">Placeholder</span>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-5 left-0 right-0 w-full flex justify-center px-4 pb-2 z-10 max-w-screen mx-auto">
      <div className="w-full max-w-sm p-4 rounded-3xl bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light shadow-lg shadow-black/20">
        <div className="flex items-center justify-between w-full">
          {navItems.map((item, index) => {
            const isActive = pathname === `/${item.path}`;

            return (
              <Link
                key={index}
                href={`/${item.path}`}
                className="flex flex-col items-center transition-all duration-200 hover:scale-110 group"
              >
                <div
                  className={`text-sm flex flex-col items-center justify-center text-center ${
                    isActive ? "drop-shadow-lg opacity-100" : "opacity-50"
                  } transition-all duration-200 group-hover:opacity-100 group-hover:drop-shadow-md space-y-2`}
                >
                  <div className="drop-shadow-md">{item.icon}</div>
                  <span className={`drop-shadow-sm ${isActive ? "font-medium" : ""}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Authentication button with client-side only rendering */}
          {authButton}
        </div>
      </div>
    </div>
  );
}