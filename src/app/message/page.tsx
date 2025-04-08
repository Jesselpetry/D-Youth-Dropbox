'use client';
import React from 'react';
import Image from 'next/image';

function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <Image 
          src="/globe.svg" // Replace with your actual image path
          alt="Centered image"
          width={300}
          height={300}
          className="mx-auto rounded-lg shadow-lg"
        />
        <p className="mt-4 text-lg">message</p>
      </div>
    </div>
  );
}

export default Page;