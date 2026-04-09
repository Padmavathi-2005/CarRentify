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
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Please check the platform slug synchronization fruition completion fruition fruition audition" (Truncated)</p>
           </div>
           <Footer />
        </div>
     );
  }

  // Determine Current Localized Content - High-Fidelity Sync
  const isRTL = RTL_LANGS.includes(currentLang);
  const localizedContent = currentLang === 'en' ? page : (page.translations?.[currentLang] || page);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-primary selection:text-white" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      {/* Simple Professional Header Hub */}
      <section className="bg-white border-b border-slate-50 pt-40 pb-16">
         <div className="max-w-4xl mx-auto px-6">
            <motion.h1 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter"
            >
               {localizedContent.title}
            </motion.h1>
         </div>
      </section>

      {/* Clean Content Stage */}
      <main className="max-w-4xl mx-auto px-6 pb-32 pt-12">
         <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm relative group">
            {/* Localized Article Content */}
            <article className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:font-medium prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:text-lg">
               <div 
                 className="whitespace-pre-wrap localized-body"
                 dangerouslySetInnerHTML={{ __html: localizedContent.content }} 
               />
               
               {/* SEO Discovery Tag */}
               {localizedContent.metaDescription && (
                 <div className="mt-16 p-8 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-start gap-4">
                    <ShieldCheck className="text-emerald-500 mt-1" size={20} />
                    <p className="text-sm font-bold text-slate-500 leading-relaxed italic">{localizedContent.metaDescription}</p>
                 </div>
               )}
            </article>
         </div>
      </main>

      <Footer />

      <style jsx global>{`
         .localized-body h1 { font-size: 2.25rem; font-weight: 900; margin-bottom: 2rem; color: #0f172a; }
         .localized-body h2 { font-size: 1.5rem; font-weight: 900; margin-top: 3rem; margin-bottom: 1.5rem; color: #0f172a; }
         .localized-body p { margin-bottom: 1.5rem; }
         .localized-body ul { margin-bottom: 2rem; list-style-type: none; padding: 0; }
         .localized-body li { padding: 1rem 0; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 0.75rem; font-weight: 600; color: #475569; }
         .localized-body li:before { content: "•"; color: #3f147b; font-weight: 900; font-size: 1.5rem; }
         
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
