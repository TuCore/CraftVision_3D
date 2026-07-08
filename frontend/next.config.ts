import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép HMR (websocket) hoạt động qua ngrok
  allowedDevOrigins: ['6dc6-58-187-184-243.ngrok-free.app', 'localhost:3000'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5192/api/:path*'
      }
    ];
  }
};

export default nextConfig;
