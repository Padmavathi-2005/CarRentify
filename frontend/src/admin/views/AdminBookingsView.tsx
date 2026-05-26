"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, ChevronRight, MoreVertical, CheckCircle2, XCircle, Clock, MapPin, Phone, Mail, User, Car } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { useLocale } from "@/components/LocaleContext";

import "../styles/AdminBookingsView.css";

const bookings = [
 { id: "BK-4501", car: "Mercedes Maybach S-Class", user: "Alexander Pierce", status: "Active", date: "Apr 2, 2026 - Apr 5, 2026", total: 450, location: "JFK Terminal 4" },
 { id: "BK-4502", car: "Porsche 911 Carrera", user: "Sophie Montgomery", status: "Pending", date: "Apr 3, 2026 - Apr 6, 2026", total: 600, location: "London Heathrow T5" },
 { id: "BK-4503", car: "Audi e-tron GT", user: "Julian Rossi", status: "Completed", date: "Mar 28, 2026 - Mar 31, 2026", total: 360, location: "Dubai Terminal 3" },
 { id: "BK-4504", car: "BMW X7 M50i", user: "Nathan Drake", status: "Cancelled", date: "Mar 25, 2026 - Mar 28, 2026", total: 540, location: "Paris CDG T2E" },
];

 export default function BookingsPage() {
  const { formatPrice } = useLocale();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filteredBookings = bookings.filter(bk => 
    (activeTab === "All" || bk.status === activeTab) &&
    (bk.id.toLowerCase().includes(search.toLowerCase()) || 
     bk.user.toLowerCase().includes(search.toLowerCase()) ||
     bk.car.toLowerCase().includes(search.toLowerCase()))
  );

 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 className="admin-bookings-container"
 >
 <div className="admin-booking-header">
 <div>
 <h1 className="text-4xl font-extrabold tracking-tight text-[var(--admin-text-main)] mb-2">Reservation System</h1>
 <p className="text-[var(--admin-text-muted)] font-medium tracking-wide">Track, modify, and optimize your global booking schedule.</p>
 </div>
 </div>

 <Card className="admin-bookings-card border-[var(--admin-border)]">
 <div className="p-8 border-b border-[var(--admin-border)] flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--admin-bg)]/20">
 <div className="relative w-full md:w-96 group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)] group-focus-within:text-primary transition-colors" />
 <Input 
 placeholder="Search ID, Customer, or Car..." 
 className="w-full pl-10 h-12 bg-[var(--admin-card-bg)] border-[var(--admin-border)] rounded-app focus-visible:ring-primary/20 text-sm font-medium text-[var(--admin-text-main)]"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>
 
 <div className="flex items-center gap-2">
 {["All", "Active", "Pending", "Completed", "Cancelled"].map((tab) => (
  <button 
    key={tab} 
    onClick={() => setActiveTab(tab)}
    className={`px-4 h-10 rounded-app text-xs font-bold tracking-wide transition-all border border-[var(--admin-border)] ${tab === activeTab ? 'bg-[var(--primary-brand-color)] text-white border-none shadow-md shadow-primary/20' : 'bg-[var(--admin-card-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)]'}`}
  >
  {tab}
  </button>
 ))}
 </div>
 </div>

 <div className="p-4">
 <div className="overflow-x-auto">
 <table className="w-full text-left admin-bookings-table">
 <thead>
 <tr className="border-b border-[var(--admin-border)]">
 <th className="text-xs font-extrabold uppercase tracking-widest text-[var(--admin-text-muted)]">Reservation ID</th>
 <th className="text-xs font-extrabold uppercase tracking-widest text-[var(--admin-text-muted)]">Customer Details</th>
 <th className="text-xs font-extrabold uppercase tracking-widest text-[var(--admin-text-muted)]">Vehicle</th>
 <th className="text-xs font-extrabold uppercase tracking-widest text-[var(--admin-text-muted)]">Period</th>
 <th className="text-xs font-extrabold uppercase tracking-widest text-[var(--admin-text-muted)]">Total Price</th>
 <th className="text-xs font-extrabold uppercase tracking-widest text-[var(--admin-text-muted)]">Status</th>
 <th className="p-8"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--admin-border)]">
 <AnimatePresence mode="popLayout">
 {filteredBookings.map((bk, i) => (
 <motion.tr 
 key={bk.id}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: i * 0.05 }}
 className="group hover:bg-[var(--admin-bg)]/50 transition-colors"
 >
 <td className="p-8">
 <span className="font-extrabold text-[var(--admin-text-main)] group-hover:text-[var(--primary-brand-color)] transition-colors text-sm">{bk.id}</span>
 </td>
 <td className="p-8">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-app bg-[var(--admin-bg)] flex items-center justify-center text-[var(--admin-text-muted)] border border-[var(--admin-border)]">
 <User size={20} />
 </div>
 <div>
 <div className="font-bold text-[var(--admin-text-main)] text-sm">{bk.user}</div>
 <div className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">LOYALTY MEMBER</div>
 </div>
 </div>
 </td>
 <td className="p-8">
 <div className="flex items-center gap-4">
 <Car size={20} className="text-primary opacity-50" />
 <span className="font-bold text-[var(--admin-text-muted)] text-sm">{bk.car}</span>
 </div>
 </td>
 <td className="p-8 text-[var(--admin-text-muted)] text-xs font-bold whitespace-nowrap">
 <div className="flex items-center gap-2">
 <Clock size={16} className="text-primary opacity-30" /> {bk.date}
 </div>
 </td>
 <td className="p-8 font-extrabold text-[var(--admin-text-main)] text-sm">{formatPrice(bk.total)}</td>
 <td className="p-8">
 <Badge className={`admin-status-badge ${bk.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : bk.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : bk.status === 'Completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
 {bk.status}
 </Badge>
 </td>
 <td className="p-8 text-right">
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
 <div className="w-20 h-20 bg-[var(--admin-bg)] rounded-app flex items-center justify-center mx-auto mb-6 border border-[var(--admin-border)]">
 <Search className="w-10 h-10 text-[var(--admin-text-muted)] opacity-20" />
 </div>
 <h3 className="text-2xl font-bold text-[var(--admin-text-main)]">No Reservations Found.</h3>
 <p className="text-[var(--admin-text-muted)] mt-2">Adjust your filters or try a different search term.</p>
 </div>
 )}
 </motion.div>
 );
}
