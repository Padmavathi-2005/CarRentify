"use client";

import React, { useState, useEffect, use as useReact } from "react";
import { 
  Plus, 
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Save,
  Clock,
  History,
  Globe,
  Tag,
  Palette,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Settings,
  MoreVertical,
  LogOut as SaveExit,
  Eye,
  Type,
  Layout,
  Code,
  Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/styles/dashboard-forms.css";
import CustomSelect from "@/components/CustomSelect";
import HtmlEditor from "@/components/HtmlEditor";
import { API_BASE_URL } from "@/config/api";

export default function AdminUpdateStaticPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = useReact(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [dbLanguages, setDbLanguages] = useState<any[]>([]);
  const [activeLang, setActiveLang] = useState("en");
  
  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    content: "",
    status: "Published",
    metaDescription: "",
    template: "Default Template",
    order: 0,
    navigationVisibility: "Show in Main Menu",
    translations: {}
  });

  useEffect(() => {
    // Fetch languages
    fetch(`${API_BASE_URL}/languages`)
      .then(res => res.json())
      .then(data => setDbLanguages(data))
      .catch(err => console.error("Lang fetch failed:", err));

    // Fetch existing page data
    fetch(`${API_BASE_URL}/pages/${id}`)
      .then(res => res.json())
      .then(data => {
         setFormData({
            ...data,
            translations: data.translations || {}
         });
         setFetching(false);
      })
      .catch(err => {
         console.error("Page fetch failed:", err);
         setFetching(false);
      });
  }, [id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ 
      ...prev, 
      [field]: value
    }));
  };

  const handleTranslationChange = (lang: string, field: string, value: string) => {
    setFormData((prev: any) => {
       const updatedTranslations = { ...prev.translations };
       if (!updatedTranslations[lang]) updatedTranslations[lang] = { title: "", content: "", metaDescription: "" };
       updatedTranslations[lang][field] = value;
       return { ...prev, translations: updatedTranslations };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push('/admin/pages');
      }
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
     return (
        <div className="flex items-center justify-center min-h-[400px]">
           <Clock className="animate-spin text-primary" size={32} />
        </div>
     );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in pb-20 max-w-[1500px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4 border-b border-[var(--admin-border)] pb-8 bg-[var(--admin-card-bg)] p-4 md:p-6 rounded-app shadow-xl shadow-black/5 dark:shadow-white/5 border border-[var(--admin-border)]">
        <div>
           <h1 className="text-xl font-black text-[var(--admin-text-main)] tracking-tight flex items-center gap-3">
              <FileText className="text-primary" size={24} /> Update Page
           </h1>
           <div className="flex items-center gap-2 mt-1 text-primary font-bold text-[9px] uppercase tracking-widest leading-loose">
              <Link href="/admin" className="hover:underline">Admin</Link>
              <ChevronRight size={10} className="text-[var(--admin-text-muted)]/30" />
              <Link href="/admin/pages" className="hover:underline">Pages</Link>
           </div>
        </div>
        <div className="flex items-center flex-wrap gap-3 w-full md:w-auto">
           <CustomSelect 
              options={[
                 { value: 'en', label: 'English', icon: <Globe size={14} /> },
                 ...dbLanguages.filter(l => l.code !== 'en').map(l => ({
                    value: l.code,
                    label: l.nativeName,
                    icon: <Languages size={14} />
                 }))
              ]}
              defaultValue={activeLang}
              onChange={(val) => setActiveLang(val)}
              className="w-full md:w-44"
           />
           <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <Link href="/admin/pages" className="flex-1 md:flex-none">
                 <Button variant="outline" type="button" className="w-full md:auto h-12 px-6 rounded-app border-[var(--admin-border)] text-[var(--admin-text-muted)] font-bold gap-2 hover:bg-[var(--admin-bg)] transition-all">
                    Cancel
                 </Button>
              </Link>
              <Button type="submit" disabled={loading} className="flex-1 md:flex-none bg-primary hover:bg-black text-white h-12 px-8 rounded-app font-bold shadow-xl shadow-primary/20 gap-3 transition-all active:scale-95">
                 {loading ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
                 {loading ? "Syncing..." : "Update Content"}
              </Button>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Column */}
        <div className="flex-1 space-y-8 w-full">
          
          {/* Editor Section */}
          <section className="bg-[var(--admin-card-bg)] p-4 md:p-8 rounded-app shadow-xl shadow-black/5 dark:shadow-white/5 border border-[var(--admin-border)] space-y-8">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                   <Type size={14} className="text-primary" />
                   <h3 className="text-xs font-black text-[var(--admin-text-main)] uppercase tracking-widest">
                      Edit Content <span className="text-primary/40">— {activeLang.toUpperCase()}</span>
                   </h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
                   <Globe size={11} className="text-[var(--admin-text-muted)]" />
                   <span className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest leading-none">Global Sync Active</span>
                </div>
             </div>

             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-3 block px-1">Localized Title *</label>
                  <Input 
                    value={activeLang === 'en' ? formData.title : (formData.translations[activeLang]?.title || "")}
                    onChange={(e) => activeLang === 'en' ? handleChange('title', e.target.value) : handleTranslationChange(activeLang, 'title', e.target.value)}
                    placeholder={`e.g. Terms in ${activeLang}`}
                    className="h-14 border-[var(--admin-border)] bg-[var(--admin-bg)]/50 rounded-app px-6 font-bold text-[var(--admin-text-main)] focus-visible:ring-primary/10 text-lg transition-all"
                    required
                  />
                </div>

                {activeLang === 'en' && (
                  <div className="animate-fade-in">
                    <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-3 block px-1">Global Permanent Link (Slug)</label>
                    <div className="flex items-center border border-[var(--admin-border)] bg-[var(--admin-bg)]/50 rounded-app overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                       <div className="px-5 py-3 border-r border-[var(--admin-border)] text-[var(--admin-text-muted)] font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">
                          rentify.io/pages/
                       </div>
                       <Input 
                          value={formData.slug}
                          onChange={(e) => handleChange('slug', e.target.value)}
                          className="h-14 border-none px-5 font-black text-primary bg-transparent text-sm"
                       />
                    </div>
                  </div>
                )}

                <div>
                   <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-3 block px-1">SEO Description ({activeLang.toUpperCase()})</label>
                   <Textarea 
                     value={activeLang === 'en' ? formData.metaDescription : (formData.translations[activeLang]?.metaDescription || "")}
                     onChange={(e) => activeLang === 'en' ? handleChange('metaDescription', e.target.value) : handleTranslationChange(activeLang, 'metaDescription', e.target.value)}
                     placeholder="Summary for localized search results..."
                     className="border-[var(--admin-border)] bg-[var(--admin-bg)]/50 rounded-app p-6 font-bold text-[var(--admin-text-main)] focus-visible:ring-primary/10 min-h-[100px] transition-all"
                   />
                </div>

                <div>
                    <HtmlEditor 
                       label="Page Body"
                       value={activeLang === 'en' ? formData.content : (formData.translations[activeLang]?.content || "")}
                       onChange={(val) => activeLang === 'en' ? handleChange('content', val) : handleTranslationChange(activeLang, 'content', val)}
                       placeholder="Start writing localized content..."
                    />
                 </div>
             </div>
          </section>
        </div>

        {/* Action Panel Sidebar */}
        <div className="w-full lg:w-[350px] space-y-8 sticky top-28">
          <section className="bg-[var(--admin-card-bg)] p-8 rounded-app shadow-xl shadow-black/5 dark:shadow-white/5 border border-[var(--admin-border)] space-y-6">
             <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary" />
                <h3 className="text-xs font-black text-[var(--admin-text-main)] uppercase tracking-widest">Update Lifecycle</h3>
             </div>
             
             <div className="space-y-6">
                 <div>
                    <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.2em] mb-3 block px-1">Master Status</label>
                    <CustomSelect 
                        options={["Published", "Draft", "Archived"]} 
                        defaultValue={formData.status}
                        onChange={(val) => handleChange('status', val)}
                    />
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.2em] mb-3 block px-1">Layout Template</label>
                    <CustomSelect 
                        options={["Default Template", "Full Width", "Legal Layout"]} 
                        defaultValue={formData.template}
                        onChange={(val) => handleChange('template', val)}
                    />
                 </div>
                 <div className="pt-6 border-t border-[var(--admin-border)]">
                    <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.2em] mb-3 block px-1">Navigation Order</label>
                    <Input 
                      type="number" 
                      value={formData.order}
                      onChange={(e) => handleChange('order', parseInt(e.target.value))}
                      className="h-12 border-[var(--admin-border)] rounded-app px-5 font-black text-primary bg-[var(--admin-bg)]/50 text-base transition-all" 
                    />
                 </div>
             </div>
          </section>

          <div className="px-6 space-y-2 text-center items-center flex flex-col">
             <Link href={`/pages/${formData.slug}`} target="_blank" className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                <ExternalLink size={14} /> Preview Live Page
             </Link>
             <p className="text-[9px] font-bold text-[var(--admin-text-muted)]/50 uppercase tracking-widest">ID: {id}</p>
          </div>
        </div>
      </div>
    </form>
  );
}
