"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; 
import ProductCard from "./ProductCard";
import Link from "next/link";

export default function NewArrivals() {
  const [activeTab, setActiveTab] = useState("All");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // To hold our dynamic list of categories
  const [availableTabs, setAvailableTabs] = useState<string[]>(["All"]);

  // FETCH DATA
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      // 1. Ask Supabase for ONLY items marked as "New Arrival"
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_new_arrival", true)
        .gt("stock", 0)
        .order("created_at", { ascending: false }); // Newest first

      // 2. If they clicked a specific tab, filter by that category
      if (activeTab !== "All") {
        query = query.eq("category", activeTab);
      }

      // 3. Limit to 8 items so the homepage doesn't get too long
      query = query.limit(12);

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching products:", error);
      } else if (data) {
        setProducts(data);

        // Smart Tabs Logic: If we are on the "All" tab, figure out what categories actually exist in these new arrivals
        if (activeTab === "All") {
          const categories = Array.from(new Set(data.map(p => p.category)));
          setAvailableTabs(["All", ...categories]);
        }
      }
      
      setLoading(false);
    }

    fetchProducts();
  }, [activeTab]);

  return (
    <section className="lee-container py-16 lg:py-24 animate-in fade-in duration-700">
      
      {/* 1. HEADER & TABS (Mobile Optimized) */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 space-y-8 md:space-y-0">
        
        {/* Title */}
        <div className="text-center md:text-left shrink-0 md:pr-8">
          <h2 className="font-heading text-3xl font-bold uppercase tracking-widest text-black">
            Just Landed
          </h2>
          <div className="h-1 w-12 bg-black mt-3 mx-auto md:mx-0"></div>
        </div>

        {/* Smart Dynamic Tabs - Scrollbars completely nuked via CSS while retaining swipe */}
        <div className="w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center justify-start md:justify-end space-x-8 border-b border-gray-100 min-w-max px-1">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap py-4 ${
                  activeTab === tab 
                    ? "text-black border-b-2 border-black" 
                    : "text-gray-400 hover:text-gray-800 border-b-2 border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. THE PRODUCT GRID OR LOADING STATE */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-3">
              <div className="aspect-square md:aspect-[4/5] bg-gray-100 rounded-sm w-full"></div>
              <div className="h-3 bg-gray-100 rounded w-1/3"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/4 mt-2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} /> 
            ))}
          </div>

          {/* Empty State */}
          {products.length === 0 && (
            <div className="text-center py-24 bg-gray-50 border border-gray-100 rounded-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">No new arrivals in this collection right now.</p>
            </div>
          )}

          
        </>
      )}

    </section>
  );
}