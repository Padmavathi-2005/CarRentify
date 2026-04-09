"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronDown,
  Languages,
  Car
} from "lucide-react";

import en from "./locales/en.json";

import { AdminTranslationContext } from "./AdminTranslationContext";
import { Button } from "@/components/ui/button";
import "../../admin/styles/AdminLayout.css";
import { useSettings } from "@/components/ThemeProvider";
import { API_BASE_URL } from "@/config/api";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard", href: "/admin" },
  { icon: Users, label: "Users", key: "users", href: "/admin/users" },
  { icon: Car, label: "Fleet", key: "fleet", href: "/admin/fleet" },
  { icon: ShieldCheck, label: "Brands", key: "brands", href: "/admin/brands" },
  { icon: FileText, label: "Static Pages", key: "staticPages", href: "/admin/pages" },
  { icon: Wallet, label: "Currencies", key: "currencies", href: "/admin/currencies" },
  { icon: Globe, label: "Languages", key: "languages", href: "/admin/languages" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dbLanguages, setDbLanguages] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState("English");
  const [t, setT] = useState<any>(en);

  const loadTranslations = async (code: string) => {
    try {
      // Dynamic import for locales
      const module = await import(`./locales/${code}.json`);
      setT(module.default);
    } catch (err) {
      console.warn(`Locale ${code} not found, falling back to English`);
      setT(en);
    }
  };

  useEffect(() => {
    const savedCode = localStorage.getItem("adminSelectedLangCode") || "en";
    const savedLang = localStorage.getItem("adminSelectedLangName") || "English";
    setSelectedLang(savedLang);
    loadTranslations(savedCode);

    // Add Google Translate Script
    if (!document.querySelector("#google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

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

    window.addEventListener('languagesUpdated', fetchDBLanguages);
    return () => window.removeEventListener('languagesUpdated', fetchDBLanguages);
  }, []);

  const triggerTranslate = (code: string, name: string) => {
    setSelectedLang(name);
    localStorage.setItem("adminSelectedLangCode", code);
    localStorage.setItem("adminSelectedLangName", name);

    const selector = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selector) {
      selector.value = code;
      selector.dispatchEvent(new Event('change'));
    }

    loadTranslations(code);
  };

  return (
    <div className="admin-layout-wrapper">
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: 'none' }} />
      
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
                <img src={settings.logoDark || "/logo.png"} alt="Logo" className="h-10 w-auto object-contain" />
              </motion.div>
            ) : (
              <motion.div
                key="logo-mini"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary mx-auto shadow-sm"
              >
                <ShieldCheck size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/admin' 
              ? pathname === '/admin' 
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.label} href={item.href}>
                <button
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all group ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-primary/5 hover:text-primary'}`}
                >
                  <Icon size={18} className={`${isActive ? 'text-white' : 'group-hover:text-primary'} transition-colors`} />
                  {isSidebarOpen && <span className="font-bold text-sm tracking-wide">{t.sidebar[item.key] || item.label}</span>}
                  {isActive && isSidebarOpen && (
                    <motion.div layoutId="active-nav" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                  )}
                </button>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 mt-auto border-t border-slate-50 space-y-1">
          <Link href="/admin/settings">
            <button
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${pathname === '/admin/settings' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-50 hover:text-primary'}`}
            >
              <Settings size={20} className={`${pathname === '/admin/settings' ? 'text-white' : 'group-hover:text-primary'} transition-colors`} />
              {isSidebarOpen && <span className="font-bold text-sm tracking-wide">{t.sidebar.settings}</span>}
            </button>
          </Link>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all font-bold text-sm group">
            <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
            {isSidebarOpen && <span>{t.sidebar.signOut}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className={`admin-main-stage ${isSidebarOpen ? 'pl-[280px]' : 'pl-[80px]'}`}>
        <header className="admin-top-header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-white hover:border-primary/20 hover:text-primary transition-all shadow-sm"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden lg:block ml-2">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t.header.infrastructureControl}</p>
               <p className="text-xs font-black text-slate-900 leading-none">{t.header.masterPrincipal}</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* GOOGLE TRANSLATE SELECTOR ICON */}
            <div className="relative group/lang flex items-center">
               <button className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary h-11 px-5 rounded-2xl border border-primary/10 transition-all group cursor-pointer shadow-sm">
                  <Globe size={18} className="group-hover:rotate-12 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline">{selectedLang}</span>
                  <ChevronDown size={14} className="text-primary/40 group-hover:translate-y-0.5 transition-transform" />
               </button>
               
               {/* Language Dropdown Menu */}
               <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all duration-300 p-2 z-50 overflow-hidden translate-y-2 group-hover/lang:translate-y-0">
                  <div className="px-4 py-3 border-b border-slate-50 mb-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.header.translateProfile}</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                     <button
                        onClick={() => triggerTranslate('en', 'English')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-all group/item"
                     >
                        <Globe size={14} className="text-slate-300 group-hover/item:text-primary" />
                        <span>{selectedLang === 'English' ? 'English (Default)' : 'English'}</span>
                     </button>
                     {dbLanguages.map(lang => (
                        <button
                           key={lang._id}
                           onClick={() => triggerTranslate(lang.code, lang.nativeName)}
                           className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-all group/item"
                        >
                           <Globe size={14} className="text-slate-300 group-hover/item:text-primary" />
                           <div className="flex flex-col items-start">
                              <span>{lang.nativeName}</span>
                              <span className="text-[9px] text-slate-400 font-medium uppercase">{lang.name}</span>
                           </div>
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            <button className="relative w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-white hover:border-primary/20 transition-all shadow-sm cursor-pointer group">
              <Bell size={20} className="group-hover:scale-110 transition-transform" />
              <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-100 hidden md:block" />
            
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <div className="text-[11px] font-black text-slate-900 group-hover:text-primary transition-colors">admin@rentify.global</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.header.masterAuthority}</div>
              </div>
              <div className="w-11 h-11 bg-primary/5 rounded-2xl border-2 border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <User size={20} />
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

// Master Admin Principal Layout Reconciliation
