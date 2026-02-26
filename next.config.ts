import type { NextConfig } from "next";

// Supabase storage hostname for Next.js Image (required for product images from storage)
let supabaseHost = "*.supabase.co";
try {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (u) supabaseHost = new URL(u).hostname;
} catch (_) {}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;