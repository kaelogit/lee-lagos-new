"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase"; 

// 1. THE MASSIVE WATCH DICTIONARY (Universal Coverage)
const LOGO_DICTIONARY: Record<string, string> = {
  // Big Three & Ultra High-End
  "Patek Philippe": "https://www.google.com/s2/favicons?domain=patek.com&sz=128",
  "Audemars Piguet": "https://www.google.com/s2/favicons?domain=audemarspiguet.com&sz=128",
  "AP": "https://www.google.com/s2/favicons?domain=audemarspiguet.com&sz=128",
  "Vacheron Constantin": "https://www.google.com/s2/favicons?domain=vacheron-constantin.com&sz=128",
  "Vacheron": "https://www.google.com/s2/favicons?domain=vacheron-constantin.com&sz=128",
  "A. Lange & Söhne": "https://www.google.com/s2/favicons?domain=alange-soehne.com&sz=128",
  "Richard Mille": "https://www.google.com/s2/favicons?domain=richardmille.com&sz=128",
  "F.P. Journe": "https://www.google.com/s2/favicons?domain=fpjourne.com&sz=128",
  "Roger Dubuis": "https://www.google.com/s2/favicons?domain=rogerdubuis.com&sz=128",

  // Luxury Giants
  "Rolex": "https://www.google.com/s2/favicons?domain=rolex.com&sz=128",
  "Omega": "https://www.google.com/s2/favicons?domain=omegawatches.com&sz=128",
  "Cartier": "https://www.google.com/s2/favicons?domain=cartier.com&sz=128",
  "Hublot": "https://www.google.com/s2/favicons?domain=hublot.com&sz=128",
  "IWC": "https://www.google.com/s2/favicons?domain=iwc.com&sz=128",
  "IWC Schaffhausen": "https://www.google.com/s2/favicons?domain=iwc.com&sz=128",
  "Breitling": "https://www.google.com/s2/favicons?domain=breitling.com&sz=128",
  "Panerai": "https://www.google.com/s2/favicons?domain=panerai.com&sz=128",
  "Jaeger-LeCoultre": "https://www.google.com/s2/favicons?domain=jaeger-lecoultre.com&sz=128",
  "JLC": "https://www.google.com/s2/favicons?domain=jaeger-lecoultre.com&sz=128",
  "Tudor": "https://www.google.com/s2/favicons?domain=tudorwatch.com&sz=128",
  "Tag Heuer": "https://www.google.com/s2/favicons?domain=tagheuer.com&sz=128",
  "Zenith": "https://www.google.com/s2/favicons?domain=zenith-watches.com&sz=128",
  "Grand Seiko": "https://www.google.com/s2/favicons?domain=grand-seiko.com&sz=128",
  "Chopard": "https://www.google.com/s2/favicons?domain=chopard.com&sz=128",
  "Piaget": "https://www.google.com/s2/favicons?domain=piaget.com&sz=128",
  "Breguet": "https://www.google.com/s2/favicons?domain=breguet.com&sz=128",
  "Bulgari": "https://www.google.com/s2/favicons?domain=bulgari.com&sz=128",
  "Bvlgari": "https://www.google.com/s2/favicons?domain=bulgari.com&sz=128",
  "Girard-Perregaux": "https://www.google.com/s2/favicons?domain=girard-perregaux.com&sz=128",
  "Ulysse Nardin": "https://www.google.com/s2/favicons?domain=ulysse-nardin.com&sz=128",
  "Blancpain": "https://www.google.com/s2/favicons?domain=blancpain.com&sz=128",
  "Glashütte Original": "https://www.google.com/s2/favicons?domain=glashuette-original.com&sz=128",
  "Franck Muller": "https://www.google.com/s2/favicons?domain=franckmuller.com&sz=128",
  "Jacob & Co": "https://www.google.com/s2/favicons?domain=jacobandco.com&sz=128",
  "H. Moser & Cie": "https://www.google.com/s2/favicons?domain=h-moser.com&sz=128",
  "Parmigiani Fleurier": "https://www.google.com/s2/favicons?domain=parmigiani.com&sz=128",

  // Modern & Specialty
  "D1 Milano": "https://www.google.com/s2/favicons?domain=d1milano.com&sz=128",
  "Bell & Ross": "https://www.google.com/s2/favicons?domain=bellross.com&sz=128",
  "Oris": "https://www.google.com/s2/favicons?domain=oris.ch&sz=128",
  "Longines": "https://www.google.com/s2/favicons?domain=longines.com&sz=128",
  "Rado": "https://www.google.com/s2/favicons?domain=rado.com&sz=128",
  "Maurice Lacroix": "https://www.google.com/s2/favicons?domain=mauricelacroix.com&sz=128",
  "Baume & Mercier": "https://www.google.com/s2/favicons?domain=baume-et-mercier.com&sz=128",
  "Montblanc": "https://www.google.com/s2/favicons?domain=montblanc.com&sz=128",
  "Nomos Glashütte": "https://www.google.com/s2/favicons?domain=nomos-glashuette.com&sz=128",
  "Frederique Constant": "https://www.google.com/s2/favicons?domain=frederiqueconstant.com&sz=128",
  "Hermès": "https://www.google.com/s2/favicons?domain=hermes.com&sz=128",
  "Bremont": "https://www.google.com/s2/favicons?domain=bremont.com&sz=128",
  "U-Boat": "https://www.google.com/s2/favicons?domain=uboatwatch.com&sz=128",

  // High-Quality Consumer & Everyday
  "Seiko": "https://www.google.com/s2/favicons?domain=seikowatches.com&sz=128",
  "Casio": "https://www.google.com/s2/favicons?domain=casio.com&sz=128",
  "G-Shock": "https://www.google.com/s2/favicons?domain=gshock.com&sz=128",
  "Citizen": "https://www.google.com/s2/favicons?domain=citizenwatch.com&sz=128",
  "Tissot": "https://www.google.com/s2/favicons?domain=tissotwatches.com&sz=128",
  "Hamilton": "https://www.google.com/s2/favicons?domain=hamiltonwatch.com&sz=128",
  "Bulova": "https://www.google.com/s2/favicons?domain=bulova.com&sz=128",
  "Mido": "https://www.google.com/s2/favicons?domain=midowatches.com&sz=128",
  "Certina": "https://www.google.com/s2/favicons?domain=certina.com&sz=128",
};

interface Brand {
  name: string;
  filter: string;
  logo: string;
}

export default function BrandSection() {
  const [activeBrands, setActiveBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Hover Effect State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // FETCH REAL BRANDS FROM DATABASE & SHUFFLE
  // ==========================================
  useEffect(() => {
    async function fetchWatchBrands() {
      // 1. Get everything in the Watches category
      const { data, error } = await supabase
        .from("products")
        .select("subcategory")
        .eq("category", "Watches");

      if (data && !error) {
        // Extract unique names
        const uniqueNames = Array.from(new Set(data.map(i => i.subcategory?.trim()).filter(Boolean)));
        
        // 2. Shuffle randomly and pick exactly 12 
        const shuffled = uniqueNames.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 12);

        // 3. Match with our Logo Dictionary
        const matchedBrands: Brand[] = selected.map((name) => ({
          name,
          filter: name,
          logo: LOGO_DICTIONARY[name] || "https://www.google.com/s2/favicons?domain=chrono24.com&sz=128"
        }));

        setActiveBrands(matchedBrands);
      }
      setLoading(false);
    }

    fetchWatchBrands();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // If there are no watches in the database, don't show the section at all
  if (!loading && activeBrands.length === 0) return null;

  return (
    <section 
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative w-full bg-white overflow-hidden py-20 cursor-none border-y border-gray-100"
    >
      <div className="lee-container">
        
        {/* 1. HEADER */}
        <div className="relative z-10 pointer-events-none mb-16 text-center lg:text-left">
          <h2 className="font-heading text-4xl lg:text-5xl font-bold uppercase tracking-tighter text-black">
            The Watch <br /> Collection.
          </h2>
          <div className="h-1 w-20 bg-black mt-6 mx-auto lg:mx-0"></div>
        </div>

        {/* 2. SPOTLIGHT (Desktop Only) */}
        {isHovering && (
          <div 
            className="pointer-events-none absolute hidden lg:block rounded-full w-[400px] h-[400px] blur-[90px] bg-gray-50 z-0 transition-opacity duration-200"
            style={{
              left: mousePos.x,
              top: mousePos.y,
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}

        {/* =========================================
            3. DYNAMIC MUSEUM GRID
           ========================================= */}
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="animate-pulse flex gap-8">
               <div className="w-16 h-16 bg-gray-100 rounded-full"></div>
               <div className="w-16 h-16 bg-gray-100 rounded-full"></div>
               <div className="w-16 h-16 bg-gray-100 rounded-full"></div>
             </div>
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW */}
            <div className="hidden lg:grid grid-cols-4 gap-y-20 gap-x-12 relative z-10">
              {activeBrands.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/shop/Watches?filter=${encodeURIComponent(brand.filter)}`}
                  className="group flex flex-col items-center justify-center transition-transform duration-500 hover:-translate-y-2"
                >
                  {/* Logo Box */}
                  <div className="relative w-24 h-24 flex items-center justify-center opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-500">
                    <Image 
                      src={brand.logo} 
                      alt={brand.name} 
                      width={80} 
                      height={80}
                      className="object-contain drop-shadow-sm" 
                      unoptimized={true} 
                    />
                  </div>
                  
                  {/* Clean Text Label */}
                  <span className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-black transition-colors border-b border-transparent group-hover:border-black pb-1">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* MOBILE VIEW (Now 100% colorful all the time) */}
            <div className="lg:hidden grid grid-cols-3 gap-8 px-2 relative z-10">
              {activeBrands.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/shop/Watches?filter=${encodeURIComponent(brand.filter)}`}
                  className="flex flex-col items-center justify-center space-y-3"
                >
                  <div className="relative w-16 h-16 opacity-100">
                    <Image 
                      src={brand.logo} 
                      alt={brand.name} 
                      fill
                      className="object-contain"
                      unoptimized={true}
                    />
                  </div>
                  <span className="text-[9px] font-bold uppercase text-black text-center">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* 4. CUSTOM CURSOR */}
      <div 
        className="hidden lg:block fixed pointer-events-none z-50 w-4 h-4 bg-black rounded-full mix-blend-difference"
        style={{
          left: mousePos.x + (sectionRef.current?.getBoundingClientRect().left || 0),
          top: mousePos.y + (sectionRef.current?.getBoundingClientRect().top || 0),
          transform: `translate(-50%, -50%) ${isHovering ? 'scale(2)' : 'scale(0)'}`,
        }}
      />
    </section>
  );
}