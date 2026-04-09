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
import { API_BASE_URL } from "@/config/api";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_BASE_URL}/users/wishlist/${user.id}`);
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
         <span className="hover:text-primary cursor-pointer">Dashboard</span>
         <ChevronRight size={10} className="text-slate-300" />
         <span className="text-primary border-b-2 border-primary/20 pb-0.5">My Favorites</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
         <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Wishlist Experience</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Synchronize and manage your favorited premium vehicles.</p>
         </div>
         <Button className="h-12 px-8 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none border-none">
            Find New Journeys
         </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1,2,3].map(i => (
             <div key={i} className="h-80 bg-slate-100 rounded-3xl animate-pulse" />
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
        <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
           
           <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-md flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:bg-rose-50 transition-all duration-500">
              <Heart size={44} className={wishlist.length === 0 ? "fill-rose-100" : "fill-rose-500"} />
           </div>
           
           <div className="space-y-3 relative z-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Your Wishlist is Empty</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-sm leading-relaxed">It seems you haven't synchronized any vehicles with your favorite hub. Explore our collection to find your next passion.</p>
           </div>
           
           <div className="flex items-center gap-4 relative z-10">
              <Button onClick={() => window.location.href='/vehicles'} className="bg-primary hover:bg-black text-white h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all active:scale-95 border-none group">
                 Browse Marketplace <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
           </div>
           
           <div className="pt-8 flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
              <ShieldCheck size={14} /> Level 1 Privacy Sync
           </div>
        </div>
      )}

    </div>
  );
}
