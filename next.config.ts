import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
    typescript: {
    ignoreBuildErrors: true,
    
  },
    images: {
    remotePatterns: [new URL('http://localhost:9000/my-public-bucket/**')],
  },
};

export default nextConfig;
