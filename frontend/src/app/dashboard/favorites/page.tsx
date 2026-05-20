"use client";

import React, { useState, useEffect } from "react";
import { 
 Heart, 
 Car, 
 Search, 
 PlusCircle, 
 Filter,
 ArrowRight,
 ShieldCheck,
 ChevronRight,
 Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CarCard from "@/components/CarCard";
import { useAuth } from "@/components/AuthContext";
import { useLocale } from "@/components/LocaleContext";
import { API_BASE_URL } from "@/config/api";

export default function FavoritesPage() {
 const { user } = useAuth();
 const { t } = useLocale();
 const [wishlist, setWishlist] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchWishlist = async () => {
 if (!user) return;
 const userId = user._id || user.id;
 if (!userId) return;

 try {
 const res = await fetch(`${API_BASE_URL}/users/wishlist/${userId}`);
 if (res.ok) {
 const data = await res.json();
 setWishlist(data.wishlist);
 }
 } catch (err) {
 console.error("Wishlist fetch failed:", err);
 } finally {
 setLoading(false);
 }
 };
 fetchWishlist();
 }, [user]);

 return (
 <div className="space-y-10 animate-fade-in pb-20">
 
 {/* Breadcrumbs Hub */}
 <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
 <span className="hover:text-primary cursor-pointer">{t('favorites.nav.dashboard')}</span>
 <ChevronRight size={10} className="text-slate-300" />
 <span className="text-primary border-b-2 border-primary/20 pb-0.5">{t('favorites.nav.my_favorites')}</span>
 </div>

 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
 <div className="space-y-2">
 <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{t('favorites.title')}</h1>
 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('favorites.subtitle')}</p>
 </div>
 </div>

 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {[1,2,3].map(i => (
 <div key={i} className="h-80 bg-slate-100 rounded-app animate-pulse" />
 ))}
 </div>
 ) : wishlist.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {wishlist.map((car, i) => (
 <CarCard key={car._id || car.id} car={car} index={i} />
 ))}
 </div>
 ) : (
 /* High-Fidelity Empty State Hub */
 <div className="bg-white p-20 rounded-app border border-slate-100 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
 
 <div className="w-24 h-24 rounded-app bg-slate-50 border border-slate-100 flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:bg-rose-50 transition-all duration-500">
 <Heart size={44} className={wishlist.length === 0 ? "fill-rose-100" : "fill-rose-500"} />
 </div>
 
 <div className="space-y-3 relative z-10">
 <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{t('favorites.labels.empty_title')}</h2>
 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-sm leading-relaxed">{t('favorites.labels.empty_desc')}</p>
 </div>
 
 <div className="flex items-center gap-4 relative z-10">
 <Button onClick={() => window.location.href='/vehicles'} className="bg-primary hover:bg-primary-hover text-white h-14 px-10 rounded-app font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 border-none group">
 {t('favorites.labels.browse_btn')} <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
 </Button>
 </div>
 
 <div className="pt-8 flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
 <ShieldCheck size={14} /> {t('favorites.labels.privacy_sync')}
 </div>
 </div>
 )}

 </div>
 );
}
