import React from 'react';

function FamilyPage() {
  return (
    <div className=" text-white">
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

      {/* Grid Section */}
      <section className="">
        {/* Year Group 68 */}
        <h3 className="text-2xl font-medium mt-6">ยุวชนปี 68</h3>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 mt-4">
          {Array(4).fill(null).map((_, index) => (
            <div
              key={index}
              className="bg-black/25 backdrop-blur-sm border border-white/25 rounded-xl text-center py-4"
            >

                <img
                  src="/path-to-image.jpg"
                  alt="PFP"
                  className="w-auto h-auto w-max-xs h-max-xs rounded-full aspect-square mx-4 border border-white/25 mb-2 overflow-hidden object-cover"
                />
        
              <h4 className="text-md font-medium">ซุปเปอร์จูเนีย</h4>
              <p className="text-xs font-light opacity-80">หนองคาย</p>
              <button className="mt-2 px-4 py-1 bg-white text-green-900 rounded-lg">
                ปี 68
              </button>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}

export default FamilyPage;
//