"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  Car, 
  ArrowUpDown,
  Calendar,
  DollarSign,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Assets
import car1 from "@/assets/images/car-1.png";
import car2 from "@/assets/images/car-2.png";
import car3 from "@/assets/images/car-3.png";
import car4 from "@/assets/images/car-4.png";
import car5 from "@/assets/images/car-5.png";

const fleetData = [
  { id: 1, name: "Mercedes Maybach S-Class", type: "Sedan", plate: "NYC-7788", status: "Available", price: 150, image: car1, fuel: "Hybrid" },
  { id: 2, name: "Audi e-tron GT", type: "Electric", plate: "LON-4422", status: "Booked", price: 120, image: car2, fuel: "Electric" },
  { id: 3, name: "Porsche 911 Carrera", type: "Sports", plate: "DXB-9900", status: "Maintenance", price: 200, image: car3, fuel: "Gasoline" },
  { id: 4, name: "BMW X7 M50i", type: "SUV", plate: "PAR-1122", status: "Available", price: 180, image: car4, fuel: "Gasoline" },
  { id: 5, name: "Mercedes-Benz S-Class", type: "Sedan", plate: "NYC-2233", status: "Available", price: 140, image: car5, fuel: "Gasoline" },
];

export default function FleetPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredFleet = fleetData.filter(car => 
    car.name.toLowerCase().includes(search.toLowerCase()) || 
    car.plate.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const totalItems = filteredFleet.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFleet = filteredFleet.slice(startIndex, startIndex + itemsPerPage);

  const getSrc = (img: any) => img?.src || img;

  return (
    <div className="space-y-6">
      {/* Header Tier */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1 flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-xl text-primary"><Car size={20} /></div>
             Fleet Governance
          </h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em]">Monitor and scale your premium vehicle portfolio</p>
        </div>
        <Button className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/20 hover:bg-black transition-all">
          <Plus size={14} className="mr-2" /> Register Vehicle
        </Button>
      </div>

      {/* Control Layer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
             placeholder="Search fleet by name or plate..." 
             className="w-full pl-12 h-11 bg-white border-slate-100 rounded-xl focus-visible:ring-primary/20 text-xs font-bold shadow-sm"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 flex gap-3">
           <Button variant="outline" className="h-11 flex-1 rounded-xl border-slate-100 bg-white text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50 transition-all">
              <Filter size={14} className="mr-2" /> Tier Filters
           </Button>
           <Button variant="outline" className="h-11 w-11 rounded-xl border-slate-100 bg-white text-slate-400 hover:text-primary transition-all">
              <ArrowUpDown size={16} />
           </Button>
        </div>
      </div>

      {/* Standardized Table View */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vehicle</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Details</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Plate</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rates</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
              <AnimatePresence mode="popLayout">
                {paginatedFleet.map((car) => (
                  <motion.tr 
                    key={car.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/20 transition-all group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-xl bg-slate-50 p-1 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:scale-110 transition-transform">
                          <img src={getSrc(car.image)} className="w-full h-full object-contain" alt={car.name} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-xs tracking-tight">{car.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{car.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                       <div className="flex items-center gap-1.5 font-black uppercase tracking-widest text-[9px] text-slate-500">
                          <Tag size={12} className="text-primary" /> {car.fuel}
                       </div>
                    </td>
                    <td className="p-5 font-mono text-xs font-black text-slate-900 tracking-wider">
                       {car.plate}
                    </td>
                    <td className="p-5">
                       <div className="flex items-center gap-1 font-black text-primary text-xs">
                          <DollarSign size={14} /> {car.price} <span className="text-[8px] text-slate-400 italic">/day</span>
                       </div>
                    </td>
                    <td className="p-5">
                       <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             car.status === 'Available' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                             car.status === 'Booked' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 
                             'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                          }`} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{car.status}</span>
                       </div>
                    </td>
                    <td className="p-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                             <Edit size={14} />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                             <Trash2 size={14} />
                          </Button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Control */}
        <div className="bg-slate-50/50 border-t border-slate-100 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Show</span>
                 <select 
                    className="h-8 rounded-lg border-slate-200 bg-white px-2 text-[10px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    value={itemsPerPage}
                    onChange={(e) => {
                       setItemsPerPage(Number(e.target.value));
                       setCurrentPage(1);
                    }}
                 >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                 </select>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                 Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} vehicles
              </p>
           </div>

           <div className="flex items-center gap-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 rounded-lg border-slate-200 bg-white text-[9px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-50"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                 Prev
              </Button>
              
              <div className="flex items-center gap-1 mx-2">
                 {[...Array(totalPages)].map((_, i) => (
                    <button
                       key={i + 1}
                       onClick={() => setCurrentPage(i + 1)}
                       className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                          currentPage === i + 1 
                          ? 'bg-slate-900 text-white shadow-lg' 
                          : 'bg-white text-slate-400 hover:bg-slate-50'
                       }`}
                    >
                       {i + 1}
                    </button>
                 ))}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 rounded-lg border-slate-200 bg-white text-[9px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-50"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                 Next
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
