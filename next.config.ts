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
    remotePatterns: [new URL(process.env.minioUrl as string)],
  },
   eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
