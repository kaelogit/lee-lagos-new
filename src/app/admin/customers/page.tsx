"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Star, Mail, Phone } from "lucide-react";

type Customer = {
  name: string;
  email: string;
  phone: string;
  total_spent: number;
  order_count: number;
  last_order_date: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    // Pull every order ever made
    const { data: orders, error } = await supabase
      .from("orders")
      .select("customer_name, customer_email, customer_phone, total_amount, created_at");

    if (!error && orders) {
      // Group them together by email address so we don't see the same person twice
      const customerMap = new Map<string, Customer>();

      orders.forEach((order) => {
        const email = order.customer_email.toLowerCase().trim();
        
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            name: order.customer_name,
            email: email,
            phone: order.customer_phone,
            total_spent: 0,
            order_count: 0,
            last_order_date: order.created_at,
          });
        }

        const customer = customerMap.get(email)!;
        customer.total_spent += Number(order.total_amount);
        customer.order_count += 1;
        
        // Keep track of their most recent purchase date
        if (new Date(order.created_at) > new Date(customer.last_order_date)) {
          customer.last_order_date = order.created_at;
        }
      });

      // Turn the map back into a list and sort it by who spent the most money
      const sortedCustomers = Array.from(customerMap.values()).sort((a, b) => b.total_spent - a.total_spent);
      setCustomers(sortedCustomers);
    }
    setLoading(false);
  };

  if (loading) return null;

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl">
      
      {/* HEADER */}
      <div className="flex items-end justify-between mb-12 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-1">
            Client Directory
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-400">
            {customers.length} Total Clients
          </p>
        </div>
      </div>

      {/* CLIENT LIST */}
      <div className="space-y-4">
        {customers.length === 0 ? (
          <p className="text-sm text-gray-500 uppercase tracking-widest py-10">No clients found.</p>
        ) : (
          customers.map((customer, index) => {
            // Automatically mark anyone who spent over 1M as a VIP
            const isVIP = customer.total_spent >= 1000000;

            return (
              <div 
                key={customer.email} 
                className="bg-[#fdfdfd] border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-black transition-colors"
              >
                
                {/* CLIENT INFO */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-black truncate">
                      {customer.name}
                    </h3>
                    {isVIP && (
                      <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
                        <Star size={10} className="fill-yellow-800" /> VIP
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 mt-4">
                    <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
                      <Mail size={12} /> {customer.email}
                    </a>
                    <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
                      <Phone size={12} /> {customer.phone}
                    </a>
                  </div>
                </div>

                {/* LIFETIME STATS */}
                <div className="grid grid-cols-3 gap-6 md:gap-12 shrink-0 border-t border-gray-100 md:border-t-0 pt-6 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Total Orders</p>
                    <p className="font-mono text-sm font-bold text-black">{customer.order_count}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Last Order</p>
                    <p className="font-mono text-[11px] text-black pt-0.5">
                      {new Date(customer.last_order_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Lifetime Spent</p>
                    <p className="font-mono text-sm font-bold text-black">
                      ₦{customer.total_spent.toLocaleString()}
                    </p>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}