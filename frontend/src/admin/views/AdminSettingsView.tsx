"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Share2, Bell, ShieldCheck,
   Save, RefreshCw, Layout, MapPin, ChevronRight, Globe, ChevronDown,
   Database, Heart, Users, Plus, Zap, Menu, ShoppingBag, Car, Quote, LayoutDashboard,
   Link as LinkIcon, Image as ImageIcon, Smile, Upload, X, Check, Droplet, Mail, Wallet, DollarSign, Percent
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import Switch from "../../components/ui/switch";
import { useSettings } from "../../components/ThemeProvider";
import { AdminTranslationContext } from "../../app/admin/AdminTranslationContext";

import { API_BASE_URL } from "@/config/api";
import "../styles/AdminSettingsView.css";
const backendUrl = API_BASE_URL;
 

const BRAND_PRESETS = [
  "#3f147b", "#291249", "#3B82F6", "#7c3aed",
  "#000000", "#1a1a1a", "#ffffff", "#f43f5e",
  "#10b981", "#f59e0b", "#6366f1", "#ec4899"
];

const ColorPickerBox = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-4" ref={containerRef}>
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block px-1">
        {label}
      </label>
      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200 relative">
        <div className="relative">
          <div
            className="w-16 h-16 rounded-xl shadow-lg border-4 border-white cursor-pointer hover:scale-105 transition-transform flex items-center justify-center group"
            style={{ background: value }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <Droplet className={`w-5 h-5 ${parseInt(value.replace('#', ''), 16) > 0xffffff / 2 ? 'text-black/20' : 'text-white/40'} opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-50 top-full left-0 mt-4 p-5 bg-white rounded-2xl shadow-2xl border border-slate-200 min-w-[240px]"
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Elite Palette</div>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {BRAND_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => { onChange(color); setIsOpen(false); }}
                      className="w-10 h-10 rounded-lg border-2 border-white shadow-sm ring-1 ring-slate-100 hover:scale-110 transition-transform"
                      style={{ background: color }}
                    />
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Custom</span>
                    <div className="w-6 h-6 rounded-md border border-slate-200 overflow-hidden relative">
                      <input
                        type="color"
                        className="absolute inset-[-10px] cursor-pointer"
                        value={value || "#000000"}
                        onChange={(e) => onChange(e.target.value)}
                      />
                    </div>
                  </div>
                  <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[10px] text-center uppercase"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1">
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 bg-white rounded-lg font-mono text-sm text-center bg-slate-50 border border-slate-200 uppercase"
          />
          <p className="text-[10px] text-slate-400 font-bold mt-2 tracking-widest px-1 uppercase text-center">Hex</p>
        </div>
      </div>
    </div>
  );
};

const EliteSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select Option",
  className = "",
  variant = "default" 
}: { 
  value: any, 
  onChange: (val: any) => void, 
  options: { value: any, label: string }[],
  placeholder?: string,
  className?: string,
  variant?: "default" | "primary" | "minimal"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 rounded-xl transition-all outline-none border focus:ring-2 focus:ring-primary/10 ${
          variant === 'primary' 
            ? 'h-9 bg-slate-100/80 border-slate-200 text-primary font-black uppercase tracking-[0.2em] text-[9px]'
            : variant === 'minimal'
            ? 'h-8 bg-white border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-[9px]'
            : 'h-11 bg-slate-50 border-slate-200 text-slate-900 font-bold uppercase tracking-widest text-[10px]'
        }`}
      >
        <span className="truncate pr-4">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={variant === 'primary' ? 12 : 14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-slate-400'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden min-w-[200px]"
          >
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                    value === opt.value 
                      ? 'bg-primary/5 text-primary font-black' 
                      : 'text-slate-600 hover:bg-slate-50 font-bold'
                  } uppercase tracking-widest text-[9px]`}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  {value !== opt.value && <ChevronRight size={10} className="text-slate-200 group-hover:text-primary transition-colors" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AdminSettingsView() {
  const { t } = useContext(AdminTranslationContext);
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState("hero");
  const [currentFooterSection, setCurrentFooterSection] = useState("social");

  useEffect(() => {
    const savedTab = localStorage.getItem("adminActiveTab");
    if (savedTab) setActiveTab(savedTab);
  }, []);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    localStorage.setItem("adminActiveTab", val);
  };

  const [currencies, setCurrencies] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [timezones, setTimezones] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${backendUrl}/currencies`).then(res => res.json()),
      fetch(`${backendUrl}/languages`).then(res => res.json()),
      fetch(`${backendUrl}/settings/meta/timezones`).then(res => res.json()),
      fetch(`${backendUrl}/pages`).then(res => res.json()),
      fetch(`${backendUrl}/brands`).then(res => res.json())
    ]).then(([cur, lang, tz, pgs, brnds]) => {
      setCurrencies(cur || []);
      setLanguages(lang || []);
      setTimezones(tz || []);
      setStaticPages(pgs || []);
      setBrands(brnds || []);
    }).catch(err => console.log('Failed to load meta:', err));
  }, []);

  const [staticPages, setStaticPages] = useState<any[]>([]);
  const [selectedHeroLang, setSelectedHeroLang] = useState('en');

  const handleTranslationChange = (field: 'title' | 'subtitle', value: string) => {
    const current = { ...(formData.heroTranslations || {}) };
    if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = { title: '', subtitle: '', heroStats: [] };
    (current as any)[selectedHeroLang] = { ...(current as any)[selectedHeroLang], [field]: value };
    handleFieldChange('heroTranslations', current);
  };

  const handleHeroStatChange = (index: number, field: 'value' | 'label', value: string) => {
    const current = { ...(formData.heroTranslations || {}) };
    if (!(current as any)[selectedHeroLang]) {
      (current as any)[selectedHeroLang] = { 
        title: '', 
        subtitle: '', 
        heroStats: [
          { value: '500+', label: 'Premium Cars' },
          { value: '50+', label: 'Locations' },
          { value: '10k+', label: 'Happy Clients' }
        ] 
      };
    }
    const stats = [...((current as any)[selectedHeroLang].heroStats || [
      { value: '500+', label: 'Premium Cars' },
      { value: '50+', label: 'Locations' },
      { value: '10k+', label: 'Happy Clients' }
    ])];
    
    if (!stats[index]) stats[index] = { value: '', label: '' };
    (stats as any)[index] = { ...(stats as any)[index], [field]: value };
    
    (current as any)[selectedHeroLang] = { ...(current as any)[selectedHeroLang], heroStats: stats };
    handleFieldChange('heroTranslations', current);
  };

  const handleNavLinkUpdate = (index: number, field: string, value: any) => {
    const current = [...(formData.headerNavLinks || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: value };
      handleFieldChange('headerNavLinks', current);
    }
  };

  const handleNavLabelUpdate = (linkId: string, value: string) => {
    const current = { ...(formData.heroTranslations || {}) };
    if (!(current as any)[selectedHeroLang]) {
      (current as any)[selectedHeroLang] = { navLabels: {} };
    }
    if (!(current as any)[selectedHeroLang].navLabels) {
      (current as any)[selectedHeroLang].navLabels = {};
    }
    (current as any)[selectedHeroLang].navLabels[linkId] = value;
    handleFieldChange('heroTranslations', current);
  };

  const logoDarkInputRef = useRef<HTMLInputElement>(null);
  const logoLightInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const ctaRenterInputRef = useRef<HTMLInputElement>(null);
  const ctaHostInputRef = useRef<HTMLInputElement>(null);
  const enhanceImageInputRef = useRef<HTMLInputElement>(null);
  const appImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateSettings(formData);
      if (success) {
        alert(t.settings.actions.success);
      } else {
        alert(t.settings.actions.dbError);
      }
    } catch (err) {
      alert(t.settings.actions.error);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Enhanced Validation & Optimization Engine
        const config: Record<string, { minW: number, minH: number, targetW: number, targetH: number, mode: 'cover' | 'contain' }> = {
           logoDark: { minW: 100, minH: 100, targetW: 400, targetH: 400, mode: 'contain' },
           logoLight: { minW: 100, minH: 100, targetW: 400, targetH: 400, mode: 'contain' },
           favicon: { minW: 32, minH: 32, targetW: 64, targetH: 64, mode: 'contain' },
           heroImageUrl: { minW: 1200, minH: 600, targetW: 1920, targetH: 1080, mode: 'cover' },
           ctaImageRenter: { minW: 600, minH: 400, targetW: 1200, targetH: 800, mode: 'cover' },
           ctaImageHost: { minW: 600, minH: 400, targetW: 1200, targetH: 800, mode: 'cover' },
           enhanceImage: { minW: 800, minH: 800, targetW: 1200, targetH: 1200, mode: 'cover' },
           appImage: { minW: 400, minH: 600, targetW: 1000, targetH: 1500, mode: 'contain' }
        };

        const c = config[field];
        if (c) {
          if (img.width < c.minW || img.height < c.minH) {
            alert(`Premium Display Error: The selected image is too small for the ${field} section.\nMinimum required: ${c.minW}x${c.minH}px.\nYour image: ${img.width}x${img.height}px.`);
            setUploading(null);
            return;
          }

          const canvas = document.createElement('canvas');
          canvas.width = c.targetW;
          canvas.height = c.targetH;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            if (c.mode === 'cover') {
              const scale = Math.max(c.targetW / img.width, c.targetH / img.height);
              const x = (c.targetW / 2) - (img.width / 2) * scale;
              const y = (c.targetH / 2) - (img.height / 2) * scale;
              ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            } else {
              const scale = Math.min(c.targetW / img.width, c.targetH / img.height);
              const x = (c.targetW / 2) - (img.width / 2) * scale;
              const y = (c.targetH / 2) - (img.height / 2) * scale;
              ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            }
            handleFieldChange(field, canvas.toDataURL('image/png', 0.8));
          }
        } else {
          handleFieldChange(field, event.target?.result as string);
        }
        setUploading(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  if (settingsLoading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <motion.div {...fadeInUp} className="w-full h-full flex flex-col">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex-1 border border-slate-200 flex flex-col">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col md:flex-row h-full">
          {/* Engineered Modular CSS Sidebar */}
          <TabsList className="admin-sidebar-list">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-2">{t.settings.title}</div>
            {[
              { id: "general", label: t.settings.tabs.general, icon: Layout },
              { id: "footer", label: t.settings.tabs.footer || "Footer Settings", icon: Share2 },
              { id: "smtp", label: t.settings.tabs.smtp, icon: Mail },
              { id: "financials", label: t.settings.tabs.financials, icon: Wallet },
              { id: "listings", label: t.settings.tabs.listings, icon: ImageIcon },
              { id: "frontend", label: t.settings.tabs.frontend, icon: Layout },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="admin-tab-trigger"
                >
                  <Icon size={16} /> {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="flex-1 flex flex-col min-w-0">
            {/* Global Control Bar */}
            <div className="min-h-14 border-b border-slate-50 px-4 md:px-6 py-2 flex flex-wrap items-center justify-between bg-slate-50/20 backdrop-blur-sm sticky top-0 z-30 gap-3 md:gap-4">
              <div className="flex-none">
                {activeTab === 'frontend' && (
                  <EliteSelect 
                    value={currentSection}
                    onChange={(val) => setCurrentSection(val)}
                    variant="primary"
                    className="w-full md:w-[200px]"
                    options={[
                      { value: "hero", label: "Hero Section" },
                      { value: "header", label: "Header Navigation" },
                      { value: "brands", label: "Brands" },
                      { value: "featured", label: "Featured Fleet" },
                      { value: "destinations", label: "Drive Destinations" },
                      { value: "cta", label: "User Pathways" },
                      { value: "enhance", label: "Enhance Experience" },
                      { value: "app", label: "Mobile App" },
                      { value: "locations", label: "Global Locations" },
                      { value: "testimonials", label: "Testimonials" },
                    ]}
                  />
                )}
              </div>
              <div className="flex-none">
                {activeTab === 'footer' && (
                  <EliteSelect 
                    value={currentFooterSection}
                    onChange={(val) => setCurrentFooterSection(val)}
                    variant="primary"
                    className="w-full md:w-[200px]"
                    options={[
                      { value: "newsletter", label: t.settings.footerTabs?.newsletter || "Newsletter Banner" },
                      { value: "social", label: t.settings.footerTabs?.social || "Social Links" },
                      { value: "links", label: t.settings.footerTabs?.links || "Quick Links" },
                      { value: "text", label: t.settings.footerTabs?.text || "Copyright & Text" },
                    ]}
                  />
                )}
              </div>
              <div className="flex items-center gap-3 ml-auto">
                {(activeTab === 'frontend' || activeTab === 'footer') && (
                   <EliteSelect 
                     value={selectedHeroLang}
                     onChange={(val) => setSelectedHeroLang(val)}
                     variant="primary"
                     className="w-[130px]"
                     options={languages.map(lang => ({ value: lang.code, label: lang.name }))}
                   />
                )}
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-9 px-6 rounded-lg bg-primary text-white font-bold flex items-center gap-2 active:scale-95 transition-all text-xs"
                >
                  {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                  {saving ? t.settings.actions.saving : t.settings.actions.save}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto w-full">
                <TabsContent value="general" className="mt-0 p-4 md:p-6 space-y-8 outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.general.name}</label>
                    <Input
                      value={formData.siteName || ""}
                      onChange={(e) => handleFieldChange('siteName', e.target.value)}
                      className="h-10 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-4 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.general.url}</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input
                        value={formData.siteUrl || ""}
                        onChange={(e) => handleFieldChange('siteUrl', e.target.value)}
                        className="h-10 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 pl-12 pr-4 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.general.logoDark}</label>
                    <div className="flex items-center gap-6">
                      <div className="w-28 h-28 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group/asset transition-all hover:border-primary/30">
                        {formData.logoDark ? (
                          <>
                            <img src={formData.logoDark} alt="Brand" className="w-full h-full object-contain p-4" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button onClick={() => logoDarkInputRef.current?.click()} className="p-2 bg-white rounded-lg text-primary shadow-lg"><Upload size={14} /></button>
                              <button onClick={() => handleFieldChange('logoDark', '')} className="p-2 bg-white rounded-lg text-red-500 shadow-lg"><X size={14} /></button>
                            </div>
                          </>
                        ) : (
                          <button onClick={() => logoDarkInputRef.current?.click()} className="flex flex-col items-center gap-2 text-slate-400 hover:text-primary transition-all">
                            <ImageIcon size={20} />
                            <span className="text-[9px] font-bold uppercase">Upload</span>
                          </button>
                        )}
                        {uploading === 'logoDark' && (
                          <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                            <RefreshCw className="animate-spin text-primary" size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          value={formData.logoDark || ""}
                          placeholder="Path..."
                          onChange={(e) => handleFieldChange('logoDark', e.target.value)}
                          className="h-10 text-[9px] bg-slate-50 rounded-lg px-4"
                        />
                      </div>
                      <input type="file" ref={logoDarkInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoDark')} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.general.logoLight}</label>
                    <div className="flex items-center gap-6">
                      <div className="w-28 h-28 bg-slate-700 rounded-xl border-2 border-dashed border-slate-500 flex flex-col items-center justify-center overflow-hidden relative group/asset transition-all hover:border-white/30">
                        {formData.logoLight ? (
                          <>
                            <img src={formData.logoLight} alt="Brand" className="w-full h-full object-contain p-4" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button onClick={() => logoLightInputRef.current?.click()} className="p-2 bg-white rounded-lg text-primary shadow-lg"><Upload size={14} /></button>
                              <button onClick={() => handleFieldChange('logoLight', '')} className="p-2 bg-white rounded-lg text-red-500 shadow-lg"><X size={14} /></button>
                            </div>
                          </>
                        ) : (
                          <button onClick={() => logoLightInputRef.current?.click()} className="flex flex-col items-center gap-2 text-white/40 hover:text-white transition-all">
                            <ImageIcon size={20} />
                            <span className="text-[9px] font-bold uppercase">Upload</span>
                          </button>
                        )}
                        {uploading === 'logoLight' && (
                          <div className="absolute inset-0 bg-slate-800/90 flex items-center justify-center">
                            <RefreshCw className="animate-spin text-white" size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          value={formData.logoLight || ""}
                          placeholder="Path..."
                          onChange={(e) => handleFieldChange('logoLight', e.target.value)}
                          className="h-10 text-[9px] bg-slate-50 rounded-lg px-4"
                        />
                      </div>
                      <input type="file" ref={logoLightInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoLight')} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.general.favicon}</label>
                    <div className="flex items-center gap-6">
                      <div className="w-28 h-28 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group/asset transition-all hover:border-primary/30">
                        {formData.favicon ? (
                          <>
                            <img src={formData.favicon} alt="Favicon" className="w-10 h-10 object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button onClick={() => faviconInputRef.current?.click()} className="p-2 bg-white rounded-lg text-primary shadow-lg"><Upload size={14} /></button>
                              <button onClick={() => handleFieldChange('favicon', '')} className="p-2 bg-white rounded-lg text-red-500 shadow-lg"><X size={14} /></button>
                            </div>
                          </>
                        ) : (
                          <button onClick={() => faviconInputRef.current?.click()} className="flex flex-col items-center gap-2 text-slate-400 hover:text-primary transition-all">
                            <Smile size={20} />
                            <span className="text-[9px] font-bold uppercase">Upload</span>
                          </button>
                        )}
                        {uploading === 'favicon' && (
                          <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                            <RefreshCw className="animate-spin text-primary" size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          value={formData.favicon || ""}
                          placeholder="Path..."
                          onChange={(e) => handleFieldChange('favicon', e.target.value)}
                          className="h-10 text-[9px] bg-slate-50 rounded-lg px-4"
                        />
                      </div>
                      <input type="file" ref={faviconInputRef} className="hidden" accept="image/*,.ico" onChange={(e) => handleFileUpload(e, 'favicon')} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.general.defaultLanguage}</label>
                    <EliteSelect
                      value={(formData as any).defaultLanguage || "en"}
                      onChange={(val) => handleFieldChange('defaultLanguage', val)}
                      options={languages.map(lang => ({ value: lang.code, label: `${lang.name} (${lang.nativeName})` }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.general.defaultCurrency}</label>
                    <EliteSelect
                      value={(formData as any).defaultCurrency || "USD"}
                      onChange={(val) => handleFieldChange('defaultCurrency', val)}
                      options={currencies.map(curr => ({ value: curr.code, label: `${curr.code} - ${curr.name} (${curr.symbol})` }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.general.timezone}</label>
                    <EliteSelect
                      value={(formData as any).defaultTimezone || "America/New_York"}
                      onChange={(val) => handleFieldChange('defaultTimezone', val)}
                      options={timezones.map(tz => ({ value: tz.value, label: tz.label }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <ColorPickerBox
                    label={t.settings.general.primaryColor}
                    value={formData.primaryColor || '#3f147b'}
                    onChange={(val) => handleFieldChange('primaryColor', val)}
                  />
                  <ColorPickerBox
                    label={t.settings.general.secondaryColor}
                    value={formData.secondaryColor || '#291249'}
                    onChange={(val) => handleFieldChange('secondaryColor', val)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.general.supportEmail}</label>
                    <Input
                      value={formData.email || ""}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="h-10 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-4 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.general.supportPhone}</label>
                    <Input
                      value={formData.phone || ""}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="h-10 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-4 text-sm"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="smtp" className="mt-0 p-4 md:p-6 space-y-6 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-800">{t.settings.smtp.verification}</h4>
                      <p className="text-[9px] text-slate-400 font-medium font-bold uppercase tracking-[0.1em]">{t.settings.smtp.otpDesc}</p>
                    </div>
                    <Switch 
                      checked={formData.emailVerificationEnabled} 
                      onCheckedChange={(val) => handleFieldChange('emailVerificationEnabled', val)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.smtp.host}</label>
                    <Input
                      value={formData.smtpHost || ""}
                      placeholder="smtp.example.com"
                      onChange={(e) => handleFieldChange('smtpHost', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.smtp.port}</label>
                    <Input
                      value={formData.smtpPort || ""}
                      placeholder="587"
                      onChange={(e) => handleFieldChange('smtpPort', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.smtp.user}</label>
                    <Input
                      value={formData.smtpUser || ""}
                      placeholder="user@example.com"
                      onChange={(e) => handleFieldChange('smtpUser', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.smtp.pass}</label>
                    <Input
                      type="password"
                      value={formData.smtpPassword || ""}
                      placeholder="••••••••"
                      onChange={(e) => handleFieldChange('smtpPassword', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.smtp.from}</label>
                    <Input
                      value={formData.smtpFrom || ""}
                      placeholder="noreply@carrentify.com"
                      onChange={(e) => handleFieldChange('smtpFrom', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financials" className="mt-0 p-4 md:p-6 space-y-8 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-4 text-primary">
                      <Wallet size={18} />
                      <h3 className="text-sm font-bold uppercase tracking-tight">{t.settings.financials.balance}</h3>
                    </div>
                    <div className="relative">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <Input
                         type="number"
                         value={formData.walletBalance}
                         onChange={(e) => handleFieldChange('walletBalance', parseFloat(e.target.value))}
                         className="h-12 pl-12 rounded-xl border-slate-200 font-bold text-xl"
                       />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 px-1 tracking-widest">{t.settings.financials.payoutDesc}</p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-4 text-slate-600">
                      <Database size={18} />
                      <h3 className="text-sm font-bold uppercase tracking-tight">{t.settings.financials.payoutMin}</h3>
                    </div>
                    <div className="relative">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <Input
                         type="number"
                         value={formData.minWithdrawalAmount}
                         onChange={(e) => handleFieldChange('minWithdrawalAmount', parseFloat(e.target.value))}
                         className="h-12 pl-12 rounded-xl border-slate-200 font-bold text-xl"
                       />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 px-1 tracking-widest">{t.settings.financials.payoutDesc}</p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-4 text-slate-600">
                      <Percent size={18} />
                      <h3 className="text-sm font-bold uppercase tracking-tight">{t.settings.financials.systemFee}</h3>
                    </div>
                    <div className="relative">
                       <Input
                         type="number"
                         value={formData.commissionRate}
                         onChange={(e) => handleFieldChange('commissionRate', parseFloat(e.target.value))}
                         className="h-12 pr-12 rounded-xl border-slate-200 font-bold text-xl text-center"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 px-1 tracking-widest">{t.settings.financials.feeDesc}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="listings" className="mt-0 p-4 md:p-6 space-y-8 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-4 text-primary">
                      <ImageIcon size={18} />
                      <h3 className="text-sm font-bold uppercase tracking-tight">{t.settings.listings.uploadLimit}</h3>
                    </div>
                    <div className="relative">
                       <Input
                         type="number"
                         value={(formData as any).maxImagesPerListing || 5}
                         onChange={(e) => handleFieldChange('maxImagesPerListing', parseInt(e.target.value) || 1)}
                         className="h-12 rounded-xl border-slate-200 font-bold text-xl text-center"
                       />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 px-1 tracking-widest text-center">{t.settings.listings.limitDesc}</p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-4 text-primary">
                      <LayoutDashboard size={18} />
                      <h3 className="text-sm font-bold uppercase tracking-tight">Pagination Density</h3>
                    </div>
                    <div className="relative">
                       <Input
                         type="number"
                         value={(formData as any).itemsPerPageLimit || 10}
                         onChange={(e) => handleFieldChange('itemsPerPageLimit', parseInt(e.target.value) || 5)}
                         className="h-12 rounded-xl border-slate-200 font-bold text-xl text-center"
                       />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 px-1 tracking-widest text-center">Global record limit per governance table</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="frontend" className="mt-0 p-4 md:p-6 space-y-8 outline-none pb-20">
                {currentSection === 'hero' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Hero Management */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-800">{t.settings.frontend.labels.showHero}</h4>
                          <p className="text-[9px] text-slate-400 font-medium font-bold uppercase tracking-[0.1em]">Activate landing page hero section</p>
                        </div>
                        <Switch 
                          checked={formData.showHeroSection} 
                          onCheckedChange={(val) => handleFieldChange('showHeroSection', val)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
                          {t.settings.frontend.heroTitle} ({selectedHeroLang})
                        </label>
                        <Input
                          value={formData.heroTranslations?.[selectedHeroLang]?.title || ""}
                          onChange={(e) => handleTranslationChange('title', e.target.value)}
                          className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
                           {t.settings.frontend.heroSubtitle} ({selectedHeroLang})
                         </label>
                         <textarea
                           value={formData.heroTranslations?.[selectedHeroLang]?.subtitle || ""}
                           onChange={(e) => handleTranslationChange('subtitle', e.target.value)}
                           className="w-full min-h-[100px] p-6 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                         />
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Hero Section Statistics ({selectedHeroLang})</label>
                        <div className="grid grid-cols-1 gap-4">
                          {[0, 1, 2].map((idx) => (
                            <div key={idx} className="flex gap-3 items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                              <div className="flex-1 space-y-1">
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1">Value</label>
                                <Input 
                                  value={(formData.heroTranslations?.[selectedHeroLang] as any)?.heroStats?.[idx]?.value || ""}
                                  placeholder="500+"
                                  onChange={(e) => handleHeroStatChange(idx, 'value', e.target.value)}
                                  className="h-9 bg-slate-50/50 border-slate-100 font-black text-xs rounded-lg"
                                />
                              </div>
                              <div className="flex-[2] space-y-1">
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1">Label</label>
                                <Input 
                                  value={(formData.heroTranslations?.[selectedHeroLang] as any)?.heroStats?.[idx]?.label || ""}
                                  placeholder="Premium Cars"
                                  onChange={(e) => handleHeroStatChange(idx, 'label', e.target.value)}
                                  className="h-9 bg-slate-50/50 border-slate-100 font-bold text-xs rounded-lg"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t.settings.frontend.heroImage}</label>
                        <div className="flex items-center gap-6">
                          <div className="w-full h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group/asset transition-all hover:border-primary/30">
                            {formData.heroImageUrl ? (
                              <>
                                <img src={formData.heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button onClick={() => heroImageInputRef.current?.click()} className="p-3 bg-white rounded-xl text-primary shadow-lg"><Upload size={18} /></button>
                                  <button onClick={() => handleFieldChange('heroImageUrl', '')} className="p-3 bg-white rounded-xl text-red-500 shadow-lg"><X size={18} /></button>
                                </div>
                              </>
                            ) : (
                              <button onClick={() => heroImageInputRef.current?.click()} className="flex flex-col items-center gap-3 text-slate-400 hover:text-primary transition-all">
                                <ImageIcon size={32} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Upload Hero Asset</span>
                              </button>
                            )}
                            {uploading === 'heroImageUrl' && (
                              <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                                <RefreshCw className="animate-spin text-primary" size={32} />
                              </div>
                            )}
                          </div>
                          <input type="file" ref={heroImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'heroImageUrl')} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentSection === 'header' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                       <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">{t.settings.frontend.navLinks}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">Sync and manage your website header links</p>
                       </div>
                       <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                               const current = formData.headerNavLinks || [];
                               const newId = `link_${Date.now()}`;
                               handleFieldChange('headerNavLinks', [...current, { id: newId, url: "/", target: "_self", label: "New Link" }]);
                               handleNavLabelUpdate(newId, "New Link");
                            }}
                            className="h-9 px-4 rounded-lg border-slate-200 text-slate-900 font-bold text-[10px] uppercase gap-2 hover:bg-slate-50"
                          >
                             <Plus size={14} /> Add Navigation
                          </Button>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <AnimatePresence mode="popLayout">
                          {(formData.headerNavLinks || []).map((link: any, index: number) => {
                             const localLabel = (formData.heroTranslations?.[selectedHeroLang] as any)?.navLabels?.[link.id];
                             const englishLabel = (formData.heroTranslations?.['en'] as any)?.navLabels?.[link.id];
                             const displayValue = localLabel !== undefined ? localLabel : (englishLabel || link.label || "");

                             return (
                               <motion.div 
                                 key={link.id || index}
                                 layout
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 exit={{ opacity: 0, x: 10 }}
                                 className="bg-white p-4 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative group hover:border-primary/20 transition-all"
                               >
                                  <div className="flex-1">
                                     <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Label ({selectedHeroLang})</label>
                                     <Input 
                                       value={displayValue}
                                       placeholder="Enter Translation..."
                                       onChange={(e) => handleNavLabelUpdate(link.id, e.target.value)}
                                       className="h-9 bg-slate-50 border-none font-bold text-xs rounded-xl px-3"
                                     />
                                  </div>

                                  <div className="flex-[2]">
                                     <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">URL / Page Path (Global)</label>
                                     <div className="flex gap-2">
                                        <Input 
                                          value={link.url}
                                          onChange={(e) => handleNavLinkUpdate(index, 'url', e.target.value)}
                                          className="h-9 bg-slate-50 border-none font-bold text-xs flex-1 rounded-xl px-3"
                                        />
                                        <EliteSelect 
                                          value={link.url}
                                          onChange={(val) => handleNavLinkUpdate(index, 'url', val)}
                                          variant="minimal"
                                          placeholder="Pick Page"
                                          className="min-w-[120px]"
                                          options={[
                                             { value: "/", label: "Home" },
                                             { value: "/vehicles", label: "Fleet" },
                                             { value: "/locations", label: "Map" },
                                             { value: "/services", label: "Services" },
                                             ...staticPages.map((p: any) => ({ value: `/p/${p.slug}`, label: `Page: ${p.title}` })),
                                          ]}
                                        />
                                     </div>
                                  </div>

                                  <div className="w-24 text-center">
                                     <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">New Tab</label>
                                     <div className="flex justify-center">
                                        <Switch 
                                           checked={link.target === '_blank'}
                                           onCheckedChange={(val) => handleNavLinkUpdate(index, 'target', val ? '_blank' : '_self')}
                                        />
                                     </div>
                                  </div>

                                  <button 
                                    onClick={() => {
                                       const current = [...formData.headerNavLinks];
                                       current.splice(index, 1);
                                       handleFieldChange('headerNavLinks', current);
                                    }}
                                    className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                  >
                                     <X size={14} />
                                  </button>
                               </motion.div>
                             );
                          })}
                       </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {currentSection === 'brands' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-1">Brands Ecosystem</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Toggle visibility of the scrolling partner marquee</p>
                      </div>
                      <Switch 
                        checked={formData.showBrandsSection}
                        onCheckedChange={(val) => handleFieldChange('showBrandsSection', val)}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                           <div>
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Main Title ({selectedHeroLang})</label>
                              <Input 
                                 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.brandsTitle || ""}
                                 onChange={(e) => {
                                    const current = { ...(formData.heroTranslations || {}) };
                                    if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                    (current as any)[selectedHeroLang].brandsTitle = e.target.value;
                                    handleFieldChange('heroTranslations', current);
                                 }}
                                 placeholder="e.g., Plan your trip"
                                 className="h-11 bg-slate-50 border-none font-bold text-xs rounded-xl px-4 shadow-inner"
                              />
                           </div>
                           <div>
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Subtitle Title ({selectedHeroLang})</label>
                              <Input 
                                 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.brandsSubtitle || ""}
                                 onChange={(e) => {
                                    const current = { ...(formData.heroTranslations || {}) };
                                    if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                    (current as any)[selectedHeroLang].brandsSubtitle = e.target.value;
                                    handleFieldChange('heroTranslations', current);
                                 }}
                                 placeholder="e.g., Explore Our Brands"
                                 className="h-11 bg-slate-50 border-none font-bold text-xs rounded-xl px-4 shadow-inner"
                              />
                           </div>
                           <div>
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Description ({selectedHeroLang})</label>
                              <Textarea 
                                 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.brandsDescription || ""}
                                 onChange={(e) => {
                                    const current = { ...(formData.heroTranslations || {}) };
                                    if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                    (current as any)[selectedHeroLang].brandsDescription = e.target.value;
                                    handleFieldChange('heroTranslations', current);
                                 }}
                                 placeholder="Select your perfect ride from our diverse fleet of premium automotive partners..."
                                 className="min-h-[100px] bg-slate-50 border-none font-bold text-xs rounded-xl p-4 resize-none shadow-inner"
                              />
                           </div>
                        </div>
                    </div>
                  </motion.div>
                )}

                {currentSection === 'featured' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-1">{t.settings.frontend.labels.showCars}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Display top-tier listings on index</p>
                      </div>
                      <Switch 
                        checked={formData.showFeaturedCars} 
                        onCheckedChange={(val) => handleFieldChange('showFeaturedCars', val)}
                      />
                    </div>

                    <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                       <div>
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Section Title ({selectedHeroLang})</label>
                          <Input 
                             value={(formData.heroTranslations?.[selectedHeroLang] as any)?.featuredTitle || ""}
                             onChange={(e) => {
                                const current = { ...(formData.heroTranslations || {}) };
                                if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                (current as any)[selectedHeroLang].featuredTitle = e.target.value;
                                handleFieldChange('heroTranslations', current);
                             }}
                             placeholder="e.g., Featured Fleet"
                             className="h-11 bg-slate-50 border-none font-bold text-xs rounded-xl px-4 shadow-inner"
                          />
                       </div>
                       <div>
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Section Subtitle ({selectedHeroLang})</label>
                          <Input 
                             value={(formData.heroTranslations?.[selectedHeroLang] as any)?.featuredSubtitle || ""}
                             onChange={(e) => {
                                const current = { ...(formData.heroTranslations || {}) };
                                if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                (current as any)[selectedHeroLang].featuredSubtitle = e.target.value;
                                handleFieldChange('heroTranslations', current);
                             }}
                             placeholder="e.g., Premium vehicles available for your next luxury experience."
                             className="h-11 bg-slate-50 border-none font-bold text-xs rounded-xl px-4 shadow-inner"
                          />
                       </div>
                    </div>
                  </motion.div>
                )}

                {currentSection === 'cta' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-1">Dual pathways section</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Toggle visibility of Renter/Host CTA cards</p>
                      </div>
                      <Switch 
                        checked={formData.showCTASection} 
                        onCheckedChange={(val) => handleFieldChange('showCTASection', val)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Renter CTA Card */}
                       <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-3xl flex items-center justify-center text-primary/30">
                             <Users size={24} />
                          </div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Renter pathway</h4>
                          <div className="mb-4">
                             <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Renter Card Image</label>
                             <div className="flex items-center gap-4">
                               <div className="w-20 h-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group/renter transition-all hover:border-primary/30">
                                 {formData.ctaImageRenter ? (
                                   <>
                                     <img src={formData.ctaImageRenter} alt="Renter" className="w-full h-full object-contain p-2" />
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/renter:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                       <button onClick={() => ctaRenterInputRef.current?.click()} className="p-1.5 bg-white rounded-lg text-primary shadow-lg"><Upload size={12} /></button>
                                       <button onClick={() => handleFieldChange('ctaImageRenter', '')} className="p-1.5 bg-white rounded-lg text-red-500 shadow-lg"><X size={12} /></button>
                                     </div>
                                   </>
                                 ) : (
                                   <button onClick={() => ctaRenterInputRef.current?.click()} className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-all">
                                     <ImageIcon size={18} />
                                     <span className="text-[8px] font-bold uppercase">Upload</span>
                                   </button>
                                 )}
                                 {uploading === 'ctaImageRenter' && (
                                   <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                                     <RefreshCw className="animate-spin text-primary" size={16} />
                                   </div>
                                 )}
                               </div>
                               <div className="flex-1 space-y-2">
                                 <Input 
                                    value={formData.ctaImageRenter || ""}
                                    placeholder="Path or Base64..."
                                    onChange={(e) => handleFieldChange('ctaImageRenter', e.target.value)}
                                    className="h-8 text-[9px] bg-slate-50 font-bold border-none"
                                 />
                                 <input type="file" ref={ctaRenterInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'ctaImageRenter')} />
                                 <p className="text-[8px] text-slate-400 italic">Recommended: 1:1 ratio, transparent BG</p>
                                </div>
                              </div>
                           </div>
                          <div>
                             <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Title ({selectedHeroLang})</label>
                             <Input 
                                value={(formData.heroTranslations?.[selectedHeroLang] as any)?.ctaTitleRenter || ""}
                                placeholder="e.g., Finding Your Ideal Match?"
                                onChange={(e) => {
                                   const current = { ...(formData.heroTranslations || {}) };
                                   if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                   (current as any)[selectedHeroLang].ctaTitleRenter = e.target.value;
                                   handleFieldChange('heroTranslations', current);
                                }}
                                className="h-10 bg-slate-50 border-none font-bold text-xs rounded-xl"
                             />
                          </div>
                          <div>
                             <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Subtitle ({selectedHeroLang})</label>
                             <Textarea 
                                value={(formData.heroTranslations?.[selectedHeroLang] as any)?.ctaSubtitleRenter || ""}
                                placeholder="e.g., Explore options for your next vehicle..."
                                onChange={(e) => {
                                   const current = { ...(formData.heroTranslations || {}) };
                                   if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                   (current as any)[selectedHeroLang].ctaSubtitleRenter = e.target.value;
                                   handleFieldChange('heroTranslations', current);
                                }}
                                className="min-h-[80px] bg-slate-50 border-none font-bold text-xs rounded-xl p-4 resize-none"
                             />
                          </div>
                          <div>
                             <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Button Text ({selectedHeroLang})</label>
                             <Input 
                                value={(formData.heroTranslations?.[selectedHeroLang] as any)?.ctaButtonRenter || ""}
                                placeholder="e.g., Explore Options"
                                onChange={(e) => {
                                   const current = { ...(formData.heroTranslations || {}) };
                                   if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                   (current as any)[selectedHeroLang].ctaButtonRenter = e.target.value;
                                   handleFieldChange('heroTranslations', current);
                                }}
                                className="h-10 bg-slate-50 border-none font-bold text-xs rounded-xl"
                             />
                          </div>
                       </div>

                       {/* Host CTA Card */}
                       <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-800/10 rounded-bl-3xl flex items-center justify-center text-slate-800/20">
                             <Car size={24} />
                          </div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-2">Host pathway</h4>
                          <div className="mb-4">
                             <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Host Card Image</label>
                             <div className="flex items-center gap-4">
                               <div className="w-20 h-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group/host transition-all hover:border-primary/30">
                                 {formData.ctaImageHost ? (
                                   <>
                                     <img src={formData.ctaImageHost} alt="Host" className="w-full h-full object-contain p-2" />
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/host:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                       <button onClick={() => ctaHostInputRef.current?.click()} className="p-1.5 bg-white rounded-lg text-primary shadow-lg"><Upload size={12} /></button>
                                       <button onClick={() => handleFieldChange('ctaImageHost', '')} className="p-1.5 bg-white rounded-lg text-red-500 shadow-lg"><X size={12} /></button>
                                     </div>
                                   </>
                                 ) : (
                                   <button onClick={() => ctaHostInputRef.current?.click()} className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-all">
                                     <ImageIcon size={18} />
                                     <span className="text-[8px] font-bold uppercase">Upload</span>
                                   </button>
                                 )}
                                 {uploading === 'ctaImageHost' && (
                                   <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                                     <RefreshCw className="animate-spin text-primary" size={16} />
                                   </div>
                                 )}
                               </div>
                               <div className="flex-1 space-y-2">
                                 <Input 
                                    value={formData.ctaImageHost || ""}
                                    placeholder="Path or Base64..."
                                    onChange={(e) => handleFieldChange('ctaImageHost', e.target.value)}
                                    className="h-8 text-[9px] bg-slate-50 font-bold border-none"
                                 />
                                 <input type="file" ref={ctaHostInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'ctaImageHost')} />
                                 <p className="text-[8px] text-slate-500 italic">Recommended: 1:1 ratio, transparent BG</p>
                                </div>
                              </div>
                           </div>
                          <div>
                             <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Title ({selectedHeroLang})</label>
                             <Input 
                                value={(formData.heroTranslations?.[selectedHeroLang] as any)?.ctaTitleHost || ""}
                                placeholder="e.g., Managing Your Car Journey?"
                                onChange={(e) => {
                                   const current = { ...(formData.heroTranslations || {}) };
                                   if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                   (current as any)[selectedHeroLang].ctaTitleHost = e.target.value;
                                   handleFieldChange('heroTranslations', current);
                                }}
                                className="h-10 bg-slate-50 border-none font-bold text-xs rounded-xl"
                             />
                          </div>
                          <div>
                             <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Subtitle ({selectedHeroLang})</label>
                             <Textarea 
                                value={(formData.heroTranslations?.[selectedHeroLang] as any)?.ctaSubtitleHost || ""}
                                placeholder="e.g., Unlock tools to track, manage, or find a new home..."
                                onChange={(e) => {
                                   const current = { ...(formData.heroTranslations || {}) };
                                   if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                   (current as any)[selectedHeroLang].ctaSubtitleHost = e.target.value;
                                   handleFieldChange('heroTranslations', current);
                                }}
                                className="min-h-[80px] bg-slate-50 border-none font-bold text-xs rounded-xl p-4 resize-none"
                             />
                          </div>
                          <div>
                             <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Button Text ({selectedHeroLang})</label>
                             <Input 
                                value={(formData.heroTranslations?.[selectedHeroLang] as any)?.ctaButtonHost || ""}
                                placeholder="e.g., List Your Car"
                                onChange={(e) => {
                                   const current = { ...(formData.heroTranslations || {}) };
                                   if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                   (current as any)[selectedHeroLang].ctaButtonHost = e.target.value;
                                   handleFieldChange('heroTranslations', current);
                                }}
                                className="h-10 bg-slate-50 border-none font-bold text-xs rounded-xl"
                             />
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}

                {currentSection === 'locations' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-1">Global Locations Section</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage visibility and content of the map section</p>
                      </div>
                      <Switch 
                        checked={formData.showLocationsSection} 
                        onCheckedChange={(val) => handleFieldChange('showLocationsSection', val)}
                      />
                    </div>

                    <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Locations Title ({selectedHeroLang})</label>
                          <Input 
                             value={(formData.heroTranslations?.[selectedHeroLang] as any)?.locationsTitle || ""}
                             placeholder="e.g., Find us globally"
                             onChange={(e) => {
                                const current = { ...(formData.heroTranslations || {}) };
                                if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                (current as any)[selectedHeroLang].locationsTitle = e.target.value;
                                handleFieldChange('heroTranslations', current);
                             }}
                             className="h-12 bg-slate-50 border-none font-bold text-sm rounded-xl"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Locations Subtitle ({selectedHeroLang})</label>
                          <Textarea 
                             value={(formData.heroTranslations?.[selectedHeroLang] as any)?.locationsSubtitle || ""}
                             placeholder="e.g., We have premium locations in all major cities..."
                             onChange={(e) => {
                                const current = { ...(formData.heroTranslations || {}) };
                                if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                (current as any)[selectedHeroLang].locationsSubtitle = e.target.value;
                                handleFieldChange('heroTranslations', current);
                             }}
                             className="min-h-[100px] bg-slate-50 border-none font-bold text-sm rounded-xl p-4 resize-none"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Button Text ({selectedHeroLang})</label>
                          <Input 
                             value={(formData.heroTranslations?.[selectedHeroLang] as any)?.locationsButton || ""}
                             placeholder="e.g., View All Locations"
                             onChange={(e) => {
                                const current = { ...(formData.heroTranslations || {}) };
                                if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                (current as any)[selectedHeroLang].locationsButton = e.target.value;
                                handleFieldChange('heroTranslations', current);
                             }}
                             className="h-12 bg-slate-50 border-none font-bold text-sm rounded-xl"
                          />
                       </div>
                    </div>
                  </motion.div>
                )}

                {currentSection === 'testimonials' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-1">{t.settings.frontend.labels.showTestimonials}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Display verification testimonials</p>
                      </div>
                      <Switch 
                        checked={formData.showTestimonials} 
                        onCheckedChange={(val) => handleFieldChange('showTestimonials', val)}
                      />
                    </div>

                    <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                       <div>
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Upper Title ({selectedHeroLang})</label>
                          <Input 
                             value={(formData.heroTranslations?.[selectedHeroLang] as any)?.testimonialsTitle || ""}
                             onChange={(e) => {
                                const current = { ...(formData.heroTranslations || {}) };
                                if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                (current as any)[selectedHeroLang].testimonialsTitle = e.target.value;
                                handleFieldChange('heroTranslations', current);
                             }}
                             placeholder="e.g., What Our Clients Say"
                             className="h-11 bg-slate-50 border-none font-bold text-xs rounded-xl px-4 shadow-inner"
                          />
                       </div>
                       <div>
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Main Heading ({selectedHeroLang})</label>
                          <Input 
                             value={(formData.heroTranslations?.[selectedHeroLang] as any)?.testimonialsSubtitle || ""}
                             onChange={(e) => {
                                const current = { ...(formData.heroTranslations || {}) };
                                if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                (current as any)[selectedHeroLang].testimonialsSubtitle = e.target.value;
                                handleFieldChange('heroTranslations', current);
                             }}
                             placeholder="e.g., Trusted by Thousands"
                             className="h-11 bg-slate-50 border-none font-bold text-xs rounded-xl px-4 shadow-inner"
                          />
                       </div>
                       <div>
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Short Description ({selectedHeroLang})</label>
                          <Input 
                             value={(formData.heroTranslations?.[selectedHeroLang] as any)?.testimonialsDescription || ""}
                             onChange={(e) => {
                                const current = { ...(formData.heroTranslations || {}) };
                                if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                (current as any)[selectedHeroLang].testimonialsDescription = e.target.value;
                                handleFieldChange('heroTranslations', current);
                             }}
                             placeholder="e.g., Real stories from real CarRentify clients around the world."
                             className="h-11 bg-slate-50 border-none font-bold text-xs rounded-xl px-4 shadow-inner"
                          />
                       </div>
                    </div>
                  </motion.div>
                )}

                {currentSection === 'enhance' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-1">Enhance Experience Section</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Section for accessories and premium services</p>
                      </div>
                      <Switch 
                        checked={formData.showEnhanceSection !== false} 
                        onCheckedChange={(val) => handleFieldChange('showEnhanceSection', val)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Content Details</h4>
                          <div className="space-y-4">
                             <div>
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Main Title ({selectedHeroLang})</label>
                                <Input 
                                   value={(formData.heroTranslations?.[selectedHeroLang] as any)?.enhanceTitle || ""}
                                   onChange={(e) => {
                                      const current = { ...(formData.heroTranslations || {}) };
                                      if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                      (current as any)[selectedHeroLang].enhanceTitle = e.target.value;
                                      handleFieldChange('heroTranslations', current);
                                   }}
                                   className="h-10 bg-slate-50 border-none font-bold text-xs rounded-xl"
                                />
                             </div>
                             <div>
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Sub-Description ({selectedHeroLang})</label>
                                <Textarea 
                                   value={(formData.heroTranslations?.[selectedHeroLang] as any)?.enhanceSubtitle || ""}
                                   onChange={(e) => {
                                      const current = { ...(formData.heroTranslations || {}) };
                                      if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                      (current as any)[selectedHeroLang].enhanceSubtitle = e.target.value;
                                      handleFieldChange('heroTranslations', current);
                                   }}
                                   className="min-h-[100px] bg-slate-50 border-none font-bold text-xs rounded-xl p-4 resize-none"
                                />
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Section Media</h4>
                          <div className="space-y-4">
                             <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Experience Feature Image</label>
                             <div className="w-full h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group/enhance transition-all hover:border-primary/30">
                                {formData.enhanceImage ? (
                                  <>
                                    <img src={formData.enhanceImage} alt="Enhance" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/enhance:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <button onClick={() => enhanceImageInputRef.current?.click()} className="p-3 bg-white rounded-xl text-primary shadow-lg"><Upload size={18} /></button>
                                      <button onClick={() => handleFieldChange('enhanceImage', '')} className="p-3 bg-white rounded-xl text-red-500 shadow-lg"><X size={18} /></button>
                                    </div>
                                  </>
                                ) : (
                                  <button onClick={() => enhanceImageInputRef.current?.click()} className="flex flex-col items-center gap-3 text-slate-400 hover:text-primary transition-all">
                                    <ImageIcon size={32} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Upload Experience Photo</span>
                                  </button>
                                )}
                                {uploading === 'enhanceImage' && (
                                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                                    <RefreshCw className="animate-spin text-primary" size={32} />
                                  </div>
                                )}
                             </div>
                             <Input 
                                value={formData.enhanceImage || ""}
                                placeholder="Path or Base64..."
                                onChange={(e) => handleFieldChange('enhanceImage', e.target.value)}
                                className="h-9 bg-slate-50 border-none font-bold text-[10px] rounded-lg"
                             />
                             <input type="file" ref={enhanceImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'enhanceImage')} />
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}

                {currentSection === 'app' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-1">Mobile App Download Section</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Promote your iOS and Android drive apps</p>
                      </div>
                      <Switch 
                        checked={formData.showAppSection !== false} 
                        onCheckedChange={(val) => handleFieldChange('showAppSection', val)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Marketing Copy</h4>
                          <div className="space-y-4">
                             <div>
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">App Title ({selectedHeroLang})</label>
                                <Input 
                                   value={(formData.heroTranslations?.[selectedHeroLang] as any)?.appTitle || ""}
                                   onChange={(e) => {
                                      const current = { ...(formData.heroTranslations || {}) };
                                      if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                      (current as any)[selectedHeroLang].appTitle = e.target.value;
                                      handleFieldChange('heroTranslations', current);
                                   }}
                                   className="h-10 bg-slate-50 border-none font-bold text-xs rounded-xl"
                                />
                             </div>
                             <div>
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Detailed Description ({selectedHeroLang})</label>
                                <Textarea 
                                   value={(formData.heroTranslations?.[selectedHeroLang] as any)?.appSubtitle || ""}
                                   onChange={(e) => {
                                      const current = { ...(formData.heroTranslations || {}) };
                                      if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                      (current as any)[selectedHeroLang].appSubtitle = e.target.value;
                                      handleFieldChange('heroTranslations', current);
                                   }}
                                   className="min-h-[120px] bg-slate-50 border-none font-bold text-xs rounded-xl p-4 resize-none"
                                />
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Display Mockup</h4>
                          <div className="space-y-4">
                             <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Phone / App Image</label>
                             <div className="w-full h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group/app transition-all hover:border-primary/30">
                                {formData.appImage ? (
                                  <>
                                    <img src={formData.appImage} alt="App" className="w-full h-full object-contain p-4" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/app:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <button onClick={() => appImageInputRef.current?.click()} className="p-3 bg-white rounded-xl text-primary shadow-lg"><Upload size={18} /></button>
                                      <button onClick={() => handleFieldChange('appImage', '')} className="p-3 bg-white rounded-xl text-red-500 shadow-lg"><X size={18} /></button>
                                    </div>
                                  </>
                                ) : (
                                  <button onClick={() => appImageInputRef.current?.click()} className="flex flex-col items-center gap-3 text-slate-400 hover:text-primary transition-all">
                                    <ImageIcon size={32} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Upload Device Mockup</span>
                                  </button>
                                )}
                                {uploading === 'appImage' && (
                                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                                    <RefreshCw className="animate-spin text-primary" size={32} />
                                  </div>
                                )}
                             </div>
                             <Input 
                                value={formData.appImage || ""}
                                placeholder="/app-mockup.png"
                                onChange={(e) => handleFieldChange('appImage', e.target.value)}
                                className="h-9 bg-slate-50 border-none font-bold text-[10px] rounded-lg"
                             />
                             <input type="file" ref={appImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'appImage')} />
                          </div>
                       </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">App Store Settings</h4>
                           <div className="space-y-4">
                              <div>
                                 <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Button Label ({selectedHeroLang})</label>
                                 <Input 
                                    value={(formData.heroTranslations?.[selectedHeroLang] as any)?.appStoreLabel || ""}
                                    onChange={(e) => {
                                       const current = { ...(formData.heroTranslations || {}) };
                                       if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                       (current as any)[selectedHeroLang].appStoreLabel = e.target.value;
                                       handleFieldChange('heroTranslations', current);
                                    }}
                                    className="h-10 bg-slate-50 border-none font-bold text-xs rounded-xl"
                                 />
                              </div>
                              <div>
                                 <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Redirect URL</label>
                                 <Input 
                                    value={(formData as any).appStoreLink || ""}
                                    onChange={(e) => handleFieldChange('appStoreLink', e.target.value)}
                                    placeholder="https://apple.com/app-store"
                                    className="h-10 bg-slate-50 border-none font-bold text-xs rounded-xl"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Google Play Settings</h4>
                           <div className="space-y-4">
                              <div>
                                 <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Button Label ({selectedHeroLang})</label>
                                 <Input 
                                    value={(formData.heroTranslations?.[selectedHeroLang] as any)?.googlePlayLabel || ""}
                                    onChange={(e) => {
                                       const current = { ...(formData.heroTranslations || {}) };
                                       if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                       (current as any)[selectedHeroLang].googlePlayLabel = e.target.value;
                                       handleFieldChange('heroTranslations', current);
                                    }}
                                    className="h-10 bg-slate-50 border-none font-bold text-xs rounded-xl"
                                 />
                              </div>
                              <div>
                                 <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Redirect URL</label>
                                 <Input 
                                    value={(formData as any).googlePlayLink || ""}
                                    onChange={(e) => handleFieldChange('googlePlayLink', e.target.value)}
                                    placeholder="https://play.google.com/store"
                                    className="h-10 bg-slate-50 border-none font-bold text-xs rounded-xl"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  </motion.div>
                )}

              </TabsContent>

              <TabsContent value="footer" className="mt-0 p-4 md:p-6 space-y-6 outline-none">
                {currentFooterSection === 'social' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                     <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                           <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-1">Social Networks</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your custom social links</p>
                        </div>
                        <Button 
                           onClick={() => {
                              const links = [...((formData as any).socialLinks || [])];
                              links.push({ id: `social_${Date.now()}`, icon: '', url: '' });
                              handleFieldChange('socialLinks', links);
                           }}
                           className="h-9 px-4 rounded-xl bg-primary text-[10px] font-bold tracking-widest uppercase text-white shadow-lg flex-shrink-0"
                        >
                           + Add Platform
                        </Button>
                     </div>
                     <div className="space-y-4">
                        {((formData as any).socialLinks || []).map((social: any, idx: number) => (
                           <div key={social.id || idx} className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative group items-center">
                              <div className="flex-none">
                                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 px-1 mb-1 block text-center">Icon</label>
                                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden relative group/icon shadow-inner">
                                   {social.icon ? (
                                      <img src={social.icon} className="w-6 h-6 object-contain" alt="social icon" />
                                   ) : (
                                      <div className="text-[8px] font-bold text-slate-300">LOGO</div>
                                   )}
                                   <input 
                                      type="file" 
                                      className="absolute inset-0 opacity-0 cursor-pointer" 
                                      accept="image/*"
                                      onChange={(e) => {
                                         const file = e.target.files?.[0];
                                         if(!file) return;
                                         
                                         const reader = new FileReader();
                                         reader.onload = (event) => {
                                            const img = new Image();
                                            img.onload = () => {
                                               const minSize = 50;
                                               const targetSize = 128; // Standard icon size for UI
                                               
                                               if (img.width < minSize || img.height < minSize) {
                                                  alert(`Icon image is too small (${img.width}x${img.height}px). For a premium look, please upload an image at least ${minSize}x${minSize}px.`);
                                                  return;
                                               }
                                               
                                               // Always resize/compress to target size for consistency and performance
                                               const canvas = document.createElement('canvas');
                                               canvas.width = targetSize;
                                               canvas.height = targetSize;
                                               const ctx = canvas.getContext('2d');
                                               if (ctx) {
                                                  // Center and scale to fill
                                                  const scale = Math.max(targetSize / img.width, targetSize / img.height);
                                                  const x = (targetSize / 2) - (img.width / 2) * scale;
                                                  const y = (targetSize / 2) - (img.height / 2) * scale;
                                                  
                                                  // Use high quality interpolation
                                                  ctx.imageSmoothingEnabled = true;
                                                  ctx.imageSmoothingQuality = 'high';
                                                  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                                                  
                                                  const optimizedDataUrl = canvas.toDataURL('image/png', 0.8);
                                                  const links = [...(formData as any).socialLinks];
                                                  links[idx].icon = optimizedDataUrl;
                                                  handleFieldChange('socialLinks', links);
                                               }
                                            };
                                            img.src = event.target?.result as string;
                                         };
                                         reader.readAsDataURL(file);
                                      }}
                                   />
                                </div>
                              </div>
                              <div className="flex-1 w-full">
                                 <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 px-1 mb-1 block">Platform URL</label>
                                 <Input 
                                    value={social.url || ""}
                                    onChange={(e) => {
                                       const links = [...(formData as any).socialLinks];
                                       links[idx].url = e.target.value;
                                       handleFieldChange('socialLinks', links);
                                    }}
                                    placeholder="https://"
                                    className="h-12 bg-slate-50 border-none font-bold text-xs rounded-xl"
                                 />
                              </div>
                              <button 
                                 onClick={() => {
                                    const links = [...(formData as any).socialLinks];
                                    links.splice(idx, 1);
                                    handleFieldChange('socialLinks', links);
                                 }}
                                 className="w-10 h-10 mt-4 md:mt-2 rounded-xl bg-red-50 text-red-500 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0"
                              >
                                 <X size={16} />
                              </button>
                           </div>
                        ))}
                        {(!(formData as any).socialLinks || (formData as any).socialLinks.length === 0) && (
                           <div className="py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                             <Share2 size={24} className="mb-2 opacity-20" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">No social platforms</span>
                           </div>
                        )}
                     </div>
                  </motion.div>
                )}

                {currentFooterSection === 'links' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                     <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                           <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-1">Quick Links</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage footer navigation links</p>
                        </div>
                        <Button 
                           onClick={() => {
                              const links = [...((formData as any).footerLinks || [])];
                              links.push({ id: `footer_link_${Date.now()}`, label: 'New Link', url: '#' });
                              handleFieldChange('footerLinks', links);
                           }}
                           className="h-9 px-4 rounded-xl bg-primary text-[10px] font-bold tracking-widest uppercase text-white shadow-lg"
                        >
                           + Add Link
                        </Button>
                     </div>
                     <div className="space-y-3">
                        {(formData as any).footerLinks && (formData as any).footerLinks.map((link: any, idx: number) => (
                           <div key={idx} className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative group items-center">
                              <div className="flex-1 w-full">
                                 <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 px-1 mb-1 block">Translation Label ({selectedHeroLang})</label>
                                 <Input 
                                    value={
                                       selectedHeroLang === 'en' 
                                          ? (link.label || "")
                                          : ((formData.heroTranslations?.[selectedHeroLang] as any)?.navLabels?.[link.id || `f_${idx}`] || "")
                                    }
                                    onChange={(e) => {
                                       if(selectedHeroLang === 'en') {
                                          const links = [...(formData as any).footerLinks];
                                          links[idx].label = e.target.value;
                                          handleFieldChange('footerLinks', links);
                                       } else {
                                          const current = { ...(formData.heroTranslations || {}) };
                                          if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = { navLabels: {} };
                                          if (!(current as any)[selectedHeroLang].navLabels) (current as any)[selectedHeroLang].navLabels = {};
                                          (current as any)[selectedHeroLang].navLabels[link.id || `f_${idx}`] = e.target.value;
                                          handleFieldChange('heroTranslations', current);
                                       }
                                    }}
                                    className="h-10 bg-slate-50 border-none font-bold text-xs rounded-xl"
                                 />
                              </div>
                              <div className="flex-1 w-full">
                                 <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 px-1 mb-1 block">URL Path</label>
                                 <Input 
                                    value={link.url || ""}
                                    onChange={(e) => {
                                       const links = [...(formData as any).footerLinks];
                                       links[idx].url = e.target.value;
                                       handleFieldChange('footerLinks', links);
                                    }}
                                    className="h-10 bg-slate-50 border-none font-bold text-xs rounded-xl"
                                 />
                              </div>
                              <button 
                                 onClick={() => {
                                    const links = [...(formData as any).footerLinks];
                                    links.splice(idx, 1);
                                    handleFieldChange('footerLinks', links);
                                 }}
                                 className="w-10 h-10 mt-4 md:mt-2 rounded-xl bg-red-50 text-red-500 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0"
                              >
                                 <X size={16} />
                              </button>
                           </div>
                        ))}
                        {(!(formData as any).footerLinks || (formData as any).footerLinks.length === 0) && (
                           <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                             <LinkIcon size={32} className="mb-3 opacity-20" />
                             <span className="text-xs font-bold uppercase tracking-widest text-slate-300">No quick links added</span>
                           </div>
                        )}
                     </div>
                  </motion.div>
                )}

                {currentFooterSection === 'text' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="space-y-2 max-w-xl">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Copyright Disclaimer ({selectedHeroLang})</label>
                      <Input
                        value={
                           selectedHeroLang === 'en'
                              ? (formData.copyright || "")
                              : ((formData.heroTranslations?.[selectedHeroLang] as any)?.copyright || "")
                        }
                        onChange={(e) => {
                           if (selectedHeroLang === 'en') {
                              handleFieldChange('copyright', e.target.value);
                           } else {
                              const current = { ...(formData.heroTranslations || {}) };
                              if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                              (current as any)[selectedHeroLang].copyright = e.target.value;
                              handleFieldChange('heroTranslations', current);
                           }
                        }}
                        className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                      />
                    </div>
                  </motion.div>
                )}

                {currentFooterSection === 'newsletter' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                     <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                           <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-1">Newsletter Setup</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Collect emails directly above your footer</p>
                        </div>
                        <Switch 
                           checked={(formData as any).showNewsletter ?? true} 
                           onCheckedChange={(val) => handleFieldChange('showNewsletter', val)}
                        />
                     </div>
                     <div className="grid grid-cols-1 gap-6 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Heading ({selectedHeroLang})</label>
                           <Input 
                              value={(formData.heroTranslations?.[selectedHeroLang] as any)?.newsletterTitle || ""}
                              onChange={(e) => {
                                 const current = { ...(formData.heroTranslations || {}) };
                                 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
                                 (current as any)[selectedHeroLang].newsletterTitle = e.target.value;
                                 handleFieldChange('heroTranslations', current);
                              }}
                              className="h-12 bg-slate-50 border-none font-bold text-sm rounded-xl"
                           />
                        </div>
                     </div>
                  </motion.div>
                )}
              </TabsContent>
            </div>
          </div>
        </div>
      </Tabs>
      </div>
    </motion.div>
  );
}
