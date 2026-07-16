import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép HMR (websocket) hoạt động qua ngrok và cloudflare
  allowedDevOrigins: [
    '*.ngrok-free.app', 
    'localhost:3000',
    '*.trycloudflare.com'
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5192'}/api/:path*`
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5192'}/uploads/:path*`
      },
      {
        source: '/image/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5192'}/image/:path*`
      }
    ];
  }
};

export default nextConfig;
