"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Search, ShoppingBag, Menu, X, ChevronDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { discountPercent } from "../lib/utils";
import { useCart } from "../context/CartContext"; 
import { supabase } from "../lib/supabase"; 
import CartDrawer from "./CartDrawer"; // NEW: The Cart Drawer Component

// 1. WE ONLY HARDCODE THE MAIN CATEGORIES NOW
const BASE_CATEGORIES = [
  { label: "Watches", href: "/shop/Watches" },
  { label: "Moissanite", href: "/shop/Moissanite" },
  { label: "Diamond", href: "/shop/Diamond" },
  { label: "Eyeglasses", href: "/shop/Eyeglasses" },
  { label: "Gold", href: "/shop/Gold" },
  { label: "Perfumes", href: "/shop/Perfumes" },
  { label: "Hustle X Lee", href: "/shop/Hustle-X-Lee", isSpecial: true },
];

export default function Navbar() {
  const { cartCount } = useCart(); 

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // NEW: Cart Drawer State
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // DYNAMIC MENU STATE
  const [menuItems, setMenuItems] = useState<any[]>(BASE_CATEGORIES);
  
  // ==========================================
  // LIVE SEARCH STATES
  // ==========================================
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // SECURITY & DYNAMIC MENU FETCHING
  useEffect(() => {
    const sweepDeadPasses = async () => {
      const { error } = await supabase.auth.getUser();
      if (error) await supabase.auth.signOut();
    };
    sweepDeadPasses();

    const fetchSubcategories = async () => {
      const { data, error } = await supabase.from("products").select("category, subcategory");

      if (data && !error) {
        const categoryMap: Record<string, Set<string>> = {};
        data.forEach((item) => {
          if (item.category && item.subcategory) {
            if (!categoryMap[item.category]) categoryMap[item.category] = new Set();
            categoryMap[item.category].add(item.subcategory.trim());
          }
        });

        const updatedMenu = BASE_CATEGORIES.map((menu) => {
          const subs = categoryMap[menu.label];
          if (subs && subs.size > 0 && !menu.isSpecial) {
            return {
              ...menu,
              children: Array.from(subs).sort().map((sub) => ({
                label: sub,
                href: `${menu.href}?filter=${encodeURIComponent(sub)}`, 
              })),
            };
          }
          return menu;
        });
        setMenuItems(updatedMenu);
      }
    };
    fetchSubcategories();
  }, []);

  // Auto-focus search
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [isSearchOpen]);

  // ==========================================
  // THE LIVE SEARCH ENGINE (Runs as you type)
  // ==========================================
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delaySearch = setTimeout(async () => {
      setIsSearching(true);
      
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, sale_price, on_sale, images")
        .ilike("name", `%${searchQuery.trim()}%`)
        .limit(5);

      if (data && !error) {
        setSearchResults(data);
      }
      setIsSearching(false);
    }, 300); 

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Prevent form submission redirect
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const toggleDropdown = (label: string) => {
    if (openDropdown === label) setOpenDropdown(null);
    else setOpenDropdown(label);
  };

  return (
    <motion.nav
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="lee-container relative">
        <div className="flex items-center justify-between h-20">
          
          {/* =========================================
              LIVE SEARCH OVERLAY
             ========================================= */}
          {isSearchOpen ? (
            <div className="absolute inset-0 bg-white z-50 flex items-center justify-between w-full h-full animate-in fade-in duration-300 px-4 md:px-0">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center h-full relative">
                <Search size={22} className="text-gray-400 mr-3 flex-shrink-0" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for watches, diamonds, perfumes..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm md:text-xl text-black placeholder-gray-300 h-full tracking-wide"
                />
              </form>
              
              <button 
                onClick={closeSearch}
                className="ml-4 p-2 text-black hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              {/* LIVE RESULTS DROPDOWN */}
              {searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-100 p-6 md:p-10 max-h-[70vh] overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <Loader2 className="animate-spin mb-3" size={32} />
                      <p className="text-sm font-bold uppercase tracking-widest">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                      {searchResults.map((product) => {
                        const onSale = product.on_sale && product.sale_price && Number(product.sale_price) < Number(product.price);
                        const price = onSale ? product.sale_price : product.price;
                        const off = onSale ? discountPercent(Number(product.price), Number(product.sale_price)) : 0;
                        
                        return (
                          <Link 
                            href={`/product/${product.id}`} 
                            key={product.id}
                            onClick={closeSearch}
                            className="group flex flex-col gap-3"
                          >
                            <div className="aspect-square bg-[#fcfcfc] overflow-hidden relative rounded-sm">
                              <img 
                                src={product.images[0] || "/placeholder.jpg"} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-black truncate group-hover:text-gray-500 transition-colors">
                                {product.name}
                              </h3>
                              <p className={`text-sm font-bold font-mono mt-1 ${onSale ? "text-red-600" : "text-black"}`}>
                                ₦{Number(price).toLocaleString()}
                                {off > 0 && <span className="ml-2 text-[10px] uppercase tracking-widest">{off}% off</span>}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
                        No products found for "{searchQuery}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 1. MOBILE MENU BUTTON */}
              <div className="lg:hidden flex-shrink-0">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 -ml-2 text-black"
                >
                  {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>

              {/* 2. LOGO — centered on the screen on phones, left on desktop */}
              <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:left-auto lg:translate-x-0 lg:flex-none flex justify-center">
                <Link href="/" className="font-heading text-lg sm:text-2xl font-bold tracking-tight uppercase whitespace-nowrap">
                  Lees<span className="font-light"> Jewellers</span>
                </Link>
              </div>

              {/* 3. DESKTOP NAVIGATION */}
              <div className="hidden lg:flex flex-1 justify-center space-x-8 h-full">
                {menuItems.map((item) => (
                  <div key={item.label} className="group relative flex items-center h-full">
                    <Link 
                      href={item.href}
                      className={`flex items-center text-xs font-bold uppercase tracking-widest py-8 transition-colors ${item.isSpecial ? 'text-red-600 hover:text-red-800' : 'text-black hover:text-gray-500'}`}
                    >
                      {item.label}
                      {item.children && <ChevronDown size={14} className="ml-1 opacity-50 group-hover:rotate-180 transition-transform duration-300" />}
                    </Link>

                    {item.children && (
                      <div className="absolute top-[100%] left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 ease-out translate-y-4 group-hover:translate-y-0 z-50">
                        <div className="bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-100 p-8 min-w-[260px] flex flex-col gap-5">
                          {item.children.map((child: any) => (
                            <Link 
                              key={child.label}
                              href={child.href} 
                              className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black hover:translate-x-2 transition-all duration-300 block"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 4. ACTIONS */}
              <div className="flex items-center space-x-5">
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="text-black hover:text-gray-500 transition-colors"
                >
                  <Search size={22} strokeWidth={1.5} />
                </button>
                
                {/* NEW: OPEN CART DRAWER INSTEAD OF LINKING TO PAGE */}
                <button 
                  onClick={() => setIsCartOpen(true)} 
                  className="relative text-black hover:text-gray-500 transition-colors"
                >
                  <ShoppingBag size={22} strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold shadow-sm"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 5. MOBILE MENU DRAWER */}
      {isMobileMenuOpen && !isSearchOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 h-[calc(100vh-80px)] overflow-y-auto shadow-xl fixed w-full z-40">
          <div className="flex flex-col p-4 space-y-2">
            {menuItems.map((item) => (
              <div key={item.label} className="border-b border-gray-50 last:border-none">
                <div className="flex justify-between items-center">
                  <Link 
                    href={item.href}
                    className={`block py-4 text-sm font-bold uppercase tracking-widest ${item.isSpecial ? 'text-red-600' : 'text-black'}`}
                    onClick={() => setIsMobileMenuOpen(false)} 
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button 
                      onClick={() => toggleDropdown(item.label)} 
                      className="p-4 text-gray-500"
                    >
                      <ChevronDown size={16} className={`transform transition-transform duration-300 ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {item.children && (
                  <div 
                    className={`overflow-hidden transition-all duration-300 bg-gray-50 ${
                      openDropdown === item.label ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-4 py-2 space-y-2 mb-2">
                      {item.children.map((child: any) => (
                        <Link 
                          key={child.label} 
                          href={child.href}
                          className="block py-3 text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-black transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. CART DRAWER COMPONENT */}
      <CartDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} />

    </motion.nav>
  );
}