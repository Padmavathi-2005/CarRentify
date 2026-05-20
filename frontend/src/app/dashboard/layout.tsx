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
 Trash2,
 MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { authService } from "@/services/authService";
import { useSettings } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthContext";
import { chatService } from "@/services/chatService";
import { API_BASE_URL } from "@/config/api";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import { useLocale } from "@/components/LocaleContext";

export default function DashboardLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const pathname = usePathname();
 const { settings } = useSettings();
 const { user, userType, logout } = useAuth();
 const { language, t } = useLocale();
 const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 const [hasChats, setHasChats] = useState(false);

 useEffect(() => {
   const checkChats = async () => {
     if (!user?._id) return;
     try {
       const conversations = await chatService.getConversations(user._id);
       setHasChats(conversations.length > 0);
     } catch (err) {
       console.error("Error checking chats:", err);
     }
   };
   checkChats();
 }, [user?._id]);

 const renterItems = [
  { name: t('dashboard.nav.overview'), icon: LayoutDashboard, href: "/dashboard" },
  { name: userType === 'host' ? t('dashboard.nav.manage_bookings') : t('dashboard.nav.my_bookings'), icon: CalendarCheck, href: "/dashboard/bookings" },
  ...(hasChats ? [{ name: t('dashboard.nav.messages'), icon: MessageSquare, href: "/dashboard/messages" }] : []),
  { name: t('dashboard.nav.my_wishlist'), icon: Heart, href: "/dashboard/favorites" },
  { name: t('dashboard.nav.wallet'), icon: Wallet, href: "/dashboard/wallet" },
 ];

 const hostItems = [
  { name: t('dashboard.nav.fleet_overview'), icon: LayoutDashboard, href: "/dashboard" },
  { name: t('dashboard.nav.manage_bookings'), icon: CalendarCheck, href: "/dashboard/bookings" },
  { name: t('dashboard.nav.fleet_logistics'), icon: Car, href: "/dashboard/cars" },
  ...(hasChats ? [{ name: t('dashboard.nav.messages'), icon: MessageSquare, href: "/dashboard/messages" }] : []),
  { name: t('dashboard.nav.wallet_earnings'), icon: Wallet, href: "/dashboard/wallet" },
 ];

 const commonItems = [
 { name: t('dashboard.nav.profile_settings'), icon: UserIcon, href: "/dashboard/profile" },
 ];

 const menuItems = userType === "host" ? [...hostItems, ...commonItems] : [...renterItems, ...commonItems];

 const isFullPage = pathname.includes('/fleet/new') || pathname.includes('/dashboard/cars/new') || pathname.includes('/dashboard/new') || pathname.includes('/dashboard/cars/edit');

 return (
 <div className="min-h-screen bg-[#F8FAFC] dark:bg-black flex flex-col font-sans selection:bg-primary selection:text-white overflow-x-clip transition-colors duration-300">
 {!isFullPage && <Header />}

 <div className={`flex-1 transition-all duration-700 ${isFullPage ? 'max-w-full' : 'max-w-[1420px] mx-auto'} w-full px-6 lg:px-6 ${isFullPage ? 'pt-10' : 'pt-24'} pb-10`}>
 <div className="flex flex-col lg:flex-row gap-10 items-start h-full">

 {/* Left Side Sidebar - Hidden in Full Page Mode */}
 {!isFullPage && (
 <aside className="hidden lg:block lg:w-[320px] shrink-0 lg:sticky lg:top-24 animate-in slide-in-from-left duration-700">
 <div className="bg-white dark:bg-slate-950 rounded-app border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col h-full">

 {/* Profile Card Header */}
 <div className="p-4 lg:p-5 pb-1 text-center flex flex-col items-center relative overflow-hidden">

 {/* Profile Image / Avatar Placeholder */}
 <div className="relative group/avatar mb-2">
 <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-app overflow-hidden border-4 border-slate-50 dark:border-slate-900 ring-4 ring-primary/5 cursor-pointer transition-all duration-500 relative">
 {user?.profileImage ? (
 <img src={user.profileImage} alt={user.displayName || "User"} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700" />
 ) : (
 <div className="w-full h-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-4xl font-black uppercase">
 {(user?.displayName || user?.firstName || "G")[0]}
 </div>
 )}

 {/* Edit Overlay */}
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
 <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-app flex items-center justify-center text-white border border-white/30">
 <PlusCircle size={20} />
 </div>
 </div>
 </div>
 </div>

 <div className="flex flex-col items-center gap-2 mb-2 w-full px-4">
 <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate max-w-full">
 {user?.displayName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : t('dashboard.common.guest'))}
 </h3>
 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-full truncate text-center">{user?.email || "guest@carrental.com"}</p>
 </div>
 </div>

 {/* Navigation Links */}
 <nav className="px-4 pt-0 pb-0 space-y-0.5">
 {menuItems.map((item) => {
 const isActive = pathname === item.href;
 return (
 <Link key={item.name} href={item.href}>
 <button className={`w-full flex items-center gap-4 px-6 py-3 rounded-app transition-all group ${isActive ? 'bg-primary/5 text-primary dark:bg-primary/10 border border-transparent dark:border-primary/20' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
 <item.icon size={18} className={isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
 <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'group-hover:text-slate-800 dark:group-hover:text-white'}`}>{item.name}</span>

 </button>
 </Link>
 );
 })}

 </nav>
 <div className="h-10" />
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
