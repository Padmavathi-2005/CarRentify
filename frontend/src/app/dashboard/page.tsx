"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { 
 BarChart3, 
 Car, 
 CalendarCheck, 
 Star, 
 Clock, 
 PlusCircle, 
 ExternalLink,
 Edit2,
 Wallet,
 ShieldCheck,
 Zap,
 ArrowRight,
 ChevronRight,
 ShoppingBag,
 Bell,
 Heart,
 MessageSquare
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthContext";
import { chatService } from "@/services/chatService";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import Link from "next/link";
import { useLocale } from "@/components/LocaleContext";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import { motion, AnimatePresence } from "framer-motion";

interface Booking {
 _id: string;
 carId: { name: string; images: string[] } | any;
 startDate: string;
 endDate: string;
 totalPrice: number;
 status: string;
 createdAt: string;
 tripStatus?: string;
}

export default function DashboardOverview() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
 const { user, userType } = useAuth();
 const { t } = useLocale();
 const { showToast } = useToast();
 const searchParams = useSearchParams();
 const msg = searchParams.get('msg');
 const toastShownRef = useRef(false);
 const [bookings, setBookings] = useState<Booking[]>([]);
 const [conversationsCount, setConversationsCount] = useState(0);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   if (msg === 'verification_required' && !toastShownRef.current) {
     showToast(t('dashboard.verification.required_toast'), 'error');
     toastShownRef.current = true;
   } else if (msg === 'verification_pending' && !toastShownRef.current) {
     showToast(t('dashboard.verification.pending_toast'), 'info');
     toastShownRef.current = true;
   }
 }, [msg, showToast]);

 useEffect(() => {
 const fetchData = async () => {
 if (!user?._id) return;
 setLoading(true);
 try {
 // Fetch Bookings based on persona
 const endpoint = userType === "host" ? "vendor-bookings" : "my-bookings";
 const token = localStorage.getItem('token');
 
 const [bookRes, convs] = await Promise.all([
 fetch(`${API_BASE_URL}/bookings/${endpoint}`, {
 headers: { 'Authorization': `Bearer ${token}` }
 }),
 chatService.getConversations(user._id)
 ]);

 if (bookRes.ok) {
 const bookData = await bookRes.json();
 setBookings(Array.isArray(bookData) ? bookData : []);
 }

 setConversationsCount(convs.length);



 } catch (err) {
 console.error("Dashboard fetch error:", err);
 } finally {
 setLoading(false);
 }
 };

 fetchData();
 }, [user?._id, userType]);

 const formatDate = (dateStr: string) => {
 if (!dateStr) return "N/A";
 return new Date(dateStr).toLocaleDateString('en-US', { 
 month: 'short', 
 day: 'numeric', 
 year: 'numeric' 
 });
 };

 const totalRevenue = bookings
  .filter(b => ['approved', 'confirmed', 'active', 'completed'].includes(b.status?.toLowerCase()))
  .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

 const netProfit = totalRevenue * 0.85;

 const stats = [
  { 
   title: userType === 'host' ? t('dashboard.overview.stats.total_rentals') : t('dashboard.overview.stats.total_bookings'), 
   val: bookings.length.toString(), 
   icon: ShoppingBag, 
   color: "bg-primary/5", 
   text: "text-primary" 
  },
  { 
   title: userType === 'host' ? t('dashboard.overview.stats.net_profit') : "Total Investment", 
   val: `$${(userType === 'host' ? netProfit : totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
   icon: BarChart3, 
   color: "bg-emerald-50", 
   text: "text-emerald-500" 
  },
  { 
   title: t('dashboard.overview.stats.wallet_amount'), 
   val: `$${(user?.walletBalance || 0).toLocaleString()}`, 
   icon: Wallet, 
   color: "bg-indigo-50", 
   text: "text-indigo-500" 
  }
 ];

 return (
  <div className="space-y-8 animate-fade-in pb-12 relative">
 
 {/* Breadcrumbs Hub */}
 <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
 <Link href="/" className="hover:text-primary cursor-pointer">{t('dashboard.common.home')}</Link>
 <ChevronRight size={10} className="text-slate-300" />
 <span className="hover:text-primary cursor-pointer">{t('dashboard.common.account')}</span>
 <ChevronRight size={10} className="text-slate-300" />
 <span className="text-primary border-b-2 border-primary/20 pb-0.5">{t('dashboard.nav.overview')}</span>
 </div>

 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
 <div className="space-y-2">
 <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
 {t('dashboard.overview.welcome', { name: user?.firstName || t('dashboard.common.guest') })}
 </h1>
 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.overview.subtitle')}</p>
 </div>
 </div>

 {/* High-Fidelity Stats Nodes */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {stats.map((stat, i) => (
 <div key={i} className="bg-white p-6 rounded-app border border-slate-100 flex items-center gap-5 group transition-all cursor-default relative overflow-hidden">
 <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50/50 rounded-full translate-x-1/2 -translate-y-1/2 blur-lg" />
 <div className={`w-12 h-12 rounded-app ${stat.color} flex items-center justify-center ${stat.text} group-hover:scale-110 transition-transform`}>
 <stat.icon size={20} />
 </div>
 <div className="relative z-10">
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.title}</p>
 <h3 className="text-xl font-black text-slate-900 leading-none">{stat.val}</h3>
 </div>
 </div>
 ))}
 </div>

  {/* Active Trips Section */}
  {bookings.filter(b => b.status === 'Active' || b.tripStatus === 'checked_in').length > 0 && (
   <section className="space-y-6">
    <div className="flex items-center gap-3">
     <div className="w-1.5 h-6 bg-primary rounded-full" />
     <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t('dashboard.active_trips_title') || "Active Journeys"}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     {bookings.filter(b => b.status === 'Active' || b.tripStatus === 'checked_in').map((trip) => (
      <Link key={trip._id} href={`/dashboard/bookings?id=${trip._id}`}>
       <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white rounded-app p-6 border border-slate-100 relative overflow-hidden group cursor-pointer shadow-xl shadow-slate-200/20"
       >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
        <div className="relative z-10 space-y-4">
         <div className="flex justify-between items-start">
          <div className="space-y-1">
           <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{trip.carId?.brand || "Premium"} {trip.carId?.model}</p>
           <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{trip.carId?.name}</h3>
          </div>
          <div className="w-10 h-10 rounded-app bg-primary/5 flex items-center justify-center">
           <Zap size={18} className="text-primary" fill="currentColor" />
          </div>
         </div>
         
         <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
          <div className="space-y-1">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Return Date</p>
           <p className={`text-xs font-black ${new Date(trip.endDate).getTime() < Date.now() ? 'text-rose-600' : 'text-slate-900'}`}>{formatDate(trip.endDate)}</p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="space-y-1 flex flex-col justify-center">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
           <div>
             {new Date(trip.endDate).getTime() < Date.now() ? (
               <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black uppercase tracking-widest shadow-sm animate-pulse">Overdue</span>
             ) : (
               <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-primary/5 text-primary border border-primary/10 text-[9px] font-black uppercase tracking-widest shadow-sm">In Progress</span>
             )}
           </div>
          </div>
         </div>
        </div>
       </motion.div>
      </Link>
     ))}
    </div>
   </section>
  )}

 {/* CTA Box - Become a Vendor */}
 {userType !== 'host' && (
 <section className="bg-white p-10 rounded-app border border-slate-100 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
 <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
 <div className="space-y-4 max-w-xl text-center md:text-left">
 <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/10">
 <Zap size={10} fill="currentColor" /> {t('dashboard.overview.cta.badge')}
 </div>
 <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{t('dashboard.overview.cta.title')}</h2>
 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{t('dashboard.overview.cta.desc')}</p>
 </div>
 <Link href="/dashboard/cars/new">
 <Button className="bg-primary hover:bg-primary-hover text-white h-11 px-10 rounded-app font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 border-none group">
 {t('dashboard.overview.cta.btn')} <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
 </Button>
 </Link>
 </div>
 </section>
 )}

 {/* Personal Info & Recent Activity Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 
 {/* Personal Info Box */}
 <section className="lg:col-span-5 bg-white p-10 rounded-app border border-slate-100 space-y-8">
 <div className="flex items-center justify-between border-b border-slate-50 pb-8">
 <div className="flex items-center gap-2">
 <ShieldCheck size={14} className="text-primary" />
 <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">{t('dashboard.overview.personal_hub.title')}</h3>
 </div>
 <Link href="/dashboard/profile" className="w-9 h-9 rounded-app bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all group">
 <Edit2 size={14} className="group-hover:rotate-12 transition-transform" />
 </Link>
 </div>

 <div className="space-y-6">
 <div className="space-y-1">
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">{t('dashboard.overview.personal_hub.full_identity')}</p>
 <p className="text-xs font-black text-slate-900">{user?.firstName} {user?.lastName}</p>
 </div>
 <div className="space-y-1">
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">{t('dashboard.overview.personal_hub.email')}</p>
 <p className="text-xs font-black text-slate-900">{user?.email}</p>
 </div>
 <div className="space-y-1">
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">{t('dashboard.overview.personal_hub.persona')}</p>
 <p className="text-xs font-black text-primary uppercase">{t('dashboard.overview.personal_hub.mode', { type: userType })}</p>
 </div>
 <div className="space-y-1">
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">{t('dashboard.overview.personal_hub.verified')}</p>
 <p className="text-xs font-black text-slate-900">{formatDate(user?.createdAt || "")}</p>
 </div>
 </div>
 </section>

 {/* Recent Activity Hub */}
 <section className="lg:col-span-7 bg-white p-10 rounded-app border border-slate-100 space-y-8 h-full">
 <div className="flex items-center justify-between border-b border-slate-50 pb-8">
 <div className="flex items-center gap-2">
 <CalendarCheck size={14} className="text-primary" />
 <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
 {userType === 'host' ? 'Recent Earnings' : 'Recent Bookings'}
 </h3>
 </div>
 <Link href="/dashboard/bookings" className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:underline">
 {t('dashboard.overview.recent.view_all')} <ExternalLink size={12} strokeWidth={3} />
 </Link>
 </div>

 {bookings.length > 0 ? (
 <div className="space-y-4">
 {bookings.slice(0, 3).map((booking) => (
 <div key={booking._id} className="p-4 rounded-app bg-slate-50/50 border border-slate-100 flex items-center justify-between group hover:bg-white hover: transition-all">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-app bg-white border border-slate-100 overflow-hidden">
 <img 
 src={getImageUrl(booking.carId?.images?.[0] || "")} 
 className="w-full h-full object-cover" 
 />
 </div>
 <div>
 <h4 className="text-xs font-black text-slate-900">{booking.carId?.name || "Vehicle"}</h4>
 <p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-xs font-black text-slate-900">${booking.totalPrice?.toLocaleString()}</p>
 <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
 booking.status === 'approved' ? 'bg-emerald-50 text-emerald-500' :
 booking.status === 'pending' ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400'
 }`}>
 {booking.status}
 </span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="h-[280px] flex flex-col items-center justify-center text-center space-y-6 bg-slate-50/50 rounded-app border border-dashed border-slate-200 group hover:bg-white hover:border-primary/20 transition-all">
 <div className="w-16 h-16 rounded-app bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
 <Car size={32} />
 </div>
 <div className="space-y-2">
 <h4 className="text-lg font-black text-slate-900 leading-none">{t('dashboard.overview.recent.no_activity')}</h4>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t('dashboard.overview.recent.sync_now')}</p>
 </div>
 <Link href="/vehicles">
 <Button className="h-12 px-8 rounded-app bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all outline-none border-none">
 {t('dashboard.overview.recent.explore_btn')}
 </Button>
 </Link>
 </div>
 )}
 </section>
 </div>
 
 {/* Visual Integrity Styles */}
 <style jsx global>{`
 .animate-fade-in {
 animation: fadeIn 0.4s ease-out forwards;
 }
 @keyframes fadeIn {
 from { opacity: 0; transform: translateY(10px); }
 to { opacity: 1; transform: translateY(0); }
 }
 `}</style>
 </div>
 );
}
