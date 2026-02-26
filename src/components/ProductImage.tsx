"use client";

import { useState } from "react";
import Image from "next/image";

const PLACEHOLDER = "/placeholder.jpg";

type ProductImageProps = {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Use for thumbnails in a list (smaller) */
  unoptimized?: boolean;
};

/**
 * Renders a product image with:
 * - unoptimized for remote URLs (Supabase) so they always load
 * - Fallback to placeholder on error or missing src
 */
export default function ProductImage({
  src,
  alt,
  fill = true,
  className = "",
  sizes,
  priority = false,
  unoptimized: forceUnoptimized,
}: ProductImageProps) {
  const [error, setError] = useState(false);
  const resolvedSrc = src && src.startsWith("http") ? src : src || PLACEHOLDER;
  const isRemote = resolvedSrc.startsWith("http");
  const unoptimized = forceUnoptimized ?? isRemote;

  if (error || !resolvedSrc) {
    return (
      <Image
        src={PLACEHOLDER}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        unoptimized
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      onError={() => setError(true)}
    />
  );
}
