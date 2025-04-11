// ✅ app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";

import Menu from "@/app/components/Menu";

export const metadata = {
  title: "D-Youth Dropbox",
  description: "โพสต์และดูข้อความของคุณแบบง่าย ๆ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-gray-50 text-gray-900 font-anakotmai">
        
        <Menu /> 
        <main className="max-w-2xl mx-auto px-4 py-6 pb-32">{children}</main>
        <div className="fixed inset-0 -z-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0E653B] to-[#0C2A20]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-25" />
        </div>
      </body>
    </html>
  );
}
