import type { NextConfig } from 'next';

const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
console.log('[next.config] API_URL:', apiUrl);

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
      },
    ],
  },
};

export default nextConfig;