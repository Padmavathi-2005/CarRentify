"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Users, Car, Calendar, DollarSign, 
  ArrowUpRight, ArrowDownRight, Clock, MapPin, CheckCircle2, 
  ChevronRight, MoreVertical, Plus, Filter, Download, ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

import { ADMIN_STATS, ADMIN_ACTIVITY, ADMIN_TASKS } from "../../data/mockData";
import "../styles/AdminDashboardView.css";

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState("Admin");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // In a real app, we'd fetch this from a store or token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      window.location.href = '/admin-login';
      return;
    }

    if (token === 'mock-admin-token') {
      setAdminName("Admin");
    }
    
    setIsAuthorized(true);
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-primary font-mono italic">
        Verifying Security Credentials...
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="admin-dashboard-container"
    >
      {/* Welcome Header */}
      <div className="admin-header-node">
         <div>
           <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Morning, {adminName}</h1>
           <p className="text-slate-500 font-medium tracking-wide">Here's what's happening in your fleet today.</p>
         </div>
         <div className="flex items-center gap-4">
            <Button variant="outline" className="h-12 px-6 rounded-2xl bg-white border-slate-200 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
               <Download size={18} /> Export Data
            </Button>
            <Button className="h-12 px-8 rounded-2xl bg-primary text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-none hover:translate-y-px transition-all">
               <Plus size={18} /> Add New Vehicle
            </Button>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stat-grid">
        {ADMIN_STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="admin-dashboard-card group">
                <CardContent className="p-10 flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${stat.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                     <Icon size={28} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{stat.label}</div>
                  <div className="admin-stat-value mb-4">{stat.value}</div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                     {stat.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                     {stat.change} vs last 30d
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
           <Card className="rounded-[2.5rem] border-none bg-white shadow-xl overflow-hidden h-full">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                 <h3 className="text-2xl font-bold text-slate-900">Recent Fleet Activity</h3>
                 <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-xs font-bold">
                       <Filter size={16} className="mr-2" /> Filters
                    </Button>
                    <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                       <MoreVertical size={18} />
                    </button>
                 </div>
              </div>
              <div className="p-4">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left admin-activity-table">
                       <thead>
                          <tr className="border-b border-slate-50">
                             <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Vehicle</th>
                             <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Customer</th>
                             <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                             <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Time</th>
                             <th className="p-6"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {ADMIN_ACTIVITY.map((item, i) => (
                             <motion.tr 
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="group hover:bg-slate-50/50 transition-colors"
                             >
                                <td className="p-6">
                                   <div className="font-extrabold text-slate-900 group-hover:text-primary transition-colors text-sm">{item.car}</div>
                                   <div className="text-[11px] font-bold text-slate-400 tracking-wider">PREMIUM CLASS</div>
                                </td>
                                <td className="p-6 text-slate-600 font-bold text-sm">{item.user}</td>
                                <td className="p-6">
                                   <Badge className={`admin-badge-stat ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : item.status === 'Confirming' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                      {item.status}
                                   </Badge>
                                </td>
                                <td className="p-6 text-slate-400 text-xs font-bold">{item.time}</td>
                                <td className="p-6">
                                   <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-primary hover:bg-white transition-all">
                                      <ChevronRight size={20} />
                                   </button>
                                </td>
                             </motion.tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </Card>
        </div>

        {/* Quick Actions & System Support */}
        <div className="space-y-10">
           <Card className="rounded-[2.5rem] border-none bg-primary p-10 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-20" />
              <div className="relative z-10">
                 <ShieldCheck className="w-12 h-12 text-white/50 mb-8" />
                 <h3 className="text-3xl font-extrabold mb-4 leading-tight">Elite Secure Operations</h3>
                 <p className="text-white/60 font-medium leading-relaxed mb-8">Maintain your portfolio's high standards with our integrated management tools.</p>
                 <Button className="w-full h-14 rounded-2xl bg-white text-primary hover:bg-black hover:text-white font-extrabold text-lg shadow-xl shadow-white/5 transition-all">
                    System Health Check
                 </Button>
              </div>
           </Card>

           <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-white space-y-8">
              <h4 className="text-xl font-extrabold text-slate-900 border-b border-slate-50 pb-6 flex items-center gap-4">
                 <Clock size={22} className="text-primary" /> Urgent Tasks
              </h4>
              <div className="space-y-6">
                 {ADMIN_TASKS.map((task, i) => (
                   <div key={i} className="admin-task-node group">
                      <div className="admin-task-dot" />
                      <div>
                         <div className="font-extrabold text-slate-900 text-sm group-hover:text-primary transition-colors">{task.task}</div>
                         <div className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{task.user || task.car} • {task.time}</div>
                      </div>
                   </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full h-12 rounded-xl text-slate-400 hover:text-primary font-bold text-sm tracking-wide">
                 View All Tasks <ChevronRight size={18} className="ml-2" />
              </Button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
