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
          className="w-full p-4 rounded-lg bg-black/25 backdrop-blur-sm border border-white/30 text-white text-lg font-light"
        />
      </div>

      {/* Grid Section */}
      <section className="">
        {/* Year Group 68 */}
        <h3 className="text-2xl font-medium mt-6">ยุวชนปี 68</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {Array(4).fill(null).map((_, index) => (
            <div
              key={index}
              className="bg-green-800 rounded-lg text-center p-4"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-white mb-4 overflow-hidden">
                <img
                  src="/path-to-image.jpg"
                  alt="Member"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg font-medium">เจส</h4>
              <p className="text-sm opacity-80">จ.พระนครศรีอยุธยา</p>
              <button className="mt-2 px-4 py-1 bg-white text-green-900 rounded-lg">
                ปี 68
              </button>
            </div>
          ))}
        </div>

        {/* Year Group 67 */}
        <h3 className="text-2xl font-semibold mt-6">ยุวชนปี 67</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {Array(4).fill(null).map((_, index) => (
            <div
              key={index}
              className="bg-green-800 rounded-lg text-center p-4"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-white mb-4 overflow-hidden">
                <img
                  src="/path-to-image.jpg"
                  alt="Member"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg font-medium">ซุปเปอร์จูเนีย</h4>
              <p className="text-sm opacity-80">จ.พระนครศรีอยุธยา</p>
              <button className="mt-2 px-4 py-1 bg-white text-green-900 rounded-lg">
                ปี 67
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FamilyPage;