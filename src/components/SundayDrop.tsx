"use client";

import { useState, useEffect, useRef } from "react";
import ProductImage from "./ProductImage";
import Link from "next/link";
import { Lock, ShoppingBag, Eye, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext"; 

// A type for our timer objects
type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

export default function SundayDrop() {
  const [items, setItems] = useState<any[]>([]); 
  const [revealed, setRevealed] = useState<number[]>([]);
  
  // NEW: A dictionary to store individual timers for EVERY product ID
  const [timers, setTimers] = useState<Record<string, TimeLeft>>({});
  
  // Cart Hook
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<string[]>([]); 

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. FETCH REAL DATA
  useEffect(() => {
    async function fetchDrops() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_drop', true)
        .gt('stock', 0)
        .limit(6);
      
      if (data && data.length > 0) {
        // FILTER: Only keep items where the release_date is still in the future
        const now = new Date().getTime();
        const activeDrops = data.filter(item => new Date(item.release_date).getTime() > now);
        setItems(activeDrops);
      }
    }
    fetchDrops();
  }, []);

  // 2. INDIVIDUAL COUNTDOWN LOGIC
  useEffect(() => {
    if (items.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      let hasExpiredItems = false;
      const newTimers: Record<string, TimeLeft> = {};

      items.forEach(item => {
        const releaseTime = new Date(item.release_date).getTime();
        const difference = releaseTime - now;

        if (difference > 0) {
          // Calculate the specific time left for this exact item
          newTimers[item.id] = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
          };
        } else {
          // If THIS specific item hits 0, flag the system to remove it
          hasExpiredItems = true;
        }
      });

      setTimers(newTimers);

      // If any items expired during this tick, immediately filter them out of the array
      if (hasExpiredItems) {
        setItems(prevItems => prevItems.filter(item => new Date(item.release_date).getTime() > now));
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [items]);

  // 3. REVEAL FUNCTION
  const toggleReveal = (id: number) => {
    if (!revealed.includes(id)) {
      setRevealed([...revealed, id]);
    }
  };

  // 4. ADD TO CART FUNCTION
  const handleSecureNow = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: Number(item.early_access_price), 
      original_price: Number(item.price),      
      image: item.images[0],
      quantity: 1,
      category: item.category,
      is_drop: item.is_drop,           
      release_date: item.release_date  
    });

    setAddedItems((prev) => [...prev, item.id]);
    setTimeout(() => {
      setAddedItems((prev) => prev.filter(id => id !== item.id));
    }, 2000);
  };

  // 5. SCROLL FUNCTIONS
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // HIDE SECTION ENTIRELY IF NO ACTIVE DROPS EXIST
  if (items.length === 0) return null;

  return (
    <section className="bg-[#050505] text-white py-24 overflow-hidden relative border-y border-white/10">
      
      {/* AMBIENT GLOW BACKGROUND */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="lee-container relative z-10">
        
        {/* HEADER */}
        <div className="flex items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.8)] bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-green-500">
                Incoming Shipments
              </span>
            </div>
            <h2 className="font-heading text-4xl lg:text-6xl font-bold uppercase tracking-tighter text-white leading-none drop-shadow-md">
              The Sunday Drop.
            </h2>
          </div>

          {/* CONTROLS (Desktop) */}
          <div className="hidden lg:flex gap-3">
            <button onClick={() => scroll('left')} className="p-3 bg-black/50 backdrop-blur-md border border-white/10 hover:border-white hover:bg-white hover:text-black transition-all rounded-full">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll('right')} className="p-3 bg-black/50 backdrop-blur-md border border-white/10 hover:border-white hover:bg-white hover:text-black transition-all rounded-full">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* SLIDER */}
        <div 
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide snap-x snap-mandatory"
        >
          {items.map((item) => {
            const isRevealed = revealed.includes(item.id);
            const isItemAdded = addedItems.includes(item.id);
            // Grab this specific item's timer (default to 0 if it hasn't loaded yet)
            const myTimer = timers[item.id] || { days: 0, hours: 0, minutes: 0, seconds: 0 };

            return (
              <div 
                key={item.id} 
                className="relative min-w-[300px] md:min-w-[380px] bg-[#0A0A0A] border border-white/10 snap-center group rounded-xl overflow-hidden shadow-2xl flex flex-col"
              >
                {/* IMAGE CONTAINER */}
                <div className="relative aspect-[4/5] overflow-hidden bg-white">
                  <ProductImage
                    src={item.images?.[0]}
                    alt={item.name}
                    fill
                    className={`object-cover transition-all duration-[1500ms] ease-out ${
                      isRevealed ? "scale-100 blur-0" : "scale-125 blur-2xl opacity-40"
                    }`}
                  />

                  {/* PREMIUM FROSTED PRIVACY GLASS */}
                  {!isRevealed && (
                    <div 
                      onClick={() => toggleReveal(item.id)}
                      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-20 bg-black/40 backdrop-blur-md hover:bg-black/30 transition-all duration-500"
                    >
                      <div className="bg-black/80 border border-white/20 p-5 rounded-full mb-5 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                        <Lock className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white drop-shadow-md">
                        Tap to Reveal
                      </span>
                    </div>
                  )}

                  {/* UNLOCKED BADGE */}
                  {isRevealed && (
                    <div className="absolute top-5 left-5 z-10 pointer-events-none">
                      <span className="bg-black/90 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-2xl rounded-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Unlocked
                      </span>
                    </div>
                  )}
                </div>

                {/* INFO SECTION */}
                <div className="p-6 relative z-10 bg-[#0A0A0A] flex-1 flex flex-col">
                  <Link href={`/product/${item.id}`}>
                    <h3 className="text-xl font-bold text-white mb-1 truncate hover:text-gray-400 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-6">
                    {item.category}
                  </p>
                  
                  <div className="flex items-end justify-between pb-6 border-b border-white/10 mb-6">
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1.5">Standard Retail</p>
                      <p className="text-sm text-gray-600 line-through decoration-white/20 font-medium">
                        ₦{Number(item.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mb-1.5 animate-pulse">Early Access</p>
                      <p className="text-xl font-bold text-white tracking-tight">
                        ₦{Number(item.early_access_price).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* INDIVIDUAL SMART TIMER */}
                  <div className="flex gap-2 mb-6 mt-auto">
                    {[
                      { label: 'Days', val: myTimer.days },
                      { label: 'Hrs', val: myTimer.hours },
                      { label: 'Mins', val: myTimer.minutes },
                      { label: 'Secs', val: myTimer.seconds }
                    ].map((unit, idx) => (
                      <div key={idx} className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-center">
                        <span className="block font-mono text-lg font-bold text-white tracking-widest">
                          {String(unit.val).padStart(2, '0')}
                        </span>
                        <span className="block text-[8px] uppercase tracking-widest text-gray-500 mt-1">
                          {unit.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ACTION BUTTON */}
                  <button 
                    disabled={!isRevealed}
                    onClick={() => handleSecureNow(item)}
                    className={`w-full font-bold uppercase text-xs py-4 md:py-5 tracking-[0.2em] flex items-center justify-center gap-3 transition-all rounded-sm shrink-0 ${
                      !isRevealed 
                        ? 'bg-[#151515] text-gray-600 cursor-not-allowed border border-transparent'
                        : isItemAdded
                          ? 'bg-green-600 text-white cursor-default shadow-[0_0_20px_rgba(22,163,74,0.4)]'
                          : 'bg-white text-black hover:bg-gray-200 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                    }`}
                  >
                    {!isRevealed ? (
                      <><Eye size={16} /> Reveal to Buy</>
                    ) : isItemAdded ? (
                      <><Check size={16} /> Added to Bag</>
                    ) : (
                      <><ShoppingBag size={16} /> Buy Now</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}