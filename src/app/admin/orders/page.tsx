"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { ChevronDown, ChevronUp } from "lucide-react";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
};

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  total_amount: number;
  payment_reference: string;
  order_status: string;
  order_notes: string | null;
  order_items: OrderItem[]; 
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (error) {
        // SMART ALARM: This forces the actual error to show on your screen
        console.error("Supabase Error Details:", error);
        alert(`Supabase Connection Blocked: ${JSON.stringify(error)}`);
      } else if (data) {
        setOrders(data);
      }
    } catch (err: any) {
      console.error("Network Crash:", err);
      alert(`Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, order_status: newStatus } : order
      ));
    } else {
      alert(`Failed to update status: ${JSON.stringify(error)}`);
    }
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-black animate-pulse">
        Syncing Database...
      </p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl">
      
      <div className="flex items-end justify-between mb-12 border-b border-gray-100 pb-4">
        <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-black">
          Order Management
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
          {orders.length} Total
        </p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500 uppercase tracking-widest py-10">No orders have been placed yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-[#fdfdfd] border border-gray-100 rounded-sm">
              
              {/* VISIBLE ROW */}
              <div 
                onClick={() => toggleOrder(order.id)}
                className="p-6 md:p-8 cursor-pointer hover:bg-white transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="grid grid-cols-2 md:flex md:items-center gap-6 md:gap-12 flex-1">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Date</p>
                    <p className="font-mono text-xs text-black">
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Customer</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-black truncate max-w-[120px] md:max-w-[200px]">
                      {order.customer_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Total</p>
                    <p className="font-mono text-xs font-bold text-black">
                      ₦{Number(order.total_amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Status</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${
                      order.order_status === 'processing' ? 'text-black' : 
                      order.order_status === 'shipped' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {order.order_status}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-gray-400 flex justify-end md:block">
                  {expandedOrderId === order.id ? <ChevronUp size={18} strokeWidth={1.5} /> : <ChevronDown size={18} strokeWidth={1.5} />}
                </div>
              </div>

              {/* HIDDEN DETAILS */}
              {expandedOrderId === order.id && (
                <div className="p-6 md:p-8 border-t border-gray-100 bg-white animate-in slide-in-from-top-2 duration-300">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* COLUMN 1 */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-100 pb-2">Contact Details</h4>
                        <p className="text-xs text-black mb-1">{order.customer_email}</p>
                        <p className="text-xs font-mono text-black">{order.customer_phone}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-100 pb-2">Shipping Address</h4>
                        <p className="text-xs text-black leading-relaxed">
                          {order.shipping_address}<br/>
                          {order.shipping_city}, {order.shipping_state}
                        </p>
                      </div>

                      {order.order_notes && (
                        <div>
                          <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-black mb-3 border-b border-black pb-2">Delivery Notes</h4>
                          <p className="text-xs text-black leading-relaxed bg-[#f9f9f9] p-4">
                            "{order.order_notes}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* COLUMN 2 */}
                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-100 pb-2 flex justify-between">
                          <span>Items Purchased</span>
                          <span>Reference: {order.payment_reference}</span>
                        </h4>
                        
                        <div className="space-y-4 mt-4">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-4">
                                <span className="font-mono text-gray-400 text-xs">{item.quantity}x</span>
                                <span className="uppercase tracking-widest text-xs font-bold text-black">{item.product_name}</span>
                              </div>
                              <span className="font-mono text-black text-xs">₦{(item.price_at_purchase * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="pt-8 border-t border-gray-100 flex flex-wrap gap-4">
                        <button onClick={() => updateOrderStatus(order.id, 'processing')} className={`px-6 py-3 text-[9px] font-bold uppercase tracking-widest border transition-colors ${order.order_status === 'processing' ? 'bg-black text-white border-black' : 'bg-transparent text-gray-500 border-gray-200 hover:border-black hover:text-black'}`}>Mark Processing</button>
                        <button onClick={() => updateOrderStatus(order.id, 'shipped')} className={`px-6 py-3 text-[9px] font-bold uppercase tracking-widest border transition-colors ${order.order_status === 'shipped' ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-gray-500 border-gray-200 hover:border-blue-600 hover:text-blue-600'}`}>Mark Shipped</button>
                        <button onClick={() => updateOrderStatus(order.id, 'delivered')} className={`px-6 py-3 text-[9px] font-bold uppercase tracking-widest border transition-colors ${order.order_status === 'delivered' ? 'bg-green-600 text-white border-green-600' : 'bg-transparent text-gray-500 border-gray-200 hover:border-green-600 hover:text-green-600'}`}>Mark Delivered</button>
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}