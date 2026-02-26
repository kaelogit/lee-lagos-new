"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";

const PAGE_SIZE = 40; 

// We wrap the main logic in a component to use inside Suspense (required by Next.js for search params)
function ShopContent() {
  const searchParams = useSearchParams(); 
  const searchQuery = searchParams.get('search');
  const categoryFilter = searchParams.get('category');

  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  async function fetchProducts(pageNumber: number, isLoadMore: boolean = false) {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("products")
      .select("*")
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .range(from, to);

    // If they searched for something in the Navbar, filter by name
    if (searchQuery) {
      query = query.ilike("name", `%${searchQuery}%`);
    }
    
    // If they clicked a general category link from the footer
    if (categoryFilter) {
      query = query.ilike("category", `%${categoryFilter}%`);
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

  // TRIGGER FETCH 
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchProducts(0, false);
  }, [searchQuery, categoryFilter]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      {/* SEARCH/SHOP HEADER */}
      <div className="bg-gray-50 border-b border-gray-100 py-16 md:py-24">
        <div className="lee-container text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-widest text-black mb-4">
            {searchQuery 
              ? `Results for "${searchQuery}"` 
              : categoryFilter 
                ? `${categoryFilter} Collection`
                : "All Collections"
            }
          </h1>
          <div className="h-1 w-12 bg-black mx-auto"></div>
          {searchQuery && !loading && (
            <p className="text-gray-500 mt-4 text-sm font-bold uppercase tracking-widest">
              Found {products.length} {products.length === 1 ? 'Item' : 'Items'}
            </p>
          )}
        </div>
      </div>

      <main className="py-16 flex-grow">
        <div className="lee-container">
          
          {loading && (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="py-20 text-center border border-gray-100 bg-gray-50/50">
              <p className="text-gray-500 text-sm uppercase tracking-widest mb-4 font-bold">
                {searchQuery ? `No products match your search.` : "No products available right now."}
              </p>
              <button 
                onClick={() => window.location.href = '/shop'}
                className="text-black border-b border-black pb-1 text-xs font-bold uppercase tracking-widest hover:text-gray-500 hover:border-gray-500 transition-colors"
              >
                Clear Search & View All
              </button>
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
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ShopContent />
    </Suspense>
  );
}