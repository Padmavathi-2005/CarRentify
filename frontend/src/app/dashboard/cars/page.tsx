'use client';

import React, { useState, useEffect } from "react";
import {
 Car,
 Search,
 Filter,
 Plus,
 MoreVertical,
 Edit3,
 Trash2,
 ExternalLink,
 Eye,
 X,
 MapPin,
 Settings,
 Zap,
 Tag,
 Info,
 History,
 ShieldCheck,
 Clock,
 ArrowRight,
 ChevronRight,
 CheckCircle2,
 XCircle,
 AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import VehicleFullPreview from "@/components/VehicleFullPreview";
import { useLocale } from "@/components/LocaleContext";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/components/Toast";

import { API_BASE_URL, getImageUrl } from "@/config/api";

export default function VendorCarsPage() {
 const { t } = useLocale();
 const { user } = useAuth();
 const { showToast } = useToast();
 const [cars, setCars] = useState<any[]>([]);
 const [activeBookings, setActiveBookings] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const isAdmin = user?.role?.toLowerCase() === 'admin';
 const [searchQuery, setSearchQuery] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage, setItemsPerPage] = useState(5);

 const fetchFleet = async () => {
 try {
 const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
 const headers: any = {};
 if (token) headers['Authorization'] = `Bearer ${token}`;

 const [fleetRes, bookingsRes] = await Promise.all([
 fetch(`${API_BASE_URL}/cars`, { headers }),
 fetch(`${API_BASE_URL}/bookings/vendor-bookings`, { headers })
 ]);

 const fleetData = await fleetRes.json();
 const bookingsData = await bookingsRes.json();

 setCars(Array.isArray(fleetData) ? fleetData : []);
 setActiveBookings(Array.isArray(bookingsData) ? bookingsData : []);
 } catch (err) {
 console.error("Fetch failed:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchFleet();
 }, []);

 const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/cars/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Listing ${status === 'approved' ? 'Approved' : 'Rejected'} Successfully`, "success");
        fetchFleet();
      } else {
        showToast("Operation Failed: Could not update listing status.", "error");
      }
    } catch (err) {
      console.error("Status update failed:", err);
      showToast("Network Error: Could not reach the server.", "error");
    }
  };

 const handleDelete = async (id: string) => {
 if (!window.confirm(t('dashboard.fleet.delete_confirm'))) return;
 try {
 const res = await fetch(`${API_BASE_URL}/cars/${id}`, {
 method: "DELETE"
 });
 if (res.ok) {
 fetchFleet();
 } else {
 alert(t('dashboard.fleet.delete_fail'));
 }
 } catch (err) {
 console.error("Delete failed:", err);
 alert(t('dashboard.fleet.network_error'));
 }
 };

 const query = searchQuery.toLowerCase();
 const filteredCars = cars.filter(car =>
 car.name?.toLowerCase().includes(query) ||
 car.model?.toLowerCase().includes(query) ||
 car.licensePlate?.toLowerCase().includes(query) ||
 (typeof car.brand === 'object' ? car.brand?.name : car.brand)?.toLowerCase().includes(query)
 );

 const totalItems = filteredCars.length;
 const totalPages = Math.ceil(totalItems / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedItems = filteredCars.slice(startIndex, startIndex + itemsPerPage);

 return (
 <div className="space-y-6 animate-fade-in text-slate-900">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
  <div className="space-y-1">
  <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">Hello, {user?.firstName || 'User'}! This is {t('dashboard.fleet.title')} ({filteredCars.length})</h1>
  <p className="text-xs md:text-sm text-slate-500 font-medium tracking-wide">{t('dashboard.fleet.subtitle')}</p>
  </div>

  <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
  <Link href="/dashboard/cars/new" className="flex-1 md:flex-none">
  <Button className="bg-primary hover:bg-primary-hover text-white h-12 md:h-14 w-full md:px-8 rounded-app font-bold gap-2 flex items-center text-[10px] md:text-sm">
  <Plus size={20} className="shrink-0" /> {t('dashboard.fleet.add_car')}
  </Button>
  </Link>
  </div>
  </div>

 {/* Filters Area */}
 <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-4 rounded-app border border-slate-100">
 <div className="relative flex-1 w-full">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
 <Input
 placeholder={t('dashboard.fleet.search_placeholder')}
 className="w-full pl-14 h-14 bg-slate-50 border-none rounded-app focus-visible:ring-primary/10 font-medium text-slate-900"
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 setCurrentPage(1);
 }}
 />
 </div>
 <div className="flex items-center gap-3 w-full lg:w-auto">
 <Button variant="outline" className="flex-1 lg:flex-none h-14 px-8 rounded-app border-slate-100 text-slate-600 gap-3 font-bold hover:bg-slate-50">
 <Filter size={20} /> {t('dashboard.fleet.filters')}
 </Button>
 <div className="hidden lg:block h-8 w-px bg-slate-100 mx-2" />
 <p className="hidden lg:block text-slate-400 text-sm font-bold whitespace-nowrap uppercase tracking-widest">{t('dashboard.fleet.vehicles_total', { count: filteredCars.length })}</p>
 </div>
 </div>

 {/* Fleet Cards Grid */}
 <div className="space-y-4">
 {loading ? (
 <div className="h-[400px] flex flex-col items-center justify-center space-y-4 bg-white rounded-app border border-slate-100 ">
 <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('dashboard.fleet.syncing')}</p>
 </div>
 ) : filteredCars.length > 0 ? (
 <>
 <div className="grid grid-cols-1 gap-4">
 {paginatedItems.map((car) => {
 const carId = car._id || car.id;
 const activeBooking = activeBookings.find(b =>
 (b.carId?._id || b.carId) === carId &&
 (b.status === 'Active' || b.status === 'Confirmed' || b.status === 'Pending')
 );

 return (
 <motion.div
 key={carId}
 whileHover={{ y: -4 }}
 className="bg-white p-6 rounded-app border border-slate-100 transition-all group flex flex-col sm:flex-row items-start gap-4 sm:gap-8"
 >
                {/* Image Node */}
                <div className="w-full md:w-56 h-36 rounded-app overflow-hidden bg-slate-50 border border-slate-100 shrink-0 relative shadow-sm">
                  <img
                    src={getImageUrl(car.images?.[0] || "")}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt={car.name}
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-app text-[8px] font-black uppercase tracking-widest border border-slate-100 flex items-center gap-1 ">
                    <Zap size={8} fill="currentColor" className="text-primary" /> {typeof car.vehicleType === 'object' ? car.vehicleType?.name : car.vehicleType}
                  </div>
                </div>

 {/* Info Node */}
 <div className="flex-1 space-y-4 w-full">
 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
 <div>
  <div>
  <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight leading-tight mb-2 flex flex-wrap items-center gap-2">
  {car.name || t('dashboard.fleet.premium_vehicle')}
  <div className="flex flex-wrap gap-2">
    <span className={`px-2 md:px-3 py-1 rounded-app text-[7px] md:text-[8px] font-black uppercase tracking-widest ${car.available ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
    }`}>
    {car.available ? t('dashboard.fleet.ready') : t('dashboard.fleet.rented')}
    </span>
    <span className={`px-2 md:px-3 py-1 rounded-app text-[7px] md:text-[8px] font-black uppercase tracking-widest ${
       car.status === 'approved' ? "bg-primary/10 text-primary border border-primary/20" : 
       car.status === 'rejected' ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" : 
       "bg-amber-500/10 text-amber-600 border border-amber-500/20"
     }`}>
      {car.status || 'Pending'}
    </span>
  </div>
  </h3>
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
  <div className="flex items-center gap-1"><MapPin size={12} className="text-primary" /> {car.location?.city || "NYC"}</div>
  <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-200" />
  <div className="flex items-center gap-1"><Tag size={12} /> {car.licensePlate && car.licensePlate !== "N/A" ? car.licensePlate : "No Plate"}</div>
  </div>
  </div>
</div>

  <div className="flex items-center gap-2 mt-2 sm:mt-0">
  {isAdmin && car.status !== 'approved' && (
    <Button 
      onClick={() => handleStatusUpdate(carId, 'approved')}
      size="sm" 
      className="h-9 md:h-10 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 rounded-app font-black uppercase text-[9px] md:text-[10px] tracking-widest gap-2"
    >
      <CheckCircle2 size={14} /> Approve
    </Button>
  )}
  {isAdmin && car.status === 'pending' && (
    <Button 
      onClick={() => handleStatusUpdate(carId, 'rejected')}
      size="sm" 
      variant="ghost"
      className="h-9 md:h-10 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-app font-black uppercase text-[9px] md:text-[10px] tracking-widest gap-2"
    >
      <XCircle size={14} /> Reject
    </Button>
  )}
  <div className="flex items-center gap-2 ml-auto sm:ml-0">
    <Link href={`/vehicles/${car.permalink || carId}`} target="_blank">
    <Button size="icon" variant="ghost" className="w-9 h-9 md:w-10 md:h-10 border border-slate-100 rounded-app text-slate-400 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all" title="View Listing">
    <Eye size={18} />
    </Button>
    </Link>
    <Link href={`/dashboard/cars/edit/${carId}`}>
    <Button size="icon" variant="ghost" className="w-9 h-9 md:w-10 md:h-10 border border-slate-100 rounded-app text-slate-400 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all" title={t('dashboard.fleet.edit_listing')}>
    <Edit3 size={18} />
    </Button>
    </Link>
    <Button
    onClick={() => handleDelete(carId)}
    size="icon" variant="ghost" className="w-9 h-9 md:w-10 md:h-10 border border-slate-100 rounded-app text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all" title={t('dashboard.fleet.delete_listing')}
    >
    <Trash2 size={18} />
    </Button>
  </div>
  </div>
 </div>

 <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-slate-50">
 <div className="space-y-1">
 <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">{t('dashboard.fleet.price_day')}</p>
 <p className="text-sm font-black text-slate-900 tracking-tight">${car.pricePerDay?.toLocaleString()}</p>
 </div>
 <div className="w-px h-8 bg-slate-100" />

 {activeBooking ? (
 <Link href={`/dashboard/bookings?carId=${carId}`} className="flex-1">
 <div className="flex items-center justify-between group/action p-3 rounded-app bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all cursor-pointer">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white ">
 {activeBooking.status === 'Active' ? <History size={14} /> : <ShieldCheck size={14} />}
 </div>
 <div>
 <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{t('dashboard.fleet.active_logistics')}</p>
 <p className="text-[8px] font-bold text-primary uppercase tracking-widest">{activeBooking.status === 'Active' ? t('dashboard.fleet.ongoing_trip') : t('dashboard.fleet.awaiting_handover')}</p>
 </div>
 </div>
 <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary group-hover/action:translate-x-1 transition-transform">
 {t('dashboard.fleet.manage_docs')} <ChevronRight size={14} />
 </div>
 </div>
 </Link>
 ) : (
 <div className="flex-1 flex items-center gap-3 opacity-40">
 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
 <Clock size={14} />
 </div>
 <div>
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t('dashboard.fleet.no_active_journey')}</p>
 <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest italic">{t('dashboard.fleet.vehicle_standby')}</p>
 </div>
 </div>
 )}
 </div>
 </div>
 </motion.div>
 );
 })}
 </div>

 {/* Pagination Controls */}
 <div className="bg-slate-50/50 border-t border-slate-100 p-6 rounded-app mt-4 flex flex-col md:flex-row justify-between items-center gap-6">
 <div className="flex items-center gap-6">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
 {t('dashboard.fleet.showing_range', { start: startIndex + 1, end: Math.min(startIndex + itemsPerPage, totalItems), total: totalItems })}
 </p>
 </div>

 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 size="sm"
 className="h-10 px-4 rounded-app border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 disabled={currentPage === 1}
 >
 {t('dashboard.fleet.prev')}
 </Button>

 <div className="flex items-center gap-1 mx-2">
 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
 <button
 key={page}
 onClick={() => setCurrentPage(page)}
 className={`w-10 h-10 rounded-app text-[10px] font-black transition-all ${currentPage === page
 ? 'bg-primary text-white '
 : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
 }`}
 >
 {page}
 </button>
 ))}
 </div>

 <Button
 variant="outline"
 size="sm"
 className="h-10 px-4 rounded-app border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
 disabled={currentPage === totalPages}
 >
 {t('dashboard.fleet.next')}
 </Button>
 </div>
 </div>
 </>
 ) : (
 <div className="py-24 text-center bg-white rounded-app border border-slate-100 ">
 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
 <Car className="text-slate-200" size={40} />
 </div>
 <h3 className="text-xl font-extrabold text-slate-900 mb-2">{searchQuery ? t('dashboard.fleet.no_matches') : t('dashboard.fleet.no_listings')}</h3>
 <p className="text-slate-400 mb-10 max-w-xs mx-auto font-medium">
 {searchQuery ? t('dashboard.fleet.adjust_search') : t('dashboard.fleet.start_earning')}
 </p>
 {!searchQuery && (
 <Link href="/dashboard/cars/new">
 <Button className="bg-primary hover:bg-primary-hover text-white h-14 px-10 rounded-app font-bold transition-all">
 {t('dashboard.fleet.create_first')}
 </Button>
 </Link>
 )}
 </div>
 )}
 </div>
 </div>
 );
}
