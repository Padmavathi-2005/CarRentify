'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SITE_SETTINGS } from '@/data/mockData';

type Settings = {
  primaryColor: string;
  secondaryColor: string;
  siteName: string;
  siteUrl: string;
  favicon: string;
  logoDark: string;
  logoLight: string;
  isAdminPanelEnabled: boolean;
  emailVerificationEnabled: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpFrom: string;
  defaultLanguage: string;
  defaultCurrency: string;
  defaultTimezone: string;
  email: string;
  phone: string;
  copyright: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  walletBalance: number;
  minWithdrawalAmount: number;
  commissionRate: number;
};

type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<boolean>;
  loading: boolean;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within ThemeProvider');
  return context;
};

// Helper to convert hex to HSL for Tailwind
const hexToHSL = (hex: string) => {
  // Guard against invalid hex codes during live typing
  if (!hex || typeof hex !== 'string' || (hex.length !== 4 && hex.length !== 7)) {
    return `263 72% 28%`; // Fallback to #3f147b
  }

  let r = 0, g = 0, b = 0;
  try {
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) return `263 72% 28%`;

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch (e) {
    return `263 72% 28%`;
  }
};

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    primaryColor: SITE_SETTINGS.branding.primaryColor,
    secondaryColor: SITE_SETTINGS.branding.secondaryColor,
    siteName: SITE_SETTINGS.general.siteName,
    siteUrl: SITE_SETTINGS.general.siteUrl,
    favicon: SITE_SETTINGS.general.favicon,
    logoDark: SITE_SETTINGS.branding.logoDark,
    logoLight: SITE_SETTINGS.branding.logoLight,
    isAdminPanelEnabled: SITE_SETTINGS.general.isAdminPanelEnabled,
    emailVerificationEnabled: (SITE_SETTINGS.general as any).emailVerificationEnabled ?? true,
    heroTitle: (SITE_SETTINGS as any).general?.heroTitle ?? 'Drive the Future of Elegance.',
    heroSubtitle: (SITE_SETTINGS as any).general?.heroSubtitle ?? 'Velocity Blue curates an elite fleet of vehicles for those who demand performance and prestige in every journey.',
    heroImageUrl: (SITE_SETTINGS as any).general?.heroImageUrl ?? '/hero-car-new.png',
    smtpHost: (SITE_SETTINGS as any).smtp?.host ?? 'smtp.gmail.com',
    smtpPort: (SITE_SETTINGS as any).smtp?.port ?? '587',
    smtpUser: (SITE_SETTINGS as any).smtp?.user ?? 'varsha.vasu282003@gmail.com',
    smtpPassword: (SITE_SETTINGS as any).smtp?.password ?? '',
    smtpFrom: (SITE_SETTINGS as any).smtp?.from ?? 'varsha.vasu282003@gmail.com',
    defaultLanguage: (SITE_SETTINGS as any).general?.defaultLanguage ?? 'en',
    defaultCurrency: (SITE_SETTINGS as any).general?.defaultCurrency ?? 'USD',
    defaultTimezone: (SITE_SETTINGS as any).general?.defaultTimezone ?? 'America/New_York',
    email: (SITE_SETTINGS as any).contact?.email ?? 'varsha.vasu282003@gmail.com',
    phone: (SITE_SETTINGS as any).contact?.phone ?? '+1 555-0000',
    copyright: (SITE_SETTINGS as any).contact?.copyright ?? '© 2026 CarRentify. All rights reserved.',
    facebook: (SITE_SETTINGS as any).social?.facebook ?? 'https://facebook.com/carrentify',
    instagram: (SITE_SETTINGS as any).social?.instagram ?? 'https://instagram.com/carrentify',
    linkedin: (SITE_SETTINGS as any).social?.linkedin ?? 'https://linkedin.com/company/carrentify',
    twitter: (SITE_SETTINGS as any).social?.twitter ?? 'https://twitter.com/carrentify',
    walletBalance: (SITE_SETTINGS as any).financials?.walletBalance ?? 0,
    minWithdrawalAmount: (SITE_SETTINGS as any).financials?.minWithdrawalAmount ?? 50,
    commissionRate: (SITE_SETTINGS as any).financials?.commissionRate ?? 15,
  });
  const [loading, setLoading] = useState(true);

  const applySettings = (updated: Settings) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-brand-color', updated.primaryColor);
    root.style.setProperty('--secondary-brand-color', updated.secondaryColor);
    
    // Update Tailwind variables
    root.style.setProperty('--primary', hexToHSL(updated.primaryColor));
    root.style.setProperty('--primary-hover', hexToHSL(updated.secondaryColor));

    // Update Browser Identity
    if (updated.siteName) document.title = updated.siteName;
    if (updated.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = updated.favicon;
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Try real DB first
        const response = await fetch('http://localhost:3001/settings');
        if (response.ok) {
          const data = await response.json();
          const merged = { ...settings, ...data };
          setSettings(merged);
          applySettings(merged);
        } else {
          // Fallback to local state/mock
          applySettings(settings);
        }
      } catch (error) {
        // Assume dev mode or offline, use defaults
        applySettings(settings);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      
      // Update local state for immediate feedback
      setSettings(updated);
      applySettings(updated);

      // Simulate API call to DB
      const response = await fetch('http://localhost:3001/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      return response.ok;
    } catch (error) {
      console.error('DB Sync failed:', error);
      return false;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}
