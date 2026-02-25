"use client";

import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { X, Trash2, ArrowRight, ShoppingBag, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function CartDrawer({ isOpen, setIsOpen }: CartDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const router = useRouter();

  const hasDropItem = cartItems.some(item => item.is_drop);

  // ==========================================
  // PREVENT BACKGROUND SCROLLING WHEN OPEN
  // ==========================================
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const closeDrawer = () => setIsOpen(false);

  const goToCheckout = () => {
    closeDrawer();
    router.push("/checkout");
  };

  return (
    <>
      {/* 1. DARK OVERLAY BACKGROUND */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
      />

      {/* 2. THE FLOATING ISLAND CART */}
      <div 
        className={`fixed z-[101] bg-white flex flex-col shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]
          top-4 right-4 left-4 sm:left-auto sm:w-[440px] max-h-[calc(100vh-32px)] rounded-2xl overflow-hidden
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom
          ${isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-16 opacity-0 scale-95 pointer-events-none"}
        `}
      >
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shrink-0">
          <h2 className="font-heading text-xl font-bold uppercase tracking-widest text-black flex items-center gap-3">
            Your Bag
            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] tracking-normal font-sans">
              {cartItems.length}
            </span>
          </h2>
          <button 
            onClick={closeDrawer} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        {/* CART ITEMS */}
        <div className="flex-1 overflow-y-auto p-6 bg-white scrollbar-hide">
          {cartItems.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                <ShoppingBag size={32} strokeWidth={1} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Your bag is empty</p>
                <p className="text-xs text-gray-500">Discover our latest collections and find your next piece.</p>
              </div>
              <button 
                onClick={closeDrawer}
                className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors mt-4"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* DROP NOTICE */}
              {hasDropItem && (
                <div className="p-4 bg-gray-50 rounded-xl flex items-start gap-3 border border-gray-100">
                  <Clock size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black leading-relaxed">
                    Note: Your bag contains Sunday Drop items. These pieces will ship as soon as they officially release.
                  </p>
                </div>
              )}

              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-5 group relative">
                  
                  {/* Item Image */}
                  <Link href={`/product/${item.id}`} onClick={closeDrawer} className="relative w-20 h-28 bg-[#fcfcfc] overflow-hidden shrink-0 block rounded-lg">
                    <Image 
                      src={item.image || "/placeholder.jpg"} 
                      alt={item.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" 
                    />
                  </Link>

                  {/* Item Details */}
                  <div className="flex flex-col flex-1 py-1">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <Link href={`/product/${item.id}`} onClick={closeDrawer} className="text-sm font-bold text-black leading-snug line-clamp-2 hover:text-gray-500 transition-colors pr-2">
                        {item.name}
                      </Link>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 shrink-0"
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-auto">
                      {item.category}
                    </p>

                    <div className="flex items-end justify-between mt-4">
                      
                      {/* FIX: CORRECTLY PASSING +1 and -1 TO CONTEXT */}
                      <div className="flex items-center border border-gray-200 rounded-lg h-9 overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold font-mono border-x border-gray-100">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        {item.original_price && (
                          <p className="text-[10px] text-gray-400 line-through font-mono">
                            ₦{(item.original_price * item.quantity).toLocaleString()}
                          </p>
                        )}
                        <p className={`text-sm font-bold font-mono ${item.original_price ? 'text-red-600' : 'text-black'}`}>
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50 shrink-0">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Subtotal</span>
              <span className="font-heading text-2xl font-bold text-black font-mono tracking-tight">
                ₦{cartTotal.toLocaleString()}
              </span>
            </div>
            
            <button 
              onClick={goToCheckout}
              className="w-full bg-black text-white h-14 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-gray-900 transition-colors group shadow-lg shadow-black/20"
            >
               Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}