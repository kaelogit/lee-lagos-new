"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Check } from "lucide-react"; 
import { useCart } from "../context/CartContext"; 

interface ProductProps {
  product: any;
}

export default function ProductCard({ product }: ProductProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);

  // 1. CHECK DROP STATUS ON MOUNT
  useEffect(() => {
    if (product.is_drop && product.release_date) {
      const now = new Date().getTime();
      const releaseTime = new Date(product.release_date).getTime();
      
      if (releaseTime > now) {
        setIsDropActive(true);
      } else {
        setIsDropActive(false);
      }
    } else {
      setIsDropActive(false);
    }
  }, [product]);

  // 2. SMART PRICE LOGIC
  const standardPrice = Number(product.price);
  let currentPrice = standardPrice;
  let originalPrice = null;

  if (isDropActive && product.early_access_price) {
    currentPrice = Number(product.early_access_price);
    originalPrice = standardPrice;
  } else if (product.on_sale && product.sale_price) {
    currentPrice = Number(product.sale_price); 
    originalPrice = standardPrice; 
  }

  const discount = originalPrice && originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // SAFE IMAGE CHECKER
  const mainImage = product.images?.[0] || "/placeholder.jpg";
  const hoverImage = product.images?.[1] || null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    
    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice, 
      original_price: originalPrice,
      image: mainImage,
      quantity: 1, 
      category: product.category,
      is_drop: isDropActive,
      release_date: product.release_date  
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group relative flex flex-col gap-3">
      
      {/* =========================================
          1. THE IMAGE CONTAINER (Plain & Clean)
         ========================================= */}
      <div className="relative aspect-square md:aspect-[4/5] w-full overflow-hidden rounded-sm">
        <Link href={`/product/${product.id}`} className="block h-full w-full">
          
          {/* Main Image (Fades out and zooms slowly on hover) */}
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-[800ms] ease-out group-hover:scale-105 ${
              hoverImage ? "group-hover:opacity-0" : ""
            }`}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          
          {/* Secondary Image (Fades in and zooms slowly on hover) */}
          {hoverImage && (
            <Image
              src={hoverImage}
              alt={product.name}
              fill
              className="object-cover opacity-0 transition-all duration-[800ms] ease-out group-hover:scale-105 group-hover:opacity-100"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          )}
        </Link>

        {/* =========================================
            2. THE MARKETING BADGES (Now with rounded pill shapes)
           ========================================= */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none z-10 items-start">
          
          {isDropActive && (
            <span className="bg-black text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-sm flex items-center gap-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              Drop
            </span>
          )}

          {product.is_new_arrival && !isDropActive && (
            <span className="bg-white text-black border border-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-sm rounded-full">
              New
            </span>
          )}

          {product.on_sale && !isDropActive && discount > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-sm rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* =========================================
            3. ACTION BUTTONS (Floating Add to Bag)
           ========================================= */}
        <button 
          onClick={handleAddToCart}
          disabled={isAdded || (!product.in_stock && !isDropActive)}
          className={`absolute bottom-3 right-3 p-3 rounded-full shadow-md transition-all duration-300 flex items-center justify-center z-10 ${
            isAdded 
              ? 'bg-green-600 text-white scale-110' 
              : 'bg-white text-black border border-gray-100 hover:bg-black hover:text-white hover:border-black active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
          title={isDropActive ? "Pre-Order" : "Add to Bag"}
        >
          {isAdded ? <Check size={18} strokeWidth={2} /> : <ShoppingBag size={18} strokeWidth={2} />}
        </button>
      </div>

      {/* =========================================
          4. THE INFO STACK
         ========================================= */}
      <div className="flex flex-col gap-1 px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {product.subcategory || product.category}
        </span>

        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-bold text-black leading-snug hover:text-gray-500 transition-colors truncate">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1">
          {originalPrice ? (
            <>
              <span className="text-xs text-gray-400 line-through decoration-gray-300">
                ₦{originalPrice.toLocaleString()}
              </span>
              <span className={`text-sm font-bold ${isDropActive ? 'text-black' : 'text-red-600'}`}>
                ₦{currentPrice.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-black">
              ₦{currentPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}