"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

    // Ask Supabase to verify the email and password
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Plain English error message
      setError("We could not log you in. Please check your email and password and try again.");
      setLoading(false);
    } else {
      // Success! Send them to the main dashboard
      router.push("/admin");
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center selection:bg-black selection:text-white px-4">
      
      <div className="w-full max-w-[400px]">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-3xl font-normal uppercase tracking-tighter text-black mb-3">
            Lee Lagos
          </h1>

        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-[#fcfcfc] border border-gray-200 p-4 mb-8 text-center">
            <p className="text-[10px] uppercase tracking-widest text-red-600 font-bold">
              {error}
            </p>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 h-10 outline-none focus:border-black transition-colors text-sm font-medium text-black rounded-none" 
              placeholder="admin@leelagos.com"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
              Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 h-10 outline-none focus:border-black transition-colors text-sm font-medium text-black rounded-none" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white h-14 flex items-center justify-center uppercase font-bold tracking-[0.2em] text-[10px] hover:bg-gray-800 transition-colors disabled:opacity-70 mt-4"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

      </div>
      
    </div>
  );
}