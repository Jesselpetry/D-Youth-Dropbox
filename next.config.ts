/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // เปิดใช้ Server Actions (ถ้าคุณใช้)
  },
  images: {
    domains: ['axdoxguzojpdpopmflfu.supabase.co',
      'picsum.photos',
    ],

  },
}

module.exports = nextConfig
