"use client";

import React from "react";
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
  Heart
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardOverview() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Breadcrumbs Hub */}
      <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
         <span className="hover:text-primary cursor-pointer">Home</span>
         <ChevronRight size={10} className="text-slate-300" />
         <span className="hover:text-primary cursor-pointer">Account</span>
         <ChevronRight size={10} className="text-slate-300" />
         <span className="text-primary border-b-2 border-primary/20 pb-0.5">Overview</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
         <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Welcome back, Alena Thiel!</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Here's a synchronized overview of your account activity.</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-white hover:text-primary hover:border-primary/20 transition-all shadow-sm cursor-pointer relative group">
               <Bell size={18} className="group-hover:scale-110" />
               <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white" />
            </div>
         </div>
      </div>

      {/* High-Fidelity Stats Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { title: "Total Bookings", val: "12", icon: ShoppingBag, color: "bg-primary/5", text: "text-primary" },
           { title: "Total Reviews", val: "08", icon: Star, color: "bg-amber-50", text: "text-amber-500" },
           { title: "Member Since", val: "5 Months", icon: Clock, color: "bg-emerald-50", text: "text-emerald-500" },
           { title: "Wallet Amount", val: "$1,248.00", icon: Wallet, color: "bg-indigo-50", text: "text-indigo-500" }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50/50 rounded-full translate-x-1/2 -translate-y-1/2 blur-lg" />
              <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center ${stat.text} group-hover:scale-110 transition-transform`}>
                 <stat.icon size={20} />
              </div>
              <div className="relative z-10">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.title}</p>
                 <h3 className="text-xl font-black text-slate-900 leading-none">{stat.val}</h3>
              </div>
           </div>
         ))}
      </div>

      {/* CTA Box - Become a Vendor */}
      <section className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
         <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            <div className="space-y-4 max-w-xl text-center md:text-left">
               <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/10">
                  <Zap size={10} fill="currentColor" /> Monetize Your Fleet
               </div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Become a Car Rental Vendor</h2>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Upgrade your account to vendor status and start renting out your vehicles. Earn money by listing your cars on our platform.</p>
            </div>
            <Button className="bg-primary hover:bg-black text-white h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all active:scale-95 border-none group">
               Learn More & Upgrade <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
         </div>
      </section>

      {/* Personal Info & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* Personal Info Box */}
         <section className="lg:col-span-5 bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-8">
               <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Personal Hub</h3>
               </div>
               <button className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all shadow-sm group">
                  <Edit2 size={14} className="group-hover:rotate-12 transition-transform" />
               </button>
            </div>

            <div className="space-y-6">
               {[
                 { label: "Full Identity", val: "Alena Thiel" },
                 { label: "Electronic Mail", val: "customer@rentify.global" },
                 { label: "Mobile Contact", val: "+1 (816) 444-8938" },
                 { label: "Verified Since", val: "Oct 22, 2025" }
               ].map((info, i) => (
                 <div key={i} className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">{info.label}</p>
                    <p className="text-xs font-black text-slate-900">{info.val}</p>
                 </div>
               ))}
            </div>
         </section>

         {/* Recent Activity Hub */}
         <section className="lg:col-span-7 bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm space-y-8 h-full">
            <div className="flex items-center justify-between border-b border-slate-50 pb-8">
               <div className="flex items-center gap-2">
                  <CalendarCheck size={14} className="text-primary" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Recent Bookings</h3>
               </div>
               <button className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:underline">
                  View All Hub <ExternalLink size={12} strokeWidth={3} />
               </button>
            </div>

            {/* Empty State / Reference Empty Hub */}
            <div className="h-[280px] flex flex-col items-center justify-center text-center space-y-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 group hover:bg-white hover:border-primary/20 transition-all">
               <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                  <Car size={32} />
               </div>
               <div className="space-y-2">
                  <h4 className="text-lg font-black text-slate-900 leading-none">No Active Bookings</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Synchronize your first journey now.</p>
               </div>
               <Button className="h-12 px-8 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none border-none">
                  Explore Premium Fleet
               </Button>
            </div>
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
