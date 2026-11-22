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

  const slide = slides[index] || slides[0];

  return (
    <section className="relative w-full h-[72px] sm:h-[96px] md:h-[124px] lg:h-[150px] bg-black overflow-hidden">
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
            className="object-cover object-center"
          />
        </Link>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
          {slides.map((item, itemIndex) => (
            <button
              key={`${item.src}-dot-${itemIndex}`}
              type="button"
              aria-label={`Show banner ${itemIndex + 1}`}
              onClick={() => setIndex(itemIndex)}
              className={`h-1.5 rounded-full transition-all ${
                itemIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
