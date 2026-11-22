"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductImage from "./ProductImage";

export type BannerSlide = {
  src: string;
  href: string;
  alt: string;
};

export default function SaleBanner({ slides }: { slides: BannerSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="bg-white px-4 sm:px-6 lg:px-8 pt-3 pb-4">
      <div className="relative mx-auto w-full max-w-[1440px] aspect-[1600/150] overflow-hidden rounded-[1.75rem] sm:rounded-[2.5rem] bg-black">
        {slides.map((item, itemIndex) => (
          <Link
            key={`${item.src}-${itemIndex}`}
            href={item.href}
            aria-label={item.alt}
            className={`absolute inset-0 block transition-opacity duration-500 ${
              itemIndex === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ProductImage
              src={item.src}
              alt={item.alt}
              fill
              priority={itemIndex === 0}
              sizes="100vw"
              className="object-contain object-center"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
