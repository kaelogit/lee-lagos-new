import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // This allows images from ANY website (HTTPS)
      },
    ],
  },
};

export default nextConfig;