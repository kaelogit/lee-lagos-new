"use client";

import { ShieldCheck, Truck, Gift } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "100% Authentic.",
    text: "Every watch and chain is tested by experts before it gets to you."
  },
  {
    icon: Truck,
    title: "Fast Delivery.",
    text: "In Lagos? Get it today. Outside Lagos? We ship globally in 3 days via DHL."
  },
  {
    icon: Gift,
    title: "Signature Packaging.",
    text: "Every order arrives in our premium, secure packaging—perfect for gifting or unboxing yourself."
  }
];

export default function TrustSection() {
  return (
    <section className="bg-white border-t border-gray-100 py-24">
      <div className="lee-container">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {FEATURES.map((feature, index) => (
            <div key={index} className="px-4 py-8 group hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gray-50 rounded-full group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <feature.icon size={32} strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="font-heading text-lg font-bold uppercase tracking-widest mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                {feature.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}