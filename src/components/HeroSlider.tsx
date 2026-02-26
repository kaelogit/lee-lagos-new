"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// THE 5 LUXURY SLIDES
const SLIDES = [
  {
    id: 1,
    src: "/diamondheroslider.png", 
    title: "VVS Clarity Only.",
    subtitle: "Ice that passes the tester. Every single time.",
    cta: "Shop Diamonds",
    link: "/shop/Diamond",
    align: "center"
  },
  {
    id: 4,
    src: "/watchesheroslider.png",
    title: "Master The Time.",
    subtitle: "Exclusive luxury timepieces crafted for the elite.",
    cta: "Shop Watches",
    link: "/shop/Watches",
    align: "left"
  },
  {
    id: 5,
    src: "/eyeglassesheroslider.png",
    title: "Visionary Frames.",
    subtitle: "Designer eyewear to complete your signature look.",
    cta: "Shop Eyewear",
    link: "/shop/Eyeglasses",
    align: "right"
  },
  {
    id: 2,
    src: "/goldheroslider.png",
    title: "The Gold Standard.",
    subtitle: "Heavyweight 18k & 24k pieces that hold their value.",
    cta: "Shop Gold",
    link: "/shop/Gold",
    align: "left"
  },
  {
    id: 3,
    src: "/perfumesheroslider.png",
    title: "Signature Scents.",
    subtitle: "Smell expensive. Arrive before you enter.",
    cta: "Discover Perfumes",
    link: "/shop/Perfumes",
    align: "right"
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  // AUTO-PLAY LOGIC
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
    // ULTRA-SLIM PANORAMIC SIZING:
    // Mobile: 200px (Very wide and short)
    // Tablet: 250px / 320px
    // Desktop: 400px (A perfectly slim, cinematic banner)
    <section className="relative w-full h-[200px] sm:h-[250px] md:h-[320px] lg:h-[400px] overflow-hidden bg-black text-white">
      
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
              src={slide.src}
              alt={slide.title}
              fill
              className="object-cover object-center"
              priority={index === 0} 
            />
            {/* The "Vignette" Overlay */}
            <div className="absolute inset-0 bg-black/20 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          </div>

          {/* Text Content - perfectly centered for the slim height */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`lee-container w-full ${
              slide.align === 'left' ? 'text-left' : 
              slide.align === 'right' ? 'text-right' : 'text-center'
            }`}>
              <div className={`max-w-2xl ${slide.align === 'right' ? 'ml-auto' : slide.align === 'center' ? 'mx-auto' : ''}`}>
                
                <h1 className={`font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter mb-2 transition-all duration-700 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                  {slide.title}
                </h1>
                
                <p className={`text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-200 mb-4 md:mb-6 font-light tracking-wide max-w-lg mx-auto md:mx-0 transition-all duration-700 delay-150 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                  {slide.subtitle}
                </p>
                
                <div className={`transition-all duration-700 delay-300 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                  <Link
                    href={slide.link}
                    className="inline-block bg-white text-black px-5 py-2.5 md:px-8 md:py-3.5 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 border border-white transition-all duration-300 rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    {slide.cta}
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 2. NAVIGATION ARROWS */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-black/30 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hidden md:flex border border-white/10"
      >
        <ChevronLeft size={20} />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-black/30 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hidden md:flex border border-white/10"
      >
        <ChevronRight size={20} />
      </button>

      {/* 3. PROGRESS DOTS */}
      <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1 transition-all duration-500 rounded-full ${
              index === current ? "w-6 md:w-10 bg-white" : "w-2 bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

    </section>
  );
}