"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 TrendingUp, TrendingDown, Users, Car, Calendar, DollarSign, 
 ArrowUpRight, ArrowDownRight, Clock, MapPin, CheckCircle2, 
 ChevronRight, MoreVertical, Filter, Download, ShieldCheck,
 AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import Link from "next/link";
import { useLocale } from "@/components/LocaleContext";

import { ADMIN_STATS, ADMIN_ACTIVITY, ADMIN_TASKS } from "../../data/mockData";
import { authService } from "../../services/authService";
import "../styles/AdminDashboardView.css";

export default function AdminDashboard() {
 const { formatPrice } = useLocale();
 const [adminName, setAdminName] = useState("Admin");
 const [isAuthorized, setIsAuthorized] = useState(false);
 const [stats, setStats] = useState<any>(null);
 const [activity, setActivity] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [statusFilter, setStatusFilter] = useState<string | null>(null);
 const [showFilters, setShowFilters] = useState(false);
 const filterRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
 setShowFilters(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 useEffect(() => {
 const token = authService.getAdminToken();
 const user = authService.getAdminUser();
 
 if (!token || user?.role?.toLowerCase() !== 'admin') {
 window.location.href = '/admin/login';
 return;
 }

 if (user) {
 setAdminName(user.displayName || user.firstName || "Admin");
 }
 
 setIsAuthorized(true);
 fetchDashboardData();
 }, []);

 const fetchDashboardData = async () => {
 try {
 const token = authService.getAdminToken();
 const headers = { 'Authorization': `Bearer ${token}` };

 const [statsRes, activityRes] = await Promise.all([
 fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/admin/dashboard/stats`, { headers }),
 fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/admin/dashboard/activity`, { headers })
 ]);

 if (statsRes.ok && activityRes.ok) {
 const statsData = await statsRes.json();
 const activityData = await activityRes.json();
 setStats(statsData);
 setActivity(activityData);
 }
 } catch (error) {
 console.error("Dashboard data fetch failed:", error);
 } finally {
 setLoading(false);
 }
 };

 const handleExportData = () => {
  if (activity.length === 0) {
    alert("No activity data available for export.");
    return;
  }
  
  const headers = ["Vehicle", "Customer", "Status", "Time"];
  const csvContent = [
    headers.join(","),
    ...activity.map(a => `"${a.car}","${a.user}","${a.status}","${a.time}"`)
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `dashboard_activity_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 };

 const handleViewAllTasks = () => {
  window.location.href = '/admin/notifications';
 };

 const handleActivityDetail = (item: any) => {
  // Navigate to bookings view with search query for the vehicle name
  window.location.href = `/admin/bookings?search=${encodeURIComponent(item.car)}`;
 };

 if (!isAuthorized || loading) {
 return (
 <div className="min-h-screen flex items-center justify-center p-6 text-primary font-mono italic">
 {loading ? "Synchronizing Infrastructure Data..." : "Verifying Security Credentials..."}
 </div>
 );
 }

 const statCards = [
 { label: "Total Revenue", href: "/admin/wallet", value: stats?.revenue?.value ? formatPrice(stats.revenue.value) : formatPrice(0), change: stats?.revenue?.change || "+0%", up: stats?.revenue?.up ?? true, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
 { label: "Active Users", href: "/admin/users", value: stats?.users?.value?.toString() || "0", change: stats?.users?.change || "+0%", up: stats?.users?.up ?? true, icon: Users, color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/10" },
 { label: "Available Fleet %", href: "/admin/cars", value: stats?.fleet?.value ? `${stats.fleet.value}%` : "0%", change: stats?.fleet?.change || "0%", up: stats?.fleet?.up ?? true, icon: Car, color: "text-violet-500", bg: "bg-violet-500/5", border: "border-violet-500/10" },
 { label: "New Bookings", href: "/admin/bookings", value: stats?.bookings?.value?.toString() || "0", change: stats?.bookings?.change || "+0%", up: stats?.bookings?.up ?? true, icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10" }
 ];

 return (
 <motion.div 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="admin-dashboard-container"
 >
 {/* Welcome Header */}
 <div className="admin-header-node mb-10">
 <div>
 <h1 className="text-xl font-black tracking-[0.05em] admin-dash-text-main mb-1">AdminHQ Dashboard</h1>
 <p className="admin-dash-text-muted font-bold text-[11px] tracking-widest uppercase">Infrastructure Analysis & Car Control Hub</p>
 </div>
 <div className="flex items-center gap-3">
  <Button 
    onClick={handleExportData}
    variant="outline" 
    className="h-11 px-6 rounded-app admin-dash-card admin-dash-text-main hover:border-primary/50 hover:text-primary transition-all flex items-center gap-2"
  >
    <Download size={16} />
    <span className="text-[10px] font-black uppercase tracking-widest">Export Data</span>
  </Button>
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
 {statCards.map((stat, i) => {
 const Icon = stat.icon;
 return (
 <motion.div
 key={stat.label}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1 }}
 >
 <Link href={stat.href} className="block outline-none">
 <Card className={`admin-stat-card rounded-app border ${stat.border} ${stat.bg} p-5 hover: hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden cursor-pointer`}>
 <div className="flex justify-between items-start mb-6 relative z-10">
 <div className={`w-12 h-12 admin-dash-card rounded-app flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border`}>
 <Icon size={20} className={stat.color} />
 </div>
 <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black ${stat.up ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'} uppercase tracking-widest `}>
 {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
 {stat.change}
 </div>
 </div>
 
 <div className="relative z-10">
 <p className="text-[10px] font-black admin-dash-text-muted uppercase tracking-[0.2em] mb-1.5">{stat.label}</p>
 <div className="flex items-baseline gap-2">
 <h3 className="text-2xl font-black admin-dash-text-main tracking-tight">{stat.value}</h3>
 </div>
 </div>
 </Card>
 </Link>
 </motion.div>
 );
 })}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
 {/* Recent Activity */}
 <div className="lg:col-span-2">
 <Card className="rounded-app admin-dash-card overflow-hidden h-full">
 <div className="p-6 admin-dash-border border-b flex justify-between items-center admin-dash-header-bg">
 <h3 className="text-2xl font-bold admin-dash-text-main">Recent Car Activity</h3>
 <div ref={filterRef} className="flex items-center gap-3 relative">
 <Button 
 onClick={() => setShowFilters(!showFilters)}
 variant="outline" 
 className={`h-10 px-4 rounded-app admin-dash-border text-xs font-bold transition-all ${showFilters || statusFilter ? 'border-primary text-primary bg-primary/5' : 'admin-dash-text-main hover:border-primary/30'}`}
 >
 <Filter size={16} className="mr-2" /> 
 <span>{statusFilter ? `Filtered: ${statusFilter}` : 'Filters'}</span>
 </Button>

 {/* Filter Dropdown */}
 <AnimatePresence>
 {showFilters && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 className="absolute top-full right-14 mt-2 w-48 admin-dash-card rounded-app z-50 overflow-hidden"
 >
 <div className="p-2 space-y-1">
 <div className="px-3 py-2 text-[9px] font-black admin-dash-text-muted uppercase tracking-widest border-b admin-dash-border mb-1">Filter by Status</div>
 {['Active', 'Confirmed', 'Completed', 'Cancelled'].map(status => (
 <button 
 key={status}
 onClick={() => {
 setStatusFilter(statusFilter === status ? null : status);
 setShowFilters(false);
 }}
 className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-app transition-colors ${statusFilter === status ? 'bg-primary/10 text-primary' : 'admin-dash-text-main hover:bg-slate-50 dark:hover:bg-white/5'}`}
 >
 {status}
 {statusFilter === status && <CheckCircle2 size={14} />}
 </button>
 ))}
 {statusFilter && (
 <button 
 onClick={() => { setStatusFilter(null); setShowFilters(false); }}
 className="w-full text-left px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-app transition-colors mt-2 border-t admin-dash-border"
 >
 Clear Filters
 </button>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 <button className="w-10 h-10 rounded-app admin-dash-card flex items-center justify-center admin-dash-text-muted hover:border-primary/50 hover:text-primary transition-all">
 <MoreVertical size={18} />
 </button>
 </div>
 </div>
 <div className="p-4">
 <div className="overflow-x-auto">
 <table className="w-full text-left admin-activity-table">
 <thead>
 <tr className="border-b border-[var(--admin-border)]">
 <th className="p-6 text-xs font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Vehicle</th>
 <th className="p-6 text-xs font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Customer</th>
 <th className="p-6 text-xs font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Status</th>
 <th className="p-6 text-xs font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Time</th>
 <th className="p-6"></th>
 </tr>
 </thead>
 <tbody className="divide-y admin-dash-border">
 {activity.length === 0 ? (
 <tr>
 <td colSpan={5} className="p-10 text-center admin-dash-text-muted font-bold uppercase tracking-widest text-[10px]">
 No Recent Activity Detected
 </td>
 </tr>
 ) : (
 (statusFilter ? activity.filter(a => a.status === statusFilter) : activity).map((item, i) => (
 <motion.tr 
 key={i}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.2 + i * 0.1 }}
 className="group hover:bg-primary/5 transition-colors cursor-pointer"
 >
 <td className="p-6" onClick={() => handleActivityDetail(item)}>
 <div className="font-extrabold admin-dash-text-main group-hover:text-primary transition-colors text-sm">{item.car}</div>
 <div className="text-[11px] font-bold admin-dash-text-muted tracking-wider">VEHICLE TRANSACTION</div>
 </td>
 <td className="p-6 admin-dash-text-main font-bold text-sm">{item.user}</td>
 <td className="p-6">
 <Badge className={`admin-badge-stat border-0 ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : item.status === 'Confirmed' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'}`}>
 {item.status}
 </Badge>
 </td>
 <td className="p-6 admin-dash-text-muted text-xs font-bold">{item.time}</td>
 <td className="p-6">
 <button 
  onClick={() => handleActivityDetail(item)}
  className="w-8 h-8 rounded-app flex items-center justify-center admin-dash-text-muted hover:text-primary hover:bg-primary/5 transition-all"
 >
 <ChevronRight size={20} />
 </button>
 </td>
 </motion.tr>
 ))
 )}
 {statusFilter && activity.filter(a => a.status === statusFilter).length === 0 && activity.length > 0 && (
 <tr>
 <td colSpan={5} className="p-10 text-center admin-dash-text-muted font-bold uppercase tracking-widest text-[10px]">
 No Activity Matches Filter "{statusFilter}"
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </Card>
 </div>

 {/* Quick Actions & Urgent Tasks */}
 <div className="space-y-6">
 <div className="admin-dash-card rounded-app p-6 space-y-6 h-full flex flex-col">
 <h4 className="text-xl font-extrabold admin-dash-text-main border-b admin-dash-border pb-6 flex items-center gap-4">
 <AlertTriangle size={22} className="text-amber-500" /> Urgent Tasks
 </h4>
 <div className="space-y-6 flex-1">
  {ADMIN_TASKS.map((task, i) => (
    <div key={i} className="admin-task-node group" onClick={() => handleViewAllTasks()}>
      <div className={`admin-task-dot ${i === 0 ? 'bg-rose-500' : i === 1 ? 'bg-amber-500' : 'bg-blue-500'}`} />
      <div>
        <div className="font-extrabold admin-dash-text-main text-sm group-hover:text-primary transition-colors">{task.task}</div>
        <div className="text-[11px] font-bold admin-dash-text-muted mt-1 uppercase tracking-widest">
          {task.user || task.car} • {task.time}
        </div>
      </div>
    </div>
  ))}
 </div>
 <Button 
  onClick={handleViewAllTasks}
  variant="ghost" 
  className="w-full h-12 rounded-app text-slate-400 hover:text-primary font-bold text-sm tracking-wide mt-auto"
 >
  View All Tasks <ChevronRight size={18} className="ml-2" />
 </Button>
 </div>
 </div>
 </div>
 </motion.div>
 );
}
