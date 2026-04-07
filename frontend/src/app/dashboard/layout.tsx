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
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { authService } from "@/services/authService";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Your Listings", icon: Car, href: "/dashboard/fleet" },
    { name: "Add New Car", icon: PlusCircle, href: "/dashboard/fleet/new" },
    { name: "Profile Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <Header />
      
      <div className="flex-1 flex overflow-hidden relative pt-20 md:pt-28">
        {/* Sidebar Backdrop - Mobile only */}
        <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[60] transition-opacity duration-300 md:hidden ${
            isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside 
          className={`${
            isSidebarOpen ? "translate-x-0 w-72 md:w-64" : "-translate-x-full md:translate-x-0 md:w-20"
          } fixed md:relative top-0 md:top-0 h-screen md:h-full bg-white border-r border-slate-200 transition-all duration-300 z-[70] flex flex-col shadow-2xl md:shadow-none cursor-pointer`}
          onClick={() => { if (!isSidebarOpen) setIsSidebarOpen(true) }}
        >
          {/* Site Logo Section */}
          <div className="p-6 border-b border-slate-50 mb-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-all shrink-0">
                <Car className="text-white" size={24} />
              </div>
              <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
                <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">CarRentify</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Dasbord</span>
              </div>
            </Link>
          </div>

          <div className={`p-4 md:p-6 flex flex-col h-full overflow-y-auto scrollbar-hide ${!isSidebarOpen && "items-center"}`}>
            {/* User Profile Section in Mobile/Expanded Sidebar */}
            {isSidebarOpen && user && (
              <div className="mb-8 p-4 bg-primary/5 rounded-[1.5rem] border border-primary/10 flex items-center gap-4 animate-fade-in group hover:bg-primary transition-all duration-500">
                <div className="w-12 h-12 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white font-bold overflow-hidden shadow-md group-hover:scale-110 transition-transform">
                   {user.profileImage ? <img src={user.profileImage} alt="" /> : getInitials(user.displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 group-hover:text-white truncate">{user.displayName}</p>
                  <p className="text-[10px] text-slate-400 group-hover:text-white/70 font-bold uppercase tracking-widest">Vendor</p>
                </div>
              </div>
            )}

            <nav className="space-y-4 flex-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={(e) => { 
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                      if (!isSidebarOpen) e.stopPropagation();
                    }}
                    className={`flex items-center gap-3 rounded-2xl transition-all group ${
                      isSidebarOpen ? "px-5 py-4" : "p-4"
                    } ${
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/20 font-extrabold" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-primary font-bold"
                    }`}
                  >
                    <item.icon size={22} className={isActive ? "text-white" : "group-hover:scale-110 transition-transform"} />
                    <span className={`text-sm tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? "w-auto opacity-100 ml-1" : "w-0 opacity-0"}`}>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className={`pt-6 border-t border-slate-100 mt-auto ${!isSidebarOpen && "flex justify-center"}`}>
               <button className={`flex items-center gap-3 text-slate-400 hover:text-red-500 transition-colors group ${isSidebarOpen ? "px-4 py-3 w-full text-left" : "p-4"}`}>
                 <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
                 <span className={`text-sm font-bold uppercase tracking-widest text-[10px] whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>Logout</span>
               </button>
            </div>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }}
            className="absolute bottom-10 -right-4 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:text-primary transition-colors hidden md:flex z-[80]"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </aside>

        {/* Main Content Area - THE ONLY SCROLLABLE AREA */}
        <main className="flex-1 h-full overflow-y-auto bg-[#f8fafc] w-full min-w-0 scroll-smooth">
          <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto min-h-full">
            {children}
            <div className="h-24 lg:hidden" /> {/* Spacer for navigation reach */}
          </div>
        </main>
      </div>

      {/* Mobile Toggle Button */}
      <div className="fixed bottom-8 right-8 md:hidden z-[100]">
         <Button 
           size="icon" 
           className="rounded-full w-16 h-16 shadow-2xl bg-primary text-white border-4 border-white/20"
           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         >
           {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
         </Button>
      </div>
    </div>
  );
}
