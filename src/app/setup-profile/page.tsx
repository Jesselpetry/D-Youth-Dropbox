"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import ProvinceSelector from "./components/provinceSelector";
import YearSelector from "./components/yearSelector";

import {
  FiUser,
  FiCalendar,
  FiMapPin,
  FiImage,
  FiLogOut,
  FiInstagram,
} from "react-icons/fi";

export default function SetupProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [year, setYear] = useState("");
  const [province, setProvince] = useState("");
  const [ig, setIg] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      } else {
        router.push("/login");
      }
    });
  }, []);

  // Preview image when selected
  useEffect(() => {
    if (profileImg) {
      const objectUrl = URL.createObjectURL(profileImg);
      setPreviewUrl(objectUrl);

      // Free memory when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [profileImg]);

  const uploadProfileImage = async (file: File, userId: string) => {
    if (!file) return null;

    try {
      // Get file extension
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Log upload attempt
      console.log("Attempting to upload file:", {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type,
      });

      // Upload the file to Supabase Storage
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type, // Explicitly set content type
        });

      if (error) {
        console.error("Error uploading image:", error);
        return null;
      }

      // Get the public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      console.log("Upload successful, public URL:", data.publicUrl);
      return data.publicUrl;
    } catch (err) {
      console.error("Exception during upload:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!userId || !userName || !year || !province) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    let imageUrl = null;

    if (profileImg) {
      setUploading(true);
      try {
        imageUrl = await uploadProfileImage(profileImg, userId);

        if (!imageUrl) {
          alert("อัปโหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง");
          setUploading(false);
          return;
        }
      } catch (err) {
        console.error("Error in upload process:", err);
        alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        setUploading(false);
        return;
      }
    }

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        user_name: userName,
        year,
        province,
        profile_img: imageUrl,
        ig,
      });

      if (error) {
        console.error("Error saving profile:", error);
        alert("บันทึกโปรไฟล์ไม่สำเร็จ: " + error.message);
      } else {
        console.log("Profile saved successfully, attempting redirect...");
        router.push("/");
        console.log("Redirect call completed");
      }
    } catch (err) {
      console.error("Exception during profile save:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setUploading(false);
    }
  };

  // Helper function to handle file selection
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

  const handleExitButton = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("ไม่สามารถออกจากระบบได้: " + error.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="p-4 flex flex-col relative overflow-y-auto">
      {/* Content */}
      <div className="max-w-2xl relative z-10 flex-1">
        {/* Exit Button */}
        <div className="absolute top-2 left-2">
          <button
            onClick={handleExitButton}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            aria-label="Exit to login page"
          >
            <FiLogOut className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center my-6">
          <h1 className="text-3xl font-bold text-white">สร้างบัญชี</h1>
          <h2 className="text-xl font-light text-white mt-2 opacity-60">
            Creating an account
          </h2>
        </div>

        <div className="w-full max-w-lg mx-auto p-5 rounded-3xl bg-black/25 backdrop-blur-sm border border-white/25 text-white text-lg font-light shadow-lg shadow-black/20">
          <div className="space-y-6 mt-2">
            {/* Profile Image - Now at the top */}
            <div className="flex justify-center">
              {previewUrl ? (
                <div className="mb-4 flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/50">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      setProfileImg(null);
                    }}
                    className="mt-2 text-white/80 hover:text-white text-sm"
                  >
                    เปลี่ยนรูป
                  </button>
                </div>
              ) : (
                <div
                  className="w-32 h-32 rounded-full bg-black/25 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center cursor-pointer"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <div className="flex flex-col items-center">
                    <FiImage className="w-8 h-8 text-white/70" />
                    <span className="mt-1 text-xs text-white/70">เลือกรูป</span>
                  </div>
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

            {/* Username - Row 1 */}
            <div className="space-y-2">
              <div className="flex items-center mb-2">
                <FiUser className="text-white/70 mr-2" />
                <label className="text-white text-xl font-medium">
                  ชื่อผู้ใช้
                </label>
              </div>
              <input
                type="text"
                placeholder="ชื่อผู้ใช้"
                className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            {/* Instagram - Row 2 */}
            <div className="space-y-2">
              <div className="flex items-center mb-2">
                <FiInstagram className="text-white/70 mr-2" />
                <label className="text-white text-xl font-medium">
                  Instagram
                </label>
              </div>
              <input
                type="text"
                placeholder="@username"
                className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light"
                value={ig}
                onChange={(e) => setIg(e.target.value)}
              />
            </div>

            {/* Year - Row 3 */}
            <div className="space-y-2 relative z-30">
              <div className="flex items-center mb-2">
                <FiCalendar className="text-white/70 mr-2" />
                <label className="text-white text-xl font-medium">
                  ยุวชน ปี
                </label>
              </div>
              <div className="relative z-30">
                <YearSelector year={year} setYear={setYear} />
              </div>
            </div>

            {/* Province - Row 4 */}
            <div className="space-y-2 relative z-20">
              <div className="flex items-center mb-2">
                <FiMapPin className="text-white/70 mr-2" />
                <label className="text-white text-xl font-medium">
                  จังหวัด
                </label>
              </div>
              <div className="relative z-20">
                <ProvinceSelector
                  province={province}
                  setProvince={setProvince}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                className="w-full bg-green-700 hover:bg-green-600 text-white text-xl py-4 rounded-lg font-bold transition-colors"
                disabled={uploading}
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    กำลังสร้างบัญชี...
                  </span>
                ) : (
                  "สร้างบัญชี"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
