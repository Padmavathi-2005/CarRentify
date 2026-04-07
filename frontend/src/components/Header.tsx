'use client';

import React from 'react';
import Link from 'next/link';
import { User, ShoppingBag, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSettings } from "@/components/ThemeProvider";

const Header = () => {
  const { settings } = useSettings();

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
          <button className="text-foreground/80 hover:text-primary transition-colors cursor-pointer" data-testid="button-account">
            <User className="w-5 h-5" />
          </button>
          <button className="text-foreground/80 hover:text-primary transition-colors relative cursor-pointer" data-testid="button-cart">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
          </button>
          <Link href="/vehicles" className="hidden lg:block">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white rounded-full px-6 font-bold transition-all shadow-sm">
              Rent a Car
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-full px-8 font-bold transition-all shadow-lg shadow-primary/10" data-testid="button-signin">
              Login
            </Button>
          </Link>
          <button className="md:hidden text-foreground cursor-pointer" data-testid="button-menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
