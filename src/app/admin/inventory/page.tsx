"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import { Plus, X, Edit2, Clock, Star, Sparkles, UploadCloud, Trash2, Tag, Wand2, Loader2 } from "lucide-react";
import Image from "next/image";

type Product = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  on_sale: boolean;
  sale_price: number | null;
  stock: number;
  in_stock: boolean;
  category: string;
  subcategory: string;
  images: string[];
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_drop: boolean;
  release_date: string | null;
  early_access_price: number | null;
  gender: string;
  style: string;
};

const emptyProduct: Product = {
  name: "", slug: "", description: "", price: 0,
  on_sale: false, sale_price: null, stock: 1, in_stock: true,
  category: "", subcategory: "", images: [],
  is_bestseller: false, is_new_arrival: false, // Defaulted to false so it doesn't auto-select
  is_drop: false, release_date: "", early_access_price: null,
  gender: "Unisex", style: "Classic"
};

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Product>(emptyProduct);
  const [saving, setSaving] = useState(false);

  // Image Upload & AI State
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [bgProcessingIndex, setBgProcessingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Smart UI Toggles
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // ==========================================
      // DROP AUTO-EXPIRATION ENGINE
      // ==========================================
      const now = new Date().getTime();
      const expiredDrops = data.filter((p: Product) => 
        p.is_drop && p.release_date && new Date(p.release_date).getTime() <= now
      );

      if (expiredDrops.length > 0) {
        // Silently update all expired drops in the database
        await Promise.all(expiredDrops.map(p => 
          supabase.from("products").update({
            is_drop: false,
            release_date: null,
            early_access_price: null,
            is_new_arrival: false // Ensures it doesn't auto-flag as a new arrival
          }).eq("id", p.id)
        ));

        // Re-fetch the clean, updated list
        const { data: refreshedData } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (refreshedData) setProducts(refreshedData);
      } else {
        setProducts(data);
      }
    }
    setLoading(false);
  };

  const availableCategories = Array.from(
    new Set(products.map(p => p.category).filter(Boolean))
  );

  const availableSubcategories = Array.from(
    new Set(
      products
        .filter(p => p.category === formData.category && p.subcategory)
        .map(p => p.subcategory)
    )
  );

  const deleteProduct = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this piece? This action cannot be undone.");
    if (!confirmDelete) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Error deleting product: " + error.message);
    else fetchProducts();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      let newData = { ...formData, [name]: checked };

      if (name === "is_bestseller" && checked) {
        newData.is_new_arrival = false;
        newData.is_drop = false; 
        newData.early_access_price = null;
        newData.release_date = "";
      }
      if (name === "is_new_arrival" && checked) {
        newData.is_bestseller = false;
        newData.is_drop = false; 
        newData.early_access_price = null;
        newData.release_date = "";
      }
      if (name === "is_drop" && checked) {
        newData.is_bestseller = false;
        newData.is_new_arrival = false;
        newData.on_sale = false;
        newData.sale_price = null;
      }
      if (name === "on_sale" && checked) {
        newData.is_drop = false;
        newData.early_access_price = null;
        newData.release_date = "";
      }

      if (name === "on_sale" && !checked) newData.sale_price = null;
      if (name === "is_drop" && !checked) {
        newData.early_access_price = null;
        newData.release_date = "";
      }

      setFormData(newData);
    } else if (type === "number") {
      setFormData({ ...formData, [name]: value === "" ? null : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ==========================================
  // IMAGE LOGIC & AI BACKGROUND REMOVAL (WATERFALL ENGINE)
  // ==========================================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    if (formData.images.length + newImageFiles.length + selectedFiles.length > 4) {
      alert("You can only upload a maximum of 4 images per piece.");
      return;
    }

    setNewImageFiles(prev => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeBackgroundWithRotation = async (file: File): Promise<File | null> => {
    const API_KEYS = [
      process.env.NEXT_PUBLIC_REMOVE_BG_KEY_1,
      process.env.NEXT_PUBLIC_REMOVE_BG_KEY_2,
      process.env.NEXT_PUBLIC_REMOVE_BG_KEY_3,
      process.env.NEXT_PUBLIC_REMOVE_BG_KEY_4,
    ].filter(Boolean);

    if (API_KEYS.length === 0) {
      alert("No Remove.bg API keys found in environment variables.");
      return null;
    }

    for (let i = 0; i < API_KEYS.length; i++) {
      const key = API_KEYS[i];
      try {
        const formData = new FormData();
        formData.append('image_file', file);
        formData.append('size', 'auto');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: { 'X-Api-Key': key as string },
          body: formData
        });

        if (response.ok) {
          const blob = await response.blob();
          const newName = file.name.replace(/\.[^/.]+$/, "") + "-nobg.png";
          return new File([blob], newName, { type: 'image/png' });
        } 
        
        // 402 means payment required / out of credits. 429 means too many requests.
        if (response.status === 402 || response.status === 429 || response.status === 403) {
          console.warn(`Key ${i + 1} exhausted. Failing over to next key...`);
          continue; 
        }

        const text = await response.text();
        console.error("Remove BG Error:", text);
        alert("Could not remove the background. The AI might not detect a clear subject. Please try another image.");
        return null;

      } catch (error) {
        console.error(`Fetch failed on key ${i+1}`, error);
      }
    }

    alert("Background removal service is temporarily unavailable. Please try another image.");
    return null;
  };

  const executeBackgroundRemoval = async (index: number) => {
    setBgProcessingIndex(index);
    const fileToProcess = newImageFiles[index];
    
    const processedFile = await removeBackgroundWithRotation(fileToProcess);
    
    if (processedFile) {
      // Replace old file with transparent file
      const updatedFiles = [...newImageFiles];
      updatedFiles[index] = processedFile;
      setNewImageFiles(updatedFiles);

      // Replace preview
      const updatedPreviews = [...previewUrls];
      updatedPreviews[index] = URL.createObjectURL(processedFile);
      setPreviewUrls(updatedPreviews);
    }
    setBgProcessingIndex(null);
  };

  const removeExistingImage = (indexToRemove: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, index) => index !== indexToRemove)
    });
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviewUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  // --------------------------

  const openNewForm = () => {
    setFormData(emptyProduct);
    setNewImageFiles([]);
    setPreviewUrls([]);
    setIsCustomCategory(availableCategories.length === 0);
    setIsCustomSubcategory(true); 
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setFormData(product);
    setNewImageFiles([]);
    setPreviewUrls([]);
    setIsCustomCategory(false);
    setIsCustomSubcategory(false);
    setIsFormOpen(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const productToSave = { ...formData };

    if (newImageFiles.length > 0) {
      const uploadedUrls: string[] = [];
      for (const file of newImageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("product_images")
          .upload(fileName, file);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("product_images")
            .getPublicUrl(fileName);
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }
      productToSave.images = [...productToSave.images, ...uploadedUrls];
    }

    if (!productToSave.id) {
      productToSave.slug = productToSave.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (!productToSave.release_date) productToSave.release_date = null;
    productToSave.in_stock = productToSave.stock > 0;

    if (productToSave.id) {
      await supabase.from("products").update(productToSave).eq("id", productToSave.id);
    } else {
      await supabase.from("products").insert([productToSave]);
    }

    await fetchProducts(); 
    setIsFormOpen(false);
    setSaving(false);
  };

  if (loading) return null;

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-end justify-between mb-12 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-1">
            Inventory Room
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-400">
            {products.length} Pieces
          </p>
        </div>
        <button 
          onClick={openNewForm}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded-sm shadow-sm hover:shadow-md"
        >
          <Plus size={14} /> Add Piece
        </button>
      </div>

      {/* PRODUCT LIST */}
      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-[#fdfdfd] border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-black transition-colors rounded-sm">
            <div className="flex items-center gap-6">
              <div className="relative w-16 h-16 bg-[#fcfcfc] overflow-hidden shrink-0 rounded-sm">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[8px] text-gray-400 uppercase tracking-widest">No Img</div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-1 truncate max-w-[200px] md:max-w-[300px]">{product.name}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mr-2">{product.category}</p>
                  
                  {/* Status Badges */}
                  {product.is_drop && <span className="text-[8px] bg-black text-white px-2 py-0.5 uppercase tracking-widest font-bold flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span> Drop</span>}
                  {product.on_sale && <span className="text-[8px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 uppercase tracking-widest font-bold">Sale</span>}
                  {product.is_bestseller && <span className="text-[8px] bg-yellow-50 text-yellow-700 border border-yellow-100 px-2 py-0.5 uppercase tracking-widest font-bold">Bestseller</span>}
                  {product.is_new_arrival && <span className="text-[8px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 uppercase tracking-widest font-bold">New</span>}
                  {product.stock <= 0 && <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 uppercase tracking-widest font-bold">Out of Stock</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-8 border-t border-gray-100 pt-4 md:border-t-0 md:pt-0">
              <div className="text-left md:text-right w-16">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Stock</p>
                <p className={`font-mono text-sm ${product.stock <= 0 ? 'text-red-600 font-bold' : 'text-black'}`}>{product.stock}</p>
              </div>
              
              {/* SMART PRICING DISPLAY */}
              <div className="text-right w-24">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Price</p>
                <div className="flex flex-col items-end">
                  {product.on_sale && product.sale_price ? (
                    <>
                      <span className="font-mono text-[10px] text-gray-400 line-through">₦{product.price.toLocaleString()}</span>
                      <span className="font-mono text-sm text-red-600 font-bold">₦{product.sale_price.toLocaleString()}</span>
                    </>
                  ) : product.is_drop && product.early_access_price ? (
                    <>
                      <span className="font-mono text-[10px] text-gray-400 line-through">₦{product.price.toLocaleString()}</span>
                      <span className="font-mono text-sm text-black font-bold">₦{product.early_access_price.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="font-mono text-sm text-black">₦{product.price.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS (EDIT & DELETE) */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openEditForm(product)}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 text-black hover:bg-black hover:text-white transition-colors shrink-0 rounded-sm"
                  title="Edit Piece"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => product.id && deleteProduct(product.id)}
                  className="w-10 h-10 flex items-center justify-center border border-red-100 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors shrink-0 rounded-sm"
                  title="Delete Piece"
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* FULL-SCREEN SLIDE-OUT FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-[#fcfcfc] w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            
            <div className="p-8 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-20 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-black">
                {formData.id ? "Edit Masterpiece" : "Add New Piece"}
              </h2>
              <button type="button" onClick={() => setIsFormOpen(false)} className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-black transition-colors">
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <form id="product-form" onSubmit={saveProduct} className="p-8 space-y-12 flex-1 relative">
              
              {/* IMAGE UPLOAD & AI SECTION */}
              <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center gap-2">
                    Piece Imagery (Max 4)
                  </h3>
                  <span className="text-[9px] font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">{formData.images.length + newImageFiles.length} / 4</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* EXISTING IMAGES */}
                  {formData.images.map((imgUrl, idx) => (
                    <div key={`existing-${idx}`} className="relative aspect-[3/4] bg-gray-50 border border-gray-200 group overflow-hidden rounded-sm shadow-sm">
                      <Image src={imgUrl} alt="Product view" fill className="object-cover" />
                      <button type="button" onClick={() => removeExistingImage(idx)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={20} className="text-white drop-shadow-md" />
                      </button>
                    </div>
                  ))}

                  {/* NEWLY ADDED IMAGES (WITH AI WAND) */}
                  {previewUrls.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-[3/4] bg-[#fcfcfc] border-2 border-black group overflow-hidden rounded-sm shadow-sm">
                      <Image src={url} alt="New upload preview" fill className="object-cover mix-blend-multiply" />
                      <div className="absolute top-2 left-2 bg-black text-white text-[8px] uppercase tracking-widest px-2 py-1 shadow-md">New</div>
                      
                      {/* Hover Controls */}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* THE MAGIC WAND: Remove BG specifically for this image */}
                        <button 
                          type="button" 
                          onClick={() => executeBackgroundRemoval(idx)}
                          disabled={bgProcessingIndex === idx}
                          className="w-10 h-10 bg-white/20 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
                          title="Remove Background (Uses 1 Credit)"
                        >
                          <Wand2 size={16} />
                        </button>

                        <button type="button" onClick={() => removeNewImage(idx)} className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Loading State Overlay */}
                      {bgProcessingIndex === idx && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                          <Loader2 size={24} className="animate-spin text-black mb-2" />
                          <span className="text-[8px] font-bold uppercase tracking-widest text-black">Processing...</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* ADD BUTTON */}
                  {(formData.images.length + newImageFiles.length) < 4 && (
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[3/4] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-black hover:bg-gray-50 transition-all rounded-sm"
                    >
                      <UploadCloud size={24} className="mb-2" />
                      <span className="text-[9px] uppercase tracking-widest font-bold">Select File</span>
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" multiple className="hidden" />
              </div>

              {/* BASIC INFO */}
              <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black mb-6 border-b border-gray-100 pb-2">Core Details</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Piece Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 h-10 outline-none focus:border-black text-sm text-black transition-colors rounded-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full bg-transparent border-b border-gray-300 py-2 outline-none focus:border-black text-sm text-black resize-none transition-colors rounded-none"></textarea>
                  </div>
                </div>
              </div>

              {/* SMART CATEGORIZATION */}
              <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black mb-6 border-b border-gray-100 pb-2">Classification</h3>
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500">Category</label>
                      {availableCategories.length > 0 && (
                        <button type="button" onClick={() => setIsCustomCategory(!isCustomCategory)} className="text-[9px] uppercase tracking-widest text-blue-600 hover:text-black font-bold transition-colors">
                          {isCustomCategory ? "Select Existing" : "+ Add New"}
                        </button>
                      )}
                    </div>
                    {isCustomCategory || availableCategories.length === 0 ? (
                      <input required type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Watches" className="w-full bg-transparent border-b border-gray-300 h-10 outline-none focus:border-black text-sm text-black transition-colors rounded-none" />
                    ) : (
                      <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 h-10 outline-none focus:border-black text-sm text-black appearance-none transition-colors rounded-none">
                        <option value="" disabled>Select Category</option>
                        {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500">Subcategory</label>
                      {availableSubcategories.length > 0 && (
                        <button type="button" onClick={() => setIsCustomSubcategory(!isCustomSubcategory)} className="text-[9px] uppercase tracking-widest text-blue-600 hover:text-black font-bold transition-colors">
                          {isCustomSubcategory ? "Select Existing" : "+ Add New"}
                        </button>
                      )}
                    </div>
                    {isCustomSubcategory || availableSubcategories.length === 0 ? (
                      <input type="text" name="subcategory" value={formData.subcategory} onChange={handleInputChange} placeholder="e.g. Diamond" className="w-full bg-transparent border-b border-gray-300 h-10 outline-none focus:border-black text-sm text-black transition-colors rounded-none" />
                    ) : (
                      <select name="subcategory" value={formData.subcategory} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 h-10 outline-none focus:border-black text-sm text-black appearance-none transition-colors rounded-none">
                        <option value="" disabled>Select Subcategory</option>
                        {availableSubcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Gender Focus</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 h-10 outline-none focus:border-black text-sm text-black appearance-none transition-colors rounded-none">
                      <option value="Unisex">Unisex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Style Type</label>
                    <select name="style" value={formData.style} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 h-10 outline-none focus:border-black text-sm text-black appearance-none transition-colors rounded-none">
                      <option value="Classic">Classic</option>
                      <option value="Statement">Statement</option>
                      <option value="Subtle">Subtle</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* STANDARD PRICING & INVENTORY */}
              <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black mb-6 border-b border-gray-100 pb-2">Logistics</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Standard Price (₦)</label>
                    <input required type="number" name="price" value={formData.price || ""} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 h-10 outline-none focus:border-black font-mono text-sm text-black transition-colors rounded-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Units in Stock</label>
                    <input required type="number" name="stock" value={formData.stock || ""} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 h-10 outline-none focus:border-black font-mono text-sm text-black transition-colors rounded-none" />
                  </div>
                </div>
              </div>

              {/* STATUS TOGGLES (THE MATRIX) */}
              <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black mb-6 border-b border-gray-100 pb-2 flex items-center justify-between">
                  Marketing Engine
                  {formData.is_drop && <span className="text-[9px] text-red-500 animate-pulse">Drop Active - Overrides applied</span>}
                </h3>
                
                {/* STATUS BADGES */}
                <div className="flex flex-col md:flex-row gap-6 mb-10 bg-gray-50 p-4 border border-gray-200 rounded-sm">
                  <label className={`flex items-center gap-3 cursor-pointer p-2 transition-all ${formData.is_drop ? 'opacity-30 pointer-events-none' : 'hover:bg-white rounded'}`}>
                    <input type="checkbox" name="is_bestseller" checked={formData.is_bestseller} onChange={handleInputChange} disabled={formData.is_drop} className="w-4 h-4 accent-black" />
                    <Star size={16} className={formData.is_bestseller ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />
                    <span className="text-xs font-bold uppercase tracking-widest text-black">Bestseller Status</span>
                  </label>
                  
                  <div className="hidden md:block w-px h-8 bg-gray-300"></div>
                  
                  <label className={`flex items-center gap-3 cursor-pointer p-2 transition-all ${formData.is_drop ? 'opacity-30 pointer-events-none' : 'hover:bg-white rounded'}`}>
                    <input type="checkbox" name="is_new_arrival" checked={formData.is_new_arrival} onChange={handleInputChange} disabled={formData.is_drop} className="w-4 h-4 accent-black" />
                    <Sparkles size={16} className={formData.is_new_arrival ? "text-black fill-black" : "text-gray-400"} />
                    <span className="text-xs font-bold uppercase tracking-widest text-black">New Arrival Status</span>
                  </label>
                </div>

                {/* SALE & DROP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* SALE MODULE */}
                  <div className={`border p-6 transition-all duration-300 rounded-sm ${formData.on_sale ? 'border-red-600 bg-red-50/30' : 'border-gray-200 bg-white'} ${formData.is_drop ? 'opacity-30 pointer-events-none' : ''}`}>
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <input type="checkbox" name="on_sale" checked={formData.on_sale} onChange={handleInputChange} disabled={formData.is_drop} className="w-4 h-4 accent-red-600" />
                      <Tag size={16} className={formData.on_sale ? "text-red-600" : "text-gray-400"} />
                      <span className={`text-xs font-bold uppercase tracking-widest ${formData.on_sale ? 'text-red-600' : 'text-black'}`}>Active Sale</span>
                    </label>
                    <div className={`transition-all overflow-hidden ${formData.on_sale ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="pt-2">
                        <label className="block text-[9px] uppercase tracking-widest text-red-600 mb-2 font-bold">Discounted Sale Price (₦)</label>
                        <input type="number" name="sale_price" value={formData.sale_price || ""} onChange={handleInputChange} className="w-full bg-transparent border-b border-red-200 h-10 outline-none focus:border-red-600 font-mono text-sm text-black rounded-none" />
                      </div>
                    </div>
                  </div>

                  {/* DROP MODULE */}
                  <div className={`border p-6 transition-all duration-300 rounded-sm ${formData.is_drop ? 'border-black bg-black text-white shadow-xl' : 'border-gray-200 bg-white text-black'}`}>
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <input type="checkbox" name="is_drop" checked={formData.is_drop} onChange={handleInputChange} className="w-4 h-4 accent-white" />
                      <Clock size={16} className={formData.is_drop ? "text-yellow-400" : "text-gray-400"} />
                      <span className={`text-xs font-bold uppercase tracking-widest ${formData.is_drop ? 'text-yellow-400' : 'text-black'}`}>The Sunday Drop</span>
                    </label>
                    <div className={`transition-all overflow-hidden ${formData.is_drop ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="pt-2 space-y-4">
                        <div>
                          <label className="block text-[9px] uppercase tracking-widest text-gray-400 mb-2">Early Access Price (₦)</label>
                          <input type="number" name="early_access_price" value={formData.early_access_price || ""} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-700 h-10 outline-none focus:border-white font-mono text-sm text-white rounded-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-widest text-gray-400 mb-2">Official Release Time</label>
                          <input type="datetime-local" name="release_date" value={formData.release_date ? formData.release_date.slice(0, 16) : ""} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-700 h-10 outline-none focus:border-white text-xs text-white rounded-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </form>

            {/* FIXED FOOTER BUTTON */}
            <div className="p-8 border-t border-gray-200 bg-white sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button 
                type="submit"
                form="product-form"
                disabled={saving}
                className="w-full bg-black text-white h-14 flex items-center justify-center uppercase font-bold tracking-[0.2em] text-[10px] hover:bg-gray-800 transition-colors disabled:opacity-70 rounded-sm shadow-md hover:shadow-lg"
              >
                {saving ? "Encrypting & Saving..." : formData.id ? "Update Masterpiece" : "Publish to Store"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}