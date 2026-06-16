"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
 User, 
 Mail, 
 ShieldCheck, 
 Camera, 
 Lock, 
 CheckCircle2, 
 AlertCircle,
 Link as LinkIcon,
 Globe,
 Share2,
 ChevronRight,
 Loader2,
 Trash2,
 MapPin,
 Eye,
 Settings,
 Repeat,
  Edit3,
  Upload,
  ChevronDown,
  LocateFixed,
  ArrowRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/ui/modal";
import { useAuth } from "@/components/AuthContext";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import Link from "next/link";
import { authService } from "@/services/authService";
import { useLocale } from "@/components/LocaleContext";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import { useToast } from "@/components/Toast";

 export default function ProfileView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  const { user, setUser, setShowVerifModal } = useAuth();
 const { showToast } = useToast();
 const { t } = useLocale();
 const [loading, setLoading] = useState(false);
 const [success, setSuccess] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [verifStatus, setVerifStatus] = useState<any>(null);
 const [passData, setPassData] = useState({
 currentPassword: "",
 newPassword: "",
 confirmPassword: ""
 });
 const [passLoading, setPassLoading] = useState(false);
 const [passError, setPassError] = useState<string | null>(null);
 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [verifyingProvider, setVerifyingProvider] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    displayName: user?.displayName || "",
    slug: user?.slug || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

 const [selectedImage, setSelectedImage] = useState<File | null>(null);
 const [previewUrl, setPreviewUrl] = useState<string | null>(null);
 const [previewedArtifact, setPreviewedArtifact] = useState<any>(null);
 const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
 
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
 
  const COUNTRIES = [
    { id: 'in', name: 'India', code: '+91', flag: '🇮🇳' },
    { id: 'ae', name: 'UAE', code: '+971', flag: '🇦🇪' },
    { id: 'us', name: 'USA', code: '+1', flag: '🇺🇸' },
    { id: 'uk', name: 'UK', code: '+44', flag: '🇬🇧' },
    { id: 'ca', name: 'Canada', code: '+1', flag: '🇨🇦' },
    { id: 'au', name: 'Australia', code: '+61', flag: '🇦🇺' },
    { id: 'de', name: 'Germany', code: '+49', flag: '🇩🇪' },
    { id: 'fr', name: 'France', code: '+33', flag: '🇫🇷' },
  ];

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [openCountry, setOpenCountry] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setOpenCountry(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Check url for updateLicense
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('updateLicense') === 'true') {
        setShowVerifModal(true);
      }
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const fetchAddressSuggestions = async (query: string) => {
  if (query.length < 3) {
  setAddressSuggestions([]);
  return;
  }
  setIsSearchingAddress(true);
  try {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}&limit=5`);
  if (res.ok) {
  const data = await res.json();
  setAddressSuggestions(data);
  }
  } catch (err) {
  console.error("OSM Fetch error:", err);
  } finally {
  setIsSearchingAddress(false);
  }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        if (res.ok) {
          const data = await res.json();
          if (data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
            setAddressSuggestions([]);
          }
        }
      } catch (err) {
        setError("Failed to fetch address from current location");
      } finally {
        setIsLocating(false);
      }
    }, (err) => {
      setError("Could not get your location. Please check browser permissions.");
      setIsLocating(false);
    });
  };

 useEffect(() => {
 if (user) {
  setFormData({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    displayName: user.displayName || "",
    slug: user.slug || "",
    phone: user.phone || "",
    address: user.address || "",
  });
 if (user.profileImage) {
 setPreviewUrl(user.profileImage.startsWith('http') ? user.profileImage : user.profileImage);
 }
 fetchVerifStatus();
 }
 }, [user]);

 const fetchVerifStatus = async () => {
 try {
 const token = localStorage.getItem('token');
 const res = await fetch(`${API_BASE_URL}/verification/my-status`, {
 headers: { 'Authorization': `Bearer ${token}` }
 });
 if (res.ok) {
 setVerifStatus(await res.json());
 }
 } catch (err) {
 console.error("Failed to fetch verif status:", err);
 }
 };

 const handleChangePassword = async (e: React.FormEvent) => {
 e.preventDefault();
 setPassLoading(true);
 setPassError(null);

 // Frontend validation
 if (passData.newPassword.length < 6) {
 setPassError(t('dashboard.profile.messages.pass_min_len'));
 setPassLoading(false);
 return;
 }
 if (passData.newPassword !== passData.confirmPassword) {
 setPassError(t('dashboard.profile.messages.pass_mismatch'));
 setPassLoading(false);
 return;
 }

 try {
 await (authService as any).changePassword(passData);
 showToast(t('dashboard.profile.messages.pass_success') || "Password updated successfully", 'success');
 setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
 } catch (err: any) {
 setPassError(err.message);
 } finally {
 setPassLoading(false);
 }
 };

 const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 setSelectedImage(file);
 const reader = new FileReader();
 reader.onloadend = () => setPreviewUrl(reader.result as string);
 reader.readAsDataURL(file);
 }
 };

 const handleUpdateProfile = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError(null);
 setSuccess(null);

 try {
 const token = localStorage.getItem('token');
 let profileImageUrl = user?.profileImage;

 // 1. Upload image if selected
 if (selectedImage) {
 const imageFormData = new FormData();
 imageFormData.append('file', selectedImage);
 const uploadRes = await fetch(`${API_BASE_URL}/media/upload`, {
 method: 'POST',
 headers: { 'Authorization': `Bearer ${token}` },
 body: imageFormData
 });
 if (uploadRes.ok) {
 const uploadData = await uploadRes.json();
 profileImageUrl = uploadData.url;
 }
 }

 // 2. Update user data
 const updateRes = await fetch(`${API_BASE_URL}/users/${user?._id}`, {
 method: 'PUT',
 headers: { 
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({
 ...formData,
 profileImage: profileImageUrl
 })
 });

 if (!updateRes.ok) {
 const errData = await updateRes.json();
 throw new Error(errData.message || 'Update failed');
 }

 const updatedUser = await updateRes.json();
 setUser(updatedUser);
 setSuccess(t('dashboard.profile.messages.sync_success'));
 } catch (err: any) {
 setError(err.message || "An unexpected error occurred.");
 } finally {
 setLoading(false);
 }
 };

  const toggleVerification = async (provider: 'Google' | 'Facebook' | 'Twitter') => {
    setVerifyingProvider(provider);
    
    // NOTE: Real OAuth2 flow simulation.
    await new Promise(resolve => setTimeout(resolve, 1500));
 try {
 const token = localStorage.getItem('token');
 const field = `is${provider}Verified`;
 const updateRes = await fetch(`${API_BASE_URL}/users/${user?._id}`, {
 method: 'PUT',
 headers: { 
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({ [field]: true })
 });
 if (updateRes.ok) {
 const updatedUser = await updateRes.json();
 setUser(updatedUser);
 setSuccess(t('dashboard.profile.messages.link_success', { provider }));
 }
 } catch (err) {
 setError(t('dashboard.profile.messages.link_fail'));
 } finally {
 setLoading(false);
 }
 };

  useEffect(() => {
    if (user?.phone) {
      const country = COUNTRIES.find(c => user?.phone?.startsWith(c.code));
      if (country) setSelectedCountry(country);
    }
  }, [user?.phone]);

  return (
 <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
 
 {/* Breadcrumbs */}
 <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
 <Link href="/dashboard" className="hover:text-primary transition-colors">{t('bookings.nav.dashboard')}</Link>
 <ChevronRight size={10} className="text-muted-foreground/40" />
 <span className="text-primary border-b-2 border-primary/20 pb-0.5 uppercase tracking-widest">{t('dashboard.profile.breadcrumb')}</span>
 </div>

 <div className="space-y-2">
 <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none flex items-center gap-3">
 {t('dashboard.profile.title')}
 {user?.verificationStatus === 'approved' && (
 <div className="bg-primary/10 text-primary px-3 py-1 rounded-app text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-primary/20 animate-pulse-slow">
 <ShieldCheck size={12} fill="currentColor" className="opacity-80" /> {t('dashboard.profile.verified_host')}
 </div>
 )}
 </h1>
 <p className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest">{t('dashboard.profile.subtitle')}</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
 
 {/* Left Column - Image & Verification Status */}
 <div className="lg:col-span-4 space-y-6">
 <div className="bg-card p-8 rounded-app border border-border dark:border-white/10 flex flex-col items-center text-center space-y-6 relative overflow-hidden group">
 <div className="absolute top-0 left-0 w-full h-24 bg-primary/5 -translate-y-1/2 blur-3xl opacity-50" />
 
 <div className="relative w-32 h-32">
 <div className="w-full h-full rounded-app overflow-hidden bg-muted border-4 border-card transition-all duration-500 ring-1 ring-border">
 {previewUrl ? (
 <img src={previewUrl} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 bg-muted">
 <User size={48} strokeWidth={1} />
 </div>
 )}
 </div>
 <label htmlFor="pfp-upload" className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-app flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all border-2 border-card">
 <Camera size={18} />
 <input type="file" id="pfp-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
 </label>
 </div>

 <div className="space-y-1">
 <h3 className="text-lg font-black text-foreground leading-tight">{user?.firstName} {user?.lastName}</h3>
 <p className="text-[10px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest">@{user?.displayName || "no_alias"}</p>
 </div>

 <div className="w-full pt-4 border-t border-border/50 space-y-4">
 <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
  <span>{t('dashboard.profile.identity_status')}</span>
   {user?.verificationStatus ? (
       <button 
         onClick={() => setShowVerifModal(true)}
       className={`px-2 py-0.5 rounded-app border-none cursor-pointer hover:scale-105 transition-all ${
       user.verificationStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
       user.verificationStatus === 'pending' ? 'bg-orange-500/10 text-orange-500' :
       'bg-destructive/10 text-destructive'
     }`}>
       {user.verificationStatus.replace('_', ' ')}
     </button>
   ) : (
    <button 
      onClick={() => setShowVerifModal(true)}
      className="px-2 py-0.5 rounded-app bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-black uppercase tracking-widest flex items-center gap-1 group border-none"
    >
      {t('dashboard.profile.not_submitted')}
      <ChevronRight size={8} className="group-hover:translate-x-0.5 transition-transform" />
    </button>
  )}
  </div>
 
  {verifStatus?.documents && verifStatus.documents.length > 0 ? (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">{t('dashboard.profile.registry_artifacts')}</h4>
        <span className="text-[8px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{verifStatus.documents.length} Items</span>
      </div>
      <button 
        type="button"
        onClick={() => setShowVerifModal(true)}
        className="w-full py-2.5 px-4 rounded-app border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group flex flex-row items-center justify-center gap-3 bg-card shadow-sm"
      >
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
          <ShieldCheck size={14} />
        </div>
        <span className="text-[10px] font-black text-foreground uppercase tracking-widest group-hover:text-primary transition-colors mt-0.5">View / Edit Documents</span>
      </button>
    </div>
  ) : (
    <div className="pt-2">
      <h4 className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-3">{t('dashboard.profile.registry_artifacts')}</h4>
      <button 
        type="button"
        onClick={() => setShowVerifModal(true)}
        className="w-full p-4 rounded-app border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all group flex flex-col items-center gap-2 text-center"
      >
        <div className="w-10 h-10 rounded-app bg-muted flex items-center justify-center text-muted-foreground/40 group-hover:text-primary transition-colors">
          <Upload size={20} />
        </div>
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">Upload Verification Documents</span>
      </button>
    </div>
  )}
 </div>
 </div>

 <div className="bg-card p-8 rounded-app border border-border dark:border-white/10 space-y-6">
 <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] flex items-center gap-2">
 <LinkIcon size={12} className="text-primary" /> {t('dashboard.profile.connected_artifacts')}
 </h3>
  <div className="space-y-3">
  {[
  { name: "Google", verified: user?.isGoogleVerified, icon: Globe, color: "text-rose-500", bg: "bg-rose-500/10" },
  { name: "Facebook", verified: user?.isFacebookVerified, icon: Globe, color: "text-blue-600", bg: "bg-blue-600/10" },
  { name: "X", verified: user?.isTwitterVerified, icon: Share2, color: "text-foreground", bg: "bg-muted" }
  ].map((social) => (
  <button 
  key={social.name}
  onClick={() => !social.verified && toggleVerification(social.name === 'X' ? 'Twitter' : social.name as any)}
  disabled={social.verified || verifyingProvider !== null}
  className={`w-full p-4 rounded-app border flex items-center justify-between transition-all group ${social.verified ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-primary/20 hover:bg-slate-50/50'}`}
  >
  <div className="flex items-center gap-3">
  <div className={`w-8 h-8 rounded-app ${social.bg} ${social.color} flex items-center justify-center`}>
  <social.icon size={14} />
  </div>
  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{social.name}</span>
  </div>
  {social.verified ? (
  <CheckCircle2 size={14} className="text-emerald-500" />
  ) : (
    verifyingProvider === (social.name === 'X' ? 'Twitter' : social.name) ? (
      <Loader2 size={14} className="animate-spin text-primary" />
    ) : (
      <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
    )
  )}
  </button>
  ))}
  </div>
  <p className="text-[9px] font-bold text-slate-400 uppercase text-center leading-relaxed font-black">{t('dashboard.profile.trust_score_bonus')}</p>
 </div>
 </div>

 {/* Right Column - Data Forms */}
 <div className="lg:col-span-8 space-y-8">
 <form onSubmit={handleUpdateProfile} className="bg-card p-10 rounded-app border border-border dark:border-white/10 space-y-10 relative">
 <div className="absolute top-0 right-0 p-10 pointer-events-none opacity-[0.03]">
 <User size={120} />
 </div>

 <div className="flex items-center gap-2 pb-6">
 <ShieldCheck size={16} className="text-primary" />
 <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">{t('dashboard.profile.core_matrix')}</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-3">
 <label className="text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block ml-1">{t('dashboard.profile.first_name')}</label>
 <div className="relative group">
 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
 <Input 
 value={formData.firstName}
 onChange={(e) => setFormData({...formData, firstName: e.target.value})}
 className="h-11 pl-12 rounded-app border-border focus:bg-card focus:border-primary transition-all font-bold text-xs text-slate-900 dark:text-white" 
 />
 </div>
 </div>
 <div className="space-y-3">
 <label className="text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block ml-1">{t('dashboard.profile.last_name')}</label>
 <div className="relative group">
 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
 <Input 
 value={formData.lastName}
 onChange={(e) => setFormData({...formData, lastName: e.target.value})}
 className="h-11 pl-12 rounded-app border-border focus:bg-card focus:border-primary transition-all font-bold text-xs text-slate-900 dark:text-white" 
 />
 </div>
 </div>
 <div className="space-y-3">
 <label className="text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block ml-1">{t('dashboard.profile.phone')}</label>
 <div ref={countryDropdownRef} className="flex flex-col gap-2 relative">
 <div className="flex gap-3">
 <div 
 onClick={() => setOpenCountry(!openCountry)}
 className={`h-11 flex items-center gap-2 px-4 border rounded-app cursor-pointer transition-all min-w-[90px] shrink-0 ${openCountry ? 'bg-slate-100 dark:bg-white/10 border-primary' : 'bg-slate-50 dark:bg-white/5 border-border hover:border-primary/40'}`}
 >
 <span className="text-base leading-none text-slate-900 dark:text-white">{selectedCountry.flag}</span>
 <span className="text-xs font-black text-slate-900 dark:text-white">{selectedCountry.code}</span>
 <ChevronDown size={12} className={`text-slate-400 transition-transform ${openCountry ? 'rotate-180 text-primary' : ''}`} />
 </div>
 <div className="flex-1 relative group">
 <Input 
 value={formData.phone ? (formData.phone.startsWith(selectedCountry.code) ? formData.phone.slice(selectedCountry.code.length).trim() : formData.phone) : ""}
 placeholder="1234567890"
 onChange={(e) => {
 const digits = e.target.value.replace(/\D/g, '');
 setFormData({...formData, phone: selectedCountry.code + ' ' + digits});
 }}
 className="h-11 pl-4 rounded-app border-border focus:bg-card focus:border-primary transition-all font-bold text-xs text-slate-900 dark:text-white" 
 />
 </div>
 </div>

 <AnimatePresence>
 {openCountry && (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 10 }}
 className="absolute top-full left-0 right-0 z-[100] mt-2 bg-card rounded-app border border-border p-2"
 >
 <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto custom-scrollbar">
 {COUNTRIES.map(c => (
 <button
 key={c.id}
 type="button"
 onClick={() => {
 const oldCode = selectedCountry.code;
 setSelectedCountry(c);
 setOpenCountry(false);
 setFormData(prev => {
 let local = prev.phone || "";
 if (local.startsWith(oldCode)) local = local.slice(oldCode.length).trim();
 return { ...prev, phone: c.code + ' ' + local.replace(/\D/g, '') };
 });
 }}
 className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all rounded-app text-left border ${
 selectedCountry.id === c.id ? 'bg-primary border-primary text-white' : 'bg-card border-border hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-white/5 text-foreground'
 }`}
 >
 <span className="text-xl leading-none text-slate-900 dark:text-white">{c.flag}</span>
 <div className="flex flex-col">
 <span className="text-[10px] font-black uppercase tracking-widest leading-none">{c.name}</span>
 <span className={`text-[9px] font-bold mt-1 ${selectedCountry.id === c.id ? 'text-white/70' : 'text-slate-400'}`}>{c.code}</span>
 </div>
 {selectedCountry.id === c.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
 </button>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 <div className="space-y-3">
 <label className="text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block ml-1">{t('dashboard.profile.email')}</label>
 <div className="relative group opacity-60">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
 <Input 
 value={user?.email || ""}
 disabled
 className="h-11 pl-12 rounded-app bg-muted border-dashed border-border cursor-not-allowed font-bold text-xs text-slate-900 dark:text-white" 
 />
 <div className="absolute right-4 top-1/2 -translate-y-1/2">
 <Lock size={12} className="text-slate-400 dark:text-slate-500" />
 </div>
 </div>
 </div>
 <div className="space-y-3 md:col-span-2">
 <label className="text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block ml-1">{t('dashboard.profile.address')}</label>
 <div className="relative group">
 <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
 <Input 
 value={formData.address}
 placeholder={t('dashboard.profile.address_placeholder')}
 onChange={(e) => {
 setFormData({...formData, address: e.target.value});
 fetchAddressSuggestions(e.target.value);
 }}
 className="h-11 pl-12 pr-12 rounded-app border-border focus:bg-card focus:border-primary transition-all font-bold text-xs text-slate-900 dark:text-white" 
 />
 
 <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
 {isSearchingAddress && (
 <Loader2 size={14} className="animate-spin text-primary" />
 )}
 <button 
    type="button" 
    onClick={handleCurrentLocation}
    disabled={isLocating}
    className="p-1.5 bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
    title="Use current location"
  >
    {isLocating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
  </button>
 </div>
 
 {addressSuggestions.length > 0 && (
 <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-card rounded-app border border-border p-2 animate-fade-in">
 {addressSuggestions.map((s, i) => (
 <button
 key={i}
 type="button"
 onClick={() => {
 setFormData({...formData, address: s.display_name});
 setAddressSuggestions([]);
 }}
 className="w-full text-left px-4 py-3 rounded-app hover:bg-muted transition-all text-[10px] font-bold text-muted-foreground flex items-center gap-3 border-b border-border/50 last:border-none"
 >
 <MapPin size={12} className="text-primary shrink-0" />
 <span className="truncate">{s.display_name}</span>
 </button>
 ))}
 </div>
 )}
 </div>
 </div>
  <div className="space-y-3 md:col-span-2">
  <label className="text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block ml-1">{t('dashboard.profile.display_name') || 'Display Name'}</label>
  <div className="relative group">
  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
  <Input 
  value={formData.displayName}
  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
  className="h-11 pl-12 rounded-app border-border focus:bg-card focus:border-primary transition-all font-bold text-xs text-slate-900 dark:text-white" 
  placeholder="How you appear to others"
  />
  </div>
  </div>
  <div className="space-y-3 md:col-span-2">
  <label className="text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block ml-1">Profile Slug (URL)</label>
  <div className="relative group">
  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
  <Input 
  value={formData.slug}
  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
  className="h-11 pl-12 rounded-app border-border focus:bg-card focus:border-primary transition-all font-bold text-xs text-slate-900 dark:text-white" 
  placeholder="your-unique-slug"
  />
  </div>
    <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1 mt-1">
      Your public profile: <Link href={`/profile/${formData.slug || user?.slug}`} target="_blank" className="text-primary hover:underline">{isMounted ? window.location.origin : ''}/profile/{formData.slug || user?.slug}</Link>
    </p>
  </div>
 </div>

 {error && (
 <div className="p-4 rounded-app bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-[10px] font-black uppercase tracking-widest animate-shake">
 <AlertCircle size={14} /> {error}
 </div>
 )}

 {success && (
 <div className="p-4 rounded-app bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
 <CheckCircle2 size={14} /> {success}
 </div>
 )}

 <Button 
 type="submit" 
 disabled={loading}
 className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-app font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 group border-none"
 >
 {loading ? <Loader2 className="animate-spin" size={20} /> : t('dashboard.profile.update_btn')}
 </Button>
 </form>

 {/* Security Hub */}
 <form onSubmit={handleChangePassword} className="bg-card p-10 rounded-app border border-border dark:border-white/10 space-y-8">
 <div className="flex items-center gap-2 pb-6 text-foreground">
 <div className="p-2 bg-destructive/10 rounded-app text-destructive"><Lock size={16} /></div>
 <h3 className="text-xs font-black uppercase tracking-[0.2em]">{t('dashboard.profile.security_protocol')}</h3>
 </div>
 
 <div className="space-y-6">
 <div className="space-y-1">
 <h4 className="text-sm font-black text-foreground">{t('dashboard.profile.change_password')}</h4>
 <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{t('dashboard.profile.password_advice')}</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
 <div className="space-y-2">
 <label className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest block ml-1">{t('dashboard.profile.current_password')}</label>
 <Input 
 type="password"
 value={passData.currentPassword}
 onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
 className="h-12 rounded-app bg-muted/30 border-border focus:bg-card text-xs font-bold text-slate-900 dark:text-white"
 placeholder="••••••••"
 required
 />
 </div>
 <div className="space-y-2">
 <label className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest block ml-1">{t('dashboard.profile.new_password')}</label>
 <Input 
 type="password"
 value={passData.newPassword}
 onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
 className="h-12 rounded-app bg-muted/30 border-border focus:bg-card text-xs font-bold text-slate-900 dark:text-white"
 placeholder="Min 6 chars"
 required
 />
 </div>
 <div className="space-y-2">
 <label className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest block ml-1">{t('dashboard.profile.confirm_new')}</label>
 <Input 
 type="password"
 value={passData.confirmPassword}
 onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
 className="h-12 rounded-app bg-muted/30 border-border focus:bg-card text-xs font-bold text-slate-900 dark:text-white"
 placeholder="Re-type new"
 required
 />
 </div>
 </div>

 {passError && (
 <div className="p-3 text-[10px] font-black text-destructive uppercase tracking-widest bg-destructive/10 rounded-app border border-destructive/20">
 {passError}
 </div>
 )}

 <Button 
 type="submit" 
 disabled={passLoading}
 className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-app font-black text-[10px] uppercase tracking-widest transition-all border-none"
 >
 {passLoading ? <Loader2 className="animate-spin" size={16} /> : t('dashboard.profile.update_creds')}
 </Button>
 </div>
 </form>

 {/* Account Management Actions */}
 <div className="bg-rose-50/30 dark:bg-rose-500/5 p-8 rounded-app border border-rose-100 dark:border-rose-500/10 space-y-6 mt-10">
 <div className="flex items-center gap-3 text-rose-500">
 <AlertCircle size={18} />
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Danger Zone</h3>
 </div>
 <div className="flex flex-col md:flex-row items-center justify-between gap-6">
 <div className="space-y-1">
 <p className="text-sm font-black text-foreground">Deactivate Account</p>
 <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Permanently remove your account and all associated data.</p>
 </div>
 <Button 
 variant="outline" 
 onClick={() => setShowDeleteModal(true)}
 className="w-full md:w-auto h-12 px-8 border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white rounded-app font-black text-[10px] uppercase tracking-widest transition-all"
 >
 <Trash2 size={16} className="mr-2" />
 Delete Account
 </Button>
 </div>
 </div>
 </div>

 </div>

 {/* Verification Preview Modal */}
 <Modal
 isOpen={!!previewedArtifact}
 onClose={() => setPreviewedArtifact(null)}
 title={previewedArtifact?.fieldName || t('dashboard.profile.modal_title')}
 description="Reviewing submitted verification document"
 icon={<ShieldCheck size={24} className="text-primary" />}
 className="max-w-md"
 >
 {previewedArtifact && (
 <div className="space-y-6">
 <div className="p-4 bg-slate-50 border border-slate-100 rounded-app">
 <div className="flex flex-col gap-1 mb-4">
 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{previewedArtifact.fieldName}</span>
 {previewedArtifact.fieldType !== 'image' ? (
 <span className="text-xl font-black text-slate-900">{previewedArtifact.value}</span>
 ) : (
 <button onClick={() => { setPreviewedArtifact(null); setShowVerifModal(true); }} className="text-[10px] font-bold text-primary hover:text-primary-hover flex items-center gap-1 w-fit mt-1">
 Update Document <ArrowRight size={10} />
 </button>
 )}
 </div>
 
 {previewedArtifact.fieldType === 'image' && (
 <div 
 onClick={() => setFullImageUrl(getImageUrl(previewedArtifact.value))}
 className="relative w-full aspect-video bg-slate-200 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in shadow-sm group"
 >
 <img 
 src={getImageUrl(previewedArtifact.value)} 
 className="w-full h-full object-cover transition-transform group-hover:scale-105" 
 alt={previewedArtifact.fieldName} 
 />
 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
 <span className="opacity-0 group-hover:opacity-100 text-white drop-shadow-md transition-opacity">🔍 View Full Size</span>
 </div>
 </div>
 )}
 </div>
 </div>
 )}



 {user?.verificationStatus === 'rejected' && (
 <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-app space-y-2">
 <div className="flex items-center gap-2 text-destructive">
 <AlertCircle size={14} />
 <span className="text-[10px] font-black uppercase">{t('dashboard.profile.rejection_title')}</span>
 </div>
 <p className="text-xs font-bold text-muted-foreground/80">{verifStatus.adminNote || "No specific feedback provided. Please review your documents and resubmit."}</p>
 <Link href="/dashboard/verification">
 <Button className="w-full h-10 mt-4 bg-destructive hover:bg-destructive/90 text-white rounded-app font-black uppercase text-[9px] tracking-widest border-none ">
 {t('dashboard.profile.recalibrate_btn')}
 </Button>
 </Link>
 </div>
 )}
 </Modal>

 {fullImageUrl && mounted && createPortal(
 <div className="fixed inset-0 z-[100000] bg-black/95 flex items-center justify-center p-4 lg:p-20 overflow-hidden animate-in fade-in duration-300" onClick={() => setFullImageUrl(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
 <button 
 onClick={() => setFullImageUrl(null)}
 className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all z-[10001]"
 >
 <X size={24} />
 </button>
 <div className="relative max-w-full max-h-full flex items-center justify-center animate-in zoom-in-95 duration-300">
 <img 
 src={fullImageUrl} 
 className="max-w-full max-h-[85vh] object-contain rounded-app shadow-2xl" 
 onClick={(e) => e.stopPropagation()}
 />
 </div>
 </div>,
 document.body
 )}

 <DeleteAccountModal 
 isOpen={showDeleteModal}
 onClose={() => setShowDeleteModal(false)}
 loading={deleteLoading}
 onConfirm={async () => {
 setDeleteLoading(true);
 try {
 const token = localStorage.getItem('token');
 const res = await fetch(`${API_BASE_URL}/users/${user?._id}`, {
 method: 'DELETE',
 headers: { 'Authorization': `Bearer ${token}` }
 });
 if (res.ok) {
 localStorage.clear();
 window.location.href = "/";
 } else {
 const data = await res.json();
 alert(data.message || "Failed to deactivate account.");
 }
 } catch (err) {
 console.error("Delete error:", err);
 } finally {
 setDeleteLoading(false);
 setShowDeleteModal(false);
 }
 }}
 />

 <style jsx global>{`
 .animate-fade-in {
 animation: fadeIn 0.5s ease-out forwards;
 }
 .animate-pulse-slow {
 animation: pulseSlow 3s infinite;
 }
 .animate-shake {
 animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
 }
 @keyframes fadeIn {
 from { opacity: 0; transform: translateY(10px); }
 to { opacity: 1; transform: translateY(0); }
 }
 @keyframes pulseSlow {
 0%, 100% { opacity: 1; }
 50% { opacity: 0.7; }
 }
 @keyframes shake {
 10%, 90% { transform: translate3d(-1px, 0, 0); }
 20%, 80% { transform: translate3d(2px, 0, 0); }
 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
 40%, 60% { transform: translate3d(4px, 0, 0); }
 }
 `}</style>
 </div>
 );
}
