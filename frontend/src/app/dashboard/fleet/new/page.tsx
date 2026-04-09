"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Save, 
  LogOut as SaveExit, 
  Image as ImageIcon, 
  MapPin, 
  Info, 
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Settings,
  History,
  Globe,
  Tag,
  Palette,
  CheckCircle2,
  AlertCircle,
  Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "@/styles/dashboard-forms.css";
import CustomSelect from "@/components/CustomSelect";

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-slate-50 animate-pulse rounded-xl mt-4 border border-slate-100 flex items-center justify-center text-slate-300 font-bold text-xs uppercase tracking-widest">Loading Map...</div>,
});

export default function NewCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form State for Progress
  const [name, setName] = useState("");
  const [permalink, setPermalink] = useState("");
  const [content, setContent] = useState("");
  const [rentalRate, setRentalRate] = useState("");
  const [make, setMake] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  // Location State
  const [latitude, setLatitude] = useState(40.7128); // Default to NYC
  const [longitude, setLongitude] = useState(-74.0060);

  // Calculate true completion percentage based on filled required fields
  const completionScore = useMemo(() => {
    const requiredValues = [name, permalink, content, rentalRate, make, vehicleType];
    const filledCount = requiredValues.filter(v => v !== undefined && v !== null && v.trim() !== "" && v !== "None" && v !== "Select drive type").length;
    return Math.round((filledCount / requiredValues.length) * 100);
  }, [name, permalink, content, rentalRate, make, vehicleType]);

  const steps = [
    { id: 1, title: "Basics", icon: <Info size={16} /> },
    { id: 2, title: "Tech Specs", icon: <Settings size={16} /> },
    { id: 3, title: "Location & Pricing", icon: <MapPin size={16} /> },
    { id: 4, title: "Finalize", icon: <CheckCircle2 size={16} /> }
  ];

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      nextStep();
      return;
    }
    setLoading(true);
    setTimeout(() => {
        router.push('/dashboard/fleet');
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-1000 pb-20 max-w-[1400px] mx-auto">
      {/* Top Navigation / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-slate-100 pb-8 text-[#1E1E1E]">
        <div>
           <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter">Create New Vehicle</h1>
           <div className="flex flex-wrap items-center gap-2 mt-2 text-primary font-bold text-[10px] uppercase tracking-widest">
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <ChevronRight size={10} className="text-slate-300" />
              <Link href="/dashboard/fleet" className="hover:underline">Fleet</Link>
              <ChevronRight size={10} className="text-slate-300" />
              <span className="text-slate-400 font-medium whitespace-nowrap">Add New Listing</span>
           </div>
        </div>
        <Link href="/" className="text-primary hover:text-black font-extrabold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
            GO TO HOMEPAGE <ExternalLink size={14} />
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Column (Content) */}
        <div className="flex-1 space-y-8 w-full">
          
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
              {/* General Section */}
              <section className="bg-white p-5 md:p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Name *</label>
                    <Input 
                      placeholder="Enter the vehicle name..."
                      className="h-12 md:h-14 border-slate-200 rounded-xl px-4 md:px-6 font-medium focus-visible:ring-primary/20"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Permalink *</label>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all shadow-sm">
                       <div className="bg-slate-50 px-4 py-3 md:px-6 md:py-4 border-b md:border-b-0 md:border-r border-slate-100 text-slate-400 font-bold text-[9px] md:text-xs uppercase tracking-widest whitespace-nowrap select-none">
                          carrentify.com/cars/
                       </div>
                       <Input 
                          placeholder="toyota-camry-2023"
                          className="h-12 md:h-14 border-none rounded-none px-4 md:px-6 font-bold text-slate-900 focus-visible:ring-0 shadow-none bg-transparent"
                          value={permalink}
                          onChange={(e) => setPermalink(e.target.value)}
                          required
                       />
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Description</label>
                    <Textarea 
                      placeholder="Enter a brief description highlighting key features"
                      className="border-slate-200 rounded-xl p-4 md:p-6 font-medium focus-visible:ring-primary/20 min-h-[100px]"
                    />
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block font-bold">Content *</label>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                       <div className="bg-slate-50 p-3 border-b border-slate-200 flex flex-wrap gap-2">
                           {["B", "I", "U", "S", "≡", "≣", "🔗", "📷"].map(tool => (
                             <div key={tool} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-400 font-black cursor-pointer hover:bg-slate-100 transition-colors">{tool}</div>
                           ))}
                       </div>
                       <Textarea 
                          placeholder="Tell the full story of the car here..."
                          className="border-none rounded-none p-4 md:p-6 font-medium focus-visible:ring-0 min-h-[300px] md:min-h-[400px]"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          required
                       />
                    </div>
                 </div>
              </section>

              {/* Status & Sorting Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status *</h3>
                   <CustomSelect options={["Available", "Unavailable", "Rented"]} defaultValue="Available" />
                </section>
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort order</h3>
                   <Input type="number" defaultValue={0} className="h-12 border-slate-200 rounded-xl px-5 font-bold" />
                </section>
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Is used?</h3>
                   <div className="w-10 h-5 bg-slate-100 rounded-full relative cursor-pointer hover:bg-slate-200 transition-colors">
                      <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                   </div>
                </section>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
              {/* Technical Grid Section */}
              <section className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Make</label>
                    <CustomSelect 
                      options={["None", "Toyota", "Honda", "Tesla", "BMW"]} 
                      defaultValue={make} 
                      onChange={(val) => setMake(val)}
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Vehicle Type</label>
                    <CustomSelect 
                      options={["None", "Sedan", "SUV", "Coupe", "Truck"]} 
                      defaultValue={vehicleType}
                      onChange={(val) => setVehicleType(val)}
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Transmission</label>
                    <CustomSelect options={["None", "Automatic", "Manual", "Semi-Auto"]} defaultValue="None" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Fuel Type</label>
                    <CustomSelect options={["None", "Gasoline", "Diesel", "Electric", "Hybrid"]} defaultValue="None" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">License Plate</label>
                    <Input placeholder="Enter license plate" className="h-12 md:h-14 border-slate-200 rounded-xl px-5" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">VIN</label>
                    <Input placeholder="Vehicle Identification Number" className="h-12 md:h-14 border-slate-200 rounded-xl px-5" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Year</label>
                    <Input type="number" placeholder="2023" className="h-12 md:h-14 border-slate-200 rounded-xl px-5" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Mileage</label>
                    <Input type="number" placeholder="Current mileage" className="h-12 md:h-14 border-slate-200 rounded-xl px-5" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Number Seats</label>
                    <Input type="number" placeholder="5" className="h-12 md:h-14 border-slate-200 rounded-xl px-5" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Drive Type</label>
                    <CustomSelect options={["Select drive type", "FWD", "RWD", "AWD", "4WD"]} defaultValue="Select drive type" />
                 </div>
              </section>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
              {/* Location Section */}
              <section className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-slate-100 space-y-6 md:space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Country</label>
                       <CustomSelect options={["United States", "United Kingdom", "Germany"]} defaultValue="United States" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">State</label>
                       <CustomSelect options={["California", "New York", "Florida"]} defaultValue="California" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">City</label>
                       <CustomSelect options={["Los Angeles", "Santa Monica", "Beverly Hills"]} defaultValue="Los Angeles" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-6">
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Address</label>
                        <Input placeholder="Enter specific street address" className="h-12 md:h-14 border-slate-200 rounded-xl px-5" />
                     </div>
                     <LocationPicker lat={latitude} lng={longitude} onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
                 </div>
              </section>

              {/* Rental Info Section */}
              <section className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-slate-100 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-3 block">Rental Type *</label>
                       <CustomSelect options={["Per Hour", "Per Day", "Per Week", "Per Month"]} defaultValue="Per Day" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Rental Rate *</label>
                       <Input 
                         type="number" 
                         placeholder="Enter Rate" 
                         className="h-12 md:h-14 border-slate-200 rounded-xl px-5" 
                         value={rentalRate}
                         onChange={(e) => setRentalRate(e.target.value)}
                         required 
                       />
                    </div>
                 </div>
              </section>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
              {/* Media Section */}
              <section className="bg-white p-5 md:p-10 rounded-xl shadow-sm border border-slate-100">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Images (Maximum 20 images)</label>
                 <div className="border-2 border-dashed border-primary/20 bg-primary/[0.02] rounded-xl p-8 md:p-16 flex flex-col items-center justify-center text-center group hover:bg-primary/[0.04] transition-all cursor-pointer border-spacing-4">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6 group-hover:scale-110 transition-transform duration-700">
                       <ImageIcon size={28} className="text-primary md:hidden" />
                       <ImageIcon size={36} className="text-primary hidden md:block" />
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-full">Drop files or click to upload</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px]">High resolution recommended</p>
                 </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Classifications */}
                <section className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-slate-100 space-y-6">
                   <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-widest">Classification</h3>
                   <div className="space-y-4">
                      <Input placeholder="Search categories..." className="h-12 border-slate-200 rounded-xl px-5" />
                      <div className="flex flex-wrap gap-2">
                        {["Sport", "Luxury", "Classic", "Electric"].map(t => (
                          <Badge key={t} variant="outline" className="px-4 py-2 rounded-xl border-slate-100 text-[8px] md:text-[9px] font-black uppercase tracking-widest">{t}</Badge>
                        ))}
                      </div>
                   </div>
                </section>

                {/* Extras */}
                <section className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-slate-100 space-y-4">
                   <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-widest">Protection Notes</h3>
                   <Textarea placeholder="Maintenance notes..." className="border-slate-200 rounded-xl p-4 font-medium min-h-[140px]" />
                </section>
              </div>

              {/* Ready to Launch */}
              <section className="bg-slate-900 p-8 md:p-12 rounded-xl text-center space-y-4 md:space-y-6 shadow-2xl shadow-slate-900/40 border border-slate-800 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full group-hover:bg-primary/30 transition-all duration-1000" />
                 <Globe size={36} className="text-primary mx-auto mb-2 md:mb-4 animate-slow-spin md:hidden" />
                 <Globe size={48} className="text-primary mx-auto mb-4 animate-slow-spin hidden md:block" />
                 <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Ready to launch?</h4>
                 <p className="text-slate-400 font-medium max-w-[600px] mx-auto text-sm md:text-base">All vehicle information is complete. Your listing will be indexed immediately upon publishing.</p>
              </section>
            </div>
          )}

          {/* Stepper Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-10 border-t border-slate-100">
            <Button 
               type="button" 
               variant="ghost" 
               onClick={prevStep}
               disabled={currentStep === 1}
               className="h-14 md:h-16 px-6 md:px-10 rounded-xl font-black gap-4 text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-all disabled:opacity-0 order-2 sm:order-1"
            >
               <ArrowLeft size={18} /> <span className="text-[10px] md:text-xs">Preview Step</span>
            </Button>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 order-1 sm:order-2">
               <button 
                  type="button"
                  className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] hover:text-primary transition-colors text-center sm:text-right sm:pr-2"
                  onClick={() => router.push('/dashboard/fleet')}
               >
                  Save draft
               </button>
               {currentStep < 4 ? (
                 <Button 
                   type="button" 
                   onClick={nextStep}
                   className="h-14 md:h-16 px-8 md:px-12 rounded-xl bg-primary hover:bg-black text-white font-black gap-3 md:gap-4 transition-all shadow-xl shadow-primary/25 uppercase tracking-widest text-[10px] md:text-xs"
                 >
                    Next Step <ArrowLeft size={18} className="rotate-180" />
                 </Button>
               ) : (
                 <Button 
                   type="submit" 
                   disabled={loading}
                   className="h-14 md:h-16 px-8 md:px-12 rounded-xl bg-[#1E1E1E] hover:bg-black text-white font-black gap-3 md:gap-4 transition-all shadow-xl shadow-black/30 uppercase tracking-widest text-[10px] md:text-xs"
                 >
                    {loading ? "Publishing..." : "Finish & Publish"} <Save size={18} />
                 </Button>
               )}
            </div>
          </div>
        </div>

        {/* Floating Summary Card (Right) */}
        <div className="hidden lg:block w-[360px] shrink-0 sticky top-8">
           <section className="bg-white p-10 rounded-xl shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] border border-slate-50 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center">
                    <Car size={28} className="text-primary" />
                 </div>
                 <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Draft Overview</h3>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Listing Progress</p>
                 </div>
              </div>
              
              <div className="space-y-5 pt-6 border-t border-slate-50">
                 {steps.map(s => {
                   // Calculate if step is effectively completed
                   const isCompleted = 
                     (s.id === 1 && name.trim() !== "" && permalink.trim() !== "" && content.trim() !== "") ||
                     (s.id === 2 && make !== "" && make !== "None" && vehicleType !== "" && vehicleType !== "None") ||
                     (s.id === 3 && rentalRate.trim() !== "") ||
                     (s.id === 4 && completionScore === 100);

                   return (
                     <div key={s.id} className="flex items-center justify-between group cursor-pointer" onClick={() => setCurrentStep(s.id)}>
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${currentStep === s.id ? "bg-primary scale-150 shadow-[0_0_8px_rgba(63,20,123,0.5)]" : isCompleted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-slate-100"}`} />
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${currentStep === s.id ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}`}>{s.title}</span>
                        </div>
                        {isCompleted && <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-500/10 animate-in zoom-in duration-300" />}
                     </div>
                   );
                 })}
              </div>

              <div className="pt-8 border-t border-slate-50">
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Completion Score</span>
                    <span className="text-xs font-black text-primary">{completionScore}%</span>
                 </div>
                 <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(63,20,123,0.3)]" 
                      style={{ width: `${completionScore}%` }} 
                    />
                 </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Hosting Tip</p>
                 <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">&quot;A high-quality description and location map can increase bookings by 40%.&quot;</p>
              </div>
           </section>
        </div>
      </div>
    </form>
  );
}
