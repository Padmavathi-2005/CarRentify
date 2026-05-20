"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldCheck,
  FileText,
  Wallet,
  Globe,
  User,
  Users,
  MessageSquare,
  ChevronDown,
  Languages,
  Car,
  Ticket,
  AlertCircle,
  Sun,
  Moon,
  Banknote,
  Star,
  BarChart3
} from "lucide-react";

import en from "./locales/en.json";
import ar from "./locales/ar.json";
import de from "./locales/de.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";
import zh from "./locales/zh.json";

const locales: Record<string, any> = { en, ar, de, es, fr, hi, ta, zh };

import { AdminTranslationContext } from "./AdminTranslationContext";
import { useLocale } from "@/components/LocaleContext";
import { useSocket } from "@/components/SocketProvider";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import "@/admin/styles/AdminLayout.css";
import { useSettings } from "@/components/ThemeProvider";
import { useToast } from "@/components/Toast";
import { authService } from "@/services/authService";
import { API_BASE_URL } from "@/config/api";

const resolveAsset = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${API_BASE_URL.replace('/api', '')}${path}`;
};

const navGroups = [
  {
    title: "Overview",
    key: "group_overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", key: "dashboard", href: "/admin" },
      { icon: Bell, label: "Notifications", key: "notifications", href: "/admin/notifications" },
      { icon: BarChart3, label: "Reports", key: "reports", href: "/admin/reports" },
    ]
  },
  {
    title: "Fleet",
    key: "group_fleet",
    items: [
      { icon: Car, label: "Cars", key: "fleet", href: "/admin/cars" },
      { icon: Star, label: "Brands", key: "brands", href: "/admin/brands" },
    ]
  },
  {
    title: "User Relations",
    key: "group_users",
    items: [
      { icon: Users, label: "Users", key: "users", href: "/admin/users" },
      { icon: ShieldCheck, label: "Verification", key: "verification", href: "/admin/verification" },
      { icon: MessageSquare, label: "Messages", key: "messages", href: "/admin/messages" },
    ]
  },
  {
    title: "Financials",
    key: "group_sales",
    items: [
      { icon: Wallet, label: "Admin Wallet", key: "wallet", href: "/admin/wallet" },
      { icon: Banknote, label: "Withdrawals", key: "withdrawals", href: "/admin/withdrawals" },
      { icon: Ticket, label: "Coupons", key: "coupons", href: "/admin/coupons" },
    ]
  },
  {
    title: "Infrastructure",
    key: "group_system",
    items: [
      { icon: FileText, label: "Static Pages", key: "staticPages", href: "/admin/pages" },
      { icon: Wallet, label: "Currencies", key: "currencies", href: "/admin/currencies" },
      { icon: Globe, label: "Languages", key: "languages", href: "/admin/languages" },
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, updateSettings } = useSettings();
  const { currency, setCurrency, currencies } = useLocale();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed for better mobile/initial UX
  const [dbLanguages, setDbLanguages] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState("English");
  const [t, setT] = useState<any>(en);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { socket } = useSocket();
  const { showToast } = useToast();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeRegTab, setActiveRegTab] = useState<'lang' | 'curr'>('lang');
  const [selectedLangCode, setSelectedLangCode] = useState("en");
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = authService.getAdminUser();
      const token = authService.getAdminToken();

      if (!token || !user || user.role !== 'admin') {
        window.location.href = '/admin-login';
        return;
      }
      setIsAuthChecking(false);

      // Auto-open sidebar only on desktop after auth check
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    checkAuth();

    // Responsive listener
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadTranslations = (code: string) => {
    setT(locales[code] || en);
  };

  useEffect(() => {
    const savedCode = localStorage.getItem("adminSelectedLangCode") || "en";
    const savedLang = localStorage.getItem("adminSelectedLangName") || "English";
    setSelectedLang(savedLang);
    setSelectedLangCode(savedCode);
    loadTranslations(savedCode);

    // Add Google Translate Script
    if (!document.querySelector("#google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      if (document.body) {
        document.body.appendChild(script);
      }

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );

        // Auto-trigger saved translation after Google Translate loads
        setTimeout(() => {
          if (savedCode !== 'en') {
            triggerTranslate(savedCode, savedLang);
          }
        }, 1200);
      };
    }

    // Fetch dynamic languages from database
    const fetchDBLanguages = () => {
      fetch(`${API_BASE_URL}/languages`)
        .then(res => res.json())
        .then(data => {
          // Filter out English if it exists in DB to avoid duplicates
          setDbLanguages(data.filter((l: any) => l.name.toLowerCase() !== 'english'));
        })
        .catch(err => console.error("Lang fetch error:", err));
    };

    fetchDBLanguages();

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${authService.getAdminToken()}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter((n: any) => !n.isRead).length);
        }
      } catch (err) { console.error("Notification fetch error:", err); }
    };

    fetchNotifications();

    if (socket) {
      const handleNewNotif = (newNotif: any) => {
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        // Show immediate feedback via toast
        showToast(`🔔 ${newNotif.title}: ${newNotif.body}`, 'info');
      };
      socket.on('new_notification', handleNewNotif);
      return () => {
        socket.off('new_notification', handleNewNotif);
      };
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    window.addEventListener('languagesUpdated', fetchDBLanguages);
    return () => {
      window.removeEventListener('languagesUpdated', fetchDBLanguages);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showNotifications, socket]);

  const handleNotifClick = async (n: any) => {
    if (!n.isRead) {
      try {
        await fetch(`${API_BASE_URL}/notifications/${n._id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${authService.getAdminToken()}` }
        });
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(notifications.map(item => item._id === n._id ? { ...item, isRead: true } : item));
      } catch (err) { console.error(err); }
    }
    
    setShowNotifications(false);
    
    if (n.data?.url) {
      router.push(n.data.url);
    } else if (n.data?.type === 'verification_request') {
      router.push(`/admin/verification?search=${encodeURIComponent(n.data.email || n.data.userId)}`);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authService.getAdminToken()}` }
      });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const triggerTranslate = (code: string, name: string) => {
    setSelectedLang(name);
    setSelectedLangCode(code);
    localStorage.setItem("adminSelectedLangCode", code);
    localStorage.setItem("adminSelectedLangName", name);

    const selector = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selector) {
      selector.value = code;
      selector.dispatchEvent(new Event('change'));
    }

    loadTranslations(code);
  };

  if (isAuthChecking) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-900"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin " /></div>;
  }

  return (
    <div className={`admin-layout-wrapper relative ${isSidebarOpen ? 'is-sidebar-open' : 'is-sidebar-collapsed'}`}>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] lg:hidden"
          />
        )}
      </AnimatePresence>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="admin-sidebar-node fixed left-0 top-0 bottom-0"
      >
        <div className="px-8 py-2 flex items-center justify-between border-b border-slate-50 mb-4">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex justify-center"
              >
                <img
                  src={resolveAsset(settings.logoDark) || "/logo.png"}
                  alt="Logo"
                  className="h-14 w-auto object-contain max-w-[180px]"
                />
              </motion.div>
            ) : (
              <motion.div
                key="logo-mini"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 bg-primary/5 rounded-app flex items-center justify-center text-primary mx-auto "
              >
                <ShieldCheck size={24} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.key} className="space-y-3">
              {isSidebarOpen && (
                <h4 className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">
                  {t.sidebar[group.key] || group.title}
                </h4>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.label} href={item.href} onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}>
                    <button
                      className={`admin-nav-btn ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={18} className="icon" />
                      {isSidebarOpen && <span className="font-bold text-sm tracking-wide">{t.sidebar[item.key] || item.label}</span>}
                      {isActive && isSidebarOpen && (
                        <motion.div layoutId="active-nav" className="ml-auto w-1.5 h-1.5 rounded-full bg-white " />
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 mt-auto border-t border-slate-100 dark:border-white/5 space-y-3">
          <Link href="/admin/settings" onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}>
            <button
              className={`admin-nav-btn ${pathname === '/admin/settings' ? 'active' : ''}`}
            >
              <Settings size={20} className="icon" />
              {isSidebarOpen && <span className="font-bold text-sm tracking-wide">{t.sidebar.settings}</span>}
            </button>
          </Link>
          <button
            onClick={() => authService.adminLogout()}
            className="admin-logout-btn"
          >
            <LogOut size={20} className="icon" />
            {isSidebarOpen && <span>{t.sidebar.signOut}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className={`admin-main-stage`}>
        <header className="admin-top-header sticky top-0 z-[100] bg-white dark:bg-[#0f172a] flex items-center h-[73px]">
          <div className="w-full px-4 lg:px-12 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-6">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-10 h-10 rounded-app bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/20 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:border-primary/20 dark:hover:border-white hover:text-primary dark:hover:text-white transition-all "
              >
                {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div className="hidden lg:block ml-2">
                <p className="admin-header-text-muted text-[10px] font-black uppercase tracking-widest leading-none mb-1">{t.header.infrastructureControl}</p>
                <p className="admin-text-primary-white text-xs font-black leading-none">{t.header.masterPrincipal}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              {/* Regional Selector */}
               <div className="relative group/lang flex items-center">
                 <button className="admin-header-btn h-10 px-2 lg:px-4 rounded-app gap-1 lg:gap-3 group cursor-pointer border-[var(--admin-border)] hover:border-primary/40 transition-all">
                   <div className="flex items-center gap-1.5">
                     <div className="w-7 h-7 rounded-app bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all">
                       <Globe size={14} className="icon" />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-widest">{selectedLangCode}</span>
                   </div>
                   <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
                   <div className="flex items-center gap-1.5">
                     <div className="w-7 h-7 rounded-app bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-all">
                       <Banknote size={14} className="icon" />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-widest">
                       {currencies.find(c => c.code === currency)?.symbol || currency}
                     </span>
                   </div>
                   <ChevronDown size={12} className="icon opacity-30 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" />
                 </button>

                {/* Regional Settings Dropdown Menu */}
                <div className="admin-dropdown-menu absolute top-full right-0 mt-3 w-72 rounded-app opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all duration-300 z-50 overflow-hidden translate-y-2 group-hover/lang:translate-y-0 border border-slate-100 dark:border-white/5">
                  <div className="p-1 bg-[var(--admin-bg)] flex border-b border-[var(--admin-border)]">
                    <button
                      onClick={() => setActiveRegTab('lang')}
                      className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-app transition-all ${activeRegTab === 'lang' ? 'bg-[var(--admin-card-bg)] text-primary ' : 'text-[var(--admin-text-muted)] hover:text-primary'}`}
                    >
                      Languages
                    </button>
                    <button
                      onClick={() => setActiveRegTab('curr')}
                      className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-app transition-all ${activeRegTab === 'curr' ? 'bg-[var(--admin-card-bg)] text-primary ' : 'text-[var(--admin-text-muted)] hover:text-primary'}`}
                    >
                      Currencies
                    </button>
                  </div>

                  <div className="flex flex-col max-h-[400px] overflow-hidden bg-[var(--admin-card-bg)]">
                    <AnimatePresence mode="wait">
                      {activeRegTab === 'lang' ? (
                        <motion.div
                          key="lang-list"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="p-2 space-y-1 overflow-y-auto custom-scrollbar"
                        >
                          <button
                            onClick={() => triggerTranslate('en', 'English')}
                            className={`admin-nav-btn w-full group/item ${selectedLang === 'English' ? 'active' : ''}`}
                          >
                            <Globe size={14} className="icon" />
                            <div className="flex flex-col items-start">
                              <span className="font-bold text-xs">English</span>
                              <span className="text-[8px] opacity-70 font-black uppercase tracking-widest">Global Default</span>
                            </div>
                          </button>
                          {dbLanguages.map(lang => (
                            <button
                              key={lang._id}
                              onClick={() => triggerTranslate(lang.code, lang.nativeName)}
                              className={`admin-nav-btn w-full group/item ${selectedLang === lang.nativeName ? 'active' : ''}`}
                            >
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">{lang.code.slice(0, 2)}</div>
                              <div className="flex flex-col items-start ml-2">
                                <span className="font-bold text-xs">{lang.nativeName}</span>
                                <span className="text-[8px] opacity-70 font-black uppercase tracking-widest">{lang.name}</span>
                              </div>
                              {selectedLang === lang.nativeName && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white " />}
                            </button>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="curr-list"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="p-2 space-y-1 overflow-y-auto custom-scrollbar"
                        >
                          {currencies.map(curr => (
                            <button
                              key={curr._id}
                              onClick={() => setCurrency(curr.code)}
                              className={`admin-nav-btn w-full group/item ${currency === curr.code ? 'active' : ''}`}
                            >
                              <div className="w-8 h-8 rounded-app bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black text-xs">{curr.symbol}</div>
                              <div className="flex flex-col items-start ml-2">
                                <span className="font-bold text-xs">{curr.code}</span>
                                <span className="text-[8px] opacity-70 font-black uppercase tracking-widest">{curr.name}</span>
                              </div>
                              {currency === curr.code && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white " />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                className="admin-header-btn w-11 h-11 rounded-app cursor-pointer group"
                title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {settings.theme === 'dark' ? (
                  <Sun size={20} className="icon group-hover:rotate-45 transition-transform text-amber-500" />
                ) : (
                  <Moon size={20} className="icon group-hover:-rotate-12 transition-transform" />
                )}
              </button>

              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="admin-header-btn relative w-11 h-11 rounded-app cursor-pointer group"
                >
                  <Bell size={20} className="icon group-hover:scale-110 transition-transform" />
                  {unreadCount > 0 && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                      <span className="text-[7px] font-black text-white">{unreadCount}</span>
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="admin-dropdown-menu absolute top-full right-0 mt-3 w-80 rounded-app z-[100] overflow-hidden"
                    >
                      <div className="admin-dropdown-header p-5 flex items-center justify-between">
                        <h4 className="admin-header-text-main text-[10px] font-black uppercase tracking-[0.2em]">Notifications</h4>
                        <button onClick={markAllRead} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Mark all read</button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-10 text-center">
                            <Bell className="mx-auto text-slate-200 dark:text-slate-700 mb-3" size={32} />
                            <p className="admin-header-text-muted text-[10px] font-bold uppercase tracking-widest">No transmissions</p>
                          </div>
                        ) : (
                          <>
                              {notifications.slice(0, 5).map((n) => (
                                <div 
                                  key={n._id} 
                                  onClick={() => handleNotifClick(n)}
                                  className={`admin-notification-item p-5 relative cursor-pointer transition-colors hover:bg-primary/[0.05] ${!n.isRead ? 'bg-primary/[0.02]' : ''}`}
                                >
                                  {!n.isRead && <div className="absolute left-2 top-6 w-1 h-8 bg-primary rounded-full" />}
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="admin-header-text-main text-[11px] font-black leading-tight uppercase tracking-tight">{n.title}</p>
                                      {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </div>
                                    <p className="admin-header-text-muted text-[10px] font-bold leading-relaxed line-clamp-2">{n.body || n.message}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="admin-text-time text-[8px] font-black uppercase">
                                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                      {n.data?.url && (
                                        <span className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                                          View Details
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {notifications.length > 5 && (
                              <Link
                                href="/admin/notifications"
                                onClick={() => setShowNotifications(false)}
                                className="admin-dropdown-footer block p-4 text-center"
                              >
                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">View All {notifications.length} Transmissions</span>
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-8 w-px bg-slate-100 dark:bg-white/5 hidden md:block" />

               <div className="relative group/profile flex items-center gap-2 cursor-pointer h-11">
                 <div className="text-right hidden sm:block">
                   <div className="admin-header-text-main text-[11px] font-black group-hover/profile:text-primary transition-colors truncate max-w-[150px]" title={authService.getAdminUser()?.firstName ? `${authService.getAdminUser()?.firstName} ${authService.getAdminUser()?.lastName}` : authService.getAdminUser()?.email}>
                     {authService.getAdminUser()?.firstName ? `${authService.getAdminUser()?.firstName} ${authService.getAdminUser()?.lastName}` : (authService.getAdminUser()?.email || "Admin")}
                   </div>
                   <div className="admin-header-text-muted text-[9px] font-bold uppercase tracking-widest mt-0.5">
                     Master Authority
                   </div>
                 </div>
                 <div className="admin-header-btn w-11 h-11 rounded-app ">
                   <User size={20} className="icon" />
                 </div>

                 {/* Profile Dropdown */}
                 <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--admin-card-bg)] border border-slate-200 dark:border-white/10 rounded-app shadow-xl opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300 z-[200] overflow-hidden translate-y-2 group-hover/profile:translate-y-0">
                   <div className="p-4 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                     <p className="text-[11px] font-bold admin-header-text-main truncate">{authService.getAdminUser()?.email}</p>
                   </div>
                   <div className="p-2">
                     <Link href="/admin/settings">
                       <button className="w-full flex items-center gap-3 px-3 py-2 rounded-app text-xs font-bold admin-header-text-main hover:bg-primary/5 hover:text-primary transition-all">
                         <Settings size={14} /> Account Settings
                       </button>
                     </Link>
                     <button 
                       onClick={() => authService.adminLogout()}
                       className="w-full flex items-center gap-3 px-3 py-2 rounded-app text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all mt-1"
                     >
                       <LogOut size={14} /> Sign Out
                     </button>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </header>

        <section className="flex-1 p-4 md:p-6 bg-slate-50/20">
          <AdminTranslationContext.Provider value={{ t, selectedLang }}>
            {children}
          </AdminTranslationContext.Provider>
        </section>
      </main>
    </div>
  );
}
