"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
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

      if (!error && profile?.user_name) {
        // มี user_name แล้ว → ไปหน้า home
        router.push("/");
      } else {
        // ยังไม่มี user_name → ไป setup profile
        router.push("/setup-profile");
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>กำลังเข้าสู่ระบบ...</p>
    </div>
  );
}
