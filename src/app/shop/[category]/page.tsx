"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image"; 
import { supabase } from "../../../lib/supabase";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ProductCard from "../../../components/ProductCard";

const PAGE_SIZE = 40; 

export default function CategoryPage() {
  const { category } = useParams();
  const searchParams = useSearchParams(); 
  const activeFilter = searchParams.get('filter');

  const [products, setProducts] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>(["All"]);
  
  // FIX 1: Initialize directly with the URL filter so it never accidentally searches "All" first
  const [activeSub, setActiveSub] = useState(activeFilter || "All");
  
  // State for Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const bgImage = `/${String(category).toLowerCase().replace(/[^a-z0-9]/g, "")}collection.png`;

  // 1. SYNC TABS & URL FILTER
  useEffect(() => {
    const categoryName = decodeURIComponent(String(category));

    async function fetchTabs() {
      const { data } = await supabase
        .from("products")
        .select("subcategory")
        .ilike("category", categoryName)
        .limit(1000); 

      if (data) {
        const subs = Array.from(new Set(data.map((p) => p.subcategory).filter(Boolean)));
        setSubcategories(["All", ...subs.sort()]);
      }
    }

    if (activeFilter) {
      setActiveSub(activeFilter);
    } else {
      setActiveSub("All");
    }

    fetchTabs();
  }, [category, activeFilter]);

  // 2. FETCH PRODUCTS (FIX 2: Accept targetSub directly so it never uses old data)
  async function fetchProducts(pageNumber: number, targetSub: string, isLoadMore: boolean = false) {
    if (!category) return;
    
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    const categoryName = decodeURIComponent(String(category));
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("products")
      .select("*")
      .ilike("category", categoryName)
      .range(from, to);

    if (targetSub !== "All") {
      // FIX 3: Using 'ilike' instead of 'eq' makes it case-insensitive (Matches Rolex and rolex)
      query = query.ilike("subcategory", `%${targetSub}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
    } else if (data) {
      if (isLoadMore) {
        setProducts((prev) => [...prev, ...data]);
      } else {
        setProducts(data);
      }

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    }

    setLoading(false);
    setLoadingMore(false);
  }

  // 3. TRIGGER FETCH (Passes current activeSub safely)
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchProducts(0, activeSub, false);
  }, [activeSub, category]);

  // 4. HANDLERS
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, activeSub, true);
  };

  const handleFilterClick = (sub: string) => {
    setActiveSub(sub);
  };

  const formatTitle = (slug: string) => {
    return decodeURIComponent(slug).replace(/-/g, " ").toUpperCase();
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="relative w-full h-[35vh] md:h-[40vh] overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-70">
           <Image 
             src={bgImage} 
             alt="Collection Header" 
             fill 
             className="object-cover"
             priority
           />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

        <div className="relative z-10 h-full flex items-end pb-12 md:pb-16">
          <div className="lee-container w-full">
            <div className="text-left animate-in slide-in-from-bottom duration-700">
              <span className="inline-block py-1 px-3 border border-yellow-500/50 rounded-full bg-black/30 backdrop-blur-md text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-400 mb-4">
                Browse Collection
              </span>
              <h1 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white drop-shadow-2xl">
                {category ? formatTitle(String(category)) : "Collection"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <main className="py-12">
        <div className="lee-container">
          
          {subcategories.length > 1 && (
            <div className="relative mb-12">
              <div className="flex overflow-x-auto whitespace-nowrap gap-3 pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => handleFilterClick(sub)}
                    className={`flex-shrink-0 text-[10px] md:text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-all border ${
                      activeSub === sub
                        ? "bg-black text-white border-black shadow-lg"
                        : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
              <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
            </div>
          )}

          {loading && (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">
                No products found in this collection.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {!loading && hasMore && products.length > 0 && (
            <div className="mt-20 text-center">
              <button 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-block bg-white border border-black text-black px-12 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More Collection"}
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}