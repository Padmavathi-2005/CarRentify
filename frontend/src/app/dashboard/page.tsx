"use client";

import React from "react";
import { 
  Car, 
  CalendarCheck, 
  CircleDollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  MoreVertical
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  { title: "Total Vehicles", value: "248", icon: Car, trend: "+12.5%", trendUp: true },
  { title: "Active Bookings", value: "156", icon: CalendarCheck, trend: "+8.2%", trendUp: true },
  { title: "Monthly Revenue", value: "$124,500", icon: CircleDollarSign, trend: "+15.3%", trendUp: true },
  { title: "Customer Satisfaction", value: "4.9 / 5", icon: Users, trend: "-0.2%", trendUp: false },
];

const bookings = [
  { id: "BK-7829", customer: "Sarah Jenkins", model: "Tesla Model S Plaid", pickup: "Oct 24, 10:00 AM", return: "Oct 27, 02:00 PM", status: "Confirmed", amount: "$840.00" },
  { id: "BK-7830", customer: "Marcus Chen", model: "Porsche Taycan", pickup: "Oct 24, 11:30 AM", return: "Oct 26, 11:30 AM", status: "Completed", amount: "$650.00" },
  { id: "BK-7831", customer: "Emma Roberts", model: "Rivian R1T Cross", pickup: "Oct 25, 09:00 AM", return: "Oct 29, 09:00 AM", status: "Pending", amount: "$1,200.00" },
  { id: "BK-7832", customer: "James Wilson", model: "Lucid Air GT", pickup: "Oct 23, 08:00 AM", return: "Oct 25, 05:00 PM", status: "Cancelled", amount: "$0.00" },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Info */}
      <div>
        <div className="flex justify-between items-center mb-2">
           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
           <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 text-sm font-bold text-slate-600">
              <CalendarCheck size={16} /> Oct 24, 2023
           </div>
        </div>
        <p className="text-slate-500 font-medium tracking-wide">Welcome back — here's your fleet at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-[2rem] overflow-hidden">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[#F4F7FE] rounded-2xl">
                   <stat.icon className="text-primary" size={24} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${stat.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                   {stat.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                   {stat.trend}
                </div>
              </div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Fleet Status */}
      <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-10">
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <h3 className="text-xl font-bold text-slate-900">Live Fleet Status</h3>
             </div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">248 Total Vehicles</p>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden mb-10">
             <div className="h-full bg-emerald-500" style={{ width: '33.1%' }} />
             <div className="h-full bg-blue-500" style={{ width: '54%' }} />
             <div className="h-full bg-amber-500" style={{ width: '7.3%' }} />
             <div className="h-full bg-slate-400" style={{ width: '5.6%' }} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { label: "Available", count: 82, color: "bg-emerald-500" },
               { label: "Rented", count: 134, color: "bg-blue-500" },
               { label: "Maintenance", count: 18, color: "bg-amber-500" },
               { label: "Inactive", count: 14, color: "bg-slate-400" }
             ].map((status, i) => (
               <div key={i} className="p-6 bg-[#F4F7FE] rounded-2xl border border-transparent hover:border-slate-200 transition-all flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{status.label}</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{status.count}</p>
                  </div>
               </div>
             ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings Table */}
      <div>
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-2xl font-bold text-slate-900">Recent Bookings</h3>
           <Button variant="ghost" className="text-primary font-bold hover:bg-transparent">
              View All <ArrowRight size={16} className="ml-2" />
           </Button>
        </div>
        
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Car Model</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pick-Up</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Return</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 text-sm font-bold text-slate-900">{booking.id}</td>
                  <td className="px-8 py-6 text-sm font-semibold text-slate-600">{booking.customer}</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-900">{booking.model}</td>
                  <td className="px-8 py-6 text-xs font-medium text-slate-500">{booking.pickup}</td>
                  <td className="px-8 py-6 text-xs font-medium text-slate-500">{booking.return}</td>
                  <td className="px-8 py-6">
                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                       booking.status === "Confirmed" ? "bg-emerald-50 text-emerald-600" :
                       booking.status === "Completed" ? "bg-blue-50 text-blue-600" :
                       booking.status === "Pending" ? "bg-amber-50 text-amber-600" :
                       "bg-rose-50 text-rose-600"
                     }`}>
                        {booking.status}
                     </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-slate-900 text-right">{booking.amount}</td>
                  <td className="px-8 py-6 text-right">
                     <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreVertical size={18} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
