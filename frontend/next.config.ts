import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép HMR (websocket) hoạt động qua ngrok và cloudflare
  allowedDevOrigins: [
    '6dc6-58-187-184-243.ngrok-free.app', 
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
      }
    ];
  }
};

export default nextConfig;
