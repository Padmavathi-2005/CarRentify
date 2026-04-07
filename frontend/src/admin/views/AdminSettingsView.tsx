"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Share2, Bell, ShieldCheck,
  Save, RefreshCw, Layout,
  Database, Heart, Users,
  Link as LinkIcon, Image as ImageIcon, Smile, Upload, X, Check, Droplet, Mail
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import Switch from "../../components/ui/switch";
import { useSettings } from "../../components/ThemeProvider";

import "../styles/AdminSettingsView.css";
const backendUrl = "http://localhost:3001";
 

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

export default function AdminSettingsView() {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const [currencies, setCurrencies] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [timezones, setTimezones] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${backendUrl}/settings/meta/currencies`).then(res => res.json()),
      fetch(`${backendUrl}/settings/meta/languages`).then(res => res.json()),
      fetch(`${backendUrl}/settings/meta/timezones`).then(res => res.json())
    ]).then(([cur, lang, tz]) => {
      setCurrencies(cur || []);
      setLanguages(lang || []);
      setTimezones(tz || []);
    }).catch(err => console.log('Failed to load meta:', err));
  }, []);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings(formData);
    setSaving(false);
  };

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleFieldChange(field, base64String);
      setUploading(null);
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
    <motion.div {...fadeInUp} className="w-full h-full flex flex-col p-2">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-1 border border-slate-200 flex flex-col">
        <Tabs defaultValue="general" className="flex flex-col md:flex-row h-full">
          {/* Engineered Modular CSS Sidebar */}
          <TabsList className="admin-sidebar-list">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-2">Settings</div>
            {[
              { id: "general", label: "Site Settings", icon: Layout },
              { id: "social", label: "Social", icon: Share2 },
              { id: "notifications", label: "Nodes", icon: Bell },
              { id: "smtp", label: "Email SMTP", icon: Mail },
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
            <div className="h-14 border-b border-slate-50 px-6 flex items-center justify-between bg-slate-50/20 backdrop-blur-sm sticky top-0 z-30">
              <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none">Autonomous Configuration</h2>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-9 px-6 rounded-lg bg-primary text-white font-bold flex items-center gap-2 active:scale-95 transition-all text-xs"
              >
                {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                {saving ? "Syncing..." : "Save"}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="general" className="mt-0 p-6 space-y-8 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Name</label>
                    <Input
                      value={formData.siteName || ""}
                      onChange={(e) => handleFieldChange('siteName', e.target.value)}
                      className="h-10 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-4 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">URL</label>
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Logo (Dark)</label>
                    <div className="flex items-center gap-6">
                      <div className="w-28 h-28 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group/asset transition-all hover:border-primary/30">
                        {formData.logoDark ? (
                          <>
                            <img src={formData.logoDark} alt="Brand" className="w-full h-full object-contain p-4" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button onClick={() => logoInputRef.current?.click()} className="p-2 bg-white rounded-lg text-primary shadow-lg"><Upload size={14} /></button>
                              <button onClick={() => handleFieldChange('logoDark', '')} className="p-2 bg-white rounded-lg text-red-500 shadow-lg"><X size={14} /></button>
                            </div>
                          </>
                        ) : (
                          <button onClick={() => logoInputRef.current?.click()} className="flex flex-col items-center gap-2 text-slate-400 hover:text-primary transition-all">
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
                      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoDark')} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Favicon</label>
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

                {/* Localization Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Default Language</label>
                    <select
                      value={(formData as any).defaultLanguage || "en"}
                      onChange={(e) => handleFieldChange('defaultLanguage', e.target.value)}
                      className="w-full h-10 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-4 text-sm appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name} ({lang.nativeName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Default Currency</label>
                    <select
                      value={(formData as any).defaultCurrency || "USD"}
                      onChange={(e) => handleFieldChange('defaultCurrency', e.target.value)}
                      className="w-full h-10 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-4 text-sm appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      {currencies.map(curr => (
                         <option key={curr.code} value={curr.code}>
                            {curr.code} - {curr.name} ({curr.symbol})
                         </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Platform Timezone</label>
                    <select
                      value={(formData as any).defaultTimezone || "America/New_York"}
                      onChange={(e) => handleFieldChange('defaultTimezone', e.target.value)}
                      className="w-full h-10 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-4 text-sm appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      {timezones.map(tz => (
                         <option key={tz.value} value={tz.value}>
                            {tz.label}
                         </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <ColorPickerBox
                    label="Primary Color"
                    value={formData.primaryColor || '#3f147b'}
                    onChange={(val) => handleFieldChange('primaryColor', val)}
                  />
                  <ColorPickerBox
                    label="Secondary Hue"
                    value={formData.secondaryColor || '#291249'}
                    onChange={(val) => handleFieldChange('secondaryColor', val)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="social" className="mt-0 p-6 space-y-6 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { id: 'facebook', label: 'Meta Protocol', placeholder: 'https://facebook.com/...' },
                    { id: 'instagram', label: 'Visual Stream', placeholder: 'https://instagram.com/...' },
                    { id: 'linkedin', label: 'Pro Network', placeholder: 'https://linkedin.com/...' },
                    { id: 'twitter', label: 'Signal Stream', placeholder: 'https://twitter.com/...' },
                  ].map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{field.label}</label>
                      <Input
                        value={(formData as any)[field.id] || ""}
                        placeholder={field.placeholder}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 p-6 space-y-6 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Support Channel (Email)</label>
                    <Input
                      value={(formData as any).email || ""}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Direct Protocol (Phone)</label>
                    <Input
                      value={(formData as any).phone || ""}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Copyright Signature</label>
                    <Input
                      value={(formData as any).copyright || ""}
                      onChange={(e) => handleFieldChange('copyright', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="smtp" className="mt-0 p-6 space-y-6 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">SMTP Host</label>
                    <Input
                      value={(formData as any).smtpHost || ""}
                      placeholder="smtp.example.com"
                      onChange={(e) => handleFieldChange('smtpHost', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">SMTP Port</label>
                    <Input
                      value={(formData as any).smtpPort || ""}
                      placeholder="587"
                      onChange={(e) => handleFieldChange('smtpPort', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">SMTP Username</label>
                    <Input
                      value={(formData as any).smtpUser || ""}
                      placeholder="user@example.com"
                      onChange={(e) => handleFieldChange('smtpUser', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">SMTP Password</label>
                    <Input
                      type="password"
                      value={(formData as any).smtpPassword || ""}
                      placeholder="••••••••"
                      onChange={(e) => handleFieldChange('smtpPassword', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">From Email Address</label>
                    <Input
                      value={(formData as any).smtpFrom || ""}
                      placeholder="noreply@carrentify.com"
                      onChange={(e) => handleFieldChange('smtpFrom', e.target.value)}
                      className="h-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 px-6 text-sm"
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
}
