"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSettings } from "@/components/ThemeProvider";
import { useLocale } from "@/components/LocaleContext";
import { API_BASE_URL } from "@/config/api";

const Footer = () => {
  const { settings } = useSettings();
  const { language } = useLocale();
  const currentYear = new Date().getFullYear();
  const [dynamicPages, setDynamicPages] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [newsStatus, setNewsStatus] = useState("");

  const handleSubscribe = async () => {
    if (!email) return;
    setNewsStatus("checking...");
    try {
       const res = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
       });
       if(res.ok) {
          setNewsStatus("success");
          setEmail("");
       } else {
          const err = await res.json();
          if (err.message === 'exists' || (err.message && err.message.message === 'exists')) {
             setNewsStatus("exists");
          } else {
             setNewsStatus(err.message?.details || err.message || "error");
          }
       }
    } catch(e) {
       setNewsStatus("Server Error");
    }
  };
  
  // High-Fidelity Localization Array for Footer
  // This structure ensures all platform languages are synchronized across the global ecosystem
  const footerContent = {
    en: {
      ecosystem: "Ecosystem",
      fleet: "Our Fleet",
      concierge: "Concierge",
      pickup: "Pickup Hubs",
      story: "About Story",
      info: "Information",
      contact: "Contact",
      headquarters: "Headquarters",
      hq_loc: "Mayfair, London, UK",
      support: "Support Hub",
      privacy: "Privacy",
      security: "Security",
      status: "Status"
    },
    fr: {
      ecosystem: "Écosystème",
      fleet: "Notre Flotte",
      concierge: "Conciergerie",
      pickup: "Centres de Retrait",
      story: "Notre Histoire",
      info: "Information",
      contact: "Contact",
      headquarters: "Siège Social",
      hq_loc: "Mayfair, Londres, UK",
      support: "Centre d'Assistance",
      privacy: "Confidentialité",
      security: "Sécurité",
      status: "État"
    },
    ta: {
      ecosystem: "சுற்றுச்சூழல்",
      fleet: "எங்கள் கடற்படை",
      concierge: "வரவேற்பு சேவை",
      pickup: "பிக்கப் மையங்கள்",
      story: "எங்களைப் பற்றி",
      info: "தகவல்",
      contact: "தொடர்பு",
      headquarters: "தலைமையகம்",
      hq_loc: "மேஃபேர், லண்டன், UK",
      support: "ஆதரவு மையம்",
      privacy: "தனியுரிமை",
      security: "பாதுகாப்பு",
      status: "நிலை"
    }
  };

  // Using global locale context for high-fidelity synchronization
  const lang = (language as "en" | "fr" | "ta") || "en"; 
  const t = (footerContent as any)[lang] || footerContent.en;

  useEffect(() => {
    const fetchPages = async () => {
       try {
          const res = await fetch(`${API_BASE_URL}/pages`);
          if (res.ok) {
             const data = await res.json();
             setDynamicPages(data.filter((p: any) => p.status === 'Published'));
          }
       } catch (err) {
          console.error("Footer fetch failed:", err);
       }
    };
    fetchPages();
  }, []);

  return (
    <footer className="bg-white pt-24 pb-12 border-t border-slate-100 font-sans mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-8">
              <img 
                src={settings.logoDark || "/logo.png"} 
                alt={settings.siteName || "CarRentify"} 
                className="h-12 w-auto object-contain" 
              />
            </Link>
            <p className="text-slate-400 font-bold text-sm leading-relaxed max-w-sm mb-8">
               {settings.siteDescription || "Experience the pinnacle of luxury car rentals. Unmatched performance, elegance, and dedicated service on every journey."}
            </p>
            
            {settings.showNewsletter !== false && (
              <div className="mb-10 max-w-sm">
                 <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">
                    {settings.heroTranslations?.[language]?.newsletterTitle || settings.heroTranslations?.['en']?.newsletterTitle || "Newsletter"}
                 </h4>
                 <div className="flex bg-slate-50 border border-slate-100 rounded-xl overflow-hidden p-1 shadow-inner">
                    <input 
                       type="email" 
                       value={email}
                       onChange={(e) => { setEmail(e.target.value); setNewsStatus(""); }}
                       placeholder="Enter email address..." 
                       className="flex-1 bg-transparent border-none text-[11px] font-bold text-slate-600 px-4 py-2 focus:outline-none"
                    />
                    <button 
                       onClick={handleSubscribe}
                       className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm active:scale-95 whitespace-nowrap"
                    >
                       {newsStatus === 'checking...' ? 'WAIT...' : 'SUBSCRIBE'}
                    </button>
                 </div>
                 {newsStatus === 'success' && <p className="text-[9px] text-emerald-500 font-bold mt-2 tracking-wide">SUCCESSFULLY SUBSCRIBED!</p>}
                 {newsStatus === 'exists' && <p className="text-[9px] text-amber-500 font-bold mt-2 tracking-wide">EMAIL ALREADY EXISTS</p>}
                 {newsStatus !== 'success' && newsStatus !== 'exists' && newsStatus !== 'checking...' && newsStatus !== '' && <p className="text-[9px] text-red-500 font-bold mt-2 tracking-wide uppercase">{newsStatus}</p>}
              </div>
            )}

            <div className="flex items-center gap-3">
               {(settings.socialLinks || []).map((social: any) => (
                 <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 hover:border-slate-200 transition-all shadow-sm">
                    {social.icon ? (
                       <img src={social.icon} alt={social.id} className="w-3.5 h-3.5 object-contain opacity-60 hover:opacity-100 transition-opacity" />
                    ) : (
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                 </a>
               ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8">{t.ecosystem}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
               <li><Link href="/vehicles" className="hover:text-primary transition-colors">{t.fleet}</Link></li>
               <li><Link href="/services" className="hover:text-primary transition-colors">{t.concierge}</Link></li>
               <li><Link href="/locations" className="hover:text-primary transition-colors">{t.pickup}</Link></li>
               <li><Link href="/about" className="hover:text-primary transition-colors">{t.story}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8">{t.info}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
               {dynamicPages.length > 0 ? (
                 dynamicPages.map(page => (
                    <li key={page._id}>
                       <Link href={`/pages/${page.slug}`} className="hover:text-primary transition-colors">
                          {page.title}
                       </Link>
                    </li>
                 ))
               ) : (
                 <>
                    <li><Link href="/p/help-center" className="hover:text-primary transition-colors">Help Center</Link></li>
                    <li><Link href="/p/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                    <li><Link href="/p/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                 </>
               )}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8">{t.contact}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
               <li className="text-slate-400 font-medium lowercase tracking-widest text-[10px]">{t.headquarters}:</li>
               <li className="text-slate-900">{t.hq_loc}</li>
               <li className="pt-2 flex flex-col gap-2">
                  <Link href={`mailto:${settings.email || "support@carrentify.com"}`} className="text-primary hover:underline truncate block">
                     {settings.email || "support@carrentify.com"}
                  </Link>
                  <Link href={`tel:${settings.phone}`} className="text-slate-500 hover:text-primary transition-colors block">
                     {settings.phone || "+44 20 7946 0000"}
                  </Link>
               </li>
            </ul>
          </div>
        </div>

         <div className="border-t border-slate-50 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-center md:text-left">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden md:block" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed max-w-sm">
                  {(settings.heroTranslations?.[language] as any)?.copyright || settings.copyright || `© ${currentYear} CarRentify. All rights reserved.`}
               </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-6 md:gap-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
               {(settings.footerLinks || []).map((link: any, idx: number) => (
                  <Link key={idx} href={link.url || "#"} className="hover:text-primary transition-colors">
                     {(settings.heroTranslations?.[language]?.navLabels?.[link.id || `f_${idx}`]) || link.label}
                  </Link>
               ))}
               {(!settings.footerLinks || settings.footerLinks.length === 0) && (
                  <>
                     <Link href="/pages/privacy-policy" className="hover:text-primary transition-colors">{t.privacy}</Link>
                     <Link href="/pages/security" className="hover:text-primary transition-colors">{t.security}</Link>
                     <Link href="/pages/status" className="hover:text-primary transition-colors">{t.status}</Link>
                  </>
               )}
            </div>
         </div>
      </div>
    </footer>
  );
};

export default Footer;
