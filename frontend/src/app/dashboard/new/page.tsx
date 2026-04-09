"use client";

import React, { useState, useEffect, useRef } from "react";
import { PlusCircle, Upload, X, Check, Save, Sparkles, ChevronLeft, LayoutGrid, Info, Settings, InfoIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/components/ThemeProvider";
import { API_BASE_URL } from "@/config/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AddCarView() {
  const { settings } = useSettings();
  const router = useRouter();
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    pricePerDay: 450,
    description: "",
    features: ["V12 Engine", "GPS", "Luxury Interior"]
  });

  const maxImages = settings?.maxImagesPerListing || 5;

  useEffect(() => {
    fetch(`${API_BASE_URL}/brands`)
      .then(res => res.json())
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(err => console.log('Failed to fetch brands:', err));
  }, []);

  const handleAddField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed.`);
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-4 group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to fleet</span>
           </Link>
           <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Listing</h1>
           <p className="text-slate-500">Share your premium vehicle with the CarRentify community.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: General Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center gap-3 mb-4 text-primary">
               <InfoIcon size={20} />
               <h3 className="font-bold text-lg">Vehicle Particulars</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Brand</label>
                 <select 
                    value={formData.brand}
                    onChange={(e) => handleAddField('brand', e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    required
                 >
                   <option value="">Select Brand</option>
                   {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Model Name</label>
                 <Input 
                   value={formData.model}
                   onChange={(e) => handleAddField('model', e.target.value)}
                   className="h-12 bg-slate-50 border-none rounded-xl px-6 font-semibold"
                   placeholder="e.g. Phantom VIII"
                   required
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Production Year</label>
                 <Input 
                   type="number"
                   value={formData.year}
                   onChange={(e) => handleAddField('year', parseInt(e.target.value))}
                   className="h-12 bg-slate-50 border-none rounded-xl px-6 font-semibold"
                   required
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Rate ($/day)</label>
                 <Input 
                   type="number"
                   value={formData.pricePerDay}
                   onChange={(e) => handleAddField('pricePerDay', parseInt(e.target.value))}
                   className="h-12 bg-slate-50 border-none rounded-xl px-6 font-semibold"
                   required
                 />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">About the Vehicle</label>
              <textarea 
                value={formData.description}
                onChange={(e) => handleAddField('description', e.target.value)}
                className="w-full h-32 bg-slate-50 border-none rounded-2xl p-6 font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Describe the condition, history and unique features..."
                required
              />
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-8 text-primary">
                <Sparkles size={20} />
                <h3 className="font-bold text-lg">Images & Visuals</h3>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence>
                  {images.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="relative aspect-square rounded-2xl overflow-hidden group shadow-md"
                    >
                      <img src={img} alt="Car" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-red-500 shadow-lg scale-0 group-hover:scale-100 transition-transform"
                      >
                         <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {images.length < maxImages && (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:border-primary/40 hover:text-primary transition-all group"
                  >
                    <Upload size={24} className="group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">{images.length}/{maxImages}</span>
                  </button>
                )}
             </div>
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               multiple 
               accept="image/*"
               onChange={handleImageUpload} 
             />
             <p className="text-[11px] text-slate-400 mt-6 flex items-center gap-2 px-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                Images are optimized for high-performance delivery. 5MB max per file.
             </p>
          </section>
        </div>

        {/* Right: Actions/Support */}
        <div className="space-y-6">
           <section className="bg-primary p-8 rounded-3xl shadow-xl shadow-primary/20 text-white text-center">
              <PlusCircle className="mx-auto mb-6 opacity-40" size={48} />
              <h3 className="text-xl font-bold mb-4">Complete Listing</h3>
              <p className="text-white/70 text-sm mb-8 leading-relaxed">Ensure all technical details are accurate to maximize your fleet's visibility and booking rate.</p>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-white text-primary hover:bg-slate-50 transition-all font-bold text-lg shadow-lg group"
              >
                {loading ? "Publishing..." : "Publish Vehicle"}
                {!loading && <Check className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />}
              </Button>
           </section>

           <div className="bg-white p-6 rounded-3xl border border-slate-200">
             <div className="flex items-center gap-3 mb-4 text-emerald-500">
                <Settings size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Platform Rules</span>
             </div>
             <ul className="space-y-3">
               {[
                 "Vivid images improve booking by 40%",
                 "Accurate pricing prevents disputes",
                 "Regular fleet maintenance is mandatory"
               ].map((rule, i) => (
                 <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 mt-1.5 shrink-0" />
                   {rule}
                 </li>
               ))}
             </ul>
           </div>
        </div>
      </form>
    </div>
  );
}
