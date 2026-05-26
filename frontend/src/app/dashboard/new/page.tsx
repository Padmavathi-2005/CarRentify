"use client";

import React, { useState, useEffect, useRef } from "react";
import { PlusCircle, Upload, X, Check, Save, Sparkles, ChevronLeft, LayoutGrid, Info, Settings, InfoIcon, ShieldCheck, Wand2 } from "lucide-react";
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
 const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
 const [images, setImages] = useState<{url: string, isWide: boolean}[]>([]);
 const [validationError, setValidationError] = useState<string | null>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);
 
 const [aiPrompt, setAiPrompt] = useState("");
 const [isAiLoading, setIsAiLoading] = useState(false);
 
 const [formData, setFormData] = useState({
 brand: "",
 vehicleType: "",
 model: "",
 year: new Date().getFullYear(),
 pricePerDay: 450,
 fuelType: "Petrol",
 transmission: "Automatic",
 seats: 5,
 mileage: 0,
 driveType: "AWD",
 description: "",
 features: ["V12 Engine", "GPS", "Luxury Interior"]
 });
 const [loading, setLoading] = useState(false);

 const maxImages = settings?.maxImagesPerListing || 5;

 useEffect(() => {
 fetch(`${API_BASE_URL}/brands`)
 .then(res => res.json())
 .then(data => setBrands(Array.isArray(data) ? data : []))
 .catch(err => console.log('Failed to fetch brands:', err));

 fetch(`${API_BASE_URL}/vehicle-types`)
 .then(res => res.json())
 .then(data => setVehicleTypes(Array.isArray(data) ? data : []))
 .catch(err => console.log('Failed to fetch types:', err));
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

 setValidationError(null);

 files.forEach(file => {
 const isSvg = file.type === "image/svg+xml" || file.name.endsWith(".svg");
 const reader = new FileReader();
 reader.onloadend = () => {
 const url = reader.result as string;
 const img = new window.Image();
 img.onload = () => {
 // Validation: Width must be significantly greater than height (Landscape)
 // For SVGs, if dimensions aren't explicitly 0x0, we use them; 
 // otherwise, we treat SVGs as 'Wide-capable' since they are vectors.
 let isWide = img.width > (img.height * 1.4);
 if (isSvg && img.width === 0) isWide = true; 
 
 setImages(prev => [...prev, { url, isWide }]);
 };
 img.src = url;
 };
 reader.readAsDataURL(file);
 });
 };

 const removeImage = (idx: number) => {
 setImages(prev => prev.filter((_, i) => i !== idx));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 
 // STRICT VALIDATION: Must have at least one image
 if (images.length === 0) {
 setValidationError("Missing Assets: You must upload at least one image of the vehicle.");
 window.scrollTo({ top: 0, behavior: 'smooth' });
 return;
 }

 // STRICT VALIDATION: Must have at least one wide image
 const hasWideImage = images.some(img => img.isWide);
 if (!hasWideImage) {
 setValidationError("Incomplete Requirements: You must upload at least one Landscape (Wide) image. Square/Portrait images are permitted as additional photos only.");
 window.scrollTo({ top: 0, behavior: 'smooth' });
 return;
 }

 if (!formData.brand || !formData.vehicleType) {
 setValidationError("Please select both a Brand and a Vehicle Category.");
 return;
 }

 setLoading(true);
 
 try {
 const token = localStorage.getItem('token');
 const res = await fetch(`${API_BASE_URL}/cars`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({
 ...formData,
 brandId: formData.brand,
 images: images.map(img => img.url),
 // Location fallback for dev
 location: {
 city: "Los Angeles",
 country: "USA",
 address: "Beverly Hills"
 }
 })
 });

 if (res.ok) {
 router.push("/dashboard");
 } else {
 const err = await res.json();
 setValidationError(err.message || "Failed to synchronize with central fleet database.");
 }
 } catch (err) {
 setValidationError("Terminal connection timed out. Please verify connectivity.");
 } finally {
 setLoading(false);
 }
 };

 const handleAiAutofill = async () => {
 if (!aiPrompt.trim()) return;
 setIsAiLoading(true);
 try {
 const token = localStorage.getItem('token');
 const res = await fetch(`${API_BASE_URL}/cars/ai-autofill`, {
 method: 'POST',
 headers: { 
   'Content-Type': 'application/json',
   'Authorization': `Bearer ${token}` 
 },
 body: JSON.stringify({ prompt: aiPrompt })
 });
 if (!res.ok) {
 const err = await res.json();
 throw new Error(err.error || 'Failed to generate details');
 }
 const data = await res.json();
 
 // Match brand
 let brandId = formData.brand;
 if (data.brandName) {
 const matchedBrand = brands.find(b => b.name.toLowerCase() === data.brandName.toLowerCase());
 if (matchedBrand) brandId = matchedBrand._id;
 }

 // Match category
 let vehicleTypeId = formData.vehicleType;
 if (data.categoryName) {
 const matchedType = vehicleTypes.find(t => t.name.toLowerCase() === data.categoryName.toLowerCase());
 if (matchedType) vehicleTypeId = matchedType._id;
 }

 setFormData(prev => ({
 ...prev,
 brand: brandId,
 vehicleType: vehicleTypeId,
 model: data.model || prev.model,
 year: data.year || prev.year,
 pricePerDay: data.pricePerDay || prev.pricePerDay,
 fuelType: data.fuelType || prev.fuelType,
 transmission: data.transmission || prev.transmission,
 seats: data.seats || prev.seats,
 mileage: data.mileage || prev.mileage,
 description: data.description || prev.description,
 }));
 
 setValidationError(null);
 } catch (error: any) {
 setValidationError(error.message || 'AI Autofill failed.');
 } finally {
 setIsAiLoading(false);
 }
 };

 return (
 <div className="max-w-5xl mx-auto space-y-8">
 {/* Error Banner */}
 <AnimatePresence>
 {validationError && (
 <motion.div 
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 className="bg-red-50 border-l-4 border-red-500 p-6 rounded-app flex items-center gap-4 -500/5 group"
 >
 <div className="bg-red-500 p-2 rounded-app text-white">
 <InfoIcon size={20} />
 </div>
 <div>
 <h4 className="font-bold text-red-900 text-sm">Action Required</h4>
 <p className="text-red-700 text-xs mt-0.5">{validationError}</p>
 </div>
 <button onClick={() => setValidationError(null)} className="ml-auto text-red-500 hover:rotate-90 transition-transform">
 <X size={20} />
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 {/* Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
 <div>
 <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-4 group">
 <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
 <span className="text-xs font-bold uppercase tracking-widest">Back to fleet</span>
 </Link>
 <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Listing</h1>
 <p className="text-slate-500">Share your premium vehicle with the CarRental community.</p>
 </div>
 </div>

 {/* AI Autofill Magic */}
 <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 p-6 rounded-app border border-violet-100 flex flex-col md:flex-row gap-4 items-center">
 <div className="flex-1 w-full">
 <label className="text-xs font-bold uppercase tracking-widest text-violet-600 px-1 mb-2 block">✨ Magic Autofill</label>
 <Input 
 value={aiPrompt}
 onChange={(e) => setAiPrompt(e.target.value)}
 placeholder="e.g., 2023 Tesla Model S Plaid, 15k miles, Electric"
 className="h-12 bg-white border-violet-200 rounded-app px-6 font-medium text-slate-700 w-full focus:ring-violet-300"
 onKeyDown={(e) => e.key === 'Enter' && !isAiLoading && (e.preventDefault(), handleAiAutofill())}
 />
 </div>
 <Button 
 type="button"
 onClick={handleAiAutofill}
 disabled={isAiLoading || !aiPrompt.trim()}
 className="md:mt-6 h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white rounded-app font-bold transition-all whitespace-nowrap"
 >
 {isAiLoading ? "Generating..." : <><Wand2 size={18} className="mr-2" /> Autofill with AI</>}
 </Button>
 </div>

 <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Left: General Info */}
 <div className="lg:col-span-2 space-y-8">
 <section className="bg-white p-8 rounded-app border border-slate-200 space-y-6">
 <div className="flex items-center gap-3 mb-4 text-primary">
 <InfoIcon size={20} />
 <h3 className="font-bold text-lg">Vehicle Particulars</h3>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Vehicle Category</label>
 <select 
 value={formData.vehicleType}
 onChange={(e) => handleAddField('vehicleType', e.target.value)}
 className="w-full h-12 bg-slate-50 border border-slate-100 rounded-app px-4 font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
 required
 >
 <option value="">Select Category</option>
 {vehicleTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Brand</label>
 <select 
 value={formData.brand}
 onChange={(e) => handleAddField('brand', e.target.value)}
 className="w-full h-12 bg-slate-50 border border-slate-100 rounded-app px-4 font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
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
 className="h-12 bg-slate-50 border-none rounded-app px-6 font-semibold"
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
 className="h-12 bg-slate-50 border-none rounded-app px-6 font-semibold"
 required
 />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Rate ($/day)</label>
 <Input 
 type="number"
 value={formData.pricePerDay}
 onChange={(e) => handleAddField('pricePerDay', parseInt(e.target.value))}
 className="h-12 bg-slate-50 border-none rounded-app px-6 font-semibold"
 required
 />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Fuel Type</label>
 <select 
 value={formData.fuelType}
 onChange={(e) => handleAddField('fuelType', e.target.value)}
 className="w-full h-12 bg-slate-50 border border-slate-100 rounded-app px-4 font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
 required
 >
 <option value="Petrol">Petrol</option>
 <option value="Diesel">Diesel</option>
 <option value="Electric">Electric</option>
 <option value="Hybrid">Hybrid</option>
 <option value="Premium Gas">Premium Gas</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Transmission</label>
 <select 
 value={formData.transmission}
 onChange={(e) => handleAddField('transmission', e.target.value)}
 className="w-full h-12 bg-slate-50 border border-slate-100 rounded-app px-4 font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
 required
 >
 <option value="Automatic">Automatic</option>
 <option value="Manual">Manual</option>
 <option value="Semiautomatic">Semiautomatic</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Seating Capacity</label>
 <Input 
 type="number"
 value={formData.seats}
 onChange={(e) => handleAddField('seats', parseInt(e.target.value))}
 className="h-12 bg-slate-50 border-none rounded-app px-6 font-semibold"
 required
 />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Mileage (mi)</label>
 <Input 
 type="number"
 value={formData.mileage}
 onChange={(e) => handleAddField('mileage', parseInt(e.target.value))}
 className="h-12 bg-slate-50 border-none rounded-app px-6 font-semibold"
 placeholder="e.g. 5000"
 required
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">About the Vehicle</label>
 <textarea 
 value={formData.description}
 onChange={(e) => handleAddField('description', e.target.value)}
 className="w-full h-32 bg-slate-50 border-none rounded-app p-6 font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none"
 placeholder="Describe the condition, history and unique features..."
 required
 />
 </div>
 </section>

 <section className="bg-white p-8 rounded-app border border-slate-200 space-y-6">
 <div className="flex justify-between items-center mb-8">
 <div className="flex items-center gap-3 text-primary">
 <Sparkles size={20} />
 <h3 className="font-bold text-lg">Images & Visuals</h3>
 </div>
 <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${images.some(img => img.isWide) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100 animate-pulse'}`}>
 {images.some(img => img.isWide) ? (
 <><Check size={12} /> Wide Hero Ready</>
 ) : (
 <><X size={12} /> Wide Hero Required</>
 )}
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <AnimatePresence>
 {images.map((img, idx) => (
 <motion.div 
 key={idx}
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.8, opacity: 0 }}
 className={`relative aspect-square rounded-app overflow-hidden group border-4 transition-all ${img.isWide ? 'border-emerald-500/30' : 'border-transparent'}`}
 >
 <img src={img.url} alt="Car" className="w-full h-full object-cover" />
 
 {img.isWide && (
 <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 ">
 <LayoutGrid size={8} /> Wide Hero
 </div>
 )}

 <button 
 type="button"
 onClick={() => removeImage(idx)}
 className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-red-500 scale-0 group-hover:scale-100 transition-transform"
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
 className="aspect-square rounded-app border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:border-primary/40 hover:text-primary transition-all group"
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
 accept="image/*,.svg"
 onChange={handleImageUpload} 
 />
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 px-2">
 <p className="text-[11px] text-slate-400 flex items-center gap-2">
 <ShieldCheck size={14} className="text-emerald-500" />
 At least 1 Landscape (Wide) image or SVG is mandatory.
 </p>
 <span className="text-[10px] text-slate-400 font-medium italic">Example: Width (500px+) {">"} Height (300px)</span>
 </div>
 </section>
 </div>

 {/* Right: Actions/Support */}
 <div className="space-y-6">
 <section className="bg-primary p-8 rounded-app text-white text-center">
 <PlusCircle className="mx-auto mb-6 opacity-40" size={48} />
 <h3 className="text-xl font-bold mb-4">Complete Listing</h3>
 <p className="text-white/70 text-sm mb-8 leading-relaxed">Ensure all technical details are accurate to maximize your fleet's visibility and booking rate.</p>
 
 <Button 
 type="submit" 
 disabled={loading || images.length === 0 || !images.some(img => img.isWide)}
 className="w-full h-14 rounded-app bg-white text-primary hover:bg-slate-50 transition-all font-bold text-lg group disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? "Publishing..." : "Publish Vehicle"}
 {!loading && <Check className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />}
 </Button>
 
 {images.length > 0 && !images.some(img => img.isWide) && (
 <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mt-4 animate-bounce">
 Add 1 Landscape Image to Unlock
 </p>
 )}
 </section>

 <div className="bg-white p-6 rounded-app border border-slate-200">
 <div className="flex items-center gap-3 mb-4 text-emerald-500">
 <Settings size={18} />
 <span className="text-[10px] font-bold uppercase tracking-widest">Platform Rules</span>
 </div>
 <ul className="space-y-3">
 {[
 "Mandatory: At least 1 Landscape (Wide) Image",
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
