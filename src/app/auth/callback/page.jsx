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

      // Get profile data
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("user_name")
        .eq("id", user.id)
        .single();

      if (!error && profile?.user_name) {
        // Use the router's push method which will respect the deployment environment
        router.push("/");
      } else {
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