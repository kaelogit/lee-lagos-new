import type { NextConfig } from "next";

function hostnameFrom(raw?: string) {
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

let supabaseHost = "*.supabase.co";
try {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (u) supabaseHost = new URL(u).hostname;
} catch (_) {}

const imageHost = hostnameFrom(process.env.NEXT_PUBLIC_IMAGE_BASE_URL);

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
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
  {
    protocol: "https",
    hostname: "*.r2.dev",
    pathname: "/**",
  },
];

if (imageHost) {
  remotePatterns.push({
    protocol: "https",
    hostname: imageHost,
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
