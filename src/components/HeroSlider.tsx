"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// THE 3 LUXURY SLIDES
const SLIDES = [
  {
    id: 1,
    // Make sure to always include the "/" at the start for public folder images
    src: "/diamondheroslider.png", 
    title: "VVS Clarity Only.",
    subtitle: "Ice that passes the tester. Every single time.",
    cta: "Shop Diamonds",
    link: "/shop?category=Diamond",
    align: "center"
  },
  {
    id: 2,
    src: "/goldheroslider.png",
    title: "The Gold Standard.",
    subtitle: "Heavyweight 18k & 24k pieces that hold their value.",
    cta: "Shop Gold",
    link: "/shop?category=Gold",
    align: "left"
  },
  {
    id: 3,
    src: "/perfumesheroslider.png",
    title: "Signature Scents.",
    subtitle: "Smell expensive. Arrive before you enter.",
    cta: "Discover Perfumes",
    link: "/shop?category=Perfumes",
    align: "right"
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  // AUTO-PLAY LOGIC (Changes every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const nextSlide = () => {
    setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  return (
    // STRICT SIZING: 75vh on mobile, 85vh on laptop. Minimum heights ensure it never gets too squished.
    <section className="relative h-[75vh] md:h-[85vh] min-h-[500px] w-full overflow-hidden bg-black text-white">
      
      {/* 1. THE SLIDES */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {/* Background Image with Dark Overlay */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={slide.src} // Fixed from slide.image
              alt={slide.title}
              fill
              // object-cover forces it to fill the box without squishing. object-center keeps the middle in view.
              className="object-cover object-center"
              priority={index === 0} 
            />
            {/* The "Vignette" Overlay (Makes text readable against bright pictures) */}
            <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          {/* Text Content */}
          <div className="absolute inset-0 flex items-center justify-center pt-10">
            <div className={`lee-container w-full ${
              slide.align === 'left' ? 'text-left' : 
              slide.align === 'right' ? 'text-right' : 'text-center'
            }`}>
              <div className={`max-w-2xl ${slide.align === 'right' ? 'ml-auto' : slide.align === 'center' ? 'mx-auto' : ''}`}>
                
                <h1 className={`font-heading text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tighter mb-4 transition-all duration-700 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  {slide.title}
                </h1>
                
                <p className={`text-lg md:text-xl text-gray-200 mb-8 font-light tracking-wide max-w-lg mx-auto md:mx-0 transition-all duration-700 delay-150 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  {slide.subtitle}
                </p>
                
                <div className={`transition-all duration-700 delay-300 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <Link
                    href={slide.link}
                    className="inline-block bg-white text-black px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white border border-white transition-all duration-300"
                  >
                    {slide.cta}
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 2. NAVIGATION ARROWS (Hidden on mobile for cleaner look) */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 bg-black/20 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hidden md:block"
      >
        <ChevronLeft size={32} />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 bg-black/20 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hidden md:block"
      >
        <ChevronRight size={32} />
      </button>

      {/* 3. PROGRESS DOTS (Bottom Center) */}
      <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1 transition-all duration-500 rounded-full ${
              index === current ? "w-12 bg-white" : "w-2 bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

    </section>
  );
}