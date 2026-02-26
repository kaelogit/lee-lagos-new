"use client";

import { useState } from "react";
import ProductImage from "./ProductImage";
import { ArrowRight, RefreshCw, Gift, Check } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function GiftFinder() {
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState({ gender: "", category: "", style: "" });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // === THE SMART QUESTIONS ===
  const steps = [
    {
      id: 1,
      key: 'gender',
      question: "Who are we spoiling today?",
      options: [
        { label: "For Him", value: "Male" },
        { label: "For Her", value: "Female" },
        { label: "Treating Myself", value: "Unisex" }, // 'Unisex' serves as a catch-all
      ],
    },
    {
      id: 2,
      key: 'category', // <--- NEW STEP: Solves "Ring vs Necklace"
      question: "What's their favorite accessory?",
      options: [
        { label: "Wrist Game (Watches/Bracelets)", value: "Wrist" },
        { label: "Neck Game (Chains/Pendants)", value: "Neck" },
        { label: "Finger Game (Rings)", value: "Finger" },
        { label: "Scents (Perfumes)", value: "Scent" },
      ],
    },
    {
      id: 3,
      key: 'style', // <--- NEW STEP: Solves "12k vs 24k"
      question: "What's their vibe?",
      options: [
        { label: "Subtle Flex (Clean, classy, understated)", value: "Subtle" },
        { label: "Statement Piece (Iced out, loud, head-turner)", value: "Statement" },
      ],
    },
  ];

  // === HANDLE ANSWER ===
  const handleSelect = async (key: string, value: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (step < 3) {
      setStep(step + 1);
    } else {
      // FINAL STEP: EXECUTE SMART SEARCH
      setLoading(true);
      setStep(4);
      await fetchSmartRecommendations(newAnswers);
    }
  };

  // === THE BRAIN ===
  const fetchSmartRecommendations = async (criteria: any) => {
    let query = supabase.from("products").select("*");

    // 1. GENDER FILTER (Include Unisex items for everyone)
    if (criteria.gender !== 'Unisex') {
      query = query.in('gender', [criteria.gender, 'Unisex']);
    }

    // 2. CATEGORY MAPPING (The "Category" answer maps to DB categories)
    if (criteria.category === 'Wrist') {
      query = query.in('category', ['Watches', 'Moissanite']); // Filter for bracelets/watches
    } else if (criteria.category === 'Neck') {
      query = query.in('subcategory', ['Chains', 'Necklaces', 'Pendants']); // Needs subcategory logic or description search
    } else if (criteria.category === 'Finger') {
      query = query.ilike('name', '%Ring%'); // Simple text search for Rings
    } else if (criteria.category === 'Scent') {
      query = query.eq('category', 'Perfumes');
    }

    // 3. STYLE FILTER (Subtle vs Statement)
    // If DB has 'style' column, use it. If not, we can use price as a proxy for now.
    if (criteria.style) {
       query = query.eq('style', criteria.style);
    }

    const { data } = await query.gt("stock", 0).limit(4);

    if (data) setResults(data);
    setLoading(false);
  };

  const resetQuiz = () => {
    setStep(1);
    setAnswers({ gender: "", category: "", style: "" });
    setResults([]);
  };

  return (
    <section className="lee-container py-24 border-t border-gray-100 bg-white">
      
      {/* HEADER */}
      <div className="text-center mb-12">
    
        <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase mt-2">
          Find The Perfect Gift.
        </h2>
        <div className="h-1 w-12 bg-black mt-4 mx-auto"></div>
      </div>

      <div className="max-w-3xl mx-auto bg-gray-50 rounded-2xl min-h-[450px] relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-12 text-center shadow-inner">
        
        {/* === STEP 0: START === */}
        {step === 0 && (
          <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
            <div className="bg-white p-6 rounded-full shadow-sm mb-6">
              <Gift size={40} strokeWidth={1.5} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Let us do the hard work.</h3>
            <p className="text-gray-500 mb-8 max-w-sm">
              Answer 3 quick questions about their style, and we'll curate the perfect luxury selection instantly.
            </p>
            <button 
              onClick={() => setStep(1)}
              className="bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all active:scale-95"
            >
              Start Consultation
            </button>
          </div>
        )}

        {/* === STEPS 1, 2, 3: QUESTIONS === */}
        {step >= 1 && step <= 3 && (
          <div className="w-full max-w-md animate-in slide-in-from-right duration-500">
            {/* Progress Bar */}
            <div className="flex justify-center mb-10 gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'w-8 bg-black' : 'w-2 bg-gray-200'}`} />
              ))}
            </div>

            <h3 className="text-xl md:text-2xl font-bold mb-8 leading-tight">
              {steps[step - 1].question}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {steps[step - 1].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(steps[step - 1].key, opt.value)}
                  className="bg-white border border-gray-200 py-5 px-6 rounded-xl text-sm font-bold text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all text-left flex items-center justify-between group shadow-sm"
                >
                  {opt.label}
                  <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === STEP 4: LOADING === */}
        {step === 4 && loading && (
          <div className="flex flex-col items-center animate-pulse">
             <div className="h-12 w-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-6"></div>
             <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading...</p>
          </div>
        )}

        {/* === STEP 4: RESULTS === */}
        {step === 4 && !loading && (
          <div className="w-full animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
               <div className="text-left">
                 <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Your Selection</p>
                 <h3 className="text-lg font-bold">We found {results.length} matches</h3>
               </div>
               <button onClick={resetQuiz} className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 text-gray-500 hover:text-black transition-colors bg-white px-4 py-2 rounded-full border border-gray-200">
                 <RefreshCw size={12} /> Restart
               </button>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {results.map((product) => (
                  <div key={product.id} className="group bg-white p-3 rounded-xl shadow-sm hover:shadow-lg transition-all text-left border border-gray-100">
                    <div className="relative aspect-square bg-gray-50 mb-3 overflow-hidden rounded-lg">
                       <ProductImage
                         src={product.images?.[0]}
                         alt={product.name}
                         fill
                         className="object-cover transition-transform duration-700 group-hover:scale-105"
                       />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase text-gray-400">{product.category}</p>
                      <h4 className="font-bold text-xs truncate leading-relaxed">{product.name}</h4>
                      <p className="text-xs font-bold text-black">₦{product.price.toLocaleString()}</p>
                    </div>
                    <button className="w-full mt-3 bg-black text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 rounded-lg">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10">
                <p className="text-gray-500">No specific matches found. Try adjusting your vibe.</p>
                <button onClick={resetQuiz} className="mt-4 text-black underline text-sm font-bold">Try Again</button>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}