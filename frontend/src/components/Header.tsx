"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
 User,
 ShoppingBag,
 Bell,
 Menu,
 LogOut,
 Repeat,
 ShieldCheck,
 Heart,
 LayoutDashboard,
 Settings,
 Languages,
 Banknote,
 Globe,
 ChevronDown,
 ChevronRight,
 X,
 Clock,
 CheckCircle2,
 MessageSquare,
 Sun,
 Moon,
 Car,
 Home,
 CalendarCheck,
 Wallet,
 ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/components/ThemeProvider";
import { authService } from "@/services/authService";
import { useAuth } from "@/components/AuthContext";
import { useLocale } from "@/components/LocaleContext";
import { useSocket } from "@/components/SocketProvider";
import { useRouter, usePathname } from "next/navigation";
import CustomSelect from "@/components/CustomSelect";
import { API_BASE_URL } from "@/config/api";
import { chatService } from "@/services/chatService";

const resolveAsset = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  if (path.startsWith('/images/') || path.startsWith('images/')) {
    return `${API_BASE_URL.replace('/api', '')}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return path;
};

const Header = ({ 
 isProductPage = false, 
 productTitle = "", 
 totalPrice = "", 
 showOverview = false,
 onBookNow = () => {} 
}: { 
 isProductPage?: boolean, 
 productTitle?: string, 
 totalPrice?: string, 
 showOverview?: boolean,
 onBookNow?: () => void 
}) => {
 const router = useRouter();
 const pathname = usePathname();
 const { settings, updateSettings } = useSettings();
 const { user, logout, userType, setUserType, setShowLoginModal } = useAuth();
 const { 
 t, 
 language: selectedLanguage, 
 setLanguage: setSelectedLanguage, 
 currency: selectedCurrency, 
 setCurrency: setSelectedCurrency,
 languages
 } = useLocale();

 const [currencies, setCurrencies] = useState<any[]>([]);
 const [showNotifications, setShowNotifications] = useState(false);
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [notifications, setNotifications] = useState<any[]>([]);
 const [messageCount, setMessageCount] = useState(0);
 const [mounted, setMounted] = useState(false);

 const { socket } = useSocket();

  const fetchNotifications = async () => {
    const token = authService.getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
 if (res.ok) {
 const data = await res.json();
 setNotifications(data);
 }
 } catch (err) {
 console.error("Fetch notifications error:", err);
 }
 };

 const fetchMessageCount = async () => {
 if (!user?._id) return;
 try {
 const conversations = await chatService.getConversations(user._id);
 const unread = conversations.filter((chat: any) => 
 chat.lastMessage && 
 chat.lastMessage.senderId !== user._id && 
 chat.lastMessage.status !== 'read'
 ).length;
 setMessageCount(unread);
 } catch (err) {
 console.error("Fetch message count error:", err);
 }
 };

 useEffect(() => {
 fetchNotifications();
 fetchMessageCount();

 if (socket) {
 const handleNewNotif = (newNotif: any) => {
 setNotifications(prev => [newNotif, ...prev]);
 };

 const handleNewMessage = () => {
 fetchMessageCount();
 };

 socket.on('new_notification', handleNewNotif);
 socket.on('newMessage', handleNewMessage);
 
 return () => {
 socket.off('new_notification', handleNewNotif);
 socket.off('newMessage', handleNewMessage);
 };
 }
 }, [user?._id, socket]);

 const unreadCount = notifications.filter(n => !n.isRead).length;

 useEffect(() => {
 const fetchMeta = async () => {
 try {
 const curRes = await fetch(`${API_BASE_URL}/currencies`);
 if (curRes.ok) setCurrencies(await curRes.json());
 } catch (err) {
 console.error("Meta fetch error:", err);
 }
 };
 fetchMeta();
 setMounted(true);
 }, []);

 useEffect(() => {
 if (isMobileMenuOpen) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = 'unset';
 }
 return () => {
 document.body.style.overflow = 'unset';
 };
 }, [isMobileMenuOpen]);

 const getInitials = () => {
 if (user?.firstName && user?.lastName) {
 return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
 }
 return user?.displayName?.charAt(0).toUpperCase() || "U";
 };

 const markAllRead = async () => {
 try {
 const token = localStorage.getItem('token');
 await fetch(`${API_BASE_URL}/notifications/read-all`, {
 method: 'PATCH',
 headers: { 'Authorization': `Bearer ${token}` }
 });
 setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
 } catch (err) {
 console.error("Mark all read error:", err);
 }
 };

 const markAsRead = async (id: string) => {
 try {
 const token = localStorage.getItem('token');
 await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
 method: 'PATCH',
 headers: { 'Authorization': `Bearer ${token}` }
 });
 setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
 } catch (err) {
 console.error("Mark read error:", err);
 }
 };

  const formatNotifTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('notifications.just_now');
    if (diffMins < 60) return t('notifications.mins_ago', { m: diffMins });
    if (diffHours < 24) return t('notifications.hours_ago', { h: diffHours });
    return t('notifications.days_ago', { d: diffDays });
  };

 const handleNotifClick = (n: any) => {
 if (!n.isRead) markAsRead(n._id);
 setShowNotifications(false);

  if (n.data?.url) {
    router.push(n.data.url);
  } else if (n.data?.type === 'booking') {
    let targetType = n.data?.userType;

    // Fallback for older notifications without explicit userType
    if (!targetType) {
      const title = n.title?.toLowerCase() || '';
      const body = n.body?.toLowerCase() || '';
      
      if (title.includes('placed') || title.includes('approved') || title.includes('rejected') || title.includes('return condition')) {
        targetType = 'renter';
      } else if (title.includes('request') || title.includes('instant') || title.includes('picked up') || title.includes('reported')) {
        targetType = 'host';
      } else if (title.includes('upcoming trip')) {
        if (body.includes('your trip')) targetType = 'renter';
        else if (body.includes('your car')) targetType = 'host';
      }
    }

    if (targetType && targetType !== userType) {
      setUserType(targetType as any);
    }
    router.push(`/dashboard/bookings?id=${n.data.bookingId}`);
  } else if (n.data?.type === 'chat') {
    router.push(`/dashboard/messages?id=${n.data.conversationId}`);
  } else if (n.data?.type === 'verification_request') {
    router.push(`/admin/verification?search=${encodeURIComponent(n.data.email || n.data.userId)}`);
  } else {
    router.push('/dashboard/notifications');
  }
 };

 const scrollToSection = (id: string) => {
 const element = document.getElementById(id);
 if (element) {
 const headerOffset = 80;
 const elementPosition = element.getBoundingClientRect().top;
 const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

 window.scrollTo({
 top: offsetPosition,
 behavior: "smooth"
 });
 }
 };

 return (
 <>
 <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-border/50 font-sans transition-colors duration-300">
 <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 lg:h-20 flex items-center justify-between">
 <div className="flex items-center gap-4 lg:gap-12">
 <Link href="/" className="inline-block">
 <div className="bg-transparent dark:bg-white dark:px-3 dark:py-1 dark:rounded-app transition-all inline-block">
  <img
    src={!mounted
    ? "/logo.png"
    : settings.theme === 'dark'
    ? (resolveAsset(settings.logoLight) || "/logo.png")
    : (resolveAsset(settings.logoDark) || "/logo.png")}
    alt={settings.siteName || "CarRental"}
    className="h-10 lg:h-[72px] w-auto object-contain transition-all"
    loading="eager"
    fetchPriority="high"
    onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
  />
 </div>
 </Link>
 <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-foreground">
 {isProductPage && showOverview ? (
 <div className="flex items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
 <span className="text-xs font-black text-foreground uppercase tracking-tighter mr-4 border-r border-border pr-8 truncate max-w-[150px]">{productTitle}</span>
 {[
 { label: 'Photos', id: 'gallery-section' },
 { label: 'Overview', id: 'overview-section' },
 { label: 'Reviews', id: 'reviews-section' },
 { label: 'Location', id: 'location-section' }
 ].map((link) => (
 <button
 key={link.id}
 onClick={() => scrollToSection(link.id)}
 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
 >
 {link.label}
 </button>
 ))}
 </div>
 ) : (
 (settings.headerNavLinks || [])
 .filter((link: any) => !['LOCATIONS', 'SERVICES'].includes(link.label.toUpperCase()))
 .map((link: any, index: number) => (
 <Link
 key={index}
 href={link.url}
 target={link.target || "_self"}
 className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer uppercase tracking-widest text-[11px] font-black"
 >
 {t(`nav.${link.label.toLowerCase()}`) !== `nav.${link.label.toLowerCase()}` 
 ? t(`nav.${link.label.toLowerCase()}`) 
 : link.label}
 </Link>
 ))
 )}
 </div>
 </div>

 <div className="flex items-center gap-1.5 lg:gap-2.5">
 {/* Theme Toggle */}
 {!showOverview && (
 <button
 onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
 className="w-10 h-10 flex items-center justify-center rounded-app bg-muted/40 hover:bg-muted text-muted-foreground hover:text-primary dark:hover:text-white border border-border/40 dark:border-white/20 hover:border-primary/30 dark:hover:border-white transition-all group"
 title={`Switch to ${mounted && settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
 >
 {mounted && settings.theme === 'dark' ? (
 <Sun size={18} className="group-hover:rotate-45 transition-transform text-amber-500" />
 ) : (
 <Moon size={18} className="group-hover:-rotate-12 transition-transform" />
 )}
 </button>
 )}

 {isProductPage && showOverview ? (
  <div className="flex items-center gap-3 lg:gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
  {totalPrice && (
  <div className="flex flex-col items-end">
  <p className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Stay</p>
  <span className="text-sm lg:text-lg font-black text-foreground tracking-tight">{totalPrice}</span>
  </div>
  )}
  <Button 
  onClick={onBookNow}
  className="h-10 lg:h-12 px-4 lg:px-8 bg-primary text-white hover:bg-secondary hover:text-white transition-all duration-300 border-none text-[10px] lg:text-xs font-black uppercase tracking-widest"
  >
  Book Now
  </Button>
  </div>
 ) : (
 user && (
 <>
 {/* Messaging shortcut */}
 <Link
 href="/dashboard/messages"
 className="hidden lg:flex w-10 h-10 items-center justify-center rounded-app bg-muted/40 hover:bg-muted text-muted-foreground hover:text-primary dark:hover:text-white border border-border/40 dark:border-white/20 hover:border-primary/30 dark:hover:border-white transition-all group relative"
 >
 <MessageSquare className="w-5 h-5" />
 {messageCount > 0 && (
 <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in duration-300 -500/20">
 {messageCount > 9 ? '9+' : messageCount}
 </span>
 )}
 </Link>

 {/* Notification Center */}
 <div className="relative hidden lg:block">
 <button
 onClick={() => setShowNotifications(!showNotifications)}
 className={`w-10 h-10 flex items-center justify-center rounded-app transition-all relative group border
 ${showNotifications ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-primary dark:hover:text-white border-border/40 dark:border-white/20 hover:border-primary/30 dark:hover:border-white'}
 `}
 >
 <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-wiggle' : ''}`} />
 {unreadCount > 0 && (
 <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in duration-300 -500/20">
 {unreadCount > 9 ? '9+' : unreadCount}
 </span>
 )}
 </button>

 <AnimatePresence>
 {showNotifications && (
 <>
 <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 className="absolute right-0 mt-4 w-80 lg:w-96 bg-card rounded-app border border-border z-50 overflow-hidden "
 >
 <div className="p-6 border-b border-border flex items-center justify-between bg-card relative z-10">
              <div>
                <h3 className="text-lg font-black text-foreground tracking-tight">{t('notifications.title')}</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{t('notifications.real_time')}</p>
              </div>
              <button onClick={markAllRead} className="text-[9px] font-black text-primary uppercase tracking-[0.1em] hover:bg-primary/5 px-3 py-1.5 rounded-app transition-all">{t('notifications.mark_all_read')}</button>
            </div>

 <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1">
 {notifications.length > 0 ? (
 notifications.slice(0, 5).map(n => (
 <div 
 key={n._id} 
 onClick={() => handleNotifClick(n)}
 className={`p-4 rounded-app transition-all cursor-pointer group flex items-start gap-4 ${n.isRead ? 'hover:bg-muted/20 opacity-60' : 'bg-primary/5 hover:bg-primary/10'}`}
 >
 <div className={`w-10 h-10 rounded-app shrink-0 flex items-center justify-center
 ${n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
 n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
 n.type === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'}
 `}>
 {n.type === 'success' ? <CheckCircle2 size={18} /> : 
 n.type === 'warning' ? <ShieldCheck size={18} /> : 
 n.type === 'error' ? <X size={18} /> : 
 n.data?.type === 'chat' ? <MessageSquare size={18} /> : <Clock size={18} />}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between gap-2 mb-1">
 <h4 className="text-xs font-black text-foreground truncate">{n.title}</h4>
 <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap">{formatNotifTime(n.createdAt)}</span>
 </div>
 <p className="text-[10px] font-bold text-muted-foreground/80 leading-relaxed line-clamp-2">{n.body}</p>
 
 {n.data?.type && (
 <div className="mt-2 text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
 {t('notifications.read_expand')} <ArrowRight size={10} />
 </div>
 )}
 </div>
 {!n.isRead && <div className="w-1.5 h-1.5 rounded-app bg-primary mt-1.5 shrink-0" />}
 </div>
 ))
 ) : (
 <div className="py-12 text-center">
 <Bell size={32} className="mx-auto text-muted mb-4" />
 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('notifications.no_notifs')}</p>
 </div>
 )}
 </div>

 <div className="p-4 bg-muted/20 border-t border-border text-center">
 <Link 
 href="/dashboard/notifications" 
 onClick={() => setShowNotifications(false)}
 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-all inline-block w-full"
 >
 {t('notifications.view_all')}
 </Link>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>

 {userType !== 'host' && (
 <Link
 href="/dashboard/favorites"
 className="hidden lg:flex text-foreground/80 hover:text-primary dark:hover:text-white transition-colors relative cursor-pointer w-10 h-10 items-center justify-center rounded-app bg-muted/40 hover:bg-rose-500/10 border border-border/40 dark:border-white/20 hover:border-rose-500/20 dark:hover:border-white group transition-all"
 >
 <Heart className={`w-5 h-5 ${userType === 'renter' ? 'text-rose-500 fill-rose-500/10' : ''}`} />
 </Link>
 )}
 </>
 )
 )}

      {/* List Your Car - Always Visible CTA */}
      {!showOverview && (
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => {
              if (!user) {
                setShowLoginModal(true);
              } else if (userType === 'renter') {
                setUserType('host');
                router.push('/dashboard/cars/new');
              } else {
                router.push('/dashboard/cars/new');
              }
            }}
            className="h-10 px-6 bg-primary hover:bg-primary-hover text-white rounded-app font-black uppercase tracking-normal transition-all text-[11px] border-none flex items-center justify-center"
          >
            {t('nav.list_car')}
          </button>
        </div>
      )}

 {!showOverview && (
 user ? (
 <div className="relative group hidden lg:block">
 <div className="flex items-center gap-2.5 ps-2.5 border-s border-border/50 cursor-pointer h-10">
 <div className="flex items-center gap-3 hidden sm:flex">
 <div className="flex flex-col items-end gap-1.5">
 <span className="text-xs font-black text-foreground tracking-tight leading-none uppercase truncate max-w-[120px]" title={user.displayName || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email)}>
 {user.displayName || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : (user.email || "User"))}
 </span>
 <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border 
 ${userType === "host" 
 ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20" 
 : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"}`}>
 {userType === "host" ? t('nav.host_mode') : t('nav.renter_mode')}
 </div>
 </div>
 </div>
 <div className="w-10 h-10 rounded-app bg-muted/50 border border-border flex items-center justify-center overflow-hidden hover:border-primary transition-all">
 {user.profileImage ? (
 <img
 src={user.profileImage}
 alt={user.displayName}
 className="w-full h-full object-cover"
 />
 ) : (
 <span className="text-primary dark:text-white font-black text-sm tracking-tighter">
 {getInitials()}
 </span>
 )}
 </div>
 </div>

 {/* Advanced Persona-Aware Dropdown */}
 <div className="absolute end-0 top-full mt-2 w-72 bg-card rounded-app border border-border dark:border-white/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 p-2 ">

 {/* Switch Mode Action - Sleeker Design */}
 <button
 onClick={() => setUserType(userType === "host" ? "renter" : "host")}
 className="w-full h-16 flex items-center justify-between gap-4 px-4 bg-muted/30 hover:bg-primary/5 rounded-app transition-all mb-2 group/item border border-border dark:border-white/20 hover:border-primary/20 text-primary"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-app bg-card border border-border dark:border-white/20 flex items-center justify-center group-hover/item:text-primary transition-all">
 <Repeat size={18} />
 </div>
 <div className="text-start">
 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{t('nav.current_persona')}</p>
 <span className="text-xs font-black text-foreground uppercase tracking-wider">
 {userType === "host" ? t('nav.switch_renter') : t('nav.switch_host')}
 </span>
 </div>
 </div>
 <div className={`w-2 h-2 rounded-app ${userType === "host" ? "bg-primary" : "bg-muted"}`} />
 </button>

 <div className="space-y-1 p-1">
 <Link
 href="/dashboard"
 className="flex items-center gap-3 px-4 py-3 text-xs font-black text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-app transition-all uppercase tracking-widest"
 >
 <LayoutDashboard size={18} className="text-muted-foreground/60" />
 {t('nav.dashboard')}
 </Link>

 <Link
 href="/dashboard/bookings"
 className="flex items-center gap-3 px-4 py-3 text-xs font-black text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-app transition-all uppercase tracking-widest"
 >
 <CalendarCheck size={18} className="text-muted-foreground/60" />
 {userType === 'host' ? (t('nav.manage_bookings') || 'Manage Bookings') : (t('nav.my_bookings') || 'My Bookings')}
 </Link>

 {user.role?.toLowerCase() === 'admin' && (
 <Link
 href="/admin"
 className="flex items-center gap-3 px-4 py-3 mt-2 text-xs font-black text-primary bg-primary/5 hover:bg-primary/10 rounded-app transition-all uppercase tracking-widest border border-primary/10"
 >
 <ShieldCheck size={18} className="text-primary" />
 Admin Control Hub
 </Link>
 )}
 </div>

 <div className="my-2 h-px bg-border dark:bg-white/10" />

 {/* Localization Controls */}
 <div className="p-2 space-y-4">
 <div className="flex items-center gap-2 px-2">
 <Globe size={11} className="text-muted-foreground/60" />
 <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('nav.regional_prefs')}</span>
 </div>

 <div className="space-y-4">
 {/* Premium CustomSelect Language Switcher - Solid Background */}
 <CustomSelect
 options={languages.map(l => ({
 value: l.code,
 label: l.name,
 icon: <Globe size={14} className="text-primary dark:text-white" />
 }))}
 side="left"
 defaultValue={selectedLanguage}
 onChange={(val: string) => setSelectedLanguage(val)}
 className="w-full [&>button]:h-12 [&>button]:border-border [&>button]:bg-card"
 />

 {/* Premium CustomSelect Currency Switcher - Solid Background */}
 <CustomSelect
 options={currencies.map(c => ({
 value: c.code,
 label: `${c.code} (${c.symbol})`,
 icon: <Banknote size={14} className="text-primary dark:text-white" />
 }))}
 side="left"
 defaultValue={selectedCurrency}
 onChange={(val: string) => setSelectedCurrency(val)}
 className="w-full [&>button]:h-12 [&>button]:border-border [&>button]:bg-card"
 />
 </div>
 </div>

 <div className="my-2 pt-2 border-t border-border dark:border-white/10">
 <button
 onClick={() => logout()}
 className="w-full flex items-center gap-3 px-5 py-4 text-xs font-black text-rose-500 hover:bg-rose-500/5 rounded-app transition-all uppercase tracking-[0.15em]"
 >
 <LogOut size={16} /> {t('nav.sign_out')}
 </button>
 </div>
 </div>
 </div>
 ) : (
 <div className="hidden lg:flex items-center gap-2">
 <Link href="/register">
 <Button 
 variant="ghost"
 className="h-10 px-6 text-foreground hover:bg-muted/50 rounded-app font-black uppercase tracking-tight transition-all text-[11px] border-none"
 >
 {t('nav.sign_up')}
 </Button>
 </Link>
 <Button 
 onClick={() => { setShowLoginModal(true); setIsMobileMenuOpen(false); }}
 className="h-10 px-8 bg-primary text-white hover:bg-primary-hover rounded-app font-black uppercase tracking-tight transition-all text-[11px] border-none"
 >
 {t('nav.login')}
 </Button>
 </div>
 )
 )}

 <button 
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 className="lg:hidden text-foreground cursor-pointer w-10 h-10 flex items-center justify-center rounded-app bg-muted/40 hover:bg-muted transition-all z-[1001]"
 >
 {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
 </button>
 </div>
 </div>
 </nav>

 {/* Mobile Menu Drawer */}
 <AnimatePresence>
 {isMobileMenuOpen && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setIsMobileMenuOpen(false)}
 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] lg:hidden"
 />
 <motion.div
 initial={{ x: "100%" }}
 animate={{ x: 0 }}
 exit={{ x: "100%" }}
 transition={{ type: "spring", damping: 25, stiffness: 200 }}
 className="fixed right-0 top-0 bottom-0 w-[300px] bg-card z-[1000] lg:hidden p-0 flex flex-col border-l border-border/50"
 >
 {/* Mobile Header with User Profile */}
 <div className="p-5 flex items-center justify-between border-b border-border/50 sticky top-0 bg-card/80 backdrop-blur-md z-10">
 <div className="flex items-center gap-4">
 {user ? (
 <div className="flex items-center gap-3">
 {user.profileImage ? (
 <img 
 src={user.profileImage} 
 alt={user.displayName} 
 className="w-10 h-10 rounded-app object-cover border border-border"
 />
 ) : (
 <div className="w-10 h-10 rounded-app bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
 {getInitials()}
 </div>
 )}
 <div className="flex flex-col">
 <span className="text-[11px] font-black uppercase tracking-tight text-foreground">{user.displayName}</span>
 <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 {userType === 'host' ? (t('nav.host_mode') || 'Host Mode') : (t('nav.renter_mode') || 'Renter Mode')}
 </span>
 </div>
 </div>
 ) : (
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-app bg-muted/40 flex items-center justify-center">
 <User size={18} className="text-muted-foreground" />
 </div>
 <div className="flex flex-col">
 <span className="text-[11px] font-black uppercase tracking-tight text-foreground">{t('dashboard.common.guest') || 'Guest User'}</span>
 <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{t('nav.navigation') || 'Navigation'}</span>
 </div>
 </div>
 )}
 </div>
 <button 
 onClick={() => setIsMobileMenuOpen(false)}
 className="w-10 h-10 flex items-center justify-center rounded-app bg-muted/40 hover:bg-muted transition-all"
 >
 <X className="w-5 h-5 text-foreground" />
 </button>
 </div>

  {/* Switch Mode Action - Mobile Drawer */}
  {user && (
    <div className="px-5 pt-5 pb-2">
      <button
        onClick={() => {
          setUserType(userType === "host" ? "renter" : "host");
          setIsMobileMenuOpen(false);
          router.push('/dashboard');
        }}
        className="w-full h-14 flex items-center justify-between gap-3 px-5 bg-primary/5 hover:bg-primary/10 rounded-app transition-all group/mode border border-primary/10 active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-app bg-primary/10 flex items-center justify-center">
            <Repeat size={14} className="text-primary group-hover/mode:rotate-180 transition-transform duration-500" />
          </div>
          <div className="flex flex-col items-start">
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Switch to</p>
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
              {userType === "host" ? t('nav.switch_renter') : t('nav.switch_host')}
            </span>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      </button>
    </div>
  )}

 <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
 <div className="flex flex-col">

 <div className="mb-6">
 <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-3">{t('nav.explore') || 'Explore'}</p>
 <div className="flex flex-col gap-4">
  {(settings.headerNavLinks || [])
  .filter((link: any) => !['LOCATIONS', 'SERVICES'].includes(link.label.toUpperCase()))
  .map((link: any, index: number) => (
  <Link
  key={index}
  href={link.url}
  onClick={() => setIsMobileMenuOpen(false)}
  className="text-[13px] font-black text-foreground/80 hover:text-primary transition-colors uppercase tracking-tight"
  >
  {t(`nav.${link.label.toLowerCase()}`) !== `nav.${link.label.toLowerCase()}` 
  ? t(`nav.${link.label.toLowerCase()}`) 
  : link.label}
  </Link>
  ))}
  
  {user && (
    <>
      <Link
        href="/dashboard/favorites"
        onClick={() => setIsMobileMenuOpen(false)}
        className="text-[13px] font-black text-foreground/80 hover:text-primary transition-colors uppercase tracking-tight"
      >
        {t('nav.wishlist')}
      </Link>
      <Link
        href="/dashboard/messages"
        onClick={() => setIsMobileMenuOpen(false)}
        className="text-[13px] font-black text-foreground/80 hover:text-primary transition-colors uppercase tracking-tight"
      >
        {t('nav.messages')}
      </Link>
      <Link
        href="/dashboard/notifications"
        onClick={() => setIsMobileMenuOpen(false)}
        className="text-[13px] font-black text-foreground/80 hover:text-primary transition-colors uppercase tracking-tight"
      >
        {t('nav.notifications')}
      </Link>
      <Link
        href="/dashboard/bookings"
        onClick={() => setIsMobileMenuOpen(false)}
        className="text-[13px] font-black text-foreground/80 hover:text-primary transition-colors uppercase tracking-tight"
      >
        {userType === 'host' ? (t('nav.manage_bookings') || 'Manage Bookings') : (t('nav.my_bookings') || 'My Bookings')}
      </Link>
      {userType === 'host' && (
        <Link
          href="/dashboard/cars"
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-[13px] font-black text-foreground/80 hover:text-primary transition-colors uppercase tracking-tight"
        >
          {t('dashboard.nav.fleet_logistics') || 'Cars & Logistics'}
        </Link>
      )}
      <button
        onClick={() => {
          setIsMobileMenuOpen(false);
          if (!user) {
            setShowLoginModal(true);
          } else if (userType === 'renter') {
            setUserType('host');
            router.push('/dashboard/cars/new');
          } else {
            router.push('/dashboard/cars/new');
          }
        }}
        className="text-[13px] text-left font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-tight"
      >
        {t('nav.list_car')}
      </button>
    </>
  )}
  </div>
  </div>

 <div className="h-px bg-border/30 mb-6" />



  <div className="mb-8">
    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-4">{t('nav.regional_prefs')}</p>
 <div className="space-y-3">
 <CustomSelect
 options={languages.map(l => ({
 value: l.code,
 label: l.name,
 icon: <Globe size={14} className="text-primary" />
 }))}
 side="left"
 defaultValue={selectedLanguage}
 onChange={(val: string) => setSelectedLanguage(val)}
 className="w-full"
 inline
 />
 <CustomSelect
 options={currencies.map(c => ({
 value: c.code,
 label: `${c.code} (${c.symbol})`,
 icon: <Banknote size={14} className="text-primary" />
 }))}
 side="left"
 defaultValue={selectedCurrency}
 onChange={(val: string) => setSelectedCurrency(val)}
 className="w-full"
 inline
 />
 </div>
 </div>

 {!user && (
 <div className="pt-4 space-y-3">
 <Button 
 onClick={() => { setShowLoginModal(true); setIsMobileMenuOpen(false); }}
 className="w-full h-12 bg-primary text-white rounded-app font-black uppercase tracking-widest text-[10px]"
 >
 {t('nav.login')}
 </Button>
 <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="block">
 <Button 
 variant="outline"
 className="w-full h-12 border-border text-foreground rounded-app font-black uppercase tracking-widest text-[10px]"
 >
 {t('nav.sign_up')}
 </Button>
 </Link>
 </div>
 )}

 {user && (
 <div className="mt-auto">
 <button
 onClick={() => { logout(); setIsMobileMenuOpen(false); }}
 className="w-full flex items-center justify-center gap-3 px-5 py-3.5 text-[11px] font-black text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 rounded-app transition-all uppercase tracking-[0.15em] border border-rose-500/10"
 >
 <LogOut size={14} /> {t('nav.sign_out')}
 </button>
 </div>
 )}
 </div>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 
 {/* Mobile Bottom Navigation - App Style */}
 <div className="lg:hidden fixed bottom-0 inset-x-0 z-[100] bg-white/95 dark:bg-background/95 backdrop-blur-2xl border-t border-border dark:border-white/10 px-4 py-3 flex items-center justify-between pb-safe !important">
 <Link href="/" className="flex flex-col items-center gap-1 group flex-1">
 <div className="p-1.5 rounded-app group-hover:bg-primary/10 transition-all">
 <Home size={20} className={pathname === '/' ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
 </div>
 <span className={`text-[8px] font-black uppercase tracking-widest ${pathname === '/' ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>Home</span>
 </Link>

 {pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') ? (
 <>
 <Link href="/dashboard" className="flex flex-col items-center gap-1 group flex-1 relative">
 <div className="relative p-1.5 rounded-app group-hover:bg-primary/10 transition-all">
 <LayoutDashboard size={20} className={pathname === '/dashboard' ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
 </div>
 <span className={`text-[8px] font-black uppercase tracking-widest ${pathname === '/dashboard' ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>Dashboard</span>
 </Link>
 <Link href="/dashboard/bookings" className="flex flex-col items-center gap-1 group flex-1">
 <div className="p-1.5 rounded-app group-hover:bg-primary/10 transition-all">
 <CalendarCheck size={20} className={pathname?.includes('bookings') ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
 </div>
 <span className={`text-[8px] font-black uppercase tracking-widest ${pathname?.includes('bookings') ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>Bookings</span>
 </Link>
 <Link href="/dashboard/wallet" className="flex flex-col items-center gap-1 group flex-1 relative">
 <div className="p-1.5 rounded-app group-hover:bg-primary/10 transition-all">
 <Wallet size={20} className={pathname?.includes('wallet') ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
 </div>
 <span className={`text-[8px] font-black uppercase tracking-widest ${pathname?.includes('wallet') ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>Wallet</span>
 </Link>
 </>
 ) : (
 <>
 <Link href="/vehicles" className="flex flex-col items-center gap-1 group flex-1">
 <div className="p-1.5 rounded-app group-hover:bg-primary/10 transition-all">
 <Car size={20} className={pathname === '/vehicles' ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
 </div>
 <span className={`text-[8px] font-black uppercase tracking-widest ${pathname === '/vehicles' ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>Cars</span>
 </Link>
 <Link href="/dashboard/messages" className="flex flex-col items-center gap-1 group flex-1 relative">
 <div className="relative p-1.5 rounded-app group-hover:bg-primary/10 transition-all">
 <MessageSquare size={20} className={pathname?.includes('messages') ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
 {messageCount > 0 && (
 <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-background shadow-sm">
 {messageCount > 9 ? '9+' : messageCount}
 </span>
 )}
 </div>
 <span className={`text-[8px] font-black uppercase tracking-widest ${pathname?.includes('messages') ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>Messages</span>
 </Link>
 <Link href="/dashboard/notifications" className="flex flex-col items-center gap-1 group flex-1 relative">
 <div className="relative p-1.5 rounded-app group-hover:bg-primary/10 transition-all">
 <Bell size={20} className={pathname?.includes('notifications') ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
 {notifications.length > 0 && (
 <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-background shadow-sm">
 {notifications.length > 9 ? '9+' : notifications.length}
 </span>
 )}
 </div>
 <span className={`text-[8px] font-black uppercase tracking-widest ${pathname?.includes('notifications') ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>{t('notifications.alerts')}</span>
 </Link>
 </>
 )}

 <Link href="/dashboard/profile" className="flex flex-col items-center gap-1 group flex-1 relative">
 <div className="relative p-1.5 rounded-app group-hover:bg-primary/10 transition-all">
 {user?.profileImage ? (
 <img src={user.profileImage} className={`w-5 h-5 rounded-full object-cover border ${pathname?.includes('profile') ? 'border-primary' : 'border-border'}`} alt="Me" />
 ) : (
 <User size={20} className={pathname?.includes('profile') ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
 )}
 {(messageCount > 0 || notifications.length > 0) && (
 <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-background animate-pulse" />
 )}
 </div>
 <span className={`text-[8px] font-black uppercase tracking-widest ${pathname?.includes('profile') ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>Account</span>
 </Link>
 </div>
 </>
 );
};

export default Header;
