"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, ChevronRight, MoreVertical, CheckCircle2, XCircle, Clock, MapPin, Phone, Mail, User, Car } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";

import "../styles/AdminBookingsView.css";

const bookings = [
  { id: "BK-4501", car: "Mercedes Maybach S-Class", user: "Alexander Pierce", status: "Active", date: "Apr 2, 2026 - Apr 5, 2026", total: "$450.00", location: "JFK Terminal 4" },
  { id: "BK-4502", car: "Porsche 911 Carrera", user: "Sophie Montgomery", status: "Pending", date: "Apr 3, 2026 - Apr 6, 2026", total: "$600.00", location: "London Heathrow T5" },
  { id: "BK-4503", car: "Audi e-tron GT", user: "Julian Rossi", status: "Completed", date: "Mar 28, 2026 - Mar 31, 2026", total: "$360.00", location: "Dubai Terminal 3" },
  { id: "BK-4504", car: "BMW X7 M50i", user: "Nathan Drake", status: "Cancelled", date: "Mar 25, 2026 - Mar 28, 2026", total: "$540.00", location: "Paris CDG T2E" },
];

export default function BookingsPage() {
  const [search, setSearch] = useState("");

  const filteredBookings = bookings.filter(bk => 
    bk.id.toLowerCase().includes(search.toLowerCase()) || 
    bk.user.toLowerCase().includes(search.toLowerCase()) ||
    bk.car.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="admin-bookings-container"
    >
      <div className="admin-booking-header">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Reservation System</h1>
          <p className="text-slate-500 font-medium tracking-wide">Track, modify, and optimize your global booking schedule.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <Button variant="outline" className="flex-1 md:flex-none h-12 px-6 rounded-2xl bg-white border-slate-200 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
             <Calendar size={18} /> Schedule View
           </Button>
           <Button className="flex-1 md:flex-none h-12 px-8 rounded-2xl bg-primary text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-none hover:translate-y-px transition-all">
             New Manual Booking
           </Button>
        </div>
      </div>

      <Card className="admin-bookings-card">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/20">
           <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search ID, Customer, or Car..." 
                className="w-full pl-10 h-12 bg-white border-slate-100 rounded-xl focus-visible:ring-primary/20 text-sm font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-2">
              {["All", "Active", "Pending", "Completed", "Cancelled"].map((tab) => (
                <button key={tab} className={`px-4 h-10 rounded-xl text-xs font-bold tracking-wide transition-all border border-slate-100 ${tab === 'All' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
                   {tab}
                </button>
              ))}
           </div>
        </div>

        <div className="p-4">
           <div className="overflow-x-auto">
              <table className="w-full text-left admin-bookings-table">
                 <thead>
                    <tr className="border-b border-slate-50">
                       <th className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Reservation ID</th>
                       <th className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Customer Details</th>
                       <th className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Vehicle</th>
                       <th className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Period</th>
                       <th className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Total Price</th>
                       <th className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Status</th>
                       <th className="p-8"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    <AnimatePresence mode="popLayout">
                      {filteredBookings.map((bk, i) => (
                        <motion.tr 
                           key={bk.id}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ delay: i * 0.05 }}
                           className="group hover:bg-slate-50/50 transition-colors"
                        >
                           <td className="p-8">
                              <span className="font-extrabold text-slate-900 group-hover:text-primary transition-colors text-sm">{bk.id}</span>
                           </td>
                           <td className="p-8">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                   <User size={20} />
                                </div>
                                <div>
                                   <div className="font-bold text-slate-900 text-sm">{bk.user}</div>
                                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LOYALTY MEMBER</div>
                                </div>
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="flex items-center gap-4">
                                <Car size={20} className="text-primary/50" />
                                <span className="font-bold text-slate-600 text-sm">{bk.car}</span>
                              </div>
                           </td>
                           <td className="p-8 text-slate-400 text-xs font-bold whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary/30" /> {bk.date}
                              </div>
                           </td>
                           <td className="p-8 font-extrabold text-slate-900 text-sm">{bk.total}</td>
                           <td className="p-8">
                               <Badge className={`admin-status-badge ${bk.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : bk.status === 'Pending' ? 'bg-amber-50 text-amber-600' : bk.status === 'Completed' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                                  {bk.status}
                               </Badge>
                           </td>
                           <td className="p-8">
                              <button className="admin-table-action-btn">
                                 <MoreVertical size={20} />
                              </button>
                           </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                 </tbody>
              </table>
           </div>
        </div>
      </Card>

      {filteredBookings.length === 0 && (
        <div className="py-20 text-center">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-200" />
           </div>
           <h3 className="text-2xl font-bold text-slate-900">No Reservations Found.</h3>
           <p className="text-slate-500 mt-2">Adjust your filters or try a different search term.</p>
        </div>
      )}
    </motion.div>
  );
}
