// ✅ app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import localFont from "next/font/local";
import Menu from "@/app/components/Menu";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "D-Youth Dropbox",
  description: "โพสต์และดูข้อความของคุณแบบง่าย ๆ",
  openGraph: {
    title: "D-Youth Dropbox",
    description: "โพสต์และดูข้อความของคุณแบบง่าย ๆ",
    url: "https://d-youth.vercel.app", // ✅ Replace with your real domain
    siteName: "D-Youth Dropbox",
    images: [
      {
        url: "https://i.ibb.co/HLHQJBbj/Web-Preview.png", // ✅ Updated image URL
        width: 1200,
        height: 630,
        alt: "D-Youth Dropbox Preview",
      },
    ],
    type: "website",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
    title: "D-Youth Dropbox",
    description: "โพสต์และดูข้อความของคุณแบบง่าย ๆ",
    images: ["https://i.ibb.co/HLHQJBbj/Web-Preview.png"], // ✅ Updated image URL
  },
};

const myFont = localFont({
  src: [
    {
      path: "/fonts/anakotmai-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "/fonts/anakotmai-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "/fonts/anakotmai-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className={`${myFont.className} bg-gray-50 text-white`}>
        <Analytics />
        <SpeedInsights/>
        <Menu />
        <main className="max-w-2xl mx-auto px-4 py-6 pb-32">{children}</main>
        <div className="fixed inset-0 -z-20">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E653B] to-[#0C2A20]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-25" />
        </div>
      </body>
    </html>
  );
}
