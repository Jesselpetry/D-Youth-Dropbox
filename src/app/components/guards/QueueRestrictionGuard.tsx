"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

interface QueueRestrictionGuardProps {
  children: React.ReactNode;
}

export default function QueueRestrictionGuard({
  children,
}: QueueRestrictionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  // Pages that should not be restricted by queue
  const allowedPaths = [
    "/login",
    "/setup-profile",
    "/auth",
    "/queue",
    "/profile",
    "/staff",
  ];

  useEffect(() => {
    checkQueueStatus();
  }, [pathname]);

  const checkQueueStatus = async () => {
    try {
      // Skip check for allowed paths
      if (allowedPaths.some((path) => pathname.startsWith(path))) {
        setChecking(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setChecking(false);
        return;
      }

      // Check if user is staff/admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "staff" || profile?.role === "admin") {
        setChecking(false);
        return;
      }

      // Check if user has pending orders in queue
      const { data: queueEntries } = await supabase
        .from("queue")
        .select("*, photo_orders(*)")
        .eq("customer_id", user.id)
        .in("status", ["waiting", "processing"]);

      if (queueEntries && queueEntries.length > 0) {
        // User has pending orders, redirect to queue page
        router.push("/queue");
        return;
      }

      setChecking(false);
    } catch (error) {
      console.error("Error checking queue status:", error);
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">กำลังตรวจสอบ...</div>
      </div>
    );
  }

  return <>{children}</>;
}
