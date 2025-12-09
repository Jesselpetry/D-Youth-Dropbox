"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { PhotoOrder } from "@/types";
import toast, { Toaster } from "react-hot-toast";

export default function StaffDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<PhotoOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PhotoOrder | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "staff" && profile?.role !== "admin") {
      toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
      router.push("/");
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("photo_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} ไม่ใช่ไฟล์รูปภาพ`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} มีขนาดใหญ่เกิน 10MB`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    if (!selectedOrder || selectedFiles.length === 0) {
      toast.error("กรุณาเลือกรูปภาพ");
      return;
    }

    setUploading(true);
    const uploadToast = toast.loading("กำลังอัปโหลดรูปภาพ...");

    try {
      const formData = new FormData();
      formData.append("orderId", selectedOrder.id.toString());
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });

      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      toast.success("อัปโหลดรูปภาพสำเร็จ!", { id: uploadToast });
      setSelectedFiles([]);
      await fetchOrders();
      
      // Update selected order
      const updatedOrder = orders.find(o => o.id === selectedOrder.id);
      if (updatedOrder) {
        setSelectedOrder({...updatedOrder, google_drive_link: result.folderLink});
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถอัปโหลดได้",
        { id: uploadToast }
      );
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmPayment = async (orderId: number) => {
    const order = orders.find((o) => o.id === orderId);
    
    if (!order?.google_drive_link) {
      toast.error("กรุณาอัปโหลดรูปภาพก่อน");
      return;
    }

    const confirmToast = toast.loading("กำลังยืนยันการชำระเงิน...");

    try {
      const response = await fetch("/api/orders/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Confirmation failed");
      }

      toast.success(
        `ยืนยันการชำระเงินสำเร็จ!\nลิงก์: ${result.driveLink}`,
        { id: confirmToast, duration: 5000 }
      );
      await fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error("Confirmation error:", error);
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถยืนยันได้",
        { id: confirmToast }
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      uploading: "bg-blue-500",
      payment_pending: "bg-orange-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
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
      <Toaster position="top-center" />
      
      <h1 className="text-3xl font-bold text-white mb-8">
        แดชบอร์ดเจ้าหน้าที่
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            รายการคำสั่งซื้อ
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {orders.length === 0 ? (
              <p className="text-white/70">ไม่มีคำสั่งซื้อ</p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedOrder?.id === order.id
                      ? "bg-green-600/30 border-2 border-green-400"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">
                        {order.customer_name}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {order.customer_email}
                      </p>
                      <p className="text-white/60 text-sm">
                        {new Date(order.created_at).toLocaleString("th-TH")}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs text-white ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Details & Upload */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          {selectedOrder ? (
            <>
              <h2 className="text-2xl font-semibold text-white mb-4">
                รายละเอียดคำสั่งซื้อ #{selectedOrder.id}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-white/70 text-sm">ลูกค้า</label>
                  <p className="text-white">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <label className="text-white/70 text-sm">อีเมล</label>
                  <p className="text-white">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <label className="text-white/70 text-sm">สถานะ</label>
                  <p className="text-white capitalize">{selectedOrder.status}</p>
                </div>
                {selectedOrder.google_drive_link && (
                  <div>
                    <label className="text-white/70 text-sm">
                      Google Drive Link
                    </label>
                    <a
                      href={selectedOrder.google_drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline block break-all"
                    >
                      {selectedOrder.google_drive_link}
                    </a>
                  </div>
                )}
              </div>

              {selectedOrder.status !== "completed" && (
                <>
                  <div className="mb-4">
                    <label className="block text-white mb-2">
                      อัปโหลดรูปภาพ
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer"
                    />
                    {selectedFiles.length > 0 && (
                      <p className="text-white/70 text-sm mt-2">
                        เลือกไว้ {selectedFiles.length} ไฟล์
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                    className="w-full mb-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
                  </button>

                  {selectedOrder.google_drive_link && (
                    <button
                      onClick={() => handleConfirmPayment(selectedOrder.id)}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      ยืนยันการชำระเงิน
                    </button>
                  )}
                </>
              )}

              {selectedOrder.status === "completed" && (
                <div className="bg-green-600/20 border border-green-400 rounded-lg p-4">
                  <p className="text-white text-center">
                    ✓ คำสั่งซื้อนี้เสร็จสมบูรณ์แล้ว
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/50 text-center">
                เลือกคำสั่งซื้อเพื่อดูรายละเอียด
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
