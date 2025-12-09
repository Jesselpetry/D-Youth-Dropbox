"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { PhotoOrder } from "@/types";

interface QueueEntryWithOrder {
  id: number;
  customer_id: number;
  order_id: number;
  position: number;
  status: string;
  created_at: string;
  photo_orders: PhotoOrder;
}

export default function QueuePage() {
  const router = useRouter();
  const [queueEntry, setQueueEntry] = useState<QueueEntryWithOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchQueueStatus();
    
    // Subscribe to queue updates
    const channel = supabase
      .channel("queue-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue",
        },
        () => {
          fetchQueueStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("queue")
        .select("*, photo_orders(*)")
        .eq("customer_id", user.id)
        .in("status", ["waiting", "processing"])
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching queue:", error);
      }

      setQueueEntry(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">กำลังโหลด...</div>
      </div>
    );
  }

  if (!queueEntry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">คิวของคุณ</h1>
          <p className="text-white/70 mb-6">
            คุณไม่มีคำสั่งซื้อที่รอดำเนินการในขณะนี้
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  const order = queueEntry.photo_orders;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            คิวของคุณ
          </h1>

          <div className="bg-green-600/20 border border-green-400 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-6xl font-bold text-white mb-2">
                {queueEntry.position}
              </div>
              <p className="text-white/70">ลำดับของคุณในคิว</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">สถานะคำสั่งซื้อ</h3>
              <p className="text-white/70 capitalize">
                {order.status === "pending" && "รอดำเนินการ"}
                {order.status === "uploading" && "กำลังอัปโหลดรูปภาพ"}
                {order.status === "payment_pending" && "รอการชำระเงิน"}
                {order.status === "completed" && "เสร็จสมบูรณ์"}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">ข้อมูลคำสั่งซื้อ</h3>
              <div className="space-y-2 text-white/70">
                <p>
                  <span className="font-medium">ชื่อ:</span> {order.customer_name}
                </p>
                <p>
                  <span className="font-medium">อีเมล:</span>{" "}
                  {order.customer_email}
                </p>
                <p>
                  <span className="font-medium">วันที่สั่ง:</span>{" "}
                  {new Date(order.created_at).toLocaleString("th-TH")}
                </p>
              </div>
            </div>

            {order.google_drive_link && (
              <div className="bg-blue-600/20 border border-blue-400 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">
                  ลิงก์ดาวน์โหลดรูปภาพ
                </h3>
                <a
                  href={order.google_drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline break-all"
                >
                  {order.google_drive_link}
                </a>
              </div>
            )}

            {order.payment_confirmed && (
              <div className="bg-green-600/20 border border-green-400 rounded-lg p-4">
                <p className="text-white text-center">
                  ✓ การชำระเงินได้รับการยืนยันแล้ว
                </p>
                <p className="text-white/70 text-center text-sm mt-2">
                  คุณจะถูกนำออกจากคิวโดยอัตโนมัติ
                </p>
              </div>
            )}

            <div className="bg-yellow-600/20 border border-yellow-400 rounded-lg p-4">
              <p className="text-white/90 text-sm">
                💡 คุณจะอยู่ในคิวจนกว่าเจ้าหน้าที่จะยืนยันการชำระเงินของคุณ
                กรุณารอสักครู่
              </p>
            </div>
          </div>

          <button
            onClick={fetchQueueStatus}
            className="w-full mt-6 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            รีเฟรชสถานะ
          </button>
        </div>
      </div>
    </div>
  );
}
