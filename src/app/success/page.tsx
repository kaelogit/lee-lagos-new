"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, ShoppingBag, Clock } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("ref");
  const isDrop = searchParams.get("drop") === "true"; // Detects the drop flag from the URL

  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="text-center max-w-2xl mx-auto py-20 px-4">
      
      {/* BEAUTIFUL PULSING CHECKMARK */}
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center animate-in zoom-in duration-700 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
          <CheckCircle size={48} className="text-green-600" strokeWidth={1.5} />
        </div>
      </div>
      
      <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tighter text-black mb-6">
        Your Order is Confirmed.
      </h1>
      
      <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-10 max-w-md mx-auto">
        Thank you for choosing Lee Lagos. We have received your payment, and our team is getting your items ready for you.
      </p>

      {/* =========================================
          THE EXCLUSIVE SUNDAY DROP MESSAGE
         ========================================= */}
      {isDrop && (
        <div className="bg-black text-white p-6 md:p-8 rounded-sm mb-12 text-left flex gap-5 animate-in slide-in-from-bottom-4 duration-700 shadow-2xl border border-white/10">
          <div className="mt-1">
            <Clock size={28} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="font-bold uppercase tracking-[0.2em] text-[11px] text-yellow-400 mb-3">
              Sunday Drop Secured 🎉
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              You successfully grabbed an exclusive Sunday Drop item! Remember, this special piece will ship out after its official release. We will send you a message the exact moment it leaves our store.
            </p>
          </div>
        </div>
      )}

      {/* ORDER NUMBER BOX */}
      {orderNumber && (
        <div className="bg-[#F9F9F9] border border-gray-100 p-8 rounded-sm mb-12 inline-block w-full">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Your Order Number</p>
          <p className="font-mono text-xl md:text-3xl font-bold text-black tracking-widest">
            {orderNumber}
          </p>
          <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest">
            Please save this number for your records
          </p>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link 
          href="/shop/Watches" 
          className="w-full sm:w-auto bg-black text-white px-12 h-14 flex items-center justify-center gap-3 uppercase font-bold tracking-[0.2em] text-[10px] hover:bg-gray-800 transition-all rounded-sm shadow-md"
        >
          <ShoppingBag size={14} /> Keep Shopping
        </Link>
        <Link 
          href="/" 
          className="w-full sm:w-auto bg-white border border-gray-200 text-black px-12 h-14 flex items-center justify-center gap-3 uppercase font-bold tracking-[0.2em] text-[10px] hover:bg-gray-50 hover:border-black transition-all rounded-sm"
        >
          Back to Home <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center pt-24 md:pt-32 pb-24">
        <Suspense fallback={
          <div className="h-64 flex items-center justify-center w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}