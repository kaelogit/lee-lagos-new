"use client";

import { useState, useEffect, useRef } from "react";
import ProductImage from "../../components/ProductImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, Clock } from "lucide-react";
import { useCart } from "../../context/CartContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { usePaystackPayment } from "react-paystack";
import { supabase } from "../../lib/supabase";

export default function CheckoutClient() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const isSuccessRef = useRef(false); 
  const hasDropItem = cartItems.some(item => item.is_drop);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    orderNotes: "",
  });

  const finalTotal = cartTotal; 

  useEffect(() => {
    setLoading(false);
    if (cartItems.length === 0 && !isSuccessRef.current) {
      router.push("/shop");
    }
  }, [cartItems, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ==========================================
  // PAYSTACK INTEGRATION CONFIG
  // ==========================================
  const config = {
    reference: (new Date()).getTime().toString(),
    email: formData.email,
    amount: finalTotal * 100, 
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_key_here",
    currency: 'NGN',
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    setProcessing(true);
    
    try {
      // 1. Save the main order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: formData.address,
          shipping_state: formData.state,
          shipping_city: formData.city,
          total_amount: finalTotal,
          payment_reference: reference.reference,
          payment_status: "paid", 
          order_status: "processing",
          order_notes: formData.orderNotes || null
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Save order items
      const itemsToInsert = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price_at_purchase: item.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 2b. Decrement stock for each product (group by product in case of multiple lines)
      const quantityByProduct: Record<string, number> = {};
      for (const item of cartItems) {
        const id = item.id;
        quantityByProduct[id] = (quantityByProduct[id] ?? 0) + item.quantity;
      }
      for (const [productId, qty] of Object.entries(quantityByProduct)) {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", productId)
          .single();
        if (product) {
          const newStock = Math.max(0, (product.stock ?? 0) - qty);
          await supabase
            .from("products")
            .update({ stock: newStock, in_stock: newStock > 0 })
            .eq("id", productId);
        }
      }

      // ==========================================
      // 3. SEND THE LUXURY CONFIRMATION EMAIL
      // ==========================================
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            name: formData.firstName,
            orderReference: reference.reference,
            items: itemsToInsert,
            total: finalTotal,
            address: formData.address,
            city: formData.city,
            state: formData.state
          })
        });
      } catch (emailError) {
        // We log it but do not throw, so the customer still reaches the success page even if email fails!
        console.error("Non-fatal error: Failed to send email via Resend", emailError);
      }

      // 4. Flag success, clear cart, and redirect perfectly
      isSuccessRef.current = true; 
      clearCart();
      router.push(`/success?ref=${reference.reference}${hasDropItem ? '&drop=true' : ''}`);

    } catch (error) {
      console.error("Error saving order:", error);
      alert("Payment successful, but there was an error recording your order. Please contact support.");
      setProcessing(false);
    }
  };

  const onClose = () => {
    setProcessing(false);
    console.log('Payment closed');
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    initializePayment({ onSuccess, onClose });
  };

  if (loading || (cartItems.length === 0 && !isSuccessRef.current)) return null;

  return (
    <div className="bg-[#Fdfdfd] min-h-screen selection:bg-black selection:text-white">
      <Navbar />

      <main className="pt-24 md:pt-32 pb-24">
        <div className="lee-container max-w-7xl">
          
          <div className="flex items-center gap-6 mb-12 border-b border-gray-200 pb-8">
            <Link href="/shop" className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
              <ArrowLeft size={18} strokeWidth={1.5} />
            </Link>
            <div>
              <h1 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tighter text-black leading-none">
                Secure Checkout
              </h1>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mt-3">
                Complete your order
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            <div className="flex-1">
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-12">
                
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-8 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">1</span> 
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">First Name *</label>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-white border border-gray-200 h-14 px-5 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm rounded-lg" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Last Name *</label>
                      <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-white border border-gray-200 h-14 px-5 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm rounded-lg" placeholder="Doe" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Email Address *</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white border border-gray-200 h-14 px-5 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm rounded-lg" placeholder="john.doe@example.com" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Phone Number *</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-white border border-gray-200 h-14 px-5 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm rounded-lg" placeholder="+234 800 000 0000" />
                    </div>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-gray-200"></div>

                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-8 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">2</span> 
                    Delivery Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Street Address *</label>
                      <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-white border border-gray-200 h-14 px-5 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm rounded-lg" placeholder="123 Luxury Avenue, Phase 1" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">City *</label>
                      <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-white border border-gray-200 h-14 px-5 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm rounded-lg" placeholder="Lekki" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">State *</label>
                      <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-white border border-gray-200 h-14 px-5 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm rounded-lg" placeholder="Lagos" />
                    </div>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-gray-200"></div>

                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-8 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">3</span> 
                    Special Instructions
                  </h2>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Order Notes (Optional)</label>
                  <textarea name="orderNotes" value={formData.orderNotes} onChange={handleInputChange} rows={4} placeholder="E.g. Leave with the concierge, or specific delivery timeframe..." className="w-full bg-white border border-gray-200 p-5 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm resize-none rounded-lg"></textarea>
                </div>

              </form>
            </div>

            <div className="w-full lg:w-[450px] shrink-0">
              <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] lg:sticky lg:top-32">
                <h3 className="font-heading text-xl font-bold uppercase tracking-widest mb-8 text-black">Order Summary</h3>
                
                {/* NEW: DROP NOTICE */}
                {hasDropItem && (
                  <div className="p-4 bg-gray-50 rounded-xl flex items-start gap-3 border border-gray-100 mb-8">
                    <Clock size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black leading-relaxed">
                      Note: Your order contains Sunday Drop items. These pieces will ship upon official release.
                    </p>
                  </div>
                )}

                <div className="space-y-6 mb-10 max-h-[350px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-5 group">
                      
                      <div className="relative w-20 h-28 bg-[#fcfcfc] shrink-0 rounded-lg overflow-hidden">
                        <ProductImage src={item.image} alt={item.name} fill className="object-cover mix-blend-multiply" />
                      </div>

                      <div className="flex-1 flex flex-col py-1">
                        <p className="text-xs font-bold text-black leading-snug line-clamp-2 mb-1">{item.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-auto">
                          {item.category}
                        </p>
                        
                        <div className="flex items-end justify-between mt-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 bg-gray-50 px-2 py-1 rounded-md">Qty: {item.quantity}</p>

                          <div className="text-right">
                            {item.original_price && (
                              <span className="text-[10px] text-gray-400 line-through font-mono block">
                                ₦{(item.original_price * item.quantity).toLocaleString()}
                              </span>
                            )}
                            <span className={`text-sm font-bold font-mono ${item.original_price ? 'text-red-600' : 'text-black'}`}>
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                <div className="space-y-5 mb-8">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Subtotal</span>
                    <span className="font-bold text-black text-sm font-mono">₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 border-t border-gray-100 pt-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Shipping</span>
                    <span className="bg-gray-100 text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm">To be discussed</span>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-gray-100 mb-8"></div>

                <div className="flex justify-between items-end mb-10">
                  <span className="font-bold text-sm uppercase tracking-widest text-black">Total</span>
                  <span className="font-heading text-3xl font-bold text-black leading-none tracking-tight font-mono">₦{finalTotal.toLocaleString()}</span>
                </div>

                <button 
                  type="submit" 
                  form="checkout-form"
                  disabled={processing}
                  className="relative w-full bg-black text-white h-16 flex items-center justify-center gap-3 uppercase font-bold tracking-[0.2em] text-[11px] rounded-xl hover:bg-gray-900 transition-all disabled:opacity-70 overflow-hidden group shadow-lg shadow-black/20"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {processing ? "Processing..." : "Place Order"} {!processing && <Lock size={14} />}
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer"></div>
                </button>

                <div className="mt-8 flex flex-col items-center justify-center gap-3">
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest text-center">
                    Payments processed securely by Paystack
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}