"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("We could not log you in. Please check your email and password and try again.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-lee-white flex flex-col items-center justify-center px-4 selection:bg-lee-black selection:text-white">
      <div className="w-full max-w-[420px]">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block font-heading text-3xl font-bold uppercase tracking-tighter text-lee-black hover:opacity-80 transition-opacity">
            Lee Lagos
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-lee-grey mt-2">
            The Standard.
          </p>
        </div>

        {/* Card */}
        <div className="bg-lee-white border border-lee-light-grey rounded-sm p-8 shadow-sm">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-lee-black mb-6 border-b border-lee-light-grey pb-3">
            Admin Sign In
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-sm">
              <p className="text-[10px] uppercase tracking-widest text-lee-red font-bold">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="admin-email" className="block text-[10px] uppercase tracking-widest text-lee-grey mb-2 font-bold">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-lee-light-grey h-11 outline-none focus:border-lee-black transition-colors text-sm font-medium text-lee-black rounded-none placeholder:text-lee-grey/70"
                placeholder="admin@leelagos.com"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-[10px] uppercase tracking-widest text-lee-grey mb-2 font-bold">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-lee-light-grey h-11 outline-none focus:border-lee-black transition-colors text-sm font-medium text-lee-black rounded-none placeholder:text-lee-grey/70"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lee-black text-white h-14 flex items-center justify-center uppercase font-bold tracking-[0.2em] text-[10px] hover:bg-lee-black/90 transition-colors disabled:opacity-60 rounded-sm"
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center mt-8">
          <Link href="/" className="text-[10px] uppercase tracking-widest text-lee-grey hover:text-lee-black transition-colors font-bold">
            ← Back to Store
          </Link>
        </p>
      </div>
    </div>
  );
}
