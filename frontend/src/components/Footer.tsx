'use client';

import React from 'react';
import { useSettings } from "@/components/ThemeProvider";

const Footer = () => {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white pt-20 pb-10 border-t border-border font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center mb-6">
              <img 
                src={settings.logoDark || "/logo.png"} 
                alt={settings.siteName || "CarRentify"} 
                className="h-10 w-auto object-contain" 
              />
            </a>
            <p className="text-muted-foreground mb-6 max-w-sm">The world's premier luxury car rental service. Experience unmatched elegance and performance on every journey.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Insurance</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">{currentYear} {settings.siteName || "CarRentify"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
