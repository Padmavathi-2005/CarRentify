'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SITE_SETTINGS } from '@/data/mockData';
import { API_BASE_URL } from '@/config/api';

type Settings = {
  primaryColor: string;
  secondaryColor: string;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  favicon: string;
  logoDark: string;
  logoLight: string;
  isAdminPanelEnabled: boolean;
  emailVerificationEnabled: boolean;
  heroTranslations: Record<string, { 
    title: string; 
    subtitle: string; 
    brandsTitle?: string; 
    brandsSubtitle?: string; 
    brandsDescription?: string;
    featuredTitle?: string;
    featuredSubtitle?: string;
    testimonialsTitle?: string;
    testimonialsSubtitle?: string;
    testimonialsDescription?: string;
    destinationsTitle?: string;
    destinationsSubtitle?: string;
    ctaTitleRenter?: string;
    ctaSubtitleRenter?: string;
    ctaButtonRenter?: string;
    ctaTitleHost?: string;
    ctaSubtitleHost?: string;
    ctaButtonHost?: string;
    locationsTitle?: string;
    locationsSubtitle?: string;
    locationsButton?: string;
    enhanceTitle?: string;
    enhanceSubtitle?: string;
    appTitle?: string;
    appSubtitle?: string;
    appStoreLabel?: string;
    googlePlayLabel?: string;
    newsletterTitle?: string;
    newsletterSubtitle?: string;
    heroStats?: { value: string, label: string }[];
    navLabels?: Record<string, string>;
  }>;
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
  socialLinks: { id: string; icon: string; url: string }[];
  walletBalance: number;
  minWithdrawalAmount: number;
  commissionRate: number;
  maxImagesPerListing: number;
  headerNavLinks: { label: string; url: string; target?: string }[];
  footerLinks: { label: string; url: string; target?: string }[];
  showHeroSection: boolean;
  showFeaturedCars: boolean;
  showTestimonials: boolean;
  showBrandsSection: boolean;
  showDestinationsSection: boolean;
  showCTASection: boolean;
  showLocationsSection: boolean;
  showEnhanceSection: boolean;
  showAppSection: boolean;
  showNewsletter: boolean;
  ctaImageRenter: string;
  ctaImageHost: string;
  enhanceImage: string;
  appImage: string;
  appStoreLink: string;
  googlePlayLink: string;
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
    siteDescription: (SITE_SETTINGS.general as any).siteDescription ?? 'Experience the pinnacle of luxury car rentals. Unmatched performance, elegance, and dedicated service on every journey.',
    siteUrl: SITE_SETTINGS.general.siteUrl,
    favicon: SITE_SETTINGS.general.favicon,
    logoDark: SITE_SETTINGS.branding.logoDark,
    logoLight: SITE_SETTINGS.branding.logoLight,
    isAdminPanelEnabled: SITE_SETTINGS.general.isAdminPanelEnabled,
    emailVerificationEnabled: (SITE_SETTINGS.general as any).emailVerificationEnabled ?? true,
    heroTranslations: (SITE_SETTINGS as any).general?.heroTranslations ?? { en: { title: 'Drive the Future of Elegance.', subtitle: 'Velocity Blue curates an elite fleet of vehicles for those who demand performance and prestige in every journey.' } },
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
    socialLinks: (SITE_SETTINGS as any).social?.socialLinks ?? [],
    walletBalance: (SITE_SETTINGS as any).financials?.walletBalance ?? 0,
    minWithdrawalAmount: (SITE_SETTINGS as any).financials?.minWithdrawalAmount ?? 50,
    commissionRate: (SITE_SETTINGS as any).financials?.commissionRate ?? 15,
    maxImagesPerListing: (SITE_SETTINGS as any).listings?.maxImagesPerListing ?? 5,
    headerNavLinks: (SITE_SETTINGS as any).frontend?.headerNavLinks ?? [],
    footerLinks: (SITE_SETTINGS as any).frontend?.footerLinks ?? [],
    showHeroSection: (SITE_SETTINGS as any).frontend?.showHeroSection ?? true,
    showFeaturedCars: (SITE_SETTINGS as any).frontend?.showFeaturedCars ?? true,
    showTestimonials: (SITE_SETTINGS as any).frontend?.showTestimonials ?? true,
    showBrandsSection: (SITE_SETTINGS as any).frontend?.showBrandsSection ?? true,
    showDestinationsSection: (SITE_SETTINGS as any).frontend?.showDestinationsSection ?? true,
    showCTASection: (SITE_SETTINGS as any).frontend?.showCTASection ?? true,
    showLocationsSection: (SITE_SETTINGS as any).frontend?.showLocationsSection ?? true,
    ctaImageRenter: (SITE_SETTINGS as any).frontend?.ctaImageRenter ?? '/car-5.png',
    ctaImageHost: (SITE_SETTINGS as any).frontend?.ctaImageHost ?? '/car-2.png',
    showEnhanceSection: (SITE_SETTINGS as any).frontend?.showEnhanceSection ?? true,
    showAppSection: (SITE_SETTINGS as any).frontend?.showAppSection ?? true,
    showNewsletter: (SITE_SETTINGS as any).frontend?.showNewsletter ?? true,
    enhanceImage: (SITE_SETTINGS as any).frontend?.enhanceImage ?? '/enhance.png',
    appImage: (SITE_SETTINGS as any).frontend?.appImage ?? '/app-mockup.png',
    appStoreLink: (SITE_SETTINGS as any).frontend?.appStoreLink ?? 'https://apple.com/app-store',
    googlePlayLink: (SITE_SETTINGS as any).frontend?.googlePlayLink ?? 'https://play.google.com/store',
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
        const response = await fetch(`${API_BASE_URL}/settings`);
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
      const response = await fetch(`${API_BASE_URL}/settings`, {
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
