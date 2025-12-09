"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { PhotoOrder } from "@/types";
import Image from "next/image";

export default function HistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PhotoOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PhotoOrder | null>(null);

  useEffect(() => {
    checkAuth();
    fetchHistory();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
    }
  };

  const fetchHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("photo_orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { text: "รอดำเนินการ", color: "bg-yellow-500" },
      uploading: { text: "กำลังอัปโหลด", color: "bg-blue-500" },
      payment_pending: { text: "รอชำระเงิน", color: "bg-orange-500" },
      completed: { text: "เสร็จสมบูรณ์", color: "bg-green-500" },
      cancelled: { text: "ยกเลิก", color: "bg-red-500" },
    };

    const status_info =
      statusMap[status as keyof typeof statusMap] ||
      { text: status, color: "bg-gray-500" };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs text-white ${status_info.color}`}
      >
        {status_info.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">ประวัติการสั่งซื้อ</h1>

      {orders.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
          <p className="text-white/70 mb-4">คุณยังไม่มีประวัติการสั่งซื้อ</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            กลับหน้าหลัก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 cursor-pointer transition-all hover:bg-white/15 ${
                  selectedOrder?.id === order.id
                    ? "ring-2 ring-green-400"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-medium text-lg">
                      คำสั่งซื้อ #{order.id}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {new Date(order.created_at).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {order.photo_urls && order.photo_urls.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {order.photo_urls.slice(0, 3).map((url, idx) => (
                      <div
                        key={idx}
                        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5"
                      >
                        <Image
                          src={url}
                          alt={`Photo ${idx + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {order.photo_urls.length > 3 && (
                      <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center">
                        <span className="text-white/70 text-sm">
                          +{order.photo_urls.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {order.payment_confirmed && (
                  <div className="mt-3 text-green-400 text-sm flex items-center gap-2">
                    <span>✓</span>
                    <span>ชำระเงินแล้ว</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Order Details */}
          <div className="lg:sticky lg:top-4 h-fit">
            {selectedOrder ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  รายละเอียดคำสั่งซื้อ #{selectedOrder.id}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm">สถานะ</label>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>

                  <div>
                    <label className="text-white/70 text-sm">ชื่อ</label>
                    <p className="text-white">{selectedOrder.customer_name}</p>
                  </div>

                  <div>
                    <label className="text-white/70 text-sm">อีเมล</label>
                    <p className="text-white">{selectedOrder.customer_email}</p>
                  </div>

                  <div>
                    <label className="text-white/70 text-sm">วันที่สั่ง</label>
                    <p className="text-white">
                      {new Date(selectedOrder.created_at).toLocaleDateString(
                        "th-TH",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>

                  {selectedOrder.completed_at && (
                    <div>
                      <label className="text-white/70 text-sm">
                        วันที่เสร็จสิ้น
                      </label>
                      <p className="text-white">
                        {new Date(selectedOrder.completed_at).toLocaleDateString(
                          "th-TH",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  )}

                  {selectedOrder.notes && (
                    <div>
                      <label className="text-white/70 text-sm">หมายเหตุ</label>
                      <p className="text-white">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {selectedOrder.google_drive_link && (
                    <div className="bg-blue-600/20 border border-blue-400 rounded-lg p-4">
                      <label className="text-white font-medium mb-2 block">
                        ลิงก์ดาวน์โหลดรูปภาพ
                      </label>
                      <a
                        href={selectedOrder.google_drive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline break-all text-sm"
                      >
                        {selectedOrder.google_drive_link}
                      </a>
                      <button
                        onClick={() =>
                          window.open(selectedOrder.google_drive_link, "_blank")
                        }
                        className="mt-3 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        เปิด Google Drive
                      </button>
                    </div>
                  )}

                  {selectedOrder.photo_urls && selectedOrder.photo_urls.length > 0 && (
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">
                        รูปภาพทั้งหมด ({selectedOrder.photo_urls.length} รูป)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedOrder.photo_urls.map((url, idx) => (
                          <div
                            key={idx}
                            className="aspect-square rounded-lg overflow-hidden bg-white/5"
                          >
                            <Image
                              src={url}
                              alt={`Photo ${idx + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(url, "_blank")}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedOrder.payment_confirmed && (
                    <div className="bg-green-600/20 border border-green-400 rounded-lg p-4">
                      <p className="text-white text-center">
                        ✓ การชำระเงินได้รับการยืนยันแล้ว
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
                <p className="text-white/50">
                  เลือกคำสั่งซื้อเพื่อดูรายละเอียด
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
