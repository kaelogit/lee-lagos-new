"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ==========================================
  // SMART SECURITY & AUTO-LOGOUT ENGINE
  // ==========================================
  useEffect(() => {
    // 1. Initial Check on Page Load
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // If there's an error (like an expired JWT), automatically clear it
      if (error || !session) {
        await supabase.auth.signOut();
        if (pathname !== "/admin/login") router.push("/admin/login");
        else setLoading(false);
      } else {
        if (pathname === "/admin/login") router.push("/admin");
        else setLoading(false);
      }
    };
    
    checkUser();

    // 2. The Smart Listener: Watches your session in the background
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // If the session expires or you log out, quietly send you back to the login screen
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        if (pathname !== "/admin/login") {
          router.push('/admin/login');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // If on login page, show only the login form
  if (pathname === "/admin/login") {
    return (
      <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
        {loading ? null : children}
      </div>
    );
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-black animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  const navItems = [
    { name: "Overview", path: "/admin" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Inventory", path: "/admin/inventory" },
    { name: "Customers", path: "/admin/customers" },
  ];

  const NavLinks = () => (
    <nav className="flex flex-col gap-8 md:gap-6">
      {navItems.map((item) => (
        <Link 
          key={item.name} 
          href={item.path}
          onClick={() => setIsMobileMenuOpen(false)} 
          className={`text-sm md:text-[11px] uppercase tracking-[0.2em] font-bold transition-colors ${
            pathname === item.path ? "text-black" : "text-gray-400 hover:text-black"
          }`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="h-screen w-full bg-white text-black flex overflow-hidden selection:bg-black selection:text-white">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-gray-100 p-8 lg:p-12 bg-white h-full shrink-0">
        <div>
          <Link href="/" className="block font-heading text-2xl font-bold uppercase tracking-tighter mb-20 hover:opacity-70 transition-opacity">
            Lee Lagos
          </Link>
          <NavLinks />
        </div>
        
        <button 
          onClick={handleLogout} 
          className="text-left text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors font-bold"
        >
          Sign Out
        </button>
      </aside>

      {/* MOBILE UI & MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-6 border-b border-gray-100 bg-white z-30 shrink-0">
          <Link href="/" className="font-heading text-xl font-bold uppercase tracking-tighter">
            Lee Lagos
          </Link>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-black hover:opacity-70 transition-opacity">
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Mobile Slide-out Menu */}
        <div className={`md:hidden fixed inset-0 z-50 transition-all duration-500 ${isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div 
            className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <aside className={`absolute top-0 left-0 w-4/5 max-w-sm h-full bg-white flex flex-col justify-between p-8 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div>
              <div className="flex items-center justify-between mb-16">
                <Link href="/" className="font-heading text-2xl font-bold uppercase tracking-tighter hover:opacity-70 transition-opacity">
                  Lee Lagos
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-black hover:opacity-70 transition-opacity">
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>
              <NavLinks />
            </div>
            <button 
              onClick={handleLogout} 
              className="text-left text-sm uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors font-bold mt-12"
            >
              Sign Out
            </button>
          </aside>
        </div>

        <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16">
          {children}
        </main>
        
      </div>
      
    </div>
  );
}