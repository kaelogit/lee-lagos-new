"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, LayoutDashboard, ShoppingBag, Package, Users, LogOut } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

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

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) {
        if (pathname !== "/admin/login") router.push("/admin/login");
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

  const navItems = [
    { name: "Overview", path: "/admin", icon: LayoutDashboard },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Inventory", path: "/admin/inventory", icon: Package },
    { name: "Customers", path: "/admin/customers", icon: Users },
  ];

  const NavLinks = () => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.2em] font-bold transition-all rounded-sm ${
              isActive
                ? "bg-lee-black text-white"
                : "text-lee-grey hover:bg-lee-light-grey hover:text-lee-black"
            }`}
          >
            <Icon size={16} strokeWidth={1.5} className="shrink-0" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  if (pathname === "/admin/login") {
    return (
      <div className="min-h-screen bg-lee-white text-lee-black selection:bg-lee-black selection:text-white">
        {loading ? null : children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen w-full bg-lee-white flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-lee-black animate-pulse font-heading">
          Authenticating...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-lee-light-grey/40 text-lee-black flex overflow-hidden selection:bg-lee-black selection:text-white">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-lee-light-grey bg-lee-white h-full shrink-0">
        <div className="p-6 lg:p-8">
          <Link
            href="/"
            className="block font-heading text-2xl font-bold uppercase tracking-tighter text-lee-black mb-2 hover:opacity-70 transition-opacity"
          >
            Lee Lagos
          </Link>
          <p className="text-[10px] uppercase tracking-[0.25em] text-lee-grey mb-10">
            The Standard.
          </p>
          <NavLinks />
        </div>
        <div className="p-6 lg:p-8 border-t border-lee-light-grey">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-[11px] uppercase tracking-widest text-lee-grey hover:text-lee-red transition-colors font-bold rounded-sm hover:bg-red-50"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-6 border-b border-lee-light-grey bg-lee-white z-30 shrink-0">
          <Link href="/" className="font-heading text-xl font-bold uppercase tracking-tighter text-lee-black">
            Lee Lagos
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-lee-black hover:opacity-70 transition-opacity p-2"
            aria-label="Open menu"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Mobile Slide-out Menu */}
        <div
          className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${
            isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div
            className={`absolute inset-0 bg-lee-black/20 backdrop-blur-sm transition-opacity duration-300 ${
              isMobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden
          />
          <aside
            className={`absolute top-0 left-0 w-[85%] max-w-sm h-full bg-lee-white flex flex-col justify-between shadow-2xl transform transition-transform duration-300 ease-out ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading text-xl font-bold uppercase tracking-tighter text-lee-black">
                  Lee Lagos
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-lee-black hover:bg-lee-light-grey rounded-sm transition-colors"
                  aria-label="Close menu"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>
              <NavLinks />
            </div>
            <div className="p-6 border-t border-lee-light-grey">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-[11px] uppercase tracking-widest text-lee-grey hover:text-lee-red font-bold"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 bg-lee-white md:bg-lee-light-grey/30 md:m-6 md:rounded-sm md:border md:border-lee-light-grey/80">
          {children}
        </main>
      </div>
    </div>
  );
}
