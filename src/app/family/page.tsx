'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface FamilyMember {
  id: number;
  user_name: string;
  province: string;
  year: string;
  profile_img: string;
}

export default function FamilyPage() {
  const [familyData, setFamilyData] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilyData = async () => {
      setLoading(true);

      // Fetch family data from the 'profiles' table
      const { data, error } = await supabase
        .from('profiles') // Replace with your actual table name if different
        .select('*');

      if (error) {
        console.error('Error fetching family data:', error);
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

  return (
    <section className="">
      {/* Header Section */}
      <header className="text-left py-6">
        <h1 className="text-3xl font-bold">ครอบครัวยุวชน</h1>
        <h2 className="text-xl font-light mt-2 opacity-60">Democratic Youth Family</h2>
      </header>

      {/* Search Bar */}
      <div className="flex justify-center my-4">
        <input
          type="text"
          placeholder="Search"
          className="w-full p-4 rounded-2xl bg-black/25 backdrop-blur-sm border border-white/25 text-white text-lg font-light"
        />
      </div>

      {/* User Cards Section */}
      <div className="flex items-center justify-between mt-6">
        <h3 className="text-2xl font-medium">สมาชิกทั้งหมด</h3>
        <div className="flex-grow h-px bg-white/25 ml-4"></div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        
        {familyData.map((member) => (
          <div
            key={member.id}
            className="bg-black/25 backdrop-blur-sm border border-white/25 rounded-2xl text-center py-4"
          >
            <img
              src={member.profile_img || '/path-to-image.jpg'}
              alt="PFP"
              className="w-20 h-20 mx-auto rounded-full aspect-square border border-white/25 mb-2 overflow-hidden object-cover"
            />
            <h4 className="text-md font-medium">{member.user_name}</h4>
            <p className="text-xs font-light opacity-80">{member.province}</p>
            <button className="mt-2 px-4 py-1 bg-white text-green-900 rounded-lg">
              ปี {member.year}
            </button>
          </div>
        ))}

      </div>
    </section>
  );
}

