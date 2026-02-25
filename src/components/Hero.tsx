import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="lee-container py-4 lg:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 h-auto lg:h-[600px]">
        
        {/* =========================================
            1. THE MAIN HERO (60% Desktop, Full Width Mobile)
           ========================================= */}
        <div className="lg:col-span-7 relative group overflow-hidden rounded-sm h-[400px] lg:h-full">
          <Link href="/shop/Moissanite" className="block w-full h-full">
            <div className="absolute inset-0 w-full h-full">
              {/* FIXED SRC PATH */}
              <Image 
                src="/moissanite.png" 
                alt="Moissanite Collection"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority 
              />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-500" />
            </div>

            <div className="absolute bottom-0 left-0 p-6 lg:p-12 w-full">
              <span className="inline-block px-2 py-1 mb-3 text-[10px] lg:text-xs font-bold tracking-[0.2em] text-black bg-white uppercase shadow-sm">
                Premium Selection
              </span>
              <h2 className="text-3xl lg:text-6xl font-heading font-bold text-white mb-3 leading-tight">
                Moissanite <br className="hidden lg:block"/> Elite.
              </h2>
              <p className="text-white/90 text-sm lg:text-lg font-light mb-6 max-w-md line-clamp-2 lg:line-clamp-none">
                Unrivaled brilliance. Hand-set stones designed for those who demand the best.
              </p>
              
              <button className="bg-white text-black px-6 lg:px-8 py-2.5 lg:py-3 font-bold uppercase tracking-widest text-[10px] lg:text-sm hover:bg-black hover:text-white transition-colors shadow-lg">
                Shop Collection
              </button>
            </div>
          </Link>
        </div>

        {/* =========================================
            2. THE SIDE STACK (40% Desktop, 50/50 Mobile)
           ========================================= */}
        <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4 h-[250px] lg:h-full">
          
          {/* TOP CARD: EYEGLASSES */}
          <div className="relative group overflow-hidden rounded-sm h-full">
            <Link href="/shop/Eyeglasses" className="block w-full h-full">
              {/* FIXED SRC PATH */}
              <Image 
                src="/eyeglasses.png" 
                alt="Designer Eyeglasses"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />
              
              <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6">
                <h3 className="text-sm lg:text-2xl font-heading font-bold text-white mb-1 lg:mb-2 uppercase tracking-wide drop-shadow-md">
                  Eyeglasses
                </h3>
                <span className="text-white text-[9px] lg:text-sm font-bold border-b border-white pb-0.5">
                  View All
                </span>
              </div>
            </Link>
          </div>

          {/* BOTTOM CARD: PERFUMES */}
          <div className="relative group overflow-hidden rounded-sm h-full">
            <Link href="/shop/Perfumes" className="block w-full h-full">
              {/* FIXED SRC PATH */}
              <Image 
                src="/perfumes.png" 
                alt="Signature Scents"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />

              <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6">
                <h3 className="text-sm lg:text-2xl font-heading font-bold text-white mb-1 lg:mb-2 uppercase tracking-wide drop-shadow-md">
                  Perfumes
                </h3>
                <span className="text-white text-[9px] lg:text-sm font-bold border-b border-white pb-0.5">
                  Shop Now
                </span>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}