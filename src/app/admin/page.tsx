"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

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
      // 1. Fetch Orders Data
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total_amount, order_status");

      // 2. Fetch Products Data (Just the stock info)
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("stock, in_stock");

      if (!ordersError && !productsError && orders && products) {
        
        // Calculate Revenue
        const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        
        // Find Actionable Orders
        const processing = orders.filter(order => order.order_status === "processing").length;

        // Find Empty Inventory
        const outOfStock = products.filter(product => product.stock <= 0 || product.in_stock === false).length;

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

  if (loading) return null; // The layout handles the loading visual

  return (
    <div className="animate-in fade-in duration-500">
      
      <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-12 border-b border-gray-100 pb-4">
        Business Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
        
        {/* REVENUE CARD */}
        <div className="bg-[#fdfdfd] border border-gray-100 p-8 hover:border-black transition-colors flex flex-col justify-between h-40">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Total Revenue</p>
          <p className="font-mono text-3xl md:text-4xl text-black tracking-tight font-medium">
            ₦{stats.totalRevenue.toLocaleString()}
          </p>
        </div>

        {/* TOTAL ORDERS CARD */}
        <div className="bg-[#fdfdfd] border border-gray-100 p-8 hover:border-black transition-colors flex flex-col justify-between h-40">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Lifetime Orders</p>
          <p className="font-mono text-3xl md:text-4xl text-black tracking-tight font-medium">
            {stats.totalOrders}
          </p>
        </div>

        {/* ACTIONABLE ORDERS CARD (Smart) */}
        <div className="bg-[#fdfdfd] border border-gray-100 p-8 hover:border-black transition-colors flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-black">Action Required</p>
            {stats.processingOrders > 0 && (
              <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
            )}
          </div>
          <p className="font-mono text-3xl md:text-4xl text-black tracking-tight font-medium">
            {stats.processingOrders}
          </p>
        </div>

        {/* INVENTORY ALERT CARD (Smart) */}
        <div className="bg-[#fdfdfd] border border-gray-100 p-8 hover:border-black transition-colors flex flex-col justify-between h-40">
          <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${stats.outOfStockItems > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            Out of Stock
          </p>
          <p className={`font-mono text-3xl md:text-4xl tracking-tight font-medium ${stats.outOfStockItems > 0 ? 'text-red-600' : 'text-black'}`}>
            {stats.outOfStockItems}
          </p>
        </div>

      </div>

    </div>
  );
}