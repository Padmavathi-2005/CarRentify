"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 ShieldCheck,
 Upload,
 CheckCircle2,
 Clock,
 XCircle,
 ArrowRight,
 Loader2,
 X,
 FileImage,
 FileText,
 AlertCircle,
 ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, BACKEND_URL, getImageUrl, PLACEHOLDER_IMAGE } from "@/config/api";
import { authService } from "@/services/authService";
import { useToast } from "@/components/Toast";
import { CustomDatePicker } from "@/components/CustomDateTimePicker";

import { useAuth } from "@/components/AuthContext";
import { useLocale } from "@/components/LocaleContext";

interface VerificationField {
 id: string;
 name: string;
 type: "image" | "text" | "date" | "phone";
 required: boolean;
 description: string;
}

interface VerificationModalProps {
 isOpen: boolean;
 onClose: () => void;
 userId?: string;
 status?: 'pending' | 'approved' | 'rejected' | 'not_submitted' | null;
}

export default function VerificationModal({
 isOpen,
 onClose,
 userId,
 status: externalStatus,
}: VerificationModalProps) {
 const { t } = useLocale();
 const { showToast } = useToast();
 const { user } = useAuth();
 const [fields, setFields] = useState<VerificationField[]>([]);
 const [myStatus, setMyStatus] = useState<any>(null);
 const [values, setValues] = useState<Record<string, string>>({});
 const [uploading, setUploading] = useState<Record<string, boolean>>({});
 const [submitting, setSubmitting] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [loadingStatus, setLoadingStatus] = useState(true);

 // Skip verification for admins implicitly
 useEffect(() => {
 const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
 const isAdminEmail = user?.email?.toLowerCase().includes('admin');
 const isAdminRole = user?.role?.toLowerCase() === 'admin';

 if (isOpen && (isAdminRole || isAdminPath || isAdminEmail)) {
 onClose();
 }
 }, [isOpen, user, onClose]);

 // Body scroll lock
 useEffect(() => {
 if (isOpen && user?.role !== 'admin') {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = 'unset';
 }
 return () => {
 document.body.style.overflow = 'unset';
 };
 }, [isOpen]);

 useEffect(() => {
 if (!isOpen) return;
 fetchData();
 }, [isOpen, userId]);

 const fetchData = async () => {
 setLoadingStatus(true);
 try {
 const [settingsRes, statusRes] = await Promise.all([
 fetch(`${API_BASE_URL}/settings`),
 fetch(`${API_BASE_URL}/verification/my-status`, {
 headers: { Authorization: `Bearer ${authService.getToken()}` },
 }),
 ]);

 if (settingsRes.ok) {
 const settings = await settingsRes.json();
 const verificationFields = settings.verification?.fields || settings.fields || [];
 setFields(verificationFields);
 }

 if (statusRes.ok) {
 const statusData = await statusRes.json();
 setMyStatus(statusData);
 // Pre-fill values if previously submitted
 if (statusData.documents) {
 const prefilled: Record<string, string> = {};
 statusData.documents.forEach((d: any) => {
 prefilled[d.fieldId] = d.value;
 });
 setValues(prefilled);
 }
 }
 } catch (err) {
 console.error("Verification fetch error:", err);
 } finally {
 setLoadingStatus(false);
 }
 };

 const handleImageUpload = async (fieldId: string, file: File) => {
 setUploading((p) => ({ ...p, [fieldId]: true }));
 try {
 const base64 = await new Promise<string>((resolve) => {
 const reader = new FileReader();
 reader.readAsDataURL(file);
 reader.onload = () => resolve(reader.result as string);
 });

 const res = await fetch(`${API_BASE_URL}/media/upload`, {
 method: "POST",
 headers: { 
 "Content-Type": "application/json",
 Authorization: `Bearer ${authService.getToken()}` 
 },
 body: JSON.stringify({ fileName: file.name, base64 }),
 });

 if (res.ok) {
 const data = await res.json();
 const url = data.url || data.path || "";
 setValues((p) => ({ ...p, [fieldId]: url }));
 }
 } catch (err) {
 console.error("Upload error:", err);
 } finally {
 setUploading((p) => ({ ...p, [fieldId]: false }));
 }
 };

 const handleSubmit = async () => {
 const docs = fields.map((f) => ({
 fieldId: f.id,
 fieldName: f.name,
 fieldType: f.type,
 value: values[f.id] || "",
 }));

 // Validate required fields
 const missing = fields.filter((f) => f.required && !values[f.id]);
 if (missing.length > 0) {
 showToast(`${t('dashboard.profile.update_proof')}: ${missing.map((f) => f.name).join(", ")}`, 'error');
 return;
 }

 // Validate Phone Numbers (10 digits)
 const phoneFields = fields.filter((f) => f.type === "phone");
 for (const pf of phoneFields) {
 const val = values[pf.id] || "";
 const digits = val.replace(/\D/g, "");
 if (digits.length < 10) {
 showToast(`${pf.name} must be at least 10 digits.`, 'error');
 return;
 }
 }

 // Validate Age (21+)
 const dateFields = fields.filter((f) => f.type === "date");
 for (const df of dateFields) {
 const val = values[df.id];
 if (val) {
 const birthDate = new Date(val);
 const today = new Date();
 let age = today.getFullYear() - birthDate.getFullYear();
 const m = today.getMonth() - birthDate.getMonth();
 if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
 age--;
 }
 if (age < 21) {
 showToast(t('dashboard.verification.age_error'), 'error');
 return;
 }
 }
 }

 setSubmitting(true);
 try {
 const res = await fetch(`${API_BASE_URL}/verification/submit`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${authService.getToken()}`,
 },
 body: JSON.stringify({ documents: docs }),
 });

 if (res.ok) {
 setSubmitted(true);
 await fetchData();
 showToast(t('dashboard.verification.success_submit') || "Identity data successfully synchronized.", 'success');
 } else {
 const err = await res.json();
 showToast(err.message || "Submission failed. Please try again.", 'error');
 }
 } catch (err) {
 console.error("Submit error:", err);
 } finally {
 setSubmitting(false);
 }
 };

 if (!isOpen) return null;

 const status = externalStatus || myStatus?.status;

 return (
 <div className="fixed inset-0 z-[2000] overflow-y-auto custom-scrollbar">
 {/* Backdrop */}
 <div className="fixed inset-0 bg-black/50" />

 {/* Modal Wrapper for centering & scrolling */}
 <div className="min-h-full flex items-center justify-center p-4 md:p-8 relative">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 transition={{ duration: 0.3 }}
 className="relative bg-white w-full max-w-2xl rounded-app border border-slate-100"
 >
 {/* Header */}
 <div className="bg-primary p-4 relative rounded-t-[var(--app-radius)] overflow-hidden">
 <div className="relative z-10">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 bg-white/20 rounded-app flex items-center justify-center text-white">
 <ShieldCheck size={28} />
 </div>
 <div>
 <h2 className="text-xl font-black text-white tracking-tight uppercase">
 {t('dashboard.verification.title')}
</h2>
 <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mt-1">
 {t('dashboard.verification.subtitle')}
</p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="w-10 h-10 rounded-app bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
 >
 <X size={18} />
 </button>
 </div>
 </div>
 </div>

 {/* Body */}
 <div className="p-8">
 {loadingStatus ? (
 <div className="flex items-center justify-center py-16">
 <Loader2 className="animate-spin text-slate-900" size={32} />
 </div>
 ) : status === "approved" || status === "rejected" ? (
 <div>
 <div className={`rounded-app p-6 mb-6 flex items-start gap-4 ${status === 'approved' ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
 {status === 'approved' ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} /> : <XCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />}
 <div>
 <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
 {status === 'approved' ? t('dashboard.verification.verified') : t('dashboard.verification.rejected')}
 </p>
 <p className={`text-sm font-bold ${status === 'approved' ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
 {status === 'approved' ? t('dashboard.verification.confirmed_desc') : (myStatus?.adminNote || t('dashboard.verification.rejected'))}
 </p>
 </div>
 </div>

 {false && status === 'approved' ? (
 <div className="py-10 text-center">
 <Button 
 onClick={onClose}
 className="h-14 px-12 bg-primary text-white hover:bg-secondary font-black uppercase tracking-widest rounded-app border-none transition-all"
 >
 {t('dashboard.verification.close')}
 </Button>
 </div>
 ) : (
 <VerificationForm
 fields={fields}
 values={values}
 setValues={setValues}
 uploading={uploading}
 handleImageUpload={handleImageUpload}
 submitting={submitting}
 onSubmit={handleSubmit}
 />
 )}
 </div>
 ) : status === "pending" ? (
 <div className="text-center py-12">
 <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
 <Clock className="text-amber-500" size={40} />
 </div>
 <h3 className="text-2xl font-black text-slate-900 mb-3">
 {t('dashboard.verification.under_review')}
 </h3>
 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
 {t('dashboard.verification.under_review_desc')}
 </p>
 <div className="mt-8 flex gap-3 justify-center">
 <Button
 onClick={onClose}
 className="h-12 px-8 bg-slate-100 text-slate-700 hover:bg-slate-200 font-black uppercase tracking-widest rounded-app border-none"
 >
 {t('dashboard.verification.close')}
 </Button>
 <Button
 onClick={() => setMyStatus(null)}
 className="h-12 px-8 bg-primary text-white hover:bg-secondary hover:text-white font-black uppercase tracking-widest rounded-app border-none transition-all"
 >
 {t('dashboard.verification.resubmit')}
 </Button>
 </div>
 </div>
 ) : submitted ? (
 <div className="text-center py-12">
 <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
 <CheckCircle2 className="text-emerald-500" size={40} />
 </div>
 <h3 className="text-2xl font-black text-slate-900 mb-3">
 {t('dashboard.verification.submitted')}
 </h3>
 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
 {t('dashboard.verification.pending_desc')}
 </p>
 <Button
 onClick={onClose}
 className="mt-8 h-12 px-10 bg-primary text-white hover:bg-secondary hover:text-white font-black uppercase tracking-widest rounded-app border-none transition-all"
 >
 {t('dashboard.verification.close')}
 </Button>
 </div>
 ) : (
 <VerificationForm
 fields={fields}
 values={values}
 setValues={setValues}
 uploading={uploading}
 handleImageUpload={handleImageUpload}
 submitting={submitting}
 onSubmit={handleSubmit}
 />
 )}
 </div>
 </motion.div>
 </div>
 </div>
 );
}

function VerificationForm({
 fields,
 values,
 setValues,
 uploading,
 handleImageUpload,
 submitting,
 onSubmit,
}: any) {
 const { t } = useLocale();
 const COUNTRIES = [
 { id: 'us', name: 'USA', code: '+1', flag: '🇺🇸' },
 { id: 'uk', name: 'UK', code: '+44', flag: '🇬🇧' },
 { id: 'in', name: 'India', code: '+91', flag: '🇮🇳' },
 { id: 'ae', name: 'UAE', code: '+971', flag: '🇦🇪' },
 { id: 'ca', name: 'Canada', code: '+1', flag: '🇨🇦' },
 { id: 'au', name: 'Australia', code: '+61', flag: '🇦🇺' },
 { id: 'de', name: 'Germany', code: '+49', flag: '🇩🇪' },
 { id: 'fr', name: 'France', code: '+33', flag: '🇫🇷' },
 ];

 const [openCountryId, setOpenCountryId] = useState<string | null>(null);
 const [selectedCountries, setSelectedCountries] = useState<Record<string, typeof COUNTRIES[0]>>({});

 const getCountry = (fieldId: string) => selectedCountries[fieldId] || COUNTRIES[0];

 const maxDob = (() => {
 const d = new Date();
 d.setFullYear(d.getFullYear() - 21);
 return d.toISOString().split('T')[0];
 })();

 return (
 <div className="space-y-6">
 <div className="bg-slate-50 border border-slate-100 rounded-app p-5 flex items-start gap-4">
 <ShieldCheck className="text-slate-400 shrink-0 mt-0.5" size={18} />
 <div className="space-y-1">
 <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t('dashboard.verification.standards')}</p>
 <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
 {t('dashboard.verification.standards_desc')}
 </p>
 </div>
 </div>

 {fields.map((field: VerificationField, idx: number) => (
 <div key={field.id} className="space-y-3">
 <div className="flex items-center gap-3">
 <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center text-[10px] font-black shrink-0">
 {idx + 1}
 </div>
 <div>
 <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">
 {field.name}
 {field.required && (
 <span className="text-rose-500 ml-1">*</span>
 )}
 </p>
 <p className="text-[10px] font-bold text-slate-400 mt-0.5">
 {field.description}
 </p>
 </div>
 </div>

 {field.type === "image" ? (
 <ImageUploadField
 fieldId={field.id}
 value={values[field.id]}
 isUploading={uploading[field.id]}
 onUpload={handleImageUpload}
 />
 ) : field.type === "date" ? (
 <CustomDatePicker
 label=""
 value={values[field.id] || ""}
 maxDate={maxDob}
 defaultViewDate={maxDob}
 inline={true}
 onChange={(val: string) =>
 setValues((p: any) => ({ ...p, [field.id]: val }))
 }
 />
 ) : field.type === "phone" ? (
 <div className="flex flex-col gap-2">
 <div className="flex gap-3">
 {/* Country Code Dropdown Trigger */}
 <div
 onClick={() => setOpenCountryId(openCountryId === field.id ? null : field.id)}
 className={`h-12 flex items-center gap-2 px-4 border rounded-app cursor-pointer transition-all min-w-[90px] shrink-0 ${openCountryId === field.id ? 'bg-slate-100 border-slate-900/30' : 'bg-slate-50 border-slate-100 hover:border-slate-900/30'}`}
 >
 <span className="text-lg leading-none">{getCountry(field.id).flag}</span>
 <span className="text-sm font-black text-slate-900">{getCountry(field.id).code}</span>
 <ChevronDown size={12} className={`text-slate-400 transition-transform ${openCountryId === field.id ? 'rotate-180 text-slate-900' : ''}`} />
 </div>

 {/* Number Input */}
 <div className="flex-1 relative group">
 <input
 type="tel"
 placeholder={t('dashboard.verification.phone_placeholder')}
 value={values[field.id] ? (values[field.id].startsWith(getCountry(field.id).code) ? values[field.id].slice(getCountry(field.id).code.length).trim() : values[field.id]) : ""}
 onChange={(e) => {
 const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
 setValues((p: any) => ({ ...p, [field.id]: getCountry(field.id).code + ' ' + digits }));
 }}
 className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-app text-sm font-bold text-slate-900 transition-all hover:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none"
 />
 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 pointer-events-none uppercase tracking-widest">
 {t('dashboard.verification.min_digits')}
 </div>
 </div>
 </div>

 {/* Inline Expanded Country List */}
 <AnimatePresence>
 {openCountryId === field.id && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden"
 >
 <div className="w-full bg-slate-50/50 border border-slate-100 rounded-app mt-1 px-2 py-2 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar">
 {COUNTRIES.map(c => (
 <div
 key={c.id}
 onClick={() => {
 const oldCode = getCountry(field.id).code;
 setSelectedCountries(prev => ({ ...prev, [field.id]: c }));
 setOpenCountryId(null);
 setValues((p: any) => {
 let local = p[field.id] || "";
 if (local.startsWith(oldCode)) local = local.slice(oldCode.length).trim();
 return { ...p, [field.id]: c.code + ' ' + local.replace(/\D/g, '') };
 });
 }}
 className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-all rounded-app ${
 getCountry(field.id).id === c.id ? 'bg-slate-900 text-white ' : 'bg-white hover:bg-slate-100 hover:text-slate-900 text-slate-600 '
 }`}
 >
 <span className="text-lg leading-none">{c.flag}</span>
 <span className="text-[10px] font-black uppercase tracking-wider">{c.name}</span>
 <span className={`text-[10px] font-bold ml-auto ${getCountry(field.id).id === c.id ? 'text-white/80' : 'text-slate-400'}`}>{c.code}</span>
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 ) : (
 <input
 type="text"
 placeholder={t('dashboard.verification.enter_field', { name: field.name })}
 value={values[field.id] || ""}
 onChange={(e) =>
 setValues((p: any) => ({ ...p, [field.id]: e.target.value }))
 }
 className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-app text-sm font-bold text-slate-900 transition-all hover:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none"
 />
 )}
 </div>
 ))}

 <Button
 onClick={onSubmit}
 disabled={submitting}
 className="w-full h-14 bg-primary hover:bg-secondary hover:text-white text-white font-black uppercase tracking-widest rounded-app border-none text-sm transition-all disabled:opacity-50 mt-4"
 >
 {submitting ? (
 <Loader2 className="animate-spin mr-2" size={18} />
 ) : (
 <div className="flex items-center gap-2">
 {t('dashboard.verification.submit_btn')} <ArrowRight size={18} />
 </div>
 )}
 </Button>
 </div>
 );
}

function ImageUploadField({
 fieldId,
 value,
 isUploading,
 onUpload,
}: {
 fieldId: string;
 value: string;
 isUploading: boolean;
 onUpload: (id: string, file: File) => void;
}) {
 const { t } = useLocale();
 const inputRef = useRef<HTMLInputElement>(null);
 const [error, setError] = useState<string | null>(null);

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setError(null);
 const img = new Image();
 const objectUrl = URL.createObjectURL(file);
 img.onload = () => {
 URL.revokeObjectURL(objectUrl);
 if (img.width < 500 || img.height < 500) {
 setError(t('dashboard.verification.error_blurry'));
 return;
 }
 onUpload(fieldId, file);
 };
 img.onerror = () => {
 URL.revokeObjectURL(objectUrl);
 setError(t('dashboard.verification.error_load'));
 };
 img.src = objectUrl;
 };

 return (
 <div className="flex flex-col gap-2">
 <div
 onClick={() => inputRef.current?.click()}
 className={`relative h-32 rounded-app border-2 border-dashed cursor-pointer transition-all flex items-center justify-center overflow-hidden group ${
 error ? "border-rose-300 bg-rose-50/50" :
 value
 ? "border-emerald-200 bg-emerald-50/30"
 : "border-slate-200 bg-slate-50 hover:border-slate-900/40 hover:bg-slate-100"
 }`}
 >
 <input
 ref={inputRef}
 type="file"
 accept="image/*"
 className="hidden"
 onChange={handleFileChange}
 />

 {isUploading ? (
 <div className="flex flex-col items-center gap-2 text-slate-900">
 <Loader2 className="animate-spin" size={24} />
 <p className="text-[10px] font-black uppercase tracking-widest">
 {t('dashboard.verification.uploading')}
 </p>
 </div>
 ) : value ? (
 <>
 <div className="flex items-center gap-4 py-2 px-6">
 <img
 src={getImageUrl(value)}
 className="w-20 h-20 object-cover rounded-app border border-emerald-100/50 relative z-10"
 alt="Uploaded document"
 onError={(e) => {
   (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
 }}
 />
 <div className="flex flex-col z-10">
 <div className="flex items-center gap-2 mb-1">
 <CheckCircle2 className="text-emerald-500" size={16} />
 <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{t('dashboard.verification.uploaded')}</span>
 </div>
 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 opacity-70">
 <Upload size={10} /> {t('dashboard.verification.replace_hint')}
 </span>
 </div>
 </div>
 <div className="absolute inset-0 bg-emerald-500/0 hover:bg-emerald-500/5 transition-all z-0" />
 </>
 ) : (
 <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-slate-900 transition-colors">
 <div className="w-12 h-12 rounded-app bg-white border border-slate-100 group-hover:border-slate-900/20 flex items-center justify-center">
 <FileImage size={22} />
 </div>
 <div className="text-center">
 <p className="text-[11px] font-black uppercase tracking-widest">
 {t('dashboard.verification.click_upload')}
 </p>
 <p className="text-[9px] font-bold mt-0.5 opacity-60">
 {t('dashboard.verification.formats_hint')}
 </p>
 </div>
 </div>
 )}
 </div>
 {error && (
 <div className="flex items-center gap-1.5 text-rose-500 mt-1 px-1">
 <AlertCircle size={12} />
 <span className="text-[10px] font-black uppercase tracking-widest leading-none">{error}</span>
 </div>
 )}
 </div>
 );
}
