"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FaSearch } from "react-icons/fa";
import Image from "next/image";
interface FamilyMember {
  id: number;
  user_name: string;
  province: string;
  year: string;
  profile_img: string;
}

export default function FamilyPage() {
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [familyData, setFamilyData] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Add search term state

  useEffect(() => {
    const fetchFamilyData = async () => {
      setLoading(true);

      const { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        console.error("Error fetching family data:", error);
      } else {
        setFamilyData(data || []);
      }

      setLoading(false);
    };

    fetchFamilyData();
  }, []);

  if (loading) {
    return <div>Loading family data...</div>;
  }

  // Group and filter data by year
  const filteredFamilyData = familyData.filter((member) =>
    member.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedData = filteredFamilyData.reduce((acc, member) => {
    acc[member.year] = acc[member.year] || [];
    acc[member.year].push(member);
    return acc;
  }, {} as Record<string, FamilyMember[]>);

  const sortedYears = Object.keys(groupedData).sort(
    (a, b) => parseInt(b) - parseInt(a)
  );

  return (
    <section className="pb-32">
      <header className="text-left py-6">
        <h1 className="text-3xl font-bold">ครอบครัวยุวชน</h1>
        <h2 className="text-xl font-light mt-2 opacity-60">
          Democratic Youth Family
        </h2>
      </header>

      {/* Search Bar */}
      <div className="flex justify-center my-2">
        <input
          type="text"
          placeholder="🔎 ค้นหาโดย ชื่อเล่น"
          value={searchTerm} // Bind to state
          onChange={(e) => setSearchTerm(e.target.value)} // Update state
          className="w-full p-4 rounded-2xl bg-black/25 backdrop-blur-sm border border-white/25 text-white text-lg font-light"
        />
      </div>

      {sortedYears.map((year) => (
        <div key={year}>
          <div className="flex items-center justify-between mt-6">
            <h3 className="text-2xl font-medium">ยุวชนปี {year}</h3>
            <div className="flex-grow h-px bg-white/25 ml-4"></div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {groupedData[year].map((member) => (
              <div
                key={member.id}
                className="bg-black/25 backdrop-blur-sm border border-white/25 rounded-2xl text-center py-4"
              >
                <Image
                  width={80}
                  height={80}
                  src={
                    imageError[member.id]
                      ? "/person.png"
                      : member.profile_img || "/person.png"
                  }
                  alt="PFP"
                  onError={() =>
                    setImageError((prev) => ({ ...prev, [member.id]: true }))
                  }
                  className="w-20 h-20 mx-auto rounded-full aspect-square border border-white/25 mb-2 overflow-hidden object-cover"
                />
                <h4 className="text-md font-medium">{member.user_name}</h4>
                <p className="text-xs font-light opacity-80">
                  {member.province}
                </p>
                <button className="font-medium text-sm mt-2 px-4 py-1 bg-white text-green-900 rounded-lg">
                  ปี {member.year}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
