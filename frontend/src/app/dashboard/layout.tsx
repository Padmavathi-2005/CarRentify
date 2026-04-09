"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Car, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  PlusCircle,
  LayoutDashboard,
  CalendarCheck,
  User as UserIcon,
  Heart,
  Wallet,
  History,
  ShieldCheck,
  Key,
  Star,
  Users,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { authService } from "@/services/authService";
import { useSettings } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { userType } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Profile", icon: UserIcon, href: "/dashboard/profile" },
    { name: "Change Password", icon: Key, href: "/dashboard/security" },
    { name: "My Bookings", icon: CalendarCheck, href: "/dashboard/bookings" },
    { name: "My Reviews", icon: Star, href: "/dashboard/reviews" },
    { name: "Upgrade to Vendor", icon: Users, href: "/dashboard/upgrade" },
  ];

  const isFullPage = pathname.includes('/fleet/new');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-primary selection:text-white">
      {!isFullPage && <Header />}
      
      <div className={`flex-1 transition-all duration-700 ${isFullPage ? 'max-w-full' : 'max-w-[1420px] mx-auto'} w-full px-6 ${isFullPage ? 'pt-10' : 'pt-24'} pb-20`}>
        <div className="flex flex-col lg:flex-row gap-10 items-start h-full">
          
          {/* Left Side Sidebar - Hidden in Full Page Mode */}
          {!isFullPage && (
            <aside className="w-full lg:w-[320px] shrink-0 sticky top-24 animate-in slide-in-from-left duration-700">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
                
                {/* Profile Card Header */}
                <div className="p-10 text-center flex flex-col items-center border-b border-slate-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-2xl mb-6 ring-4 ring-primary/5 group cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-500">
                     <img src="https://i.pravatar.cc/150?u=alena" alt="Alena Thiel" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">Alena Thiel</h3>
                  <p className="text-xs font-bold text-slate-400">customer@rentify.io</p>
                  
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                     <ShieldCheck size={10} fill="currentColor" /> Verified Account
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-6 space-y-1">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.name} href={item.href}>
                        <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${isActive ? 'bg-primary/5 text-primary' : 'text-slate-400 hover:bg-slate-50'}`}>
                           <item.icon size={18} className={isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
                           <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'group-hover:text-slate-800'}`}>{item.name}</span>
                           {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                      </Link>
                    );
                  })}
                  
                  {/* Logout */}
                  <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-rose-500 transition-all group mt-2">
                     <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                     <span className="text-[11px] font-black uppercase tracking-widest">Logout Account</span>
                  </button>
                </nav>

                {/* Delete Account at Bottom */}
                <div className="p-6 mt-auto border-t border-slate-50">
                   <button className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl text-rose-500 bg-rose-50/30 hover:bg-rose-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest group shadow-sm active:scale-95">
                      <Trash2 size={16} className="group-hover:animate-shake" />
                      Delete My Account
                   </button>
                </div>
              </div>
            </aside>
          )}

          {/* Right Content Area */}
          <main className={`flex-1 w-full min-w-0 ${isFullPage ? 'max-w-[1600px] mx-auto' : ''}`}>
             {children}
          </main>
        </div>
      </div>
      
      <Footer />
      
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .group-hover\:animate-shake:hover {
          animation: shake 0.3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
