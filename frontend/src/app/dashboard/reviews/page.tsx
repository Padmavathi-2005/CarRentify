"use client";

import React, { useState, useEffect } from "react";
import { 
  Star, 
  Car, 
  MessageCircle, 
  ChevronRight, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthContext";
import { API_BASE_URL } from "@/config/api";

export default function UserReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_BASE_URL}/reviews/user/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error("User reviews fetch failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserReviews();
  }, [user]);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      
      {/* Breadcrumbs Hub */}
      <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
         <span className="hover:text-primary cursor-pointer">Dashboard</span>
         <ChevronRight size={10} className="text-slate-300" />
         <span className="text-primary border-b-2 border-primary/20 pb-0.5">My Reviews</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
         <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Feedback History</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage and synchronize your ratings across the premium fleet hub.</p>
         </div>
         <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/10">
            <Zap size={10} fill="currentColor" /> Total Synchronized Feedback: {reviews.length}
         </div>
      </div>

      {loading ? (
        <div className="space-y-6">
           {[1,2,3].map(i => (
             <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
           ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
           {reviews.map((rev, i) => (
             <div key={i} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm relative group hover:shadow-xl hover:shadow-slate-200/40 transition-all">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                   
                   {/* Car Preview Hub */}
                   <div className="w-full md:w-60 shrink-0 space-y-4">
                      <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-slate-50 relative group/img">
                         <img src={(rev.car?.images && rev.car.images[0]) || "/car-placeholder.png"} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" alt={rev.car?.name} />
                         <div className="absolute inset-0 bg-black/5" />
                      </div>
                      <div className="space-y-1 text-center md:text-left">
                         <h4 className="text-sm font-black text-slate-900 leading-none tracking-tight line-clamp-1">{rev.car?.name}</h4>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Vehicle Recognition ID Sync</p>
                      </div>
                   </div>

                   {/* Review Content Hub */}
                   <div className="flex-1 space-y-6 border-t md:border-t-0 md:border-l border-slate-50 pt-8 md:pt-0 md:pl-10 relative">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                         <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl">
                            {[...Array(5)].map((_, idx) => (
                               <Star key={idx} size={10} className={idx < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                            ))}
                            <span className="ml-2 text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">{rev.rating}.0 Sync</span>
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            <Calendar size={12} /> {new Date(rev.createdAt).toLocaleDateString()}
                         </div>
                      </div>

                      <p className="text-base font-bold text-slate-600 leading-relaxed italic pr-6 group-hover:text-slate-900 transition-colors">"{rev.comment}"</p>
                      
                      <div className="flex items-center gap-4 pt-4">
                         <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100/50">
                            <ShieldCheck size={12} fill="currentColor" /> Verified Synchronized Driver
                         </div>
                         <button className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1.5">
                            <ExternalLink size={12} /> View Platform Listing
                         </button>
                      </div>
                   </div>

                </div>
             </div>
           ))}
        </div>
      ) : (
        /* Empty State Feedback Hub */
        <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
           <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-md flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:text-primary transition-all duration-500">
              <MessageCircle size={44} className="opacity-40" />
           </div>
           <div className="space-y-3 relative z-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">No Reviews Found</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-sm leading-relaxed">Your journey feedback history is currently unsynchronized. Rate your completed bookings to build your reputation.</p>
           </div>
           <Button onClick={() => window.location.href='/dashboard/bookings'} className="h-14 px-10 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all animate-pulse border-none">
              Explore Fulfilled Bookings <ArrowRight size={14} className="ml-2" />
           </Button>
        </div>
      )}

    </div>
  );
}
