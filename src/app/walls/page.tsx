"use client";

import PaperWall from "@/app/components/PaperWall";

export default function WallsPage() {
  return (
    <PaperWall
      title="กำแพง"
      subtitle="Walls"
      buttonText="เขียนข้อความ"
      buttonAction={() => (window.location.href = "/walls/send")}
      // Current date is used from default
    />
  );
}
