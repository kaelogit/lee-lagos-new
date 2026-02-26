"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { 
  ShoppingBag, MessageCircle, Share2, 
  ChevronLeft, ChevronRight, Plus, Minus, X, Copy, Check, Clock 
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ProductCard from "../../../components/ProductCard";
import { useCart } from "../../../context/CartContext";

export default function ProductClientPage({ id }: { id: string }) {
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // BAG STATES
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  // SHARE BOX STATES
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // INFO LIST STATE
  const [openSection, setOpenSection] = useState<string | null>("description");

  // DROP & TIMER STATES
  const [isDropActive, setIsDropActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const sliderRef = useRef<HTMLDivElement>(null);

  // GET DATA FROM DATABASE
  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);

      const { data: mainProduct, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setProduct(mainProduct);

      const { data: related } = await supabase
        .from("products")
        .select("*")
        .eq("category", mainProduct.category)
        .neq("id", id)
        .limit(8);

      if (related) setRelatedProducts(related);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  // LIVE COUNTDOWN TIMER
  useEffect(() => {
    if (!product) return;

    if (product.is_drop && product.release_date) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const releaseTime = new Date(product.release_date).getTime();
        const diff = releaseTime - now;

        if (diff <= 0) {
          setIsDropActive(false);
          setTimeLeft("00:00:00");
        } else {
          setIsDropActive(true);
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          const formatted = `${days > 0 ? `${days}d ` : ''}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          setTimeLeft(formatted);
        }
      };

      updateTimer(); 
      const intervalId = setInterval(updateTimer, 1000);

      return () => clearInterval(intervalId); 
    } else {
      setIsDropActive(false);
    }
  }, [product]);

  const handleQuantity = (type: 'inc' | 'dec') => {
    if (type === 'dec' && quantity > 1) setQuantity(prev => prev - 1);
    if (type === 'inc') setQuantity(prev => prev + 1);
  };

  // SMART PRICE LOGIC
  const standardPrice = product ? Number(product.price) : 0;
  let currentPrice = standardPrice;
  let originalPrice = null;

  if (product) {
    if (isDropActive && product.early_access_price) {
      currentPrice = Number(product.early_access_price);
      originalPrice = standardPrice;
    } else if (product.on_sale && product.sale_price) {
      currentPrice = Number(product.sale_price);
      originalPrice = standardPrice;
    }
  }

  // ADD TO BAG
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice, 
      original_price: originalPrice,
      image: product.images[0],
      quantity: quantity,
      category: product.category,
      is_drop: isDropActive,            
      release_date: product.release_date  
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000); 
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this ${product.name} on Lee Lagos.`);
    
    let link = "";
    if (platform === 'whatsapp') link = `https://wa.me/?text=${text}%20${url}`;
    else if (platform === 'facebook') link = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    else if (platform === 'twitter') link = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    else { copyToClipboard(); return; }

    if (link) window.open(link, '_blank');
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Item not found.</div>;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="lee-container">
          
          {/* BREADCRUMBS & NAVIGATION (Fixed for Mobile Inline) */}
          <div className="flex flex-row items-center justify-between gap-4 mb-6 md:mb-8 border-b border-gray-100 pb-4">
            <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Link href="/" className="hover:text-black">Home</Link> 
              <span>/</span>
              <Link href={`/shop/${product.category}`} className="hover:text-black">Shop</Link>
              <span>/</span>
              <span className="text-black truncate max-w-[80px] md:max-w-none">{product.category}</span>
            </div>

            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <Link href={`/product/${product.id}`} className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">
                <ChevronLeft size={14} /> Prev
              </Link>
              <div className="h-3 w-[1px] bg-gray-300"></div>
              <Link href={`/product/${product.id}`} className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">
                Next <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 mb-24">
            
            {/* PHOTOS (Removed Borders) */}
            <div className="space-y-4 h-fit">
              <div className="relative aspect-square bg-[#fcfcfc] overflow-hidden rounded-sm">
                <Image src={product.images[activeImage] || "/placeholder.jpg"} alt={product.name} fill className="object-cover" priority />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img: string, idx: number) => (
                    <button key={idx} onClick={() => setActiveImage(idx)} className={`relative w-16 h-16 flex-shrink-0 bg-[#fcfcfc] rounded-sm overflow-hidden transition-all border-2 ${activeImage === idx ? "border-black" : "border-transparent hover:border-gray-300"}`}>
                      <div className="absolute inset-0"><Image src={img} alt="Thumbnail" fill className="object-cover" /></div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT DETAILS */}
            <div className="flex flex-col justify-center">
              <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-tighter mb-2 text-black leading-none mt-4 md:mt-0">
                {product.name}
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                Ref: LEE-{product.id.substring(0, 8).toUpperCase()}
              </p>

              {/* DROP BANNER */}
              {isDropActive && (
                <div className="bg-black text-white p-5 rounded-lg mb-6 shadow-md border border-gray-800 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-red-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">The Sunday Drop. Active.</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">
                    Get this piece at the exclusive drop price. Once the timer ends, It will be dropped at the standard price, if it hasn't sold out first.
                  </p>
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/10">
                    <span className="text-xs text-gray-400 uppercase tracking-widest flex-1">Drop Ends In:</span>
                    <span className="text-sm font-bold tracking-wider text-yellow-400 font-mono drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                      {timeLeft}
                    </span>
                  </div>
                </div>
              )}

              {/* PRICE */}
              <div className="mb-8">
                <div className="flex items-baseline gap-3">
                  <span className={`text-3xl font-bold ${isDropActive || product.on_sale ? 'text-red-600' : 'text-black'}`}>
                    ₦{currentPrice.toLocaleString()}
                  </span>
                  
                  {originalPrice && (
                    <span className="text-lg text-gray-400 line-through decoration-gray-400">
                      ₦{originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                {!isDropActive && (
                   <span className="text-sm text-green-600 font-bold uppercase tracking-wide block mt-2">
                     {product.in_stock ? "In Stock" : "Out of Stock"}
                   </span>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-4 mb-4 h-14">
                <div className="flex items-center border border-gray-300 w-32 shrink-0 rounded-lg overflow-hidden">
                   <button onClick={() => handleQuantity('dec')} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-lg transition-colors">-</button>
                   <div className="flex-1 h-full flex items-center justify-center text-sm font-bold border-x border-gray-200">{quantity}</div>
                   <button onClick={() => handleQuantity('inc')} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-lg transition-colors">+</button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={!product.in_stock && !isDropActive}
                  className={`flex-1 text-white h-full flex items-center justify-center gap-3 uppercase font-bold tracking-widest text-xs transition-all rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${isAdded ? 'bg-green-600 hover:bg-green-700' : 'bg-black hover:bg-gray-800'}`}
                >
                  {isAdded ? <Check size={18} /> : <ShoppingBag size={18} />} 
                  {isAdded ? "Added" : isDropActive ? "Buy Now" : !product.in_stock ? "Sold Out" : "Add to Bag"}
                </button>
              </div>

              {/* HELP & SHARE */}
              <div className="flex gap-2 mb-12">
                <a 
  href={`https://wa.me/2349160003594?text=${encodeURIComponent(`Hello Lee Lagos, I am interested in the ${product.name} (Qty: ${quantity}). Could you please send me a video of this soon as you're chanced so I can see the details? Thank you!`)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex-1 bg-white border border-gray-300 text-black h-14 flex items-center justify-center gap-3 uppercase font-bold tracking-widest text-xs hover:bg-gray-50 hover:border-black transition-all rounded-lg"
>
  <MessageCircle size={18} /> Request Video
</a>
                
                <button 
                  onClick={() => setIsShareOpen(true)}
                  className="w-14 h-14 border border-gray-300 text-black flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all rounded-lg"
                >
                  <Share2 size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* INFO LIST */}
              <div className="border-t border-gray-200">
                <div className="border-b border-gray-200">
                  <button onClick={() => setOpenSection(openSection === 'description' ? null : 'description')} className="w-full py-5 flex items-center justify-between text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
                    Description
                    {openSection === 'description' ? <Minus size={14} /> : <Plus size={14} />}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openSection === 'description' ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                    <p className="text-sm text-gray-600 leading-relaxed">{product.description || "Crafted for excellence."}</p>
                  </div>
                </div>
                
                
                <div className="border-b border-gray-200">
                  <button onClick={() => setOpenSection(openSection === 'delivery' ? null : 'delivery')} className="w-full py-5 flex items-center justify-between text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
                    Delivery & Returns
                    {openSection === 'delivery' ? <Minus size={14} /> : <Plus size={14} />}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openSection === 'delivery' ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                    <p className="text-sm text-gray-600 leading-relaxed"><strong>Lagos:</strong> Same Day Delivery.<br/><strong>Global:</strong> 3-5 Business Days</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SIMILAR ITEMS */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-gray-100 pt-16">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-heading text-xl font-bold uppercase tracking-widest">You May Also Like</h3>
                <div className="flex gap-2">
                  <button onClick={() => scrollSlider('left')} className="p-2 border border-gray-200 hover:bg-black hover:text-white transition-colors rounded-lg"><ChevronLeft size={20} /></button>
                  <button onClick={() => scrollSlider('right')} className="p-2 border border-gray-200 hover:bg-black hover:text-white transition-colors rounded-lg"><ChevronRight size={20} /></button>
                </div>
              </div>
              <div ref={sliderRef} className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory">
                {relatedProducts.map((item) => (
                  <div key={item.id} className="min-w-[200px] md:min-w-[220px] snap-start">
                    <ProductCard product={item} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* SHARE MODAL */}
      {isShareOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsShareOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Share this piece</h3>
              <button onClick={() => setIsShareOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              <button onClick={() => shareToSocial('whatsapp')} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 bg-[#25D366]/10 rounded-full flex items-center justify-center group-hover:bg-[#25D366] transition-colors duration-300"><MessageCircle size={24} className="text-[#25D366] group-hover:text-white" /></div><span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">WhatsApp</span>
              </button>
              <button onClick={() => shareToSocial('instagram')} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-600 transition-colors duration-300"><svg className="w-6 h-6 text-pink-600 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></div><span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Instagram</span>
              </button>
              <button onClick={() => shareToSocial('facebook')} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300"><svg className="w-6 h-6 text-blue-600 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></div><span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Facebook</span>
              </button>
              <button onClick={() => shareToSocial('tiktok')} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 bg-black/5 rounded-full flex items-center justify-center group-hover:bg-black transition-colors duration-300"><svg className="w-6 h-6 text-black group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div><span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">TikTok</span>
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-100">
              <span className="text-xs text-gray-500 truncate max-w-[200px]">{typeof window !== 'undefined' ? window.location.href : ''}</span>
              <button onClick={copyToClipboard} className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2">
                {copied ? <span className="text-green-600 flex items-center gap-1"><Check size={14}/> Copied</span> : <span className="flex items-center gap-1"><Copy size={14}/> Copy</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}