"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { TrendingUp, ShoppingBag, AlertCircle, Package, ArrowUpRight } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    processingOrders: 0,
    outOfStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total_amount, order_status");

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("stock, in_stock");

      if (!ordersError && !productsError && orders && products) {
        const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        const processing = orders.filter((o) => o.order_status === "processing").length;
        const outOfStock = products.filter((p) => p.stock <= 0 || p.in_stock === false).length;

        setStats({
          totalRevenue: revenue,
          totalOrders: orders.length,
          processingOrders: processing,
          outOfStockItems: outOfStock,
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-lee-grey animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-lee-black border-b border-lee-light-grey pb-4 mb-1">
          Business Overview
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-lee-grey">
          Key metrics at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-lee-white border border-lee-light-grey p-6 md:p-8 rounded-sm hover:border-lee-black/20 transition-colors flex flex-col justify-between min-h-[160px]">
          <div className="flex items-start justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-lee-grey">Total Revenue</p>
            <TrendingUp size={18} className="text-lee-grey/60 shrink-0" />
          </div>
          <p className="font-mono text-2xl md:text-3xl text-lee-black tracking-tight font-medium mt-2">
            ₦{stats.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-lee-white border border-lee-light-grey p-6 md:p-8 rounded-sm hover:border-lee-black/20 transition-colors flex flex-col justify-between min-h-[160px]">
          <div className="flex items-start justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-lee-grey">Lifetime Orders</p>
            <ShoppingBag size={18} className="text-lee-grey/60 shrink-0" />
          </div>
          <p className="font-mono text-2xl md:text-3xl text-lee-black tracking-tight font-medium mt-2">
            {stats.totalOrders}
          </p>
        </div>

        <Link
          href="/admin/orders?status=processing"
          className="bg-lee-white border border-lee-light-grey p-6 md:p-8 rounded-sm hover:border-lee-black transition-colors flex flex-col justify-between min-h-[160px] group"
        >
          <div className="flex items-start justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-lee-black">Action Required</p>
            {stats.processingOrders > 0 && (
              <span className="w-2.5 h-2.5 bg-lee-red rounded-full animate-pulse" aria-hidden />
            )}
            <ArrowUpRight size={16} className="text-lee-grey group-hover:text-lee-black transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
          </div>
          <p className="font-mono text-2xl md:text-3xl text-lee-black tracking-tight font-medium mt-2">
            {stats.processingOrders}
          </p>
          <span className="text-[9px] uppercase tracking-widest text-lee-grey mt-2">View orders →</span>
        </Link>

        <Link
          href="/admin/inventory"
          className={`border p-6 md:p-8 rounded-sm flex flex-col justify-between min-h-[160px] group transition-colors ${
            stats.outOfStockItems > 0
              ? "bg-red-50/50 border-red-200 hover:border-lee-red"
              : "bg-lee-white border-lee-light-grey hover:border-lee-black/20"
          }`}
        >
          <div className="flex items-start justify-between">
            <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
              stats.outOfStockItems > 0 ? "text-lee-red" : "text-lee-grey"
            }`}>
              Out of Stock
            </p>
            {stats.outOfStockItems > 0 && <AlertCircle size={18} className="text-lee-red shrink-0" />}
            {stats.outOfStockItems === 0 && <Package size={18} className="text-lee-grey/60 shrink-0" />}
          </div>
          <p className={`font-mono text-2xl md:text-3xl tracking-tight font-medium mt-2 ${
            stats.outOfStockItems > 0 ? "text-lee-red" : "text-lee-black"
          }`}>
            {stats.outOfStockItems}
          </p>
          <span className="text-[9px] uppercase tracking-widest text-lee-grey mt-2">Manage inventory →</span>
        </Link>
      </div>

      <div className="mt-10 pt-8 border-t border-lee-light-grey flex flex-wrap gap-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 bg-lee-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-lee-black/90 transition-colors rounded-sm"
        >
          All Orders
          <ArrowUpRight size={14} />
        </Link>
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-2 border border-lee-black text-lee-black px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-lee-black hover:text-white transition-colors rounded-sm"
        >
          Inventory Room
          <ArrowUpRight size={14} />
        </Link>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 border border-lee-light-grey text-lee-grey px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-lee-black hover:text-lee-black transition-colors rounded-sm"
        >
          Customers
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
