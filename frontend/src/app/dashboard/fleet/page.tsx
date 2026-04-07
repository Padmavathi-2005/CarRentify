"use client";

import React, { useState, useEffect } from "react";
import { 
  Car, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function VendorFleetPage() {
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch
    setTimeout(() => {
      setFleet([
        { id: "1", name: "Phantom VIII", brand: "Rolls-Royce", status: "Available", price: "$2,500", plate: "RR-001-LUX", image: "https://images.unsplash.com/photo-1631214503951-375100d24275?q=80&w=200"},
        { id: "2", name: "SF90 Stradale", brand: "Ferrari", status: "Rented", price: "$3,500", plate: "F-90-SPD", image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=200"},
        { id: "3", name: "Revuelto", brand: "Lamborghini", status: "Available", price: "$3,200", plate: "L-REV-V12", image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=200"},
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Fleet</h1>
           <p className="text-slate-500 font-medium tracking-wide">Manage and monitor all your listed vehicles.</p>
        </div>
        
        <Link href="/dashboard/fleet/new">
          <Button className="bg-primary hover:bg-black text-white h-14 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20 gap-2 flex items-center">
             <Plus size={22} /> Add New Car
          </Button>
        </Link>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input 
              placeholder="Search your fleet (e.g. Model, Brand, License Plate)..." 
              className="w-full pl-14 h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/10 font-medium"
            />
         </div>
         <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button variant="outline" className="flex-1 lg:flex-none h-14 px-8 rounded-2xl border-slate-100 text-slate-600 gap-3 font-bold hover:bg-slate-50">
               <Filter size={20} /> Filters
            </Button>
            <div className="hidden lg:block h-8 w-px bg-slate-100 mx-2" />
            <p className="hidden lg:block text-slate-400 text-sm font-bold whitespace-nowrap uppercase tracking-widest">{fleet.length} Vehicles Total</p>
         </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
             <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Fleet Data...</p>
          </div>
        ) : fleet.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Name</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">License Plate</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody>
              {fleet.map((car) => (
                <tr key={car.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-50 shadow-sm">
                          <img src={car.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       </div>
                       <span className="text-sm font-black text-slate-900">{car.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">{car.brand}</td>
                  <td className="px-8 py-6">
                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                       car.status === "Available" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                     }`}>
                        {car.status}
                     </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-primary">{car.price}<span className="text-[10px] text-slate-400 ml-1">/day</span></td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-400 tracking-widest font-mono">{car.plate}</td>
                  <td className="px-8 py-6 text-right">
                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5" title="Edit Listing">
                           <Edit3 size={18} />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50" title="Delete Listing">
                           <Trash2 size={18} />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50" title="View Public Page">
                           <ExternalLink size={18} />
                        </Button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-24 text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="text-slate-200" size={40} />
             </div>
             <h3 className="text-xl font-extrabold text-slate-900 mb-2">No Listings Found</h3>
             <p className="text-slate-400 mb-10 max-w-xs mx-auto font-medium">You haven't added any vehicles to your fleet yet. Start earning today!</p>
             <Link href="/dashboard/fleet/new">
               <Button className="bg-primary hover:bg-black text-white h-14 px-10 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all">
                  Create Your First Listing
               </Button>
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
