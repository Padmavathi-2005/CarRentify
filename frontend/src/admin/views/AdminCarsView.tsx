"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { 
 Search, 
 Filter, 
 Edit, 
 Trash2, 
 Car, 
 ArrowUpDown,
 Calendar,
 DollarSign,
 Tag,
 X,
 MapPin,
 ChevronRight,
 RefreshCw,
 Upload,
 Image as ImageIcon,
 Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/components/ThemeProvider";
import { useLocale } from "@/components/LocaleContext";
import dynamic from "next/dynamic";
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });
import { API_BASE_URL, getImageUrl, PLACEHOLDER_IMAGE } from '@/config/api';
import { useRouter } from "next/navigation";

export default function CarsPage() {
 const router = useRouter();
 const { settings } = useSettings();
 const { formatPrice } = useLocale();
 const [cars, setCars] = useState<any[]>([]);
 const [currencies, setCurrencies] = useState<any[]>([]);
 const [search, setSearch] = useState("");
 const [loading, setLoading] = useState(true);
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage, setItemsPerPage] = useState(10);

 useEffect(() => {
  if (settings?.itemsPerPageLimit) setItemsPerPage(settings.itemsPerPageLimit);
 }, [settings?.itemsPerPageLimit]);
 
 // Filter & Sort State
 const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
 const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
 const [showTierDropdown, setShowTierDropdown] = useState(false);
 const [showSortDropdown, setShowSortDropdown] = useState(false);
 
 const tierDropdownRef = useRef<HTMLDivElement>(null);
 const sortDropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
   if (tierDropdownRef.current && !tierDropdownRef.current.contains(event.target as Node)) {
    setShowTierDropdown(false);
   }
   if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
    setShowSortDropdown(false);
   }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);
 
 const renderSafe = (val: any) => {
 if (!val) return "";
 if (typeof val === 'object') {
 if (val.name) return val.name;
 if (val.label) return val.label;
 if (val.title) return val.title;
 return JSON.stringify(val);
 }
 return String(val);
 };
 
 useEffect(() => {
  fetchCars();
  fetchCurrencies();
 }, []);

 const fetchCurrencies = async () => {
  try {
   const res = await fetch(`${API_BASE_URL}/currencies`);
   if (res.ok) setCurrencies(await res.json());
  } catch (err) { console.error("Fetch currencies failed:", err); }
 };

 const fetchCars = async () => {
  try {
   const res = await fetch(`${API_BASE_URL}/cars`);
   const data = await res.json();
   setCars(Array.isArray(data) ? data : []);
  } catch (err) {
   console.error("Fetch failed:", err);
  } finally {
   setLoading(false);
  }
 };

 const handleOpenModal = (car: any = null) => {
  if (car) {
   router.push(`/admin/cars/edit/${car._id || car.id}`);
  } else {
   router.push(`/admin/cars/new`);
  }
 };

 const handleDelete = async (id: string) => {
 console.log("Attempting to delete ID:", id);
 if (!id) {
 alert("Invalid Vehicle ID. Cannot perform deletion.");
 return;
 }
 if (!window.confirm("Are you sure you want to delete this vehicle from your records?")) return;
 try {
 const res = await fetch(`${API_BASE_URL}/cars/${id}`, {
 method: 'DELETE',
 });
 if (res.ok) {
 alert("Vehicle deleted successfully");
 fetchCars();
 } else {
 const error = await res.json();
 alert(`Delete failed: ${error.message || 'Server error'}`);
 }
 } catch (err) {
 console.error("Delete failed:", err);
 alert("Network error: Could not reach server to delete vehicle");
 }
 };

  // 1. Search & Tier Filter
  const filteredCars = (Array.isArray(cars) ? cars : []).filter(car => {
   const matchesSearch = 
    car.name?.toLowerCase().includes(search.toLowerCase()) || 
    car.licensePlate?.toLowerCase().includes(search.toLowerCase()) ||
    car.status?.toLowerCase().includes(search.toLowerCase());
      
   const matchesTier = selectedTiers.length === 0 || selectedTiers.includes(car.vehicleType);
    
   return matchesSearch && matchesTier;
  });

  // 2. Sort Logic
  if (sortConfig !== null) {
   filteredCars.sort((a: any, b: any) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
      
    if (aVal === undefined || aVal === null) aVal = '';
    if (bVal === undefined || bVal === null) bVal = '';
      
    if (typeof aVal === 'string' && typeof bVal === 'string') {
     return sortConfig.direction === 'asc' 
      ? aVal.localeCompare(bVal) 
      : bVal.localeCompare(aVal);
    } else {
     return sortConfig.direction === 'asc'
      ? (aVal > bVal ? 1 : aVal < bVal ? -1 : 0)
      : (bVal > aVal ? 1 : bVal < aVal ? -1 : 0);
    }
   });
  }

 const totalItems = filteredCars.length;
 const totalPages = Math.ceil(totalItems / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedCars = filteredCars.slice(startIndex, startIndex + itemsPerPage);

 const getPaginationRange = () => {
 const totalNumbers = 5;
 if (totalPages <= totalNumbers) {
 return Array.from({ length: totalPages }, (_, i) => i + 1);
 }

 const range: (number | string)[] = [];
 if (currentPage <= 3) {
 range.push(1, 2, 3, "...", totalPages);
 } else if (currentPage >= totalPages - 2) {
 range.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
 } else {
 range.push(1, "...", currentPage, "...", totalPages);
 }
 return range;
 };

 return (
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="md:col-span-2 relative group uppercase">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)] group-focus-within:text-primary transition-colors" />
 <Input 
 placeholder="Search cars by name or plate..." 
 className="w-full pl-12 h-11 bg-[var(--admin-card-bg)] border-[var(--admin-border)] rounded-app focus-visible:ring-primary/20 text-xs font-bold text-[var(--admin-text-main)]"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>
 <div className="md:col-span-2 flex gap-3">
  {/* Tier Filters Button & Dropdown */}
  <div className="flex-1 relative" ref={tierDropdownRef}>
   <Button 
    onClick={() => setShowTierDropdown(!showTierDropdown)}
    variant="outline" 
    className={`h-11 w-full rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
     showTierDropdown || selectedTiers.length > 0
      ? 'border-primary text-primary bg-primary/5'
      : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)]'
    }`}
   >
    <Filter size={14} className="mr-2" /> 
    {selectedTiers.length > 0 ? `Tiers: ${selectedTiers.join(', ')}` : 'Tier Filters'}
   </Button>

   {/* Tier Dropdown menu */}
   <AnimatePresence>
    {showTierDropdown && (
     <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full left-0 mt-2 w-56 bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)] z-50 overflow-hidden shadow-xl"
     >
      <div className="p-2 space-y-1">
       <div className="px-3 py-2 text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest border-b border-[var(--admin-border)] mb-1">
        Filter by Tier
       </div>
       {['Sedan', 'SUV', 'Sports', 'Convertible'].map(tier => {
        const isSelected = selectedTiers.includes(tier);
        return (
         <button
          key={tier}
          onClick={() => {
           if (isSelected) {
            setSelectedTiers(selectedTiers.filter(t => t !== tier));
           } else {
            setSelectedTiers([...selectedTiers, tier]);
           }
           setCurrentPage(1);
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-app transition-colors ${
           isSelected
            ? 'bg-primary/10 text-primary'
            : 'text-[var(--admin-text-main)] hover:bg-[var(--admin-bg)]'
          }`}
         >
          <span>{tier}</span>
          {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
         </button>
        );
       })}
       {selectedTiers.length > 0 && (
        <button
         onClick={() => {
          setSelectedTiers([]);
          setShowTierDropdown(false);
          setCurrentPage(1);
         }}
         className="w-full text-left px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-app transition-colors mt-2 border-t border-[var(--admin-border)]"
        >
         Clear Filters
        </button>
       )}
      </div>
     </motion.div>
    )}
   </AnimatePresence>
  </div>

  {/* Sort Button & Dropdown */}
  <div className="relative" ref={sortDropdownRef}>
   <Button 
    onClick={() => setShowSortDropdown(!showSortDropdown)}
    variant="outline" 
    className={`h-11 w-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] transition-all ${
     showSortDropdown || sortConfig !== null
      ? 'border-primary text-primary bg-primary/5'
      : 'text-[var(--admin-text-muted)] hover:text-primary'
    }`}
   >
    <ArrowUpDown size={16} />
   </Button>

   {/* Sort Dropdown Menu */}
   <AnimatePresence>
    {showSortDropdown && (
     <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full right-0 mt-2 w-56 bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)] z-50 overflow-hidden shadow-xl"
     >
      <div className="p-2 space-y-1">
       <div className="px-3 py-2 text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest border-b border-[var(--admin-border)] mb-1">
        Sort Options
       </div>
       {[
        { label: 'Name: A - Z', key: 'name', direction: 'asc' },
        { label: 'Name: Z - A', key: 'name', direction: 'desc' },
        { label: 'Daily Rate: Low to High', key: 'pricePerDay', direction: 'asc' },
        { label: 'Daily Rate: High to Low', key: 'pricePerDay', direction: 'desc' },
        { label: 'Year: Newest First', key: 'year', direction: 'desc' },
        { label: 'Year: Oldest First', key: 'year', direction: 'asc' }
       ].map(opt => {
        const isSelected = sortConfig?.key === opt.key && sortConfig?.direction === opt.direction;
        return (
         <button
          key={`${opt.key}-${opt.direction}`}
          onClick={() => {
           if (isSelected) {
            setSortConfig(null);
           } else {
            setSortConfig({ key: opt.key, direction: opt.direction as 'asc' | 'desc' });
           }
           setShowSortDropdown(false);
           setCurrentPage(1);
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-app transition-colors ${
           isSelected
            ? 'bg-primary/10 text-primary'
            : 'text-[var(--admin-text-main)] hover:bg-[var(--admin-bg)]'
          }`}
         >
          <span>{opt.label}</span>
          {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
         </button>
        );
       })}
       {sortConfig !== null && (
        <button
         onClick={() => {
          setSortConfig(null);
          setShowSortDropdown(false);
          setCurrentPage(1);
         }}
         className="w-full text-left px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-app transition-colors mt-2 border-t border-[var(--admin-border)]"
        >
         Reset Sort
        </button>
       )}
      </div>
     </motion.div>
    )}
   </AnimatePresence>
  </div>
 </div>
 </div>

 <div className="bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)] overflow-hidden">
  {/* Table View - Hidden on Mobile */}
  <div className="hidden md:block overflow-x-auto">
  <table className="w-full text-left border-collapse">
  <thead>
  <tr className="bg-[var(--admin-bg)]/50 border-b border-[var(--admin-border)]">
  <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Vehicle</th>
  <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Details</th>
  <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Plate</th>
  <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Rates</th>
  <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Status</th>
  <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] text-right">Actions</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-[var(--admin-border)] text-[11px] font-bold text-[var(--admin-text-muted)]">
  <AnimatePresence mode="popLayout">
  {loading ? (
  <tr>
  <td colSpan={6} className="p-20 text-center">
  <div className="flex flex-col items-center gap-3">
  <RefreshCw className="animate-spin text-primary" size={24} />
  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Syncing Cars...</span>
  </div>
  </td>
  </tr>
  ) : paginatedCars.length === 0 ? (
  <tr>
  <td colSpan={6} className="p-20 text-center">
  <div className="flex flex-col items-center gap-3">
  <Car className="text-[var(--admin-text-muted)] opacity-20" size={48} />
  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">No vehicles found in your portfolio</span>
  </div>
  </td>
  </tr>
  ) : paginatedCars.map((car) => (
  <motion.tr 
  key={car._id}
  layout
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="hover:bg-[var(--admin-bg)]/50 transition-all group"
  >
  <td className="p-5">
  <div className="flex items-center gap-4">
  <div className="w-28 h-16 rounded-app bg-[var(--admin-bg)] flex items-center justify-center overflow-hidden border border-[var(--admin-border)] group-hover:scale-105 transition-transform shadow-sm shrink-0">
    {car.images?.[0] ? (
      <img src={getImageUrl(car.images[0])} className="w-full h-full object-cover" alt={car.name} />
    ) : (
      <div className="p-2 bg-[var(--admin-border)] rounded-app text-[var(--admin-text-muted)]"><Car size={24} /></div>
    )}
  </div>
  <div>
  <p className="font-black text-[var(--admin-text-main)] text-xs tracking-tight">
  {renderSafe(car.name)}
  </p>
  <p className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-0.5">
  {renderSafe(car.vehicleType)}
  </p>
  </div>
  </div>
  </td>
  <td className="p-5">
  <div className="flex items-center gap-1.5 font-black uppercase tracking-widest text-[9px] text-[var(--admin-text-muted)]">
  <Tag size={12} className="text-primary" /> {renderSafe(car.fuelType)}
  </div>
  </td>
  <td className="p-5 font-mono text-xs font-black text-[var(--admin-text-main)] tracking-wider uppercase">
  {renderSafe(car.licensePlate)}
  </td>
  <td className="p-5">
  <div className="flex items-center gap-1 font-black text-primary text-xs">
  {formatPrice(car.pricePerDay, car.currency)} <span className="text-[8px] text-[var(--admin-text-muted)] italic ml-1">/day</span>
  </div>
  </td>
  <td className="p-5">
  <div className="flex items-center gap-2">
  <div className={`w-1.5 h-1.5 rounded-full ${
  car.available ? 'bg-emerald-500 ' : 'bg-rose-500 '
  }`} />
  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">{car.available ? 'Available' : 'Booked'}</span>
  </div>
  </td>
  <td className="p-5 text-right">
  <div className="flex items-center justify-end gap-2">
  <Button 
  onClick={() => handleOpenModal(car)}
  size="icon" variant="ghost" className="w-9 h-9 rounded-app bg-[var(--admin-bg)] text-[var(--admin-text-main)] hover:bg-[var(--primary-brand-color)] hover:text-white transition-all "
  >
  <Edit size={14} />
  </Button>
  <Button 
  onClick={() => handleDelete(car._id || car.id)}
  size="icon" variant="ghost" className="w-9 h-9 rounded-app bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all "
  >
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

  {/* Mobile Card View */}
  <div className="md:hidden p-4 space-y-4">
  {loading ? (
  <div className="py-20 text-center">
  <RefreshCw className="animate-spin text-primary mx-auto mb-3" size={24} />
  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Syncing Cars...</span>
  </div>
  ) : paginatedCars.length === 0 ? (
  <div className="py-20 text-center">
  <Car className="text-[var(--admin-text-muted)] opacity-20 mx-auto mb-3" size={48} />
  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">No vehicles found</span>
  </div>
  ) : paginatedCars.map((car) => (
  <div key={car._id} className="p-4 bg-[var(--admin-bg)]/50 rounded-app border border-[var(--admin-border)] space-y-4">
  <div className="flex items-center gap-4">
  <div className="w-24 h-16 rounded-app bg-white flex items-center justify-center border border-[var(--admin-border)] overflow-hidden shrink-0 shadow-sm">
  {car.images?.[0] ? (
    <img 
      src={getImageUrl(car.images[0])} 
      className="w-full h-full object-cover" 
      alt={car.name} 
      onError={(e) => {
        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
      }}
    />
  ) : (
    <img 
      src={PLACEHOLDER_IMAGE} 
      className="w-full h-full object-cover" 
      alt="Placeholder" 
    />
  )}
  </div>
  <div className="flex-1">
  <h4 className="font-black text-xs text-[var(--admin-text-main)]">{renderSafe(car.name)}</h4>
  <p className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">{renderSafe(car.vehicleType)} • {renderSafe(car.licensePlate)}</p>
  </div>
  <div className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${car.available ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
  {car.available ? 'Available' : 'Booked'}
  </div>
  </div>
  
  <div className="flex items-center justify-between pt-2 border-t border-[var(--admin-border)]/50">
  <div className="text-primary font-black text-xs">
  {formatPrice(car.pricePerDay, car.currency)} <span className="text-[8px] text-[var(--admin-text-muted)] font-bold uppercase ml-0.5">/ day</span>
  </div>
  <div className="flex gap-2">
  <Button onClick={() => handleOpenModal(car)} size="icon" variant="ghost" className="w-8 h-8 rounded-app bg-white border border-[var(--admin-border)] text-[var(--admin-text-main)]"><Edit size={12} /></Button>
  <Button onClick={() => handleDelete(car._id || car.id)} size="icon" variant="ghost" className="w-8 h-8 rounded-app bg-rose-50 text-rose-500 border border-rose-100"><Trash2 size={12} /></Button>
  </div>
  </div>
  </div>
  ))}
  </div>

  <div className="bg-[var(--admin-bg)]/50 border-t border-[var(--admin-border)] p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px]">
  <div className="flex items-center gap-4">
  <div className="flex items-center gap-2">
  <span className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Show</span>
  <select 
  className="h-8 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-2 font-black text-[var(--admin-text-main)] outline-none focus:ring-2 focus:ring-primary/20 transition-all "
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
  <p className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">
  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} vehicles
  </p>
  </div>
  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 md:pb-0">
  <Button 
  variant="outline" 
  size="sm" 
  className="h-8 px-3 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] disabled:opacity-30 transition-all hover:bg-[var(--admin-bg)]"
  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
  disabled={currentPage === 1}
  >
  Prev
  </Button>
  
  <div className="flex items-center gap-1 mx-2">
  {getPaginationRange().map((page, idx) => (
  page === "..." ? (
  <div key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-[var(--admin-text-muted)] font-bold text-[10px] opacity-30">...</div>
  ) : (
  <button
  key={`page-${page}`}
  onClick={() => setCurrentPage(Number(page))}
  className={`w-8 h-8 rounded-app text-[10px] font-black transition-all shrink-0 ${
  currentPage === page 
  ? 'bg-[var(--primary-brand-color)] text-white ' 
  : 'bg-[var(--admin-card-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)] border border-[var(--admin-border)]'
  }`}
  >
  {page}
  </button>
  )
  ))}
  </div>

  <Button 
  variant="outline" 
  size="sm" 
  className="h-8 px-3 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] disabled:opacity-30 transition-all hover:bg-[var(--admin-bg)]"
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
