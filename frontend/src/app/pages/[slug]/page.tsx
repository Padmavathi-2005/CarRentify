"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Globe, 
  HelpCircle, 
  BookOpen, 
  LifeBuoy, 
  ShieldCheck, 
  Info,
  Clock,
  ArrowRight,
  ArrowLeft,
  Languages
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/config/api";

// Global RTL Identifier Hub
const RTL_LANGS = ['ar', 'fa', 'he', 'ur'];

export default function StaticPageView() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState("en");
  const [availableLangs, setAvailableLangs] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch Dynamic Languages for selection
    fetch(`${API_BASE_URL}/languages`)
      .then(res => res.json())
      .then(data => setAvailableLangs(data))
      .catch(err => console.error("Lang fetch failed:", err));

    // 2. Fetch the Specialized Static Page Data
    const fetchPage = async () => {
       try {
          const res = await fetch(`${API_BASE_URL}/pages/slug/${slug}`);
          if (res.ok) {
             const data = await res.json();
             setPage(data);
          }
       } catch (err) {
          console.error("Page fetch failed:", err);
       } finally {
          setLoading(false);
       }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
     return (
        <div className="min-h-screen bg-white flex items-center justify-center">
           <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-primary">
              <LifeBuoy size={40} />
           </motion.div>
        </div>
     );
  }

  if (!page) {
     return (
        <div className="min-h-screen bg-white">
           <Header />
           <div className="max-w-7xl mx-auto px-6 pt-40 pb-20 text-center">
              <h1 className="text-4xl font-black text-slate-800 mb-4">Content Not Accessible</h1>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">The requested content is currently unavailable. Please check the URL or try searching for another page.</p>
           </div>
           <Footer />
        </div>
     );
  }

  // Determine Current Localized Content - High-Fidelity Sync
  const isRTL = RTL_LANGS.includes(currentLang);
  const localizedContent = currentLang === 'en' ? page : (page.translations?.[currentLang] || page);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      {/* Simple Professional Header Hub */}
      <section className="bg-card border-b border-border pt-28 pb-8">
         <div className="max-w-4xl mx-auto px-6">
            <motion.h1 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-4xl md:text-5xl font-black text-foreground tracking-tighter"
            >
               {localizedContent.title}
            </motion.h1>
         </div>
      </section>

      {/* Clean Content Stage */}
      <main className="max-w-4xl mx-auto px-6 pb-32 pt-8">
         <div className="bg-card p-8 md:p-12 rounded-app border border-border shadow-sm relative group">
            {/* Localized Article Content */}
            <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:font-medium prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:text-lg">
               <div 
                 className="localized-body"
                 dangerouslySetInnerHTML={{ __html: localizedContent.content }} 
               />
               
               {/* SEO Discovery Tag */}
               {localizedContent.metaDescription && (
                 <div className="mt-16 p-8 rounded-app bg-muted/50 border border-border flex items-start gap-4">
                    <ShieldCheck className="text-emerald-500 mt-1" size={20} />
                    <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">{localizedContent.metaDescription}</p>
                 </div>
               )}
            </article>
         </div>
      </main>

      <Footer />

      <style jsx global>{`
         .localized-body h1 { font-size: 2.25rem; font-weight: 900; margin-bottom: 1rem; color: hsl(var(--foreground)); }
         .localized-body h2 { font-size: 1.5rem; font-weight: 900; margin-top: 2rem; margin-bottom: 0.5rem; color: hsl(var(--foreground)); }
         .localized-body p { margin-top: 0; margin-bottom: 1rem; color: hsl(var(--muted-foreground)); }
         .localized-body ul { margin-bottom: 2rem; list-style-type: none; padding: 0; }
         .localized-body li { padding: 1rem 0; border-bottom: 1px solid hsl(var(--border)); display: flex; align-items: center; gap: 0.75rem; font-weight: 600; color: hsl(var(--muted-foreground)); }
         .localized-body li:before { content: "•"; color: hsl(var(--primary)); font-weight: 900; font-size: 1.5rem; }
         
         @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
         }
         .animate-fade-in {
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
         }
      `}</style>
    </div>
  );
}
