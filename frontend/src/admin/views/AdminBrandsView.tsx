"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  ArrowUpDown,
  Globe,
  Image as ImageIcon,
  CheckCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/config/api";

export default function AdminBrandsView() {
  const [brands, setBrands] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/brands`);
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const totalItems = filteredBrands.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBrands = filteredBrands.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header Tier */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1 flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-xl text-primary"><ShieldCheck size={20} /></div>
             Brand Governance
          </h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em]">Scale and verify your automotive manufacturer ecosystem</p>
        </div>
        <Button className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/20 hover:bg-black transition-all">
          <Plus size={14} className="mr-2" /> Register Brand
        </Button>
      </div>

      {/* Control Layer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative group text-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
             placeholder="Search partners by name..." 
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

      {/* Golden Template Table View */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Brand</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Origin</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Joined</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                       <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing ecosystem...</p>
                       </div>
                    </td>
                  </tr>
                ) : paginatedBrands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No brand matches found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedBrands.map((brand) => (
                    <motion.tr 
                      key={brand._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/20 transition-all group"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:scale-110 transition-transform">
                            {brand.logo ? (
                               <img src={brand.logo} className="w-8 h-8 object-contain" alt={brand.name} />
                            ) : (
                               <ImageIcon size={18} className="text-slate-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-xs tracking-tight">{brand.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tier 1 Partner</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                         <div className="flex items-center gap-1.5 font-black uppercase tracking-widest text-[9px] text-slate-500">
                            <Globe size={12} className="text-primary" /> Global
                         </div>
                      </td>
                      <td className="p-5">
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Verified</span>
                         </div>
                      </td>
                      <td className="p-5">
                         <div className="flex items-center gap-2 font-black text-slate-400 text-[10px] uppercase">
                            <Clock size={12} /> {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
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
                  ))
                )}
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
                 Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} brands
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
