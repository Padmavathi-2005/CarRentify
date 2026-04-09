"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  ShoppingBag,
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
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthContext";
import { useLocale } from "@/components/LocaleContext";
import CustomSelect from "@/components/CustomSelect";
import { API_BASE_URL } from "@/config/api";

const Header = () => {
  const { settings } = useSettings();
  const { user, logout, userType, setUserType } = useAuth();
  const { language: selectedLanguage, setLanguage: setSelectedLanguage, currency: selectedCurrency, setCurrency: setSelectedCurrency } = useLocale();

  const [currencies, setCurrencies] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [curRes, langRes] = await Promise.all([
          fetch(`${API_BASE_URL}/currencies`),
          fetch(`${API_BASE_URL}/languages`)
        ]);
        if (curRes.ok) setCurrencies(await curRes.json());
        if (langRes.ok) setLanguages(await langRes.json());
      } catch (err) {
        console.error("Meta fetch error:", err);
      }
    };
    fetchMeta();
  }, []);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.displayName?.charAt(0).toUpperCase() || "U";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border/40 font-sans">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center">
            <img
              src={settings.logoDark || "/logo.png"}
              alt={settings.siteName || "CarRentify"}
              className="h-14 w-auto object-contain"
            />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
            {(settings.headerNavLinks || []).map((link: any, index: number) => (
              <Link
                key={index}
                href={link.url}
                target={link.target || "_self"}
                className="hover:text-primary transition-colors cursor-pointer uppercase tracking-widest text-[11px] font-black"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-foreground/80 hover:text-primary transition-colors relative cursor-pointer mr-2">
            {userType === "host" ? (
              <ShieldCheck className="w-5 h-5 text-primary" />
            ) : (
              <Heart className="w-5 h-5" />
            )}
          </button>

          <Link
            href="/dashboard/fleet/new"
            onClick={() => setUserType("host")}
            className="hidden lg:block"
          >
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white rounded-full px-6 font-bold transition-all shadow-sm"
            >
              List Your Car
            </Button>
          </Link>

          {user ? (
            <div className="relative group">
              <div className="flex items-center gap-3 pl-4 border-l border-border/50 cursor-pointer h-10">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-bold text-foreground leading-none">
                    {user.displayName || `${user.firstName} ${user.lastName}`}
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest mt-1 font-black ${userType === "host"
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-slate-100 text-slate-500"
                      }`}
                  >
                    {userType === "host" ? "Host Mode" : "Renter Mode"}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden hover:border-primary transition-all shadow-md">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary font-black text-sm tracking-tighter">
                      {getInitials()}
                    </span>
                  )}
                </div>
              </div>

              {/* Advanced Persona-Aware Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 p-2">
                
                {/* Switch Mode Action - Sleeker Design */}
                <button
                  onClick={() => setUserType(userType === "host" ? "renter" : "host")}
                  className="w-full h-16 flex items-center justify-between gap-4 px-4 bg-slate-50 hover:bg-primary/5 rounded-xl transition-all mb-2 group/item border border-slate-100 hover:border-primary/20 text-primary"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-50 flex items-center justify-center group-hover/item:text-primary transition-all">
                      <Repeat size={18} />
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Persona</p>
                       <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                         {userType === "host" ? "Switch to Renter" : "Switch to Host"}
                       </span>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${userType === "host" ? "bg-primary shadow-[0_0_10px_rgba(63,20,123,0.5)]" : "bg-slate-300"}`} />
                </button>

                <div className="space-y-1 p-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-600 hover:text-primary hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest"
                  >
                    <LayoutDashboard size={18} className="text-slate-400" />
                    {userType === "host" ? "Host Control Center" : "Renter Dashboard"}
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-600 hover:text-primary hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest"
                  >
                    <User size={18} className="text-slate-400" />
                    Account Settings
                  </Link>
                </div>

                <div className="my-2 h-px bg-slate-50" />

                {/* Localization Controls */}
                <div className="p-2 space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <Globe size={11} className="text-slate-300" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Regional Preferences</span>
                  </div>

                  <div className="space-y-4">
                    {/* Premium CustomSelect Language Switcher - Solid Background */}
                    <CustomSelect 
                       options={languages.map(l => ({
                          value: l.code,
                          label: l.name,
                          icon: <Globe size={14} className="text-primary" />
                       }))}
                       defaultValue={selectedLanguage}
                       onChange={(val: string) => setSelectedLanguage(val)}
                       className="w-full [&>button]:h-12 [&>button]:border-slate-100 [&>button]:bg-white [&>button]:shadow-none [&>div:last-child]:right-full [&>div:last-child]:left-auto [&>div:last-child]:top-1/2 [&>div:last-child]:-translate-y-1/2 [&>div:last-child]:mr-4 [&>div:last-child]:w-72 [&>div:last-child]:origin-right"
                    />
                    
                    {/* Premium CustomSelect Currency Switcher - Solid Background */}
                    <CustomSelect 
                       options={currencies.map(c => ({
                          value: c.code,
                          label: `${c.code} (${c.symbol})`,
                          icon: <Banknote size={14} className="text-primary" />
                       }))}
                       defaultValue={selectedCurrency}
                       onChange={(val: string) => setSelectedCurrency(val)}
                       className="w-full [&>button]:h-12 [&>button]:border-slate-100 [&>button]:bg-white [&>button]:shadow-none [&>div:last-child]:right-full [&>div:last-child]:left-auto [&>div:last-child]:top-1/2 [&>div:last-child]:-translate-y-1/2 [&>div:last-child]:mr-4 [&>div:last-child]:w-72 [&>div:last-child]:origin-right"
                    />
                  </div>
                </div>

                <div className="my-2 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-5 py-4 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all uppercase tracking-[0.15em]"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <Button className="bg-primary text-white hover:bg-black rounded-full px-10 h-12 font-black transition-all shadow-xl shadow-primary/20 text-sm tracking-tight border-none">
                Login
              </Button>
            </Link>
          )}

          <button className="md:hidden text-foreground cursor-pointer">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
