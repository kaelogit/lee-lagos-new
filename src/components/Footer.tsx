"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 md:pt-24 pb-8 md:pb-12 border-t border-white/10">
      <div className="lee-container">
        
        {/* =========================================
            1. GIANT BRAND TYPOGRAPHY (Mobile Adjusted)
           ========================================= */}
        <div className="mb-12 md:mb-24">
          <h2 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[8rem] leading-none font-black uppercase tracking-tighter text-white">
            Lee Lagos.
          </h2>
        </div>

        {/* =========================================
            2. MAIN FOOTER GRID (Tighter on mobile)
           ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16 md:mb-24">
          
          {/* Column 1: The Brand (Plain English) */}
          <div className="lg:pr-8">
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 md:mb-6 text-gray-500">
              About Us
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted source for authentic watches, diamonds, and perfumes in West Africa. We guarantee the quality of everything we sell.
            </p>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 md:mb-6 text-gray-500">
              Collections
            </h4>
            <ul className="space-y-3 md:space-y-4 text-sm font-medium tracking-wide">
              <li><Link href="/shop/Watches" className="hover:text-gray-400 transition-colors">Watches</Link></li>
              <li><Link href="/shop/Moissanite" className="hover:text-gray-400 transition-colors">Moissanite</Link></li>
              <li><Link href="/shop/Diamond" className="hover:text-gray-400 transition-colors">Diamond</Link></li>
              <li><Link href="/shop/Gold" className="hover:text-gray-400 transition-colors">Gold</Link></li>
              <li><Link href="/shop/Eyeglasses" className="hover:text-gray-400 transition-colors">Eyeglasses</Link></li>
              <li><Link href="/shop/Perfumes" className="hover:text-gray-400 transition-colors">Perfumes</Link></li>
              <li><Link href="/shop/Hustle-X-Lee" className="text-red-500 hover:text-red-400 transition-colors">Hustle X Lee</Link></li>
            </ul>
          </div>

          {/* Column 3: Personal Shopper (Plain English) */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 md:mb-6 text-gray-500">
              Personal Shopper
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Looking for a specific watch or custom jewelry? Our team can help you find exactly what you need. Send us a message to get started.
            </p>
            <a 
              href="https://wa.me/message/NFSDDTWF4HQCD1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-bold uppercase tracking-widest hover:text-gray-400 hover:border-gray-400 transition-all"
            >
              Chat With Us <ArrowUpRight size={16} />
            </a>
          </div>

          {/* Column 4: Contact & Location */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 md:mb-6 text-gray-500">
              Visit Us
            </h4>
            <ul className="space-y-5 md:space-y-6 text-sm">
              <li className="flex items-start gap-4">
                <MapPin className="mt-1 text-gray-500 shrink-0" size={18} />
                <span className="text-gray-400 leading-relaxed">
                  <strong className="block text-white mb-1 font-medium">Lagos</strong>
                  33A Adebayo Doherty Road<br />Lekki Phase 1, Lagos, Nigeria.
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="text-gray-500 shrink-0" size={18} />
                <span className="text-gray-400">+234 916 000 3594</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="text-gray-500 shrink-0" size={18} />
                <span className="text-gray-400">leelagos@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* =========================================
            3. BOTTOM: SOCIAL LINKS & COPYRIGHT
           ========================================= */}
        <div className="flex flex-col lg:flex-row items-center justify-between pt-8 border-t border-white/10 gap-6 md:gap-8">
          
          {/* Copyright */}
          <p className="text-[10px] text-gray-500 uppercase tracking-widest order-2 lg:order-1 text-center lg:text-left w-full lg:w-auto">
            © {new Date().getFullYear()} Lee Lagos. All rights reserved.
          </p>
          
          {/* Luxury Text-Based Social Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 md:gap-8 order-1 lg:order-2 w-full lg:w-auto">
            <a 
              href="https://www.instagram.com/lees_lagos?igsh=MW83bXJlODhqY2Rhbg%3D%3D&utm_source=qr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-[0.2em] text-white hover:text-gray-400 transition-colors flex items-center gap-1"
            >
              Instagram <ArrowUpRight size={12} className="text-gray-500" />
            </a>
            <a 
              href="https://snapchat.com/t/fxz3i5Te" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-[0.2em] text-white hover:text-gray-400 transition-colors flex items-center gap-1"
            >
              Snapchat <ArrowUpRight size={12} className="text-gray-500" />
            </a>
            <a 
              href="https://www.tiktok.com/@lees_lagos" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-[0.2em] text-white hover:text-gray-400 transition-colors flex items-center gap-1"
            >
              TikTok <ArrowUpRight size={12} className="text-gray-500" />
            </a>
            
          </div>

        </div>

      </div>
    </footer>
  );
}