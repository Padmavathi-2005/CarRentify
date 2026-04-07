'use client';

import React from 'react';
import Link from 'next/link';
import { User, ShoppingBag, Menu, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSettings } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthContext";

const Header = () => {
  const { settings } = useSettings();
  const { user, logout } = useAuth();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/40 font-sans">
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
            <Link href="/vehicles" className="hover:text-primary transition-colors cursor-pointer">Vehicles</Link>
            <Link href="/locations" className="hover:text-primary transition-colors cursor-pointer">Locations</Link>
            <Link href="/services" className="hover:text-primary transition-colors cursor-pointer">Services</Link>
            <Link href="/about" className="hover:text-primary transition-colors cursor-pointer">About</Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-foreground/80 hover:text-primary transition-colors relative cursor-pointer" data-testid="button-cart">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
          </button>
          
          <Link href="/vehicles" className="hidden lg:block">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white rounded-full px-6 font-bold transition-all shadow-sm">
              Rent a Car
            </Button>
          </Link>

          {user ? (
            <div className="relative group">
              <div className="flex items-center gap-3 pl-4 border-l border-border/50 cursor-pointer">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-bold text-foreground leading-none">{user.displayName || `${user.firstName} ${user.lastName}`}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Premium Member</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden hover:border-primary transition-all">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-bold text-sm tracking-tighter uppercase">{getInitials()}</span>
                  )}
                </div>
              </div>

              {/* Advanced Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 p-2">
                 <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Hub</p>
                 </div>
                 <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-all">
                    <User size={16} /> My Fleet Dashboard
                 </Link>
                 <button 
                   onClick={() => logout()}
                   className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                 >
                    <LogOut size={16} /> Sign Out
                 </button>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <Button className="bg-primary text-primary-foreground hover:bg-black rounded-full px-8 font-bold transition-all shadow-lg shadow-primary/10" data-testid="button-signin">
                Login
              </Button>
            </Link>
          )}

          <button className="md:hidden text-foreground cursor-pointer" data-testid="button-menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
