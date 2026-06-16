"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSettings } from "@/components/ThemeProvider";
import { useLocale } from "@/components/LocaleContext";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/config/api";

const resolveAsset = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  if (path.startsWith('/images/') || path.startsWith('images/')) {
    return `${API_BASE_URL.replace('/api', '')}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return path;
};

const Footer = () => {
  const { settings } = useSettings();
  const { language, t } = useLocale();
  const { showToast } = useToast();
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = useState(false);
  const [dynamicPages, setDynamicPages] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [newsStatus, setNewsStatus] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscribe = async () => {
    if (!email) return;
    setNewsStatus("checking...");
    try {
      const res = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
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
    } catch (e) {
      setNewsStatus("Server Error");
    }
  };

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
    <footer className="bg-card pt-12 pb-12 border-t border-border font-sans mt-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-10">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <div className="bg-transparent dark:bg-white dark:px-3 dark:py-1 dark:rounded-app transition-all inline-block">
                <img
                  src={!mounted
                    ? "/logo.png"
                    : settings.theme === 'dark'
                    ? (resolveAsset(settings.logoLight) || "/logo.png")
                    : (resolveAsset(settings.logoDark) || "/logo.png")}
                  alt={settings.siteName || "CarRental"}
                  className="h-12 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-slate-900 dark:text-white font-bold text-sm leading-relaxed max-w-sm mb-8">
              {(settings.heroTranslations?.[language] as any)?.siteDescription || settings.siteDescription || t('footer.description')}
            </p>

            {settings.showNewsletter !== false && (
              <div className="mb-10 max-w-sm">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.2em] mb-3">
                  {settings.heroTranslations?.[language]?.newsletterTitle || settings.heroTranslations?.['en']?.newsletterTitle || "Newsletter"}
                </h4>
                <div className="flex bg-muted/50 border border-border rounded-app overflow-hidden p-1 ">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setNewsStatus(""); }}
                    placeholder={t('footer.enter_email')}
                    className="flex-1 bg-transparent border-none text-[11px] font-bold text-slate-900 dark:text-white px-4 py-2 focus:outline-none"
                  />
                  <button
                    onClick={handleSubscribe}
                    className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-app hover:bg-primary/90 transition-colors active:scale-95 whitespace-nowrap"
                  >
                    {newsStatus === 'checking...' ? t('footer.wait') : t('footer.subscribe')}
                  </button>
                </div>
                {newsStatus === 'success' && <p className="text-[9px] text-emerald-500 font-bold mt-2 tracking-wide">{t('footer.success_sub')}</p>}
                {newsStatus === 'exists' && <p className="text-[9px] text-amber-500 font-bold mt-2 tracking-wide">{t('footer.email_exists')}</p>}
                {newsStatus !== 'success' && newsStatus !== 'exists' && newsStatus !== 'checking...' && newsStatus !== '' && <p className="text-[9px] text-red-500 font-bold mt-2 tracking-wide uppercase">{newsStatus}</p>}
              </div>
            )}

            <div className="flex items-center gap-3">
              {(settings.socialLinks || []).map((social: any) => (
                <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-app bg-muted/50 border border-border flex items-center justify-center hover:bg-muted hover:border-primary/20 transition-all ">
                  {social.id?.toLowerCase().includes('twitter') ? (
                    <svg className="w-3 h-3 fill-foreground/60" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                  ) : social.icon ? (
                    <img src={social.icon} alt={social.id} className="w-3.5 h-3.5 object-contain opacity-60 hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  )}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8">{t('footer.ecosystem')}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-900 dark:text-slate-300">
              <li><Link href="/vehicles" className="hover:text-primary transition-colors">{t('footer.fleet')}</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">{t('footer.story')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8">{t('footer.info')}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-900 dark:text-slate-300">
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
                  <li><Link href="/p/cancellation-policy" className="hover:text-primary transition-colors">{t('footer.cancellation')}</Link></li>
                  <li><Link href="/p/help-center" className="hover:text-primary transition-colors">{t('footer.help_center')}</Link></li>
                  <li><Link href="/p/faq" className="hover:text-primary transition-colors">{t('footer.faq')}</Link></li>
                  <li><Link href="/p/terms-of-service" className="hover:text-primary transition-colors">{t('footer.terms')}</Link></li>
                  <li><Link href="/pages/privacy-policy" className="hover:text-primary transition-colors">{t('footer.privacy_policy')}</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8">{t('footer.contact')}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-900 dark:text-slate-300">
              <li className="text-slate-400 dark:text-white/40 font-medium lowercase tracking-widest text-[10px]">{t('footer.headquarters')}:</li>
              <li className="text-slate-900 dark:text-white">{settings.hqLoc || t('footer.hq_loc')}</li>
              <li className="pt-2 flex flex-col gap-2">
                <a 
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${settings.email || "support@carrental.com"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    navigator.clipboard.writeText(settings.email || "support@carrental.com");
                    showToast("Email copied to clipboard! Opening Gmail...", "success");
                  }}
                  className="text-primary hover:underline truncate block"
                >
                  {settings.email || "support@carrental.com"}
                </a>
                <a 
                  href={`tel:${settings.phone || "+44 20 7946 0000"}`}
                  onClick={() => {
                    navigator.clipboard.writeText(settings.phone || "+44 20 7946 0000");
                    showToast("Phone number copied to clipboard!", "success");
                  }}
                  className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors block"
                >
                  {settings.phone || "+44 20 7946 0000"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-center md:text-start">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden md:block" />
            <p className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest leading-relaxed max-w-sm">
              {(settings.heroTranslations?.[language] as any)?.copyright || settings.copyright || t('footer.copyright').replace('{year}', currentYear.toString())}
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-6 md:gap-8 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
            {(settings.footerLinks || []).map((link: any, idx: number) => (
              <Link key={idx} href={link.url || "#"} className="hover:text-primary transition-colors">
                {(settings.heroTranslations?.[language]?.navLabels?.[link.id || `f_${idx}`]) || link.label}
              </Link>
            ))}
            {(!settings.footerLinks || settings.footerLinks.length === 0) && (
              <>
                <Link href="/pages/privacy-policy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
                <Link href="/pages/security" className="hover:text-primary transition-colors">{t('footer.security')}</Link>
                <Link href="/pages/status" className="hover:text-primary transition-colors">{t('footer.status')}</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
