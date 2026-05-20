import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // In production, Nginx handles the routing to /backend and /socket.io.
  // We don't need Next.js rewrites for these as they will just create loops.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'carrental.sangvish.com',
      },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4042';
    return [
      {
        source: '/backup',
        destination: `${apiUrl}/backup`,
      },
      {
        source: '/restore',
        destination: `${apiUrl}/restore`,
      },
    ];
  },
};

export default nextConfig;
