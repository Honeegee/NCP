import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth", "word-extractor"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ldxuqxvvsspgmoogubit.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
