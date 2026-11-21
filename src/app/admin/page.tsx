"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { TrendingUp, ShoppingBag, AlertCircle, Package, ArrowUpRight, Clock } from "lucide-react";
import ProductImage from "../../components/ProductImage";

type LatestOrder = {
  id: string;
  customer_name: string;
  total_amount: number;
  order_status: string | null;
  created_at: string;
};

type StockPiece = {
  id: string;
  name: string;
  stock: number | null;
  images: string[] | null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    processingOrders: 0,
    preOrderCount: 0,
    outOfStockItems: 0,
  });
  const [latestOrders, setLatestOrders] = useState<LatestOrder[]>([]);
  const [outOfStock, setOutOfStock] = useState<StockPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      const [
        revenueResult,
        ordersCount,
        processingCount,
        preOrderCount,
        stockCount,
        latestResult,
        stockResult,
      ] = await Promise.all([
        supabase.from("orders").select("total_amount"),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status", "processing"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status", "pre-order"),
        supabase.from("products").select("id", { count: "exact", head: true }).or("stock.lte.0,in_stock.eq.false"),
        supabase
          .from("orders")
          .select("id, customer_name, total_amount, order_status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("products")
          .select("id, name, stock, images")
          .or("stock.lte.0,in_stock.eq.false")
          .order("name")
          .limit(6),
      ]);

      const failed = [
        revenueResult.error,
        ordersCount.error,
        processingCount.error,
        preOrderCount.error,
        stockCount.error,
        latestResult.error,
        stockResult.error,
      ].find(Boolean);

      if (failed) {
        setLoadError("The overview could not be loaded. Refresh the page and try again.");
        setLoading(false);
        return;
      }

      const revenue = (revenueResult.data || []).reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
      );

      setStats({
        totalRevenue: revenue,
        totalOrders: ordersCount.count || 0,
        processingOrders: processingCount.count || 0,
        preOrderCount: preOrderCount.count || 0,
        outOfStockItems: stockCount.count || 0,
      });
      setLatestOrders(latestResult.data || []);
      setOutOfStock(stockResult.data || []);
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

  if (loadError) {
    return (
      <div className="max-w-6xl">
        <p className="text-sm text-lee-red">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-lee-black border-b border-lee-light-grey pb-4 mb-1">
          Business Overview
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-lee-grey">
          Key metrics at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-6">
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
        <Link
          href="/admin/orders?status=pre-order"
          className={`border p-6 md:p-8 rounded-sm flex flex-col justify-between min-h-[160px] group transition-colors ${
            stats.preOrderCount > 0
              ? "bg-amber-50/50 border-amber-200 hover:border-amber-600"
              : "bg-lee-white border-lee-light-grey hover:border-lee-black/20"
          }`}
        >
          <div className="flex items-start justify-between">
            <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
              stats.preOrderCount > 0 ? "text-amber-700" : "text-lee-grey"
            }`}>
              Pre-Orders
            </p>
            {stats.preOrderCount > 0 && <Clock size={18} className="text-amber-600 shrink-0" />}
          </div>
          <p className={`font-mono text-2xl md:text-3xl tracking-tight font-medium mt-2 ${
            stats.preOrderCount > 0 ? "text-amber-700" : "text-lee-black"
          }`}>
            {stats.preOrderCount}
          </p>
          <span className="text-[9px] uppercase tracking-widest text-lee-grey mt-2">View pre-orders →</span>
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-lee-white border border-lee-light-grey rounded-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-lee-light-grey">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">Latest orders</h2>
            <Link href="/admin/orders" className="text-[10px] uppercase tracking-widest text-lee-grey hover:text-lee-black">
              View all
            </Link>
          </div>
          {latestOrders.length === 0 ? (
            <p className="px-6 py-8 text-sm text-lee-grey">No orders yet.</p>
          ) : (
            <ul>
              {latestOrders.map((order) => (
                <li key={order.id} className="px-6 py-4 border-b border-lee-light-grey last:border-b-0 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{order.customer_name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-lee-grey mt-1">
                      {new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                      {" · "}
                      {order.order_status || "new"}
                    </p>
                  </div>
                  <p className="font-mono text-sm shrink-0">₦{Number(order.total_amount).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-lee-white border border-lee-light-grey rounded-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-lee-light-grey">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">Out of stock</h2>
            <Link href="/admin/inventory" className="text-[10px] uppercase tracking-widest text-lee-grey hover:text-lee-black">
              Inventory
            </Link>
          </div>
          {outOfStock.length === 0 ? (
            <p className="px-6 py-8 text-sm text-lee-grey">Every piece has stock.</p>
          ) : (
            <ul>
              {outOfStock.map((piece) => (
                <li key={piece.id} className="px-6 py-3 border-b border-lee-light-grey last:border-b-0 flex items-center gap-4">
                  <div className="relative w-10 h-12 bg-lee-light-grey shrink-0 overflow-hidden">
                    <ProductImage src={piece.images?.[0]} alt={piece.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{piece.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-lee-red mt-1">
                      Stock {piece.stock ?? 0}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
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
