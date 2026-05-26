"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 Bell, 
 Trash2, 
 CheckCircle2, 
 AlertCircle, 
 Clock, 
 Search, 
 Filter,
 RefreshCw,
 MoreVertical,
 ShieldCheck,
 Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/config/api";
import { authService } from "@/services/authService";

export default function AdminNotificationsView() {
 const router = useRouter();
 const [notifications, setNotifications] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [filterType, setFilterType] = useState<'all' | 'urgent' | 'sync'>('all');

 const fetchNotifications = async () => {
 setLoading(true);
 try {
 const res = await fetch(`${API_BASE_URL}/notifications?_t=${Date.now()}`, {
 headers: { Authorization: `Bearer ${authService.getAdminToken()}` }
 });
 if (res.ok) {
 const data = await res.json();
 setNotifications(data);
 }
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchNotifications();
 }, []);

 const filtered = notifications.filter(n => {
   const searchLower = search.toLowerCase();
   const matchesSearch = (n.title || "").toLowerCase().includes(searchLower) || 
                         (n.body || n.message || "").toLowerCase().includes(searchLower);
   let matchesType = true;
   if (filterType === 'urgent') {
     matchesType = n.type === 'warning' || n.type === 'error';
   } else if (filterType === 'sync') {
     matchesType = n.type === 'info' || n.type === 'success' || !n.type;
   }
   return matchesSearch && matchesType;
 });

 return (
 <div className="space-y-6">
 {/* Header Area */}
 <div className="bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
 <div>
 <h2 className="text-2xl font-black text-[var(--admin-text-main)] tracking-tight flex items-center gap-3">
 <div className="p-2 bg-primary/5 rounded-app text-primary"><Bell size={20} /></div>
 Notifications Hub
 </h2>
 <p className="text-[var(--admin-text-muted)] font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Audit trail and system transmissions</p>
 </div>
 <div className="flex items-center gap-3">
 <Button variant="outline" className="h-10 px-4 rounded-app border-[var(--admin-border)] text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)]">
 Mark All Read
 </Button>
 <Button onClick={fetchNotifications} variant="outline" className="h-10 w-10 p-0 rounded-app border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:text-primary bg-transparent">
 <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
 </Button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 {/* Filters Sidebar */}
 <div className="space-y-6">
 <div className="bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] space-y-6">
 <div className="space-y-2">
 <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] ml-1">Search Logs</label>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] opacity-50" size={14} />
 <Input 
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Find event..." 
 className="pl-9 h-11 bg-[var(--admin-bg)] border-none rounded-app text-xs font-bold text-[var(--admin-text-main)]" 
 />
 </div>
 </div>

 <div className="space-y-4 pt-4 border-t border-[var(--admin-border)]">
 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-main)]">Priority Levels</h4>
 <div className="space-y-1">
 <button 
  onClick={() => setFilterType('all')}
  className={`w-full flex items-center justify-between p-3 rounded-app font-black text-[10px] uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-primary text-white' : 'hover:bg-[var(--admin-bg)] text-[var(--admin-text-muted)]'}`}
 >
 <span>All Streams</span>
 <Zap size={12} />
 </button>
 <button 
  onClick={() => setFilterType('urgent')}
  className={`w-full flex items-center justify-between p-3 rounded-app font-black text-[10px] uppercase tracking-widest transition-all ${filterType === 'urgent' ? 'bg-primary text-white' : 'hover:bg-[var(--admin-bg)] text-[var(--admin-text-muted)]'}`}
 >
 <span>Urgent Alerts</span>
 <div className={`w-1.5 h-1.5 rounded-full ${filterType === 'urgent' ? 'bg-white' : 'bg-rose-500'}`} />
 </button>
 <button 
  onClick={() => setFilterType('sync')}
  className={`w-full flex items-center justify-between p-3 rounded-app font-black text-[10px] uppercase tracking-widest transition-all ${filterType === 'sync' ? 'bg-primary text-white' : 'hover:bg-[var(--admin-bg)] text-[var(--admin-text-muted)]'}`}
 >
 <span>System Syncs</span>
 <div className={`w-1.5 h-1.5 rounded-full ${filterType === 'sync' ? 'bg-white' : 'bg-blue-500'}`} />
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Notifications List */}
 <div className="lg:col-span-3 space-y-3">
 <AnimatePresence mode="popLayout">
 {loading ? (
 <div className="bg-[var(--admin-card-bg)] p-20 rounded-app border border-[var(--admin-border)] text-center">
 <RefreshCw className="animate-spin mx-auto text-primary mb-4" size={32} />
 <p className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Synchronizing Analysis Logs...</p>
 </div>
 ) : filtered.length === 0 ? (
 <div className="bg-[var(--admin-card-bg)] p-20 rounded-app border border-[var(--admin-border)] text-center">
 <Bell className="mx-auto text-slate-100 mb-4" size={48} />
 <p className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Transmission silence. All systems operational.</p>
 </div>
 ) : (
 filtered.map((n, i) => (
 <motion.div
 key={n._id}
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: i * 0.05 }}
 className={`group bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] hover: hover:border-primary/20 transition-all flex items-start gap-5 relative overflow-hidden ${!n.isRead ? 'border-l-4 border-l-primary' : ''}`}
 >
 <div className={`p-3 rounded-app shrink-0 ${!n.isRead ? 'bg-primary/5 text-primary' : 'bg-[var(--admin-bg)] text-[var(--admin-text-muted)]'}`}>
 <ShieldCheck size={20} />
 </div>
 <div className="flex-1">
 <div className="flex justify-between items-start mb-1">
 <h3 className="font-black text-[var(--admin-text-main)] text-sm tracking-tight">{n.title}</h3>
 <span className="text-[10px] font-bold text-[var(--admin-text-muted)] bg-[var(--admin-bg)] px-2 py-1 rounded-full">{new Date(n.createdAt).toLocaleDateString()}</span>
 </div>
 <p className="text-xs font-medium text-[var(--admin-text-muted)] leading-relaxed max-w-2xl">{n.body || n.message}</p>
 <div className="flex items-center gap-4 mt-4">
 <div className="flex items-center gap-1.5 text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">
 <Clock size={12} /> {new Date(n.createdAt).toLocaleTimeString()}
 </div>
 <div className="w-1 h-1 rounded-full bg-slate-200" />
 {n.data?.url ? (
 <button 
  onClick={() => router.push(n.data.url)}
 className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
 >
 View Context
 </button>
 ) : (n.data?.bookingId || n.data?.userId) ? (
 <button 
  onClick={() => router.push(n.data?.bookingId ? '/admin/bookings' : '/admin/users')}
 className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
 >
 Reference Context
 </button>
 ) : (
 <button className="text-[9px] font-black text-slate-300 uppercase tracking-widest cursor-default">
 Context N/A
 </button>
 )}
 </div>
 </div>
 <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
 <button className="w-8 h-8 rounded-app bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-all"><Trash2 size={14} /></button>
 <button className="w-8 h-8 rounded-app bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all"><CheckCircle2 size={14} /></button>
 </div>
 </motion.div>
 ))
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 );
}
