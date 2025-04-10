"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import ProvinceSelector from "./components/provinceSelector";
import YearSelector from "./components/yearSelector";
import { RiLoaderFill } from "react-icons/ri";
import { FiLogOut, FiSave, FiUser, FiCalendar, FiMapPin } from "react-icons/fi";

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [year, setYear] = useState("");
  const [province, setProvince] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth error:", authError);
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        router.push("/setup-profile"); // ไปที่หน้า Setup Profile ถ้าไม่มีโปรไฟล์
        return;
      }

      setUserName(data.user_name || "");
      setYear(data.year || "");
      setProvince(data.province || "");
      setPreviewUrl(data.profile_img || null);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (profileImg) {
      const objectUrl = URL.createObjectURL(profileImg);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [profileImg]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("ไม่สามารถออกจากระบบได้: " + error.message);
    } else {
      router.push("/login"); // ไปที่หน้า Login หลัง logout
    }
  };

  const uploadProfileImage = async (file: File, userId: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }

      setProfileImg(file);
    }
  };

  const handleSubmit = async () => {
    if (!userId || !userName || !year || !province || !previewUrl) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    let imageUrl = previewUrl;

    if (profileImg) {
      const uploadedUrl = await uploadProfileImage(profileImg, userId);
      if (!uploadedUrl) {
        alert("อัปโหลดรูปไม่สำเร็จ");
        return;
      }
      imageUrl = uploadedUrl;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      user_name: userName,
      year,
      province,
      profile_img: imageUrl,
    });

    if (error) {
      console.error("Update error:", error);
      alert("ไม่สามารถบันทึกได้");
    } else {
      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <RiLoaderFill className="animate-spin text-white" size={48} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-6">

      <h1 className="text-3xl font-bold text-white">โปรไฟล์</h1>
      <h2 className="text-xl font-light text-white mt-2 opacity-60">
        Profile
      </h2>

      <div className="mt-6 max-w-2xl mx-auto">
        {/* Form Fields */}
        <div className="space-y-6 w-full p-4 rounded-2xl bg-black/25 backdrop-blur-sm border border-white/25 text-white text-lg font-light">

          {/* Profile Image Section */}
          <div className="flex justify-center mt-4">
            {previewUrl ? (
              <div className="relative group">
                <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/25 transition-all duration-300">
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <span className="text-white text-sm">Change Photo</span>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div
                className="w-36 h-36 rounded-full flex flex-col items-center justify-center bg-black/25 border-5 border-dashed border-white/25 cursor-pointer hover:border-white/50 transition-all duration-300"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <svg
                  className="w-10 h-10 text-white/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                <span className="mt-2 text-white/70 text-sm">Add Photo</span>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <div className="flex items-center mb-2">
              <FiUser className="text-white/70 mr-2" />
              <label className="text-white text-lg font-medium">
                ชื่อผู้ใช้
              </label>
            </div>
            <input
              type="text"
              placeholder="Username"
              className="w-full p-4 rounded-xl bg-black/25 backdrop-blur-sm border border-white/25 text-white text-lg font-light focus:border-white/50 focus:outline-none transition-colors"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <div className="flex items-center mb-2">
                <FiCalendar className="text-white/70 mr-2" />
                <label className="text-white text-lg font-medium">ปี</label>
              </div>
              <YearSelector year={year} setYear={setYear} />
            </div>
            <div className="relative">
              <div className="flex items-center mb-2">
                <FiMapPin className="text-white/70 mr-2" />
                <label className="text-white text-lg font-medium">จังหวัด</label>
              </div>
              <ProvinceSelector province={province} setProvince={setProvince} />
            </div>
          </div>

          <div className="pt-6 space-y-4">
            <button
              onClick={handleSubmit}
              className="cursor-pointer w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-lg py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              <FiSave className="mr-2" />
              บันทึกการเปลี่ยนแปลง
            </button>

            <button
              onClick={handleLogout}
              className="cursor-pointer w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-lg py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              <FiLogOut className="mr-2" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}