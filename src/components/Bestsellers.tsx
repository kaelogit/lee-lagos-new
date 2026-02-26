"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase"; 
import ProductCard from "./ProductCard";

export default function Bestsellers() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    async function fetchBestsellers() {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_bestseller", true)
        .gt("stock", 0)
        .order("created_at", { ascending: false })
        .limit(8); // Pulling exactly 8 items makes a perfect 2-row grid on desktop

      if (error) {
        console.error("Error fetching bestsellers:", error);
      } else if (data) {
        setProducts(data);
      }
      
      setLoading(false);
    }

    fetchBestsellers();
  }, []);

  // If loading is done and there are no bestsellers, completely hide this section
  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="lee-container">
        
        {/* CENTERED HEADER */}
        <div className="flex flex-col items-center justify-center mb-16 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-widest text-black">
            Bestsellers
          </h2>
          <div className="h-[2px] w-12 bg-black mt-6"></div>
          <p className="text-gray-500 mt-4 text-sm md:text-base tracking-wide max-w-md">
            The products everyone is buying right now.
          </p>
        </div>

        {/* THE EDITORIAL GRID */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="aspect-[4/5] bg-gray-100 w-full"></div>
                <div className="h-3 bg-gray-100 w-1/3"></div>
                <div className="h-4 bg-gray-100 w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
            {products.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        
        

      </div>
    </section>
  );
}