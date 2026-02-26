"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { supabase } from "../lib/supabase"; 

export default function OnSale() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSaleItems() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("on_sale", true)
        .gt("stock", 0)
        .order("created_at", { ascending: false })
        .limit(10); 

      if (data) setProducts(data);
      setLoading(false);
    }
    fetchSaleItems();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400; 
      if (direction === 'left') scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      else scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-[#fcfcfc] py-20 lg:py-24 border-y border-gray-100">
      <div className="lee-container">
        
        {/* HEADER */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag size={14} className="text-red-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-600">
                Limited Time
              </span>
            </div>
            <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-widest text-black">
              On sales
            </h2>
          </div>

          <div className="hidden md:flex gap-3">
            <button onClick={() => scroll('left')} className="w-14 h-14 flex items-center justify-center border border-gray-200 text-black hover:bg-black hover:text-white transition-colors rounded-full">
              <ChevronLeft size={24} strokeWidth={1.5} />
            </button>
            <button onClick={() => scroll('right')} className="w-14 h-14 flex items-center justify-center border border-gray-200 text-black hover:bg-black hover:text-white transition-colors rounded-full">
              <ChevronRight size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* THE SLIDER (SEAMLESS EDGE-TO-EDGE) */}
        {loading ? (
          <div className="flex overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shrink-0 w-[350px] h-[480px] md:w-[450px] md:h-[600px] bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div ref={scrollRef} className="flex overflow-x-auto pb-10 scrollbar-hide snap-x snap-mandatory">
            {products.map((product) => {
              const standardPrice = Number(product.price);
              const salePrice = Number(product.sale_price);

              return (
                <Link 
                  href={`/product/${product.id}`} 
                  key={product.id} 
                  className="relative block shrink-0 snap-center w-[350px] h-[480px] md:w-[450px] md:h-[600px] overflow-hidden group shadow-sm hover:shadow-xl transition-shadow duration-300"
                >
                  {/* IMAGE */}
                  <img
                    src={product.images[0] || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />

                  {/* THE EDITORIAL SPLIT-BADGE */}
                  <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 flex shadow-2xl pointer-events-none z-10">
                    
                    {/* Retail Price Side (Solid Black) */}
                    <div className="bg-black px-4 py-3 md:px-5 md:py-4 flex flex-col justify-center">
                      <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-1">
                        Retail
                      </span>
                      <span className="text-xs md:text-sm font-mono text-gray-500 line-through decoration-gray-500">
                        ₦{standardPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Sale Price Side (Solid White) */}
                    <div className="bg-white px-4 py-3 md:px-5 md:py-4 flex flex-col justify-center">
                      <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-red-600 mb-1">
                        Now
                      </span>
                      <span className="text-sm md:text-lg font-bold font-mono text-black">
                        ₦{salePrice.toLocaleString()}
                      </span>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}