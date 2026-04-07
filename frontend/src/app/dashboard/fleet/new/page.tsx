"use client";

import React, { useState } from "react";
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
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Logic later
    setTimeout(() => {
        router.push('/dashboard/fleet');
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <Link href="/dashboard/fleet" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-4 font-bold uppercase tracking-widest text-[10px]">
              <ArrowLeft size={14} /> Back to Fleet
           </Link>
           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Car</h1>
           <p className="text-slate-500 font-medium tracking-wide">Enter the details of your vehicle to list it on the marketplace.</p>
        </div>
        
        <div className="flex gap-4">
           <Button type="submit" className="bg-primary hover:bg-black text-white h-14 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20 gap-2 flex items-center">
              <Save size={20} /> Save
           </Button>
           <Button type="button" variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 text-slate-600 gap-2 font-black hover:bg-slate-50">
              <SaveExit size={18} /> Save & Exit
           </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Column */}
        <div className="flex-1 space-y-10">
          {/* General Information */}
          <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/5 rounded-xl text-primary">
                   <Info size={18} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">General Information</h3>
             </div>

             <div className="space-y-6">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Name *</label>
                   <Input 
                      placeholder="Enter vehicle name (e.g. Toyota Camry 2023, Honda CR-V, etc.)"
                      className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium focus-visible:ring-primary/10"
                      required
                   />
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Description</label>
                   <Textarea 
                      placeholder="Enter a brief description highlighting the key features of the vehicle."
                      className="bg-slate-50 border-none rounded-[1.5rem] p-6 font-medium focus-visible:ring-primary/10 min-h-[120px]"
                   />
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Full Content / Story</label>
                   <div className="bg-slate-50 rounded-[2rem] p-8 border border-dashed border-slate-200 min-h-[300px] flex items-center justify-center text-slate-400 font-medium italic">
                      Rich Text Editor Placeholder
                   </div>
                </div>
             </div>
          </section>

          {/* Media / Images */}
          <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                   <ImageIcon size={18} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Vehicle Photos</h3>
             </div>

             <div className="relative h-64 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-10 group hover:border-primary/30 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                   <Plus size={24} className="text-primary" />
                </div>
                <p className="text-slate-600 font-black text-lg mb-2">Drop files here or click to upload</p>
                <p className="text-slate-400 text-sm font-medium italic">Upload up to 10 high-quality images. Recommended resolution: 1200x800px.</p>
             </div>
          </section>

          {/* Location Details */}
          <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                   <MapPin size={18} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Vehicle Location</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Country</label>
                   <Input placeholder="United States" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">State</label>
                   <Input placeholder="California" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">City</label>
                   <Input placeholder="Los Angeles" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Address</label>
                   <Input placeholder="Enter specific street address (e.g. 101 Main St)" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">License Plate</label>
                   <Input placeholder="e.g. ABC 123" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" />
                </div>
             </div>
          </section>

          {/* Technical Specifications */}
          <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
                   <Filter size={18} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Technical Details</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Year *</label>
                   <Input type="number" placeholder="2023" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" required />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Transmission</label>
                   <Input placeholder="Automatic" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Fuel Type</label>
                   <Input placeholder="Electric / Hybrid" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Horsepower (HP)</label>
                   <Input type="number" placeholder="500" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Number of Seats</label>
                   <Input type="number" placeholder="4" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Cylinders</label>
                   <Input type="number" placeholder="8" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" />
                </div>
             </div>
          </section>
        </div>

        {/* Side Column */}
        <div className="w-full lg:w-[400px] space-y-10">
          {/* Rental Pricing */}
          <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500 uppercase font-black text-xs">$</div>
                <h3 className="text-xl font-bold text-slate-900">Rental Information</h3>
             </div>

             <div className="space-y-6">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Rental Type</label>
                   <select className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium focus:ring-1 focus:ring-primary/20 appearance-none outline-none">
                      <option>Per Day</option>
                      <option>Per Hour</option>
                      <option>Per Month</option>
                   </select>
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Rental Rate *</label>
                   <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        className="h-14 pl-10 bg-slate-50 border-none rounded-2xl px-6 font-black text-2xl text-primary"
                        required
                      />
                   </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Tax (%)</label>
                   <Input type="number" placeholder="0" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" />
                </div>
             </div>
          </section>

          {/* Attributes */}
          <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
             <h3 className="text-xl font-bold text-slate-900">Attributes</h3>
             
             <div className="space-y-6">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Brand / Make</label>
                   <Input placeholder="Select Brand" className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium" />
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                   <Checkbox id="is-used" className="w-6 h-6 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                   <label htmlFor="is-used" className="text-sm font-bold text-slate-700 cursor-pointer">Mark as 'Used' vehicle</label>
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Status</label>
                   <select className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-emerald-600 appearance-none outline-none">
                      <option className="text-emerald-600">Available</option>
                      <option className="text-rose-600">Unavailable</option>
                   </select>
                </div>
             </div>
          </section>

          {/* Categories & Amenities */}
          <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
             <h3 className="text-xl font-bold text-slate-900">Categories & Amenities</h3>
             
             <div className="space-y-4">
                {["Luxury", "Sports", "Electric", "SUV"].map((cat) => (
                   <div key={cat} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <div className="w-5 h-5 border-2 border-slate-200 rounded group-hover:border-primary transition-colors" />
                         <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{cat}</span>
                      </div>
                      <Badge variant="ghost" className="text-slate-300 text-[10px] font-bold">12</Badge>
                   </div>
                ))}
             </div>

             <div className="pt-6 border-t border-slate-50">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">Amenities</label>
               <div className="flex flex-wrap gap-2">
                  {["Sunroof", "Heated Seats", "Autopilot", "Leather"].map(tag => (
                     <Badge key={tag} className="bg-slate-50 hover:bg-primary/10 text-slate-500 hover:text-primary transition-all px-4 py-2 rounded-xl border-none font-bold text-[10px] uppercase tracking-widest">{tag}</Badge>
                  ))}
                  <button className="flex items-center gap-1 text-primary font-bold text-[10px] uppercase ml-2 hover:underline">
                     <Plus size={12} /> Add more
                  </button>
               </div>
             </div>
          </section>
        </div>
      </div>
    </form>
  );
}
