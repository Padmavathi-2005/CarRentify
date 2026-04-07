"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Car, Calendar, Users, Settings, LogOut, Bell, Search, Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import "../../admin/styles/AdminLayout.css";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Car, label: "Fleet Manage", href: "/admin/fleet" },
  { icon: Calendar, label: "Bookings", href: "/admin/bookings" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="admin-layout-wrapper">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="admin-sidebar-node fixed left-0 top-0 bottom-0"
      >
        <div className="p-6 h-24 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Car size={24} />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">Rentify<span className="text-primary italic">Admin</span></span>
              </motion.div>
            ) : (
              <motion.div
                key="logo-mini"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white mx-auto shadow-lg shadow-primary/20"
              >
                <Car size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <button
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all group ${isActive ? 'bg-primary text-white' : 'text-slate-500 hover:bg-primary/5 hover:text-primary'}`}
                >
                  <Icon size={18} className={`${isActive ? 'text-white' : 'group-hover:text-primary'} transition-colors`} />
                  {isSidebarOpen && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
                  {isActive && isSidebarOpen && (
                    <motion.div layoutId="active-nav" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                  )}
                </button>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-bold text-sm">
            <LogOut size={22} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className={`admin-main-stage ${isSidebarOpen ? 'pl-[280px]' : 'pl-[80px]'}`}>
        {/* Lean Admin Header */}
        <header className="admin-top-header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            >
              {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search records..."
                className="w-[240px] pl-9 h-9 bg-slate-50 border-slate-100 rounded-lg focus-visible:ring-primary/20 transition-all text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-100" />
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-extrabold text-slate-900 group-hover:text-primary transition-colors">Liam Sullivan</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Admin</div>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=liam" alt="Admin" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <section className="flex-1 p-5 bg-slate-50/50">
          {children}
        </section>
      </main>
    </div>
  );
}
