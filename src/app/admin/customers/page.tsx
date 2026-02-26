"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { Star, Mail, Phone, Search } from "lucide-react";

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
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("customer_name, customer_email, customer_phone, total_amount, created_at");

      if (!error && orders) {
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
          if (new Date(order.created_at) > new Date(customer.last_order_date)) {
            customer.last_order_date = order.created_at;
          }
        });

        const sorted = Array.from(customerMap.values()).sort(
          (a, b) => b.total_spent - a.total_spent
        );
        setCustomers(sorted);
      }
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    );
  }, [customers, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-lee-grey animate-pulse">
          Loading clients...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-lee-black border-b border-lee-light-grey pb-4 mb-1">
          Client Directory
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-lee-grey">
          {filteredCustomers.length} {search ? "matching" : "total"} clients
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <label htmlFor="customer-search" className="sr-only">
          Search customers by name, email or phone
        </label>
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-lee-grey pointer-events-none"
          />
          <input
            id="customer-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full bg-lee-white border border-lee-light-grey h-12 pl-11 pr-4 text-sm text-lee-black placeholder:text-lee-grey outline-none focus:border-lee-black transition-colors rounded-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <p className="text-sm text-lee-grey uppercase tracking-widest py-12 text-center">
            {search ? "No clients match your search." : "No clients yet."}
          </p>
        ) : (
          filteredCustomers.map((customer) => {
            const isVIP = customer.total_spent >= 1_000_000;
            return (
              <div
                key={customer.email}
                className="bg-lee-white border border-lee-light-grey p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 rounded-sm hover:border-lee-black/20 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-lee-black truncate">
                      {customer.name}
                    </h3>
                    {isVIP && (
                      <span className="badge-black flex items-center gap-1 shrink-0">
                        <Star size={10} className="fill-white" /> VIP
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 mt-4">
                    <a
                      href={`mailto:${customer.email}`}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-lee-grey hover:text-lee-black transition-colors"
                    >
                      <Mail size={12} /> {customer.email}
                    </a>
                    <a
                      href={`tel:${customer.phone}`}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-lee-grey hover:text-lee-black transition-colors"
                    >
                      <Phone size={12} /> {customer.phone}
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 md:gap-12 shrink-0 border-t border-lee-light-grey md:border-t-0 pt-6 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[9px] uppercase tracking-widest text-lee-grey mb-1">
                      Orders
                    </p>
                    <p className="font-mono text-sm font-bold text-lee-black">
                      {customer.order_count}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[9px] uppercase tracking-widest text-lee-grey mb-1">
                      Last order
                    </p>
                    <p className="font-mono text-[11px] text-lee-black">
                      {new Date(customer.last_order_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-lee-grey mb-1">
                      Spent
                    </p>
                    <p className="font-mono text-sm font-bold text-lee-black">
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
