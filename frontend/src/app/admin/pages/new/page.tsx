"use client";

import React, { useState, useEffect } from "react";
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
import { API_BASE_URL } from "@/config/api";

export default function AdminEditStaticPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    fetch(`${API_BASE_URL}/languages`)
      .then(res => res.json())
      .then(data => setDbLanguages(data))
      .catch(err => console.error("Lang fetch failed:", err));
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ 
      ...prev, 
      [field]: value,
      ...(field === 'title' && activeLang === 'en' ? { slug: value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') } : {})
    }));
  };

  const handleTranslationChange = (lang: string, field: string, value: string) => {
    setFormData((prev: any) => {
       const updatedTranslations = { ...prev.translations };
       if (!updatedTranslations[lang]) updatedTranslations[lang] = { title: "", content: "", metaDescription: "" };
       updatedTranslations[lang][field] = value;
       
       // If editing active tab, also update top-level formData for immediate UI feedback if it's the main lang
       // but strictly, the main fields represent 'en' usually.
       return { ...prev, translations: updatedTranslations };
    });
  };

  const currentTitle = activeLang === 'en' ? formData.title : (formData.translations[activeLang]?.title || "");
  const currentContent = activeLang === 'en' ? formData.content : (formData.translations[activeLang]?.content || "");
  const currentMeta = activeLang === 'en' ? formData.metaDescription : (formData.translations[activeLang]?.metaDescription || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push('/admin/pages');
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in pb-20 max-w-[1500px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4 border-b border-slate-100 pb-8 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
           <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FileText className="text-primary" size={24} /> Create Page
           </h1>
           <div className="flex items-center gap-2 mt-1 text-primary font-bold text-[9px] uppercase tracking-widest leading-loose">
              <Link href="/admin" className="hover:underline">Admin</Link>
              <ChevronRight size={10} className="text-slate-300" />
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
                 <Button variant="outline" type="button" className="w-full md:auto h-12 px-6 rounded-xl border-slate-100 text-slate-500 font-bold gap-2 hover:bg-slate-50">
                    Cancel
                 </Button>
              </Link>
              <Button type="submit" disabled={loading} className="flex-1 md:flex-none bg-primary hover:bg-black text-white h-12 px-8 rounded-xl font-bold shadow-xl shadow-primary/20 gap-3 transition-all active:scale-95">
                 {loading ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
                 {loading ? "Syncing..." : "Publish Page"}
              </Button>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Column */}
        <div className="flex-1 space-y-8 w-full">
          
          {/* Editor Section */}
          <section className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100 space-y-8">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                   <Type size={14} className="text-primary" />
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                      Content Editor <span className="text-primary/40">— {activeLang.toUpperCase()}</span>
                   </h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                   <Globe size={11} className="text-slate-400" />
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Editing Language</span>
                </div>
             </div>

             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Localized Title *</label>
                  <Input 
                    value={activeLang === 'en' ? formData.title : (formData.translations[activeLang]?.title || "")}
                    onChange={(e) => activeLang === 'en' ? handleChange('title', e.target.value) : handleTranslationChange(activeLang, 'title', e.target.value)}
                    placeholder={`e.g. Terms in ${activeLang}`}
                    className="h-14 border-slate-100 bg-slate-50/50 rounded-xl px-6 font-bold text-slate-900 focus-visible:ring-primary/10 text-lg"
                    required
                  />
                </div>

                {activeLang === 'en' && (
                  <div className="animate-fade-in">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Global Permanent Link (Slug)</label>
                    <div className="flex items-center border border-slate-100 bg-slate-50/50 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                       <div className="px-5 py-3 border-r border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">
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
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">SEO Description ({activeLang.toUpperCase()})</label>
                   <Textarea 
                     value={activeLang === 'en' ? formData.metaDescription : (formData.translations[activeLang]?.metaDescription || "")}
                     onChange={(e) => activeLang === 'en' ? handleChange('metaDescription', e.target.value) : handleTranslationChange(activeLang, 'metaDescription', e.target.value)}
                     placeholder="Summary for localized search results..."
                     className="border-slate-100 bg-slate-50/50 rounded-xl p-6 font-bold text-slate-900 focus-visible:ring-primary/10 min-h-[100px]"
                   />
                </div>

                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Page Body</label>
                   <div className="border border-slate-200 shadow-xl shadow-slate-100 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 p-3 border-b border-slate-100 flex flex-wrap gap-2 items-center">
                          {["H1", "H2", "B", "I", "U", "OL", "UL", "🔗", "📷", "Code"].map(tool => (
                            <div key={tool} className="px-3 h-8 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 font-black cursor-pointer hover:bg-slate-100 hover:text-primary shadow-sm text-[9px] uppercase tracking-tighter transition-all">{tool}</div>
                          ))}
                      </div>
                      <Textarea 
                         value={activeLang === 'en' ? formData.content : (formData.translations[activeLang]?.content || "")}
                         onChange={(e) => activeLang === 'en' ? handleChange('content', e.target.value) : handleTranslationChange(activeLang, 'content', e.target.value)}
                         placeholder="Start writing localized content..."
                         className="border-none p-8 font-medium text-slate-700 focus-visible:ring-0 min-h-[500px] leading-relaxed text-base"
                         required
                      />
                   </div>
                </div>
             </div>
          </section>
        </div>

        {/* Action Panel Sidebar */}
        <div className="w-full lg:w-[350px] space-y-8 sticky top-28">
          <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
             <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Publishing Hub</h3>
             </div>
             
             <div className="space-y-6">
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block px-1">Master Lifecycle</label>
                    <CustomSelect 
                        options={["Published", "Draft", "Archived"]} 
                        defaultValue={formData.status}
                        onChange={(val) => handleChange('status', val)}
                    />
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block px-1">UX Template</label>
                    <CustomSelect 
                        options={["Default Template", "Full Width", "Legal Layout"]} 
                        defaultValue={formData.template}
                        onChange={(val) => handleChange('template', val)}
                    />
                 </div>
                 <div className="pt-6 border-t border-slate-50">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block px-1">Navigation Index</label>
                    <Input 
                      type="number" 
                      value={formData.order}
                      onChange={(e) => handleChange('order', parseInt(e.target.value))}
                      className="h-12 border-slate-100 rounded-xl px-5 font-black text-primary bg-slate-50/50 text-base" 
                    />
                 </div>
             </div>
          </section>

          <div className="px-6 space-y-2">
             <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center">Translation sync active</p>
             <div className="flex items-center justify-center gap-1">
                {Object.keys(formData.translations).map(k => (
                   <div key={k} className="w-1.5 h-1.5 rounded-full bg-primary/20 border border-primary/30" title={k} />
                ))}
             </div>
          </div>
        </div>
      </div>
    </form>
  );
}
