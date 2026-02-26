"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

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

const STATUSES = [
  { value: "all", label: "All" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
] as const;

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get("status") || "all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
        alert(`Connection error: ${error.message}`);
      } else if (data) {
        setOrders(data);
      }
    } catch (err: unknown) {
      console.error("Network error:", err);
      alert(`Network error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, order_status: newStatus } : order
        )
      );
    } else {
      alert(`Failed to update: ${error.message}`);
    }
  };

  const copyReference = (ref: string, orderId: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrderId((id) => (id === orderId ? null : orderId));
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.order_status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-lee-grey animate-pulse">
          Syncing orders...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-lee-black border-b border-lee-light-grey pb-4 mb-1">
          Order Management
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-lee-grey">
          {filteredOrders.length} {statusFilter === "all" ? "total" : statusFilter}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors ${
              statusFilter === s.value
                ? "bg-lee-black text-white"
                : "bg-lee-white border border-lee-light-grey text-lee-grey hover:border-lee-black hover:text-lee-black"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <p className="text-sm text-lee-grey uppercase tracking-widest py-12 text-center">
            {statusFilter === "all" ? "No orders yet." : `No ${statusFilter} orders.`}
          </p>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-lee-white border border-lee-light-grey rounded-sm overflow-hidden hover:border-lee-black/20 transition-colors"
            >
              <div
                onClick={() => toggleOrder(order.id)}
                className="p-6 md:p-8 cursor-pointer hover:bg-lee-light-grey/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="grid grid-cols-2 md:flex md:items-center gap-6 md:gap-10 flex-1">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-lee-grey mb-1">Date</p>
                    <p className="font-mono text-xs text-lee-black">
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-lee-grey mb-1">Customer</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-lee-black truncate max-w-[140px] md:max-w-[220px]">
                      {order.customer_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-lee-grey mb-1">Total</p>
                    <p className="font-mono text-xs font-bold text-lee-black">
                      ₦{Number(order.total_amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-lee-grey mb-1">Status</p>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                        order.order_status === "processing"
                          ? "bg-lee-black text-white"
                          : order.order_status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-lee-grey flex justify-end md:block">
                  {expandedOrderId === order.id ? (
                    <ChevronUp size={18} strokeWidth={1.5} />
                  ) : (
                    <ChevronDown size={18} strokeWidth={1.5} />
                  )}
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="p-6 md:p-8 border-t border-lee-light-grey bg-lee-light-grey/20 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-lee-grey mb-3 border-b border-lee-light-grey pb-2">
                          Contact
                        </h4>
                        <p className="text-xs text-lee-black mb-1">{order.customer_email}</p>
                        <p className="text-xs font-mono text-lee-black">{order.customer_phone}</p>
                      </div>
                      <div>
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-lee-grey mb-3 border-b border-lee-light-grey pb-2">
                          Shipping
                        </h4>
                        <p className="text-xs text-lee-black leading-relaxed">
                          {order.shipping_address}
                          <br />
                          {order.shipping_city}, {order.shipping_state}
                        </p>
                      </div>
                      {order.order_notes && (
                        <div>
                          <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-lee-black mb-3 border-b border-lee-black pb-2">
                            Delivery Notes
                          </h4>
                          <p className="text-xs text-lee-black leading-relaxed bg-lee-white p-4 rounded-sm border border-lee-light-grey">
                            &ldquo;{order.order_notes}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-lee-light-grey pb-2">
                          <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-lee-grey">
                            Items
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyReference(order.payment_reference, order.id);
                            }}
                            className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-lee-grey hover:text-lee-black transition-colors"
                          >
                            {copiedId === order.id ? (
                              <Check size={12} className="text-lee-red" />
                            ) : (
                              <Copy size={12} />
                            )}
                            {copiedId === order.id ? "Copied" : "Copy ref"}
                          </button>
                        </div>
                        <p className="text-[9px] text-lee-grey mb-3 font-mono">
                          Ref: {order.payment_reference}
                        </p>
                        <div className="space-y-3">
                          {order.order_items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center text-sm"
                            >
                              <div className="flex items-center gap-4">
                                <span className="font-mono text-lee-grey text-xs">
                                  {item.quantity}×
                                </span>
                                <span className="uppercase tracking-widest text-xs font-bold text-lee-black">
                                  {item.product_name}
                                </span>
                              </div>
                              <span className="font-mono text-lee-black text-xs">
                                ₦{(item.price_at_purchase * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-lee-light-grey flex flex-wrap gap-3">
                        <button
                          onClick={() => updateOrderStatus(order.id, "processing")}
                          className={`px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest border rounded-sm transition-colors ${
                            order.order_status === "processing"
                              ? "bg-lee-black text-white border-lee-black"
                              : "bg-lee-white border-lee-light-grey text-lee-grey hover:border-lee-black hover:text-lee-black"
                          }`}
                        >
                          Processing
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                          className={`px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest border rounded-sm transition-colors ${
                            order.order_status === "shipped"
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-lee-white border-lee-light-grey text-lee-grey hover:border-blue-600 hover:text-blue-600"
                          }`}
                        >
                          Shipped
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                          className={`px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest border rounded-sm transition-colors ${
                            order.order_status === "delivered"
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-lee-white border-lee-light-grey text-lee-grey hover:border-green-600 hover:text-green-600"
                          }`}
                        >
                          Delivered
                        </button>
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

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[280px]">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-lee-grey animate-pulse">
            Loading orders...
          </p>
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
