"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Palette, Share2, Bell, ShieldCheck,
 Save, RefreshCw, Layout, MapPin, ChevronRight, Globe, ChevronDown,
 Database, Heart, Users, Plus, Zap, Menu, ShoppingBag, Car, Quote, LayoutDashboard, Search,
 Link as LinkIcon, Image as ImageIcon, Smile, Upload, X, Check, Droplet, Mail, Wallet, DollarSign, Percent, CreditCard,
 AlertCircle, Edit2, Clock
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import Switch from "../../components/ui/switch";
import { useSettings } from "../../components/ThemeProvider";
import { AdminTranslationContext, useAdminTranslation } from "../../app/admin/AdminTranslationContext";
import { authService } from "../../services/authService";

import { API_BASE_URL } from "@/config/api";
import "../styles/AdminSettingsView.css";
const backendUrl = API_BASE_URL;

const resolveAsset = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${backendUrl.replace('/api', '')}${path}`;
};

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
 <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)] block px-1">
 {label}
 </label>
 <div className="flex items-center gap-6 p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)] relative">
 <div className="relative">
 <div
 className="w-16 h-16 rounded-app border-4 border-white cursor-pointer hover:scale-105 transition-transform flex items-center justify-center group"
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
 className="absolute z-50 top-full left-0 mt-4 p-5 bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)] min-w-[240px]"
 >
 <div className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-4">Elite Palette</div>
 <div className="grid grid-cols-4 gap-3 mb-6">
 {BRAND_PRESETS.map((color) => (
 <button
 key={color}
 onClick={() => { onChange(color); setIsOpen(false); }}
 className="w-10 h-10 rounded-app border-2 border-white ring-1 ring-slate-100 hover:scale-110 transition-transform"
 style={{ background: color }}
 />
 ))}
 </div>

 <div className="pt-4 border-t border-[var(--admin-border)]">
 <div className="flex items-center justify-between mb-4">
 <span className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase">Custom</span>
 <div className="w-6 h-6 rounded-app border border-[var(--admin-border)] overflow-hidden relative">
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
 className="h-10 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-app font-mono text-[10px] text-center uppercase"
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
 className="h-12 bg-[var(--admin-card-bg)] rounded-app font-mono text-sm text-center bg-[var(--admin-bg)] border border-[var(--admin-border)] uppercase"
 />
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold mt-2 tracking-widest px-1 uppercase text-center">Hex</p>
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
 variant = "default",
 disabled = false
}: { 
 value: any, 
 onChange: (val: any) => void, 
 options: { value: any, label: string }[],
 placeholder?: string,
 className?: string,
 variant?: "default" | "primary" | "minimal",
 disabled?: boolean
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
 type="button"
 disabled={disabled}
 onClick={() => !disabled && setIsOpen(!isOpen)}
 className={`w-full flex items-center justify-between px-4 rounded-app transition-all outline-none border focus:ring-2 focus:ring-primary/10 ${
 variant === 'primary' 
 ? 'h-9 bg-[var(--admin-bg)]/80 border-[var(--admin-border)] text-primary font-black uppercase tracking-[0.2em] text-[9px]'
 : variant === 'minimal'
 ? 'h-8 bg-[var(--admin-card-bg)] border-[var(--admin-border)] text-[var(--admin-text-main)] font-bold uppercase tracking-widest text-[9px]'
 : 'h-11 bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text-main)] font-bold uppercase tracking-widest text-[10px]'
 } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
 >
 <span className="truncate pr-4">{selectedOption ? selectedOption.label : placeholder}</span>
 <ChevronDown size={variant === 'primary' ? 12 : 14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-[var(--admin-text-muted)]'}`} />
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 className="absolute z-[100] top-full left-0 right-0 mt-2 bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)] overflow-hidden min-w-[200px]"
 >
 <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
 {options.map((opt) => (
 <button
 key={opt.value}
 onClick={() => {
 onChange(opt.value);
 setIsOpen(false);
 }}
 className={`w-full text-left px-4 py-3 rounded-app transition-all flex items-center justify-between group ${
 value === opt.value 
 ? 'bg-primary/5 text-primary font-black' 
 : 'text-[var(--admin-text-main)] hover:bg-[var(--admin-bg)] font-bold'
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

// ─────────────────────────────────────────────────────────────
// Locations Manager — edits formData.officeLocations in-place
// Saved with the global Save button (no separate server call)
// ─────────────────────────────────────────────────────────────
const EMPTY_LOCATION = { city: '', address: '', phone: '', email: '', hours: '', coordinates: '' };

const TaxesManager = React.forwardRef(({
 taxes,
 onChange,
}: {
 taxes: any[];
 onChange: (val: any[]) => void;
}, ref) => {
 const [editingIdx, setEditingIdx] = useState<number | null>(null);
 const [editDraft, setEditDraft] = useState<any>({});
 const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
 const [showToast, setShowToast] = useState(false);
 const listRef = useRef<HTMLDivElement>(null);

 React.useImperativeHandle(ref, () => ({
 addItem: handleAddNewTax
 }));

 const handleSaveEdit = (idx: number) => {
 const updated = taxes.map((t, i) => (i === idx ? { ...editDraft } : t));
 onChange(updated);
 setEditingIdx(null);
 };

 const handleAddNewTax = () => {
 const newTax = {
 id: `tax_${Date.now()}`,
 name: 'New Tax',
 description: 'Standard sales tax or VAT',
 percentage: 5,
 isEnabled: true
 };
 onChange([...taxes, newTax]);
 setEditingIdx(taxes.length);
 setEditDraft(newTax);
 
 setTimeout(() => {
 if (listRef.current) {
 const lastChild = listRef.current.lastElementChild;
 lastChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
 }
 }, 100);
 };

 const confirmDelete = () => {
 if (confirmDeleteIdx !== null) {
 const updated = taxes.filter((_, i) => i !== confirmDeleteIdx);
 onChange(updated);
 setConfirmDeleteIdx(null);
 setShowToast(true);
 setTimeout(() => setShowToast(false), 3000);
 }
 };

 return (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative">
 {/* Success Toast */}
 <AnimatePresence>
 {showToast && (
 <motion.div 
 initial={{ opacity: 0, y: 50, x: '-50%' }} 
 animate={{ opacity: 1, y: 0, x: '-50%' }} 
 exit={{ opacity: 0, y: 50, x: '-50%' }}
 className="fixed bottom-10 left-1/2 z-50 bg-slate-900 rounded-full px-6 py-3 flex items-center gap-3 border border-white/10"
 >
 <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
 <Check size={12} className="text-white" />
 </div>
 <span className="text-xs font-black text-white uppercase tracking-widest">Tax Removed Successfully</span>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Custom Delete Modal */}
 <AnimatePresence>
 {confirmDeleteIdx !== null && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 onClick={() => setConfirmDeleteIdx(null)}
 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
 />
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }} 
 animate={{ opacity: 1, scale: 1, y: 0 }} 
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative w-full max-w-sm bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)] p-8 text-center overflow-hidden"
 >
 <div className="w-16 h-16 bg-red-500/10 rounded-app flex items-center justify-center mx-auto mb-4 text-red-500">
 <X size={32} />
 </div>
 <h3 className="text-lg font-black text-[var(--admin-text-main)] mb-2 uppercase tracking-tight">Remove Tax?</h3>
 <p className="text-xs font-bold text-[var(--admin-text-muted)] mb-8 uppercase tracking-widest leading-relaxed">
 This will stop applying "{taxes[confirmDeleteIdx]?.name}" to new bookings.
 </p>
 <div className="flex flex-col gap-2">
 <Button onClick={confirmDelete} className="h-12 w-full bg-red-500/100 hover:bg-red-600 text-white rounded-app text-[10px] font-black uppercase tracking-[0.2em] -200">
 Confirm Removal
 </Button>
 <button onClick={() => setConfirmDeleteIdx(null)} className="h-12 w-full bg-[var(--admin-bg)] text-[var(--admin-text-muted)] rounded-app text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--admin-bg)] transition-all">
 Cancel
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 <div className="flex items-center justify-between py-2 mb-4 border-b border-[var(--admin-border)]">
 <div>
 <h4 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--admin-text-main)] mb-1">Tax Configuration</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">
 Manage regional taxes and VAT applied to rentals
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-6" ref={listRef}>
 {taxes && taxes.length > 0 ? taxes.map((tax, idx) => {
 const isEditing = editingIdx === idx;
 return (
 <motion.div 
 layout
 key={tax.id || idx} 
 className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-app overflow-hidden p-6 relative group/tax"
 >
 {isEditing ? (
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Tax Name</label>
 <Input value={editDraft.name} onChange={e => setEditDraft({...editDraft, name: e.target.value})} className="h-10 font-bold" />
 </div>
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Percentage (%)</label>
 <div className="relative">
 <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
 <Input type="number" value={editDraft.percentage} onChange={e => setEditDraft({...editDraft, percentage: Number(e.target.value)})} className="h-10 font-bold pr-10" />
 </div>
 </div>
 </div>
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Description</label>
 <Textarea value={editDraft.description} onChange={e => setEditDraft({...editDraft, description: e.target.value})} className="min-h-[80px] font-bold" />
 </div>
 <div className="flex items-center gap-4 py-2 border-t border-[var(--admin-border)] mt-4 font-black">
 <span className="text-[9px] font-black uppercase text-[var(--admin-text-muted)] tracking-widest">Status</span>
 <Switch checked={editDraft.isEnabled} onCheckedChange={(val) => setEditDraft({...editDraft, isEnabled: val})} />
 </div>
 <div className="flex gap-2">
 <Button onClick={() => handleSaveEdit(idx)} className="h-9 px-6 bg-primary text-white rounded-app text-[10px] font-black uppercase tracking-widest">Save Changes</Button>
 <button onClick={() => setEditingIdx(null)} className="h-9 px-4 rounded-app border border-[var(--admin-border)] text-[var(--admin-text-muted)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--admin-bg)]">Cancel</button>
 </div>
 </div>
 ) : (
 <div className="flex items-start gap-6">
 <div className={`w-14 h-14 rounded-app flex items-center justify-center flex-shrink-0 ${tax.isEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--admin-bg)] text-[var(--admin-text-muted)]'}`}>
 <Database size={24} />
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-3">
 <h4 className="text-sm font-black text-[var(--admin-text-main)]">{tax.name}</h4>
 <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${tax.isEnabled ? 'bg-emerald-500/100/10 text-emerald-500' : 'bg-[var(--admin-bg)] text-[var(--admin-text-muted)]'}`}>
 {tax.isEnabled ? 'Active' : 'Disabled'}
 </span>
 </div>
 <div className="flex items-center gap-2">
 <button onClick={() => { setEditingIdx(idx); setEditDraft({...tax}); }} className="w-8 h-8 rounded-app border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-text-muted)] hover:border-primary hover:text-primary transition-all">
 <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
 </button>
 <button onClick={() => setConfirmDeleteIdx(idx)} className="w-8 h-8 rounded-app bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover/tax:opacity-100 transition-all hover:bg-red-500/100 hover:text-white">
 <X size={14} />
 </button>
 </div>
 </div>
 <p className="text-xs font-bold text-[var(--admin-text-muted)] mb-4">{tax.description}</p>
 <div className="p-3 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)] w-fit min-w-[120px]">
 <span className="text-[8px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest block mb-1">Tax Amount</span>
 <span className="text-xs font-black text-[var(--admin-text-main)]">{tax.percentage}%</span>
 </div>
 </div>
 </div>
 )}
 </motion.div>
 );
 }) : (
 <div className="py-16 text-center text-[var(--admin-text-muted)]">
 <Database size={32} className="mx-auto mb-3 opacity-30" />
 <p className="text-[10px] font-black uppercase tracking-widest">No taxes configured - click Add Tax to begin</p>
 </div>
 )}
 </div>
 </motion.div>
 );
});

const VerificationFieldsManager = ({
 fields,
 onChange,
}: {
 fields: any[];
 onChange: (val: any[]) => void;
}) => {
 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <div>
 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-text-main)] mb-1">Required Documents</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Define what documents users must upload for identity verification</p>
 </div>
 <Button 
 onClick={() => {
 const newField = { id: `field_${Date.now()}`, name: 'New ID Type', type: 'image', required: true, description: '' };
 onChange([...fields, newField]);
 }}
 className="h-10 px-6 rounded-app bg-primary text-[10px] font-black uppercase tracking-widest text-white "
 >
 + Add Document Type
 </Button>
 </div>

 <div className="grid grid-cols-1 gap-4">
 {fields.map((field, idx) => (
 <div key={field.id} className="bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-app bg-primary/10 flex items-center justify-center text-primary">
 {field.type === 'image' ? <ImageIcon size={16} /> : <Edit2 size={16} />}
 </div>
 <Input 
 value={field.name}
 onChange={(e) => {
 const updated = [...fields];
 updated[idx].name = e.target.value;
 onChange(updated);
 }}
 className="h-8 bg-transparent border-none font-black text-sm p-0 focus-visible:ring-0 w-80"
 placeholder="Document Name (e.g. Passport)"
 />
 </div>
 <button 
 onClick={() => {
 const updated = fields.filter((_, i) => i !== idx);
 onChange(updated);
 }}
 className="text-[var(--admin-text-muted)] hover:text-red-500 transition-colors"
 >
 <X size={18} />
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-[var(--admin-border)]">
 <div className="space-y-2">
 <label className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Field Type</label>
 <EliteSelect 
 value={field.type}
 onChange={(val) => {
 const updated = [...fields];
 updated[idx].type = val;
 onChange(updated);
 }}
 options={[
 { value: 'image', label: 'Image Upload' },
 { value: 'text', label: 'Text Input' },
 { value: 'date', label: 'Date Selection' },
 { value: 'phone', label: 'Phone Number' }
 ]}
 variant="minimal"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Required</label>
 <div className="h-8 flex items-center">
 <Switch 
 checked={field.required}
 onCheckedChange={(val) => {
 const updated = [...fields];
 updated[idx].required = val;
 onChange(updated);
 }}
 />
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Instruction/Help Text</label>
 <Input 
 value={field.description}
 onChange={(e) => {
 const updated = [...fields];
 updated[idx].description = e.target.value;
 onChange(updated);
 }}
 className="h-8 bg-[var(--admin-bg)] border-none text-[10px] font-bold rounded-app"
 placeholder="Explain what to upload..."
 />
 </div>
 </div>
 </div>
 ))}
 {fields.length === 0 && (
 <div className="py-20 border-2 border-dashed border-[var(--admin-border)] rounded-app flex flex-col items-center justify-center text-[var(--admin-text-muted)]">
 <ShieldCheck size={48} className="mb-4 opacity-10" />
 <p className="text-[10px] font-black uppercase tracking-widest">No verification fields defined</p>
 </div>
 )}
 </div>
 </div>
 );
};

const CORE_LISTING_FIELDS = [
  { id: 'core_name', label: 'Vehicle Name / Title', key: 'name', type: 'text', required: true, placeholder: 'e.g. Tesla Model S', isCore: true, stepId: 1 },
  { id: 'core_permalink', label: 'Permalink / Slug', key: 'permalink', type: 'text', required: true, placeholder: 'e.g. tesla-model-s', isCore: true, stepId: 1 },
  { id: 'core_content', label: 'Description (HTML Rich Text)', key: 'content', type: 'text', required: true, placeholder: 'Full vehicle description...', isCore: true, stepId: 1 },
  { id: 'core_shortDescription', label: 'Short Description', key: 'shortdescription', type: 'text', required: false, placeholder: 'Brief summary...', isCore: true, stepId: 1 },
  { id: 'core_vehicleType', label: 'Vehicle Category', key: 'vehicletype', type: 'select', required: true, placeholder: 'Select category', options: 'Sedan, SUV, Coupe, Truck, Van, Wagon', isCore: true, stepId: 1 },
  { id: 'core_transmission', label: 'Transmission', key: 'transmission', type: 'select', required: true, placeholder: 'Select transmission', options: 'Automatic, Manual, Semi-Auto', isCore: true, stepId: 3 },
  { id: 'core_fuelType', label: 'Fuel Type', key: 'fueltype', type: 'select', required: true, placeholder: 'Select fuel type', options: 'Petrol, Diesel, EV, Hybrid', isCore: true, stepId: 3 },
  { id: 'core_year', label: 'Manufacture Year', key: 'year', type: 'number', required: true, placeholder: 'e.g. 2024', isCore: true, stepId: 1 },
  { id: 'core_brandId', label: 'Brand / Make', key: 'brandid', type: 'select', required: true, placeholder: 'Select brand', options: 'Tesla, BMW, Audi, Mercedes, Toyota, Honda', isCore: true, stepId: 1 },
  { id: 'core_model', label: 'Model', key: 'model', type: 'text', required: true, placeholder: 'e.g. Model S', isCore: true, stepId: 1 },
  { id: 'core_pricePerDay', label: 'Price Per Day', key: 'priceperday', type: 'number', required: true, placeholder: 'e.g. 150', isCore: true, stepId: 5 },
  { id: 'core_minBookingDays', label: 'Minimum Booking Days', key: 'minbookingdays', type: 'number', required: false, placeholder: 'e.g. 1', isCore: true, stepId: 5 },
  { id: 'core_securityDeposit', label: 'Security Deposit', key: 'securitydeposit', type: 'number', required: false, placeholder: 'e.g. 500', isCore: true, stepId: 5 },
  { id: 'core_distanceIncluded', label: 'Distance Included (km)', key: 'distanceincluded', type: 'number', required: false, placeholder: 'e.g. 200', isCore: true, stepId: 5 },
  { id: 'core_extraDistanceFee', label: 'Extra Distance Fee (per km)', key: 'extradistancefee', type: 'number', required: false, placeholder: 'e.g. 0.5', isCore: true, stepId: 5 },
  { id: 'core_horsepower', label: 'Horsepower (HP)', key: 'horsepower', type: 'number', required: false, placeholder: 'e.g. 450', isCore: true, stepId: 3 },
  { id: 'core_mileage', label: 'Mileage / Odometer', key: 'mileage', type: 'number', required: false, placeholder: 'e.g. 25000', isCore: true, stepId: 3 },
  { id: 'core_vin', label: 'VIN Number', key: 'vin', type: 'text', required: false, placeholder: '17-Digit VIN', isCore: true, stepId: 3 },
  { id: 'core_seats', label: 'Number of Seats', key: 'seats', type: 'number', required: true, placeholder: 'e.g. 5', isCore: true, stepId: 3 },
  { id: 'core_doors', label: 'Number of Doors', key: 'doors', type: 'number', required: true, placeholder: 'e.g. 4', isCore: true, stepId: 3 },
  { id: 'core_driveType', label: 'Drivetrain / Drive Type', key: 'drivetype', type: 'select', required: false, placeholder: 'Select drivetrain', options: 'FWD, RWD, AWD, 4WD', isCore: true, stepId: 3 },
  { id: 'core_fuelEfficiency', label: 'Fuel Efficiency', key: 'fuelefficiency', type: 'text', required: false, placeholder: 'e.g. 15 km/l', isCore: true, stepId: 3 },
  { id: 'core_color', label: 'Color', key: 'color', type: 'text', required: false, placeholder: 'e.g. Midnight Black', isCore: true, stepId: 3 },
  { id: 'core_acceleration', label: 'Acceleration (0-100 km/h)', key: 'acceleration', type: 'number', required: false, placeholder: 'e.g. 3.5', isCore: true, stepId: 3 },
  { id: 'core_chargingType', label: 'EV Charging Type', key: 'chargingtype', type: 'select', required: false, placeholder: 'Select charging type', options: 'AC Level 1, AC Level 2, DC Fast Charge, Tesla Supercharger', isCore: true, stepId: 3 },
  { id: 'core_batteryCapacity', label: 'Battery Capacity (kWh)', key: 'batterycapacity', type: 'number', required: false, placeholder: 'e.g. 100', isCore: true, stepId: 3 },
  { id: 'core_range', label: 'EV Range (km)', key: 'range', type: 'number', required: false, placeholder: 'e.g. 500', isCore: true, stepId: 3 }
];

const CustomFieldsManager = ({
  fields,
  customSteps = [],
  onChange,
}: {
  fields: any[];
  customSteps?: { id: number; title: string }[];
  onChange: (val: any[], stepsVal?: { id: number; title: string }[]) => void;
}) => {
  const [activeStepId, setActiveStepId] = useState(1);

  const baseSteps = [
    { id: 1, title: 'Information' },
    { id: 2, title: 'Photos' },
    { id: 3, title: 'Specs' },
    { id: 4, title: 'Address' },
    { id: 5, title: 'Pricing' },
    { id: 6, title: 'SEO' },
  ];

  const allSteps = [...baseSteps, ...customSteps];

  // Merge core fields with custom fields ensuring core fields are always present and correctly identified
  const allFields = CORE_LISTING_FIELDS.map(core => {
    const existing = fields.find(f => f.key.toLowerCase() === core.key.toLowerCase());
    if (existing) {
      return { ...existing, isCore: true, stepId: existing.stepId || core.stepId };
    }
    return core;
  });
  fields.forEach(f => {
    if (!allFields.some(core => core.key.toLowerCase() === f.key.toLowerCase())) {
      allFields.push({ ...f, stepId: f.stepId || 3 });
    }
  });

  const filteredFields = allFields.filter(f => f.stepId === activeStepId);

  return (
    <div className="space-y-6 pt-6 border-t border-[var(--admin-border)] pb-32">
      <div className="flex items-center justify-between p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-text-main)] mb-1">Listing Fields & Specifications</h4>
          <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Manage core vehicle attributes and define custom specifications</p>
        </div>
        <Button 
          onClick={() => {
            const count = allFields.filter(f => !f.isCore).length + 1;
            const newField = { id: `spec_${Date.now()}`, label: `New Specification ${count}`, key: `new_spec_${count}`, type: 'text', required: false, placeholder: '', options: '', stepId: activeStepId };
            onChange([...allFields, newField], customSteps);
          }}
          className="h-10 px-6 rounded-app bg-primary text-[10px] font-black uppercase tracking-widest text-white"
        >
          + Add Spec Field
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-2 bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)]">
        {allSteps.map(st => (
          <div key={st.id} onClick={() => setActiveStepId(st.id)} className={`flex items-center gap-2 px-4 py-2 rounded-app cursor-pointer transition-all ${activeStepId === st.id ? 'bg-primary text-white font-black shadow-lg shadow-primary/20' : 'bg-[var(--admin-bg)] text-[var(--admin-text-main)] hover:bg-[var(--admin-bg)]/80 font-bold'} text-[10px] uppercase tracking-widest`}>
            <span>Step {st.id}: {st.title}</span>
            {st.id > 6 && (
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  const updatedSteps = customSteps.filter(cs => cs.id !== st.id);
                  const updatedFields = allFields.map(f => f.stepId === st.id ? { ...f, stepId: 3 } : f);
                  onChange(updatedFields, updatedSteps);
                  setActiveStepId(1);
                }}
                className="ml-1 hover:text-red-300 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <Button 
          type="button"
          onClick={() => {
            const nextId = allSteps.length > 0 ? Math.max(...allSteps.map(s => s.id)) + 1 : 7;
            const newStep = { id: nextId, title: `Custom Step ${nextId}` };
            onChange(allFields, [...customSteps, newStep]);
            setActiveStepId(nextId);
          }}
          className="h-8 px-4 rounded-app bg-[var(--admin-bg)] hover:bg-primary/10 text-primary border border-dashed border-primary/30 text-[10px] font-black uppercase tracking-widest"
        >
          + Add Custom Step
        </Button>
      </div>

      {activeStepId > 6 && (
        <div className="flex items-center gap-4 p-4 bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)]">
          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Custom Step Title:</label>
          <Input 
            value={customSteps.find(cs => cs.id === activeStepId)?.title || ''}
            onChange={(e) => {
              const updatedSteps = customSteps.map(cs => cs.id === activeStepId ? { ...cs, title: e.target.value } : cs);
              onChange(allFields, updatedSteps);
            }}
            className="h-9 bg-[var(--admin-bg)] border-none font-black text-xs w-80"
            placeholder="e.g. Advanced Features"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredFields.map((field) => {
          const idx = allFields.findIndex(f => f.key === field.key);
          return (
            <div key={field.id || `field_${idx}`} className="bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] space-y-4 overflow-visible relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-app bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Database size={16} />
                  </div>
                  <Input 
                    value={field.label}
                    onChange={(e) => {
                      const updated = [...allFields];
                      updated[idx].label = e.target.value;
                      if (!updated[idx].key || updated[idx].key.startsWith('new_spec_')) {
                        updated[idx].key = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_');
                      }
                      onChange(updated, customSteps);
                    }}
                    className="h-8 bg-transparent border-none font-black text-sm p-0 focus-visible:ring-0 w-80"
                    placeholder="Field Label (e.g. Number of Seats)"
                  />
                  {field.isCore && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-black uppercase tracking-widest shrink-0">
                      🔒 Core Listing Field
                    </span>
                  )}
                </div>
                {!field.isCore ? (
                  <button 
                    onClick={() => {
                      const updated = allFields.filter((_, i) => i !== idx);
                      onChange(updated, customSteps);
                    }}
                    className="text-[var(--admin-text-muted)] hover:text-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                ) : (
                  <span className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Protected Schema</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-[var(--admin-border)]">
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Field Key</label>
                    {allFields.filter((f, i) => i !== idx && f.key.trim() && f.key.trim().toLowerCase() === field.key.trim().toLowerCase()).length > 0 && (
                      <span className="text-[9px] font-black text-rose-500 animate-pulse">⚠️ Duplicate Key</span>
                    )}
                  </div>
                  <Input 
                    value={field.key}
                    disabled={field.isCore}
                    onChange={(e) => {
                      const updated = [...allFields];
                      updated[idx].key = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      onChange(updated, customSteps);
                    }}
                    className={`h-8 bg-[var(--admin-bg)] border ${allFields.filter((f, i) => i !== idx && f.key.trim() && f.key.trim().toLowerCase() === field.key.trim().toLowerCase()).length > 0 ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-none'} text-[10px] font-bold rounded-app w-full ${field.isCore ? 'opacity-70 cursor-not-allowed' : ''}`}
                    placeholder="e.g. number_of_seats"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Field Type</label>
                  <EliteSelect 
                    value={field.type}
                    disabled={field.isCore}
                    onChange={(val) => {
                      const updated = [...allFields];
                      updated[idx].type = val;
                      if (val === 'boolean' && !updated[idx].options) {
                        updated[idx].options = 'Yes, No';
                      }
                      onChange(updated, customSteps);
                    }}
                    options={[
                      { value: 'text', label: 'Text Input' },
                      { value: 'number', label: 'Number Input' },
                      { value: 'boolean', label: 'Toggle Switch' },
                      { value: 'select', label: 'Dropdown Select' },
                      { value: 'image', label: 'Single Image Upload' },
                      { value: 'images', label: 'Multiple Images Upload' },
                      { value: 'file', label: 'Document Upload (PDF, Word)' }
                    ]}
                    variant="minimal"
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Assigned Step</label>
                  <EliteSelect 
                    value={field.stepId}
                    onChange={(val) => {
                      const updated = [...allFields];
                      updated[idx].stepId = Number(val);
                      onChange(updated, customSteps);
                    }}
                    options={allSteps.map(s => ({ value: s.id, label: `Step ${s.id}: ${s.title}` }))}
                    variant="minimal"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Required</label>
                  <div className="h-8 flex items-center">
                    <Switch 
                      checked={field.required}
                      disabled={field.isCore}
                      onCheckedChange={(val) => {
                        const updated = [...allFields];
                        updated[idx].required = val;
                        onChange(updated, customSteps);
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">
                    {field.type === 'select' ? 'Options (Comma separated)' : field.type === 'boolean' ? 'Toggle Labels (e.g. Yes, No)' : field.type === 'image' || field.type === 'images' || field.type === 'file' ? 'Helper / Format Text' : 'Placeholder Text'}
                  </label>
                  <Input 
                    value={field.type === 'select' || field.type === 'boolean' ? field.options : field.placeholder}
                    onChange={(e) => {
                      const updated = [...allFields];
                      if (field.type === 'select' || field.type === 'boolean') {
                        updated[idx].options = e.target.value;
                      } else {
                        updated[idx].placeholder = e.target.value;
                      }
                      onChange(updated, customSteps);
                    }}
                    className="h-8 bg-[var(--admin-bg)] border-none text-[10px] font-bold rounded-app w-full"
                    placeholder={field.type === 'select' ? 'e.g. Automatic, Manual' : field.type === 'boolean' ? 'e.g. Yes, No' : field.type === 'image' ? 'e.g. Upload high-res photo' : field.type === 'images' ? 'e.g. Upload gallery photos' : field.type === 'file' ? 'e.g. Upload PDF or DOCX' : 'e.g. Enter value...'}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {filteredFields.length === 0 && (
          <div className="py-20 border-2 border-dashed border-[var(--admin-border)] rounded-app flex flex-col items-center justify-center text-[var(--admin-text-muted)]">
            <Plus size={48} className="mb-4 opacity-10" />
            <p className="text-[10px] font-black uppercase tracking-widest">No specification fields assigned to this step</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProtectionPlansManager = React.forwardRef(({
 plans,
 onChange,
}: {
 plans: any[];
 onChange: (val: any[]) => void;
}, ref) => {
 const [editingIdx, setEditingIdx] = useState<number | null>(null);
 const [editDraft, setEditDraft] = useState<any>({});
 const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
 const [showToast, setShowToast] = useState(false);
 const listRef = useRef<HTMLDivElement>(null);

 React.useImperativeHandle(ref, () => ({
 addItem: handleAddNewPlan
 }));

 const handleSaveEdit = (idx: number) => {
 const updated = plans.map((p, i) => (i === idx ? { ...editDraft } : p));
 onChange(updated);
 setEditingIdx(null);
 };

 const handleAddNewPlan = () => {
 const newPlan = {
 id: `plan_${Date.now()}`,
 name: 'New Protection Plan',
 description: 'Describe the coverage here...',
 coverageSubtext: 'e.g. $500 deductible',
 outOfPocketPercentage: 10,
 pricePercentage: 15
 };
 onChange([...plans, newPlan]);
 setEditingIdx(plans.length);
 setEditDraft(newPlan);

 // Scroll to new plan
 setTimeout(() => {
 if (listRef.current) {
 const lastChild = listRef.current.lastElementChild;
 lastChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
 }
 }, 100);
 };

 const confirmDelete = () => {
 if (confirmDeleteIdx !== null) {
 const updated = plans.filter((_, i) => i !== confirmDeleteIdx);
 onChange(updated);
 setConfirmDeleteIdx(null);
 setShowToast(true);
 setTimeout(() => setShowToast(false), 3000);
 }
 };

 return (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative">
 {/* Success Toast */}
 <AnimatePresence>
 {showToast && (
 <motion.div 
 initial={{ opacity: 0, y: 50, x: '-50%' }} 
 animate={{ opacity: 1, y: 0, x: '-50%' }} 
 exit={{ opacity: 0, y: 50, x: '-50%' }}
 className="fixed bottom-10 left-1/2 z-50 bg-slate-900 rounded-full px-6 py-3 flex items-center gap-3 border border-white/10"
 >
 <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
 <Check size={12} className="text-white" />
 </div>
 <span className="text-xs font-black text-white uppercase tracking-widest">Plan Deleted Successfully</span>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Custom Delete Modal */}
 <AnimatePresence>
 {confirmDeleteIdx !== null && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 onClick={() => setConfirmDeleteIdx(null)}
 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
 />
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }} 
 animate={{ opacity: 1, scale: 1, y: 0 }} 
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative w-full max-w-sm bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)] p-8 text-center overflow-hidden"
 >
 <div className="w-16 h-16 bg-red-500/10 rounded-app flex items-center justify-center mx-auto mb-4 text-red-500">
 <X size={32} />
 </div>
 <h3 className="text-lg font-black text-[var(--admin-text-main)] mb-2 uppercase tracking-tight">Delete Protection Plan?</h3>
 <p className="text-xs font-bold text-[var(--admin-text-muted)] mb-8 uppercase tracking-widest leading-relaxed">
 This action cannot be undone. Users will no longer be able to select "{plans[confirmDeleteIdx]?.name}" during checkout.
 </p>
 <div className="flex flex-col gap-2">
 <Button onClick={confirmDelete} className="h-12 w-full bg-red-500/100 hover:bg-red-600 text-white rounded-app text-[10px] font-black uppercase tracking-[0.2em] -200">
 Delete Permanently
 </Button>
 <button onClick={() => setConfirmDeleteIdx(null)} className="h-12 w-full bg-[var(--admin-bg)] text-[var(--admin-text-muted)] rounded-app text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--admin-bg)] transition-all">
 Keep Plan
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 <div className="flex items-center justify-between py-2 mb-4 border-b border-[var(--admin-border)]">
 <div>
 <h4 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--admin-text-main)] mb-1">Protection Plans</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">
 Configure coverage tiers and out-of-pocket maximums
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-6" ref={listRef}>
 {plans && plans.length > 0 ? plans.map((plan, idx) => {
 const isEditing = editingIdx === idx;
 return (
 <motion.div 
 layout
 key={plan.id || idx} 
 className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-app overflow-hidden p-6 relative group/plan"
 >
 {isEditing ? (
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Plan Name</label>
 <Input value={editDraft.name} onChange={e => setEditDraft({...editDraft, name: e.target.value})} className="h-10 font-bold" />
 </div>
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Price Percentage (%)</label>
 <div className="relative">
 <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
 <Input type="number" value={editDraft.pricePercentage} onChange={e => setEditDraft({...editDraft, pricePercentage: Number(e.target.value)})} className="h-10 font-bold pr-10" />
 </div>
 </div>
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Out-of-Pocket Percentage (%)</label>
 <div className="relative">
 <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
 <Input type="number" value={editDraft.outOfPocketPercentage} onChange={e => setEditDraft({...editDraft, outOfPocketPercentage: Number(e.target.value)})} className="h-10 font-bold pr-10" />
 </div>
 </div>
 </div>
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Description</label>
 <Textarea value={editDraft.description} onChange={e => setEditDraft({...editDraft, description: e.target.value})} className="min-h-[80px] font-bold" />
 </div>
 <div className="flex gap-2">
 <Button onClick={() => handleSaveEdit(idx)} className="h-9 px-6 bg-primary text-white rounded-app text-[10px] font-black uppercase tracking-widest">Save Changes</Button>
 <button onClick={() => setEditingIdx(null)} className="h-9 px-4 rounded-app border border-[var(--admin-border)] text-[var(--admin-text-muted)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--admin-bg)]">Cancel</button>
 </div>
 </div>
 ) : (
 <div className="flex items-start gap-6">
 <div className="w-14 h-14 rounded-app bg-primary/10 flex items-center justify-center flex-shrink-0">
 <ShieldCheck className="text-primary" size={24} />
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-3">
 <h4 className="text-sm font-black text-[var(--admin-text-main)]">{plan.name}</h4>
 </div>
 <div className="flex items-center gap-2">
 <button onClick={() => { setEditingIdx(idx); setEditDraft({...plan}); }} className="w-8 h-8 rounded-app border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-text-muted)] hover:border-primary hover:text-primary transition-all">
 <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
 </button>
 <button onClick={() => setConfirmDeleteIdx(idx)} className="w-8 h-8 rounded-app bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover/plan:opacity-100 transition-all hover:bg-red-500/100 hover:text-white">
 <X size={14} />
 </button>
 </div>
 </div>
 <p className="text-xs font-bold text-[var(--admin-text-muted)] mb-4">{plan.description}</p>
 <div className="grid grid-cols-2 gap-4">
 <div className="p-3 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <span className="text-[8px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest block mb-1">Price Markup</span>
 <span className="text-xs font-black text-[var(--admin-text-main)]">{plan.pricePercentage}% of car daily rate</span>
 </div>
 <div className="p-3 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <span className="text-[8px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest block mb-1">Max Out-of-pocket</span>
 <span className="text-xs font-black text-[var(--admin-text-main)]">{plan.outOfPocketPercentage}% of car daily rate</span>
 </div>
 </div>
 </div>
 </div>
 )}
 </motion.div>
 );
 }) : (
 <div className="py-16 text-center text-[var(--admin-text-muted)]">
 <ShieldCheck size={32} className="mx-auto mb-3 opacity-30" />
 <p className="text-[10px] font-black uppercase tracking-widest">No plans initialized - click Add Plan to create one</p>
 </div>
 )}
 </div>

 <div className="p-4 bg-primary/5 border border-primary/10 rounded-app">
 <p className="text-[9px] font-black text-primary uppercase tracking-widest">
 💡 Changes to protection plans will take effect immediately for new bookings. The daily price and out-of-pocket maximum are calculated as a percentage of the car's Base Daily Price.
 </p>
 </div>
 </motion.div>
 );
});

const CancellationManager = React.forwardRef(({
 config,
 onChange,
}: {
 config: any;
 onChange: (val: any) => void;
}, ref) => {
 const [editingIdx, setEditingIdx] = useState<number | null>(null);
 const [editDraft, setEditDraft] = useState<any>({});
 const listRef = useRef<HTMLDivElement>(null);

 React.useImperativeHandle(ref, () => ({
 addItem: () => {
 const newRule = {
 id: `rule_${Date.now()}`,
 type: 'before_trip_start',
 hours: 24,
 refundPercentage: 50,
 description: 'New Cancellation Rule'
 };
 const updatedRules = [...(config.rules || []), newRule];
 onChange({ ...config, rules: updatedRules });
 setEditingIdx(updatedRules.length - 1);
 setEditDraft(newRule);
 }
 }));

 const handleSaveEdit = (idx: number) => {
 const updatedRules = (config.rules || []).map((r: any, i: number) => (i === idx ? { ...editDraft } : r));
 onChange({ ...config, rules: updatedRules });
 setEditingIdx(null);
 };

 const handleDelete = (idx: number) => {
 if (!confirm('Remove this cancellation rule?')) return;
 const updatedRules = (config.rules || []).filter((_: any, i: number) => i !== idx);
 onChange({ ...config, rules: updatedRules });
 };

 return (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
 <div className="flex items-center justify-between py-2 mb-4 border-b border-[var(--admin-border)]">
 <div>
 <h4 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--admin-text-main)] mb-1">Cancellation Policy</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">
 Define refund rules based on booking time and trip start
 </p>
 </div>
 <div className="flex items-center gap-4">
 <span className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Enabled</span>
 <Switch checked={config.isCancellationEnabled} onCheckedChange={(val) => onChange({...config, isCancellationEnabled: val})} />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-4" ref={listRef}>
 <div className="p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)] flex items-center justify-between">
 <div>
 <h5 className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-main)] mb-1">Default Refund</h5>
 <p className="text-[9px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Applied if no other rules match</p>
 </div>
 <div className="flex items-center gap-3">
 <Input 
 type="number" 
 value={config.defaultRefundPercentage} 
 onChange={(e) => onChange({...config, defaultRefundPercentage: Number(e.target.value)})}
 className="w-20 h-10 font-bold text-center" 
 />
 <span className="text-xs font-black text-[var(--admin-text-main)]">%</span>
 </div>
 </div>

 {(config.rules || []).map((rule: any, idx: number) => {
 const isEditing = editingIdx === idx;
 return (
 <div key={rule.id || idx} className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-app p-6 relative group/rule">
 {isEditing ? (
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Rule Type</label>
 <EliteSelect 
 value={editDraft.type} 
 onChange={(val) => setEditDraft({...editDraft, type: val})}
 options={[
 { value: 'within_booking_window', label: 'Within Booking Window' },
 { value: 'before_trip_start', label: 'Before Trip Start' }
 ]}
 />
 </div>
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Time Window (Hours)</label>
 <Input type="number" value={editDraft.hours} onChange={e => setEditDraft({...editDraft, hours: Number(e.target.value)})} className="h-10 font-bold" />
 </div>
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Refund Percentage (%)</label>
 <Input type="number" value={editDraft.refundPercentage} onChange={e => setEditDraft({...editDraft, refundPercentage: Number(e.target.value)})} className="h-10 font-bold" />
 </div>
 </div>
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Description</label>
 <Input value={editDraft.description} onChange={e => setEditDraft({...editDraft, description: e.target.value})} className="h-10 font-bold" />
 </div>
 <div className="flex gap-2 justify-end pt-2">
 <Button onClick={() => handleSaveEdit(idx)} className="h-9 px-6 bg-primary text-white rounded-app text-[10px] font-black uppercase tracking-widest">Save</Button>
 <button onClick={() => setEditingIdx(null)} className="h-9 px-4 rounded-app border border-[var(--admin-border)] text-[var(--admin-text-muted)] text-[10px] font-black uppercase tracking-widest">Cancel</button>
 </div>
 </div>
 ) : (
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-6">
 <div className="w-12 h-12 rounded-app bg-primary/5 flex items-center justify-center text-primary">
 <Clock size={20} />
 </div>
 <div>
 <h4 className="text-sm font-black text-[var(--admin-text-main)]">{rule.description}</h4>
 <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">
 {rule.type === 'within_booking_window' ? `Within ${rule.hours}h of booking` : `More than ${rule.hours}h before trip`} 
 <span className="mx-2 opacity-30">•</span>
 {rule.refundPercentage}% Refund
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button onClick={() => { setEditingIdx(idx); setEditDraft({...rule}); }} className="w-8 h-8 rounded-app border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-text-muted)] hover:text-primary transition-all">
 <Edit2 size={14} />
 </button>
 <button onClick={() => handleDelete(idx)} className="w-8 h-8 rounded-app bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500/100 hover:text-white transition-all opacity-0 group-hover/rule:opacity-100">
 <X size={14} />
 </button>
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 </motion.div>
 );
});

function LocationsManager({
 locations,
 onChange,
}: {
 locations: any[];
 onChange: (val: any[]) => void;
}) {
 const [adding, setAdding] = useState(false);
 const [newLoc, setNewLoc] = useState({ ...EMPTY_LOCATION });
 const [editingIdx, setEditingIdx] = useState<number | null>(null);
 const [editDraft, setEditDraft] = useState<any>({});

 const handleAdd = () => {
 if (!newLoc.city || !newLoc.address) return alert('City and Address are required');
 onChange([...locations, { ...newLoc }]);
 setNewLoc({ ...EMPTY_LOCATION });
 setAdding(false);
 };

 const handleSaveEdit = (idx: number) => {
 const updated = locations.map((l, i) => (i === idx ? { ...editDraft } : l));
 onChange(updated);
 setEditingIdx(null);
 };

 const handleDelete = (idx: number) => {
 if (!confirm(`Remove "${locations[idx].city}"?`)) return;
 onChange(locations.filter((_, i) => i !== idx));
 };

 const FIELDS: { key: keyof typeof EMPTY_LOCATION; label: string; placeholder: string; icon: string }[] = [
 { key: 'city', label: 'City', placeholder: 'e.g. Dubai', icon: '🌆' },
 { key: 'address', label: 'Address', placeholder: 'e.g. Dubai International Airport, Terminal 3', icon: '📍' },
 { key: 'phone', label: 'Phone', placeholder: 'e.g. +971 4 224 5555', icon: '📞' },
 { key: 'email', label: 'Email', placeholder: 'e.g. dubai@carrental.com', icon: '✉️' },
 { key: 'hours', label: 'Hours', placeholder: 'e.g. 24/7 Service', icon: '🕐' },
 { key: 'coordinates', label: 'Coordinates', placeholder: 'e.g. 25.2532° N, 55.3657° E', icon: '🗺️' },
 ];

 return (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between py-2 mb-4 border-b border-[var(--admin-border)]">
 <div>
 <h4 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--admin-text-main)] mb-1">Office Locations</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">
 Manage branch locations shown on the home page &amp; locations page
 </p>
 </div>
 </div>

 {/* Add form */}
 <AnimatePresence>
 {adding && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden"
 >
 <div className="p-6 bg-[var(--admin-card-bg)] border border-primary/20 rounded-app space-y-4">
 <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">New Location</h5>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {FIELDS.map(f => (
 <div key={f.key} className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">{f.icon} {f.label}{f.key === 'city' || f.key === 'address' ? ' *' : ''}</label>
 <Input
 value={newLoc[f.key]}
 onChange={e => setNewLoc(p => ({ ...p, [f.key]: e.target.value }))}
 placeholder={f.placeholder}
 className="h-10 bg-[var(--admin-bg)] border-[var(--admin-border)] text-sm font-bold"
 />
 </div>
 ))}
 </div>
 <div className="flex items-center gap-3 pt-2">
 <Button onClick={handleAdd} className="h-9 px-6 bg-primary text-white rounded-app text-[10px] font-black uppercase tracking-widest">
 Add Location
 </Button>
 <button onClick={() => setAdding(false)} className="h-9 px-5 rounded-app border border-[var(--admin-border)] text-[var(--admin-text-muted)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--admin-bg)]">
 Cancel
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Location cards */}
 {locations.length === 0 && !adding ? (
 <div className="py-16 text-center text-[var(--admin-text-muted)]">
 <MapPin size={32} className="mx-auto mb-3 opacity-30" />
 <p className="text-[10px] font-black uppercase tracking-widest">No locations yet — add your first one above</p>
 </div>
 ) : (
 <div className="space-y-4">
 {locations.map((loc, idx) => {
 const isEditing = editingIdx === idx;
 return (
 <motion.div key={idx} layout className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-app overflow-hidden">
 {isEditing ? (
 <div className="p-5 space-y-4">
 <div className="flex items-center justify-between mb-2">
 <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Editing: {loc.city}</h5>
 <button onClick={() => setEditingIdx(null)} className="w-7 h-7 rounded-full bg-[var(--admin-bg)] flex items-center justify-center text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)]">
 <X size={13} />
 </button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {FIELDS.map(f => (
 <div key={f.key} className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">{f.icon} {f.label}</label>
 <Input
 value={editDraft[f.key] || ''}
 onChange={e => setEditDraft((p: any) => ({ ...p, [f.key]: e.target.value }))}
 placeholder={f.placeholder}
 className="h-9 bg-[var(--admin-bg)] border-[var(--admin-border)] text-xs font-bold"
 />
 </div>
 ))}
 </div>
 <div className="flex gap-3 pt-1">
 <Button onClick={() => handleSaveEdit(idx)} className="h-9 px-6 bg-primary text-white rounded-app text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
 <Check size={12} /> Save Changes
 </Button>
 <button onClick={() => setEditingIdx(null)} className="h-9 px-4 rounded-app border border-[var(--admin-border)] text-[var(--admin-text-muted)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--admin-bg)]">
 Cancel
 </button>
 </div>
 </div>
 ) : (
 <div className="flex items-start gap-5 p-5 group">
 {/* Pin icon */}
 <div className="w-11 h-11 rounded-app bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
 <MapPin size={18} className="text-primary" />
 </div>
 {/* Info */}
 <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
 <div className="sm:col-span-2 lg:col-span-3 mb-1">
 <h4 className="text-sm font-black text-[var(--admin-text-main)] tracking-tight">{loc.city}</h4>
 <p className="text-[11px] text-[var(--admin-text-muted)] font-medium">{loc.address}</p>
 </div>
 {loc.phone && (
 <div>
 <span className="text-[8px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Phone</span>
 <p className="text-[11px] font-bold text-[var(--admin-text-main)]">{loc.phone}</p>
 </div>
 )}
 {loc.email && (
 <div>
 <span className="text-[8px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Email</span>
 <p className="text-[11px] font-bold text-[var(--admin-text-main)]">{loc.email}</p>
 </div>
 )}
 {loc.hours && (
 <div>
 <span className="text-[8px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Hours</span>
 <p className="text-[11px] font-bold text-[var(--admin-text-main)]">{loc.hours}</p>
 </div>
 )}
 {loc.coordinates && (
 <div className="sm:col-span-2 lg:col-span-3">
 <span className="text-[8px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Coordinates</span>
 <p className="text-[11px] font-bold text-[var(--admin-text-muted)] font-mono">{loc.coordinates}</p>
 </div>
 )}
 </div>
 {/* Actions */}
 <div className="flex items-center gap-2 flex-shrink-0">
 <button
 onClick={() => { setEditingIdx(idx); setEditDraft({ ...loc }); }}
 className="w-8 h-8 rounded-app border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-text-muted)] hover:border-primary hover:text-primary transition-all"
 title="Edit"
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
 </button>
 <button
 onClick={() => handleDelete(idx)}
 className="w-8 h-8 rounded-app border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-text-muted)] hover:border-red-300 hover:text-red-500 transition-all"
 title="Delete"
 >
 <X size={13} />
 </button>
 </div>
 </div>
 )}
 </motion.div>
 );
 })}
 </div>
 )}

 {/* Save reminder */}
 <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-app">
 <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
 <Save size={14} className="text-blue-500" />
 </div>
 <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
 Changes are saved with the global <strong>Save Settings</strong> button in the top bar.
 These locations appear on the home page "Find us globally" section and the Locations page.
 </p>
 </div>
 </motion.div>
 );
}

// ────────────────────────────────────────────────────────────────
// Destinations Manager — standalone component used in frontend tab
// ────────────────────────────────────────────────────────────────
function DestinationsManager({ backendUrl }: { backendUrl: string }) {
 const [items, setItems] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [uploadingId, setUploadingId] = useState<string | null>(null);
 const [editingId, setEditingId] = useState<string | null>(null);
 const [editDraft, setEditDraft] = useState<any>({});
 const [adding, setAdding] = useState(false);
 const [newDraft, setNewDraft] = useState<{ city: string, country: string, description: string, image?: string | null, fileName?: string }>({ city: '', country: '', description: '', image: null, fileName: '' });
 const [availableLocations, setAvailableLocations] = useState<any[]>([]);
 const [loadingLocations, setLoadingLocations] = useState(false);
 const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

 const token = authService.getAdminToken();
 const authHeaders = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

 const load = async () => {
 setLoading(true);
 try {
 const res = await fetch(`${backendUrl}/destinations/admin/all`, { headers: authHeaders });
 const data = await res.json();
 setItems(Array.isArray(data) ? data : []);
 } catch { setItems([]); } finally { setLoading(false); }
 };

 const loadAvailable = async () => {
 setLoadingLocations(true);
 try {
 const res = await fetch(`${backendUrl}/cars/destinations`);
 const data = await res.json();
 setAvailableLocations(Array.isArray(data) ? data : []);
 } catch { setAvailableLocations([]); } finally { setLoadingLocations(false); }
 };

 const resizeImage = (file: File, maxWidth = 1200, maxHeight = 1200, minDimension = 300): Promise<{ base64: string, fileName: string }> => {
 return new Promise((resolve, reject) => {
 const reader = new FileReader();
 reader.onload = (e) => {
 const img = new Image();
 img.onload = () => {
 const canvas = document.createElement('canvas');
 let width = img.width;
 let height = img.height;

 if (width > height) {
 if (width > maxWidth) {
 height *= maxWidth / width;
 width = maxWidth;
 }
 } else {
 if (height > maxHeight) {
 width *= maxHeight / height;
 height = maxHeight;
 }
 }

 canvas.width = width;
 canvas.height = height;
 const ctx = canvas.getContext('2d');
 ctx?.drawImage(img, 0, 0, width, height);
 resolve({ 
 base64: canvas.toDataURL('image/jpeg', 0.8),
 fileName: file.name
 });
 };
 img.src = e.target?.result as string;
 };
 reader.readAsDataURL(file);
 });
 };

 const handleNewImageSelect = async (file: File) => {
 const resized = await resizeImage(file);
 setNewDraft(p => ({ ...p, image: resized.base64, fileName: resized.fileName }));
 };

 useEffect(() => { 
 load(); 
 loadAvailable();
 }, []);

 const handleImageUpload = async (id: string, file: File) => {
 setUploadingId(id);
 const reader = new FileReader();
 reader.onload = (event) => {
 const img = new Image();
 img.onload = () => {
 const minW = 800;
 const minH = 600;
 const targetW = 1200;
 const targetH = 800;

 if (img.width < minW || img.height < minH) {
 alert(`Quality Shield: Home page destination photos require at least ${minW}x${minH}px for a premium look. Your image is ${img.width}x${img.height}px.`);
 setUploadingId(null);
 return;
 }

 const canvas = document.createElement('canvas');
 canvas.width = targetW;
 canvas.height = targetH;
 const ctx = canvas.getContext('2d');
 if (ctx) {
 ctx.imageSmoothingEnabled = true;
 ctx.imageSmoothingQuality = 'high';
 const scale = Math.max(targetW / img.width, targetH / img.height);
 const x = (targetW / 2) - (img.width / 2) * scale;
 const y = (targetH / 2) - (img.height / 2) * scale;
 ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

 const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
 
 fetch(`${backendUrl}/destinations/${id}/image`, {
 method: 'POST',
 headers: authHeaders,
 body: JSON.stringify({ fileName: file.name, base64: optimizedDataUrl }),
 })
 .then(res => res.json())
 .then(data => {
 setItems(prev => prev.map(item => item._id === id ? { ...item, image: data } : item));
 })
 .catch(() => alert('Image sync failed'))
 .finally(() => setUploadingId(null));
 }
 };
 img.src = event.target?.result as string;
 };
 reader.readAsDataURL(file);
 };

 const handleCreate = async () => {
 if (!newDraft.city || !newDraft.country) return alert('City and Country are required');
 try {
 const { image, fileName, ...dto } = newDraft;
 const res = await fetch(`${backendUrl}/destinations`, { method: 'POST', headers: authHeaders, body: JSON.stringify(dto) });
 const data = await res.json();
 
 if (image && data._id) {
 const imgRes = await fetch(`${backendUrl}/destinations/${data._id}/image`, {
 method: 'POST',
 headers: authHeaders,
 body: JSON.stringify({ fileName, base64: image }),
 });
 const imgPath = await imgRes.json();
 data.image = imgPath;
 }

 setItems(prev => [...prev, data]);
 setNewDraft({ city: '', country: '', description: '', image: null, fileName: '' });
 setAdding(false);
 } catch { alert('Failed to create destination'); }
 };

 const handleSaveEdit = async (id: string) => {
 try {
 const res = await fetch(`${backendUrl}/destinations/${id}`, { method: 'PATCH', headers: authHeaders, body: JSON.stringify(editDraft) });
 const data = await res.json();
 setItems(prev => prev.map(item => item._id === id ? data : item));
 setEditingId(null);
 } catch { alert('Failed to update destination'); }
 };

 const handleToggle = async (id: string, isActive: boolean) => {
 try {
 await fetch(`${backendUrl}/destinations/${id}`, { method: 'PATCH', headers: authHeaders, body: JSON.stringify({ isActive }) });
 setItems(prev => prev.map(item => item._id === id ? { ...item, isActive } : item));
 } catch { alert('Failed to update'); }
 };

 const handleDelete = async (id: string, city: string) => {
 if (!confirm(`Delete "${city}"? This will also remove the uploaded image.`)) return;
 try {
 await fetch(`${backendUrl}/destinations/${id}`, { method: 'DELETE', headers: authHeaders });
 setItems(prev => prev.filter(item => item._id !== id));
 } catch { alert('Failed to delete destination'); }
 };

 const resolvedImage = (item: any) =>
 item.image
 ? item.image.startsWith('http') ? item.image : `${backendUrl.replace('/api', '')}${item.image}`
 : null;

 return (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
 {/* Available Locations Header */}
 <div className="bg-[var(--admin-bg)] p-6 rounded-app border border-[var(--admin-border)] mb-8">
 <div className="flex items-center justify-between">
 <div>
 <h5 className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-main)] mb-1">Destination Promotion</h5>
 <p className="text-[9px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Select an active car hub to promote it to the home page carousel</p>
 </div>
 {!adding && (
 <Button 
 onClick={() => {
 setNewDraft({ city: '', country: '', description: '', image: null, fileName: '' });
 setAdding(true);
 }} 
 className="h-10 px-6 bg-primary text-white rounded-app text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
 >
 <Plus size={14} className="mr-2" /> Add New Destination
 </Button>
 )}
 </div>
 </div>

 {/* Header */}
 <div className="flex items-center justify-between py-2 mb-4 border-b border-[var(--admin-border)]">
 <div>
 <h4 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--admin-text-main)] mb-1">Drive Destinations</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">
 Manage the 4 destination cards on the home page with custom images
 </p>
 </div>
 </div>

 {/* Add form */}
 <AnimatePresence>
 {adding && (
 <motion.div
 initial={{ opacity: 0, y: -10, height: 0 }}
 animate={{ opacity: 1, y: 0, height: 'auto' }}
 exit={{ opacity: 0, y: -10, height: 0 }}
 className="overflow-hidden"
 >
 <div className="p-6 bg-[var(--admin-card-bg)] border border-primary/20 rounded-app space-y-4">
 <div className="flex items-center justify-between">
 <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">New Destination</h5>
 <div className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">
 {availableLocations.filter(loc => !items.some(it => it.city?.toLowerCase() === loc.city?.toLowerCase())).length} Locations Available
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Select Available City *</label>
 <EliteSelect 
 value={newDraft.city}
 onChange={(val) => {
 const loc = availableLocations.find(l => l.city === val);
 setNewDraft(p => ({ ...p, city: val, country: loc?.country || '' }));
 }}
 options={availableLocations
 .filter(loc => !items.some(it => it.city?.toLowerCase() === loc.city?.toLowerCase()))
 .map(loc => ({ value: loc.city, label: `${loc.city} (${loc.count} cars)` }))
 }
 placeholder="Choose a listing hub..."
 />
 </div>
 <div className="space-y-1">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Country (Auto-filled)</label>
 <Input 
 value={newDraft.country} 
 readOnly 
 placeholder="Select city first" 
 className="h-11 bg-[var(--admin-bg)] border-[var(--admin-border)] text-sm font-bold opacity-70 cursor-not-allowed" 
 />
 </div>
 <div className="md:col-span-2 space-y-1">
 <div className="flex justify-between items-center">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Short Description</label>
 <span className={`text-[8px] font-black uppercase ${newDraft.description.length > 50 ? 'text-red-500' : 'text-primary'}`}>
 {newDraft.description.length} / 50 Chars
 </span>
 </div>
 <Input 
 value={newDraft.description} 
 onChange={e => {
 if (e.target.value.length <= 50) {
 setNewDraft(p => ({ ...p, description: e.target.value }));
 }
 }} 
 placeholder="e.g. Stunning desert views & luxury rides" 
 className={`h-11 bg-[var(--admin-bg)] border-[var(--admin-border)] text-sm font-bold ${newDraft.description.length >= 50 ? 'border-red-500' : ''}`} 
 />
 <p className="text-[8px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">
 Tip: Keep it short (max 50 chars) to fit neatly in a single line.
 </p>
 </div>

 <div className="md:col-span-2 space-y-3 pt-2">
 <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Destination Photo (Auto-resized for speed)</label>
 <div className="flex gap-4 items-start">
 <div className="flex-1 h-32 bg-[var(--admin-bg)] rounded-app border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center relative group overflow-hidden">
 {newDraft.image ? (
 <>
 <img src={newDraft.image} className="w-full h-full object-cover" />
 <button 
 onClick={() => setNewDraft(p => ({ ...p, image: null, fileName: '' }))}
 className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <X size={14} />
 </button>
 </>
 ) : (
 <button 
 onClick={() => {
 const input = document.createElement('input');
 input.type = 'file';
 input.accept = 'image/*';
 input.onchange = (e) => {
 const f = (e.target as HTMLInputElement).files?.[0];
 if (f) handleNewImageSelect(f);
 };
 input.click();
 }}
 className="flex flex-col items-center gap-2 text-[var(--admin-text-muted)] hover:text-primary transition-colors"
 >
 <Upload size={24} />
 <span className="text-[9px] font-black uppercase tracking-widest">Select Image</span>
 </button>
 )}
 </div>
 <div className="w-1/2 p-4 bg-primary/5 rounded-app border border-primary/10">
 <p className="text-[9px] font-bold text-primary uppercase leading-relaxed tracking-wider">
 ✨ Intelligent Upload: We automatically resize large images to 1200px to ensure your home page loads lightning fast.
 </p>
 </div>
 </div>
 </div>
 </div>
 
 <div className="flex items-center gap-3 pt-2">
 <Button 
 onClick={handleCreate} 
 disabled={!newDraft.city || !newDraft.country}
 className="h-10 px-8 bg-primary text-white rounded-app text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
 >
 Create Destination
 </Button>
 <button 
 onClick={() => setAdding(false)} 
 className="h-10 px-6 rounded-app border border-[var(--admin-border)] text-[var(--admin-text-muted)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--admin-bg)]"
 >
 Cancel
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Cards grid */}
 {loading ? (
 <div className="py-16 flex items-center justify-center">
 <RefreshCw className="animate-spin text-primary" size={24} />
 </div>
 ) : items.length === 0 ? (
 <div className="py-16 text-center text-[var(--admin-text-muted)]">
 <MapPin size={32} className="mx-auto mb-3 opacity-30" />
 <p className="text-[10px] font-black uppercase tracking-widest">No destinations yet — add your first one above</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {items.map((item) => {
 const img = resolvedImage(item);
 const isEditing = editingId === item._id;
 return (
 <motion.div key={item._id} layout className="group relative rounded-app overflow-hidden border border-[var(--admin-border)] bg-[var(--admin-card-bg)] hover: transition-all">
 {/* Image zone */}
 <div className="relative h-44 bg-[var(--admin-bg)] overflow-hidden">
 {img ? (
 <img src={img} alt={item.city} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--admin-text-muted)]">
 <ImageIcon size={32} />
 <span className="text-[9px] font-black uppercase tracking-widest">No image</span>
 </div>
 )}

 {/* Upload overlay */}
 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
 <button
 onClick={() => fileInputRefs.current[item._id]?.click()}
 className="flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-card-bg)] rounded-app text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-main)] hover:bg-primary hover:text-white transition-all"
 >
 <Upload size={12} /> {img ? 'Replace Image' : 'Upload Image'}
 </button>
 </div>

 {/* Upload spinner */}
 {uploadingId === item._id && (
 <div className="absolute inset-0 bg-[var(--admin-card-bg)]/80 flex items-center justify-center">
 <RefreshCw className="animate-spin text-primary" size={24} />
 </div>
 )}

 {/* Active toggle badge */}
 <div className="absolute top-3 left-3">
 <button
 onClick={() => handleToggle(item._id, !item.isActive)}
 className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${item.isActive ? 'bg-emerald-500/100 text-white' : 'bg-[var(--admin-bg)] text-[var(--admin-text-muted)]'}`}
 >
 {item.isActive ? 'Active' : 'Hidden'}
 </button>
 </div>

 {/* Delete */}
 <button
 onClick={() => handleDelete(item._id, item.city)}
 className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--admin-card-bg)]/90 flex items-center justify-center text-red-400 hover:bg-red-500/100 hover:text-white transition-all opacity-0 group-hover:opacity-100"
 >
 <X size={14} />
 </button>

 {/* Hidden file input */}
 <input
 type="file"
 accept="image/*"
 className="hidden"
 ref={el => { fileInputRefs.current[item._id] = el; }}
 onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(item._id, f); e.target.value = ''; }}
 />
 </div>

 {/* Info zone */}
 <div className="p-4">
 {isEditing ? (
 <div className="space-y-3">
 <div className="grid grid-cols-2 gap-2">
 <Input value={editDraft.city || ''} onChange={e => setEditDraft((p: any) => ({ ...p, city: e.target.value }))} placeholder="City" className="h-9 bg-[var(--admin-bg)] border-[var(--admin-border)] text-xs font-bold" />
 <Input value={editDraft.country || ''} onChange={e => setEditDraft((p: any) => ({ ...p, country: e.target.value }))} placeholder="Country" className="h-9 bg-[var(--admin-bg)] text-xs font-bold" />
 </div>
 <Input value={editDraft.description || ''} onChange={e => setEditDraft((p: any) => ({ ...p, description: e.target.value }))} placeholder="Description" className="h-9 bg-[var(--admin-bg)] border-[var(--admin-border)] text-xs font-bold" />
 <div className="flex gap-2">
 <Button onClick={() => handleSaveEdit(item._id)} className="flex-1 h-8 bg-primary text-white rounded-app text-[9px] font-black uppercase tracking-widest">
 <Check size={11} className="mr-1" /> Save
 </Button>
 <button onClick={() => setEditingId(null)} className="flex-1 h-8 rounded-app border border-[var(--admin-border)] text-[var(--admin-text-muted)] text-[9px] font-black uppercase tracking-widest hover:bg-[var(--admin-bg)]">
 Cancel
 </button>
 </div>
 </div>
 ) : (
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <div className="flex items-center gap-1.5 text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-1">
 <MapPin size={9} /> {item.country}
 </div>
 <h4 className="text-sm font-black text-[var(--admin-text-main)] tracking-tight truncate">{item.city}</h4>
 {item.description && <p className="text-[10px] text-[var(--admin-text-muted)] mt-0.5 truncate">{item.description}</p>}
 </div>
 <button
 onClick={() => { setEditingId(item._id); setEditDraft({ city: item.city, country: item.country, description: item.description }); }}
 className="w-8 h-8 rounded-app border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-text-muted)] hover:border-primary hover:text-primary transition-all flex-shrink-0"
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
 </button>
 </div>
 )}
 </div>

 </motion.div>
 );
 })}
 </div>
 )}

 <div className="p-4 bg-amber-50 border border-amber-100 rounded-app">
 <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
 💡 Tip: The home page shows the first 4 <strong>active</strong> destinations. Upload a high-quality landscape photo (min 800×600px) for each city. The listing count badge is automatically merged from actual car listings in that city.
 </p>
 </div>
 </motion.div>
 );
}

// ────────────────────────────────────────────────────────────────
// Payment Provider Master Control - High-Fidelity Design Echo
// ────────────────────────────────────────────────────────────────
function PaymentSettingsManager({ backendUrl }: { backendUrl: string }) {
 const [gateways, setGateways] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [expandedId, setExpandedId] = useState<string | null>(null);
 const [savingId, setSavingId] = useState<string | null>(null);
 const [searchQuery, setSearchQuery] = useState('');
 
 const logoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

 const token = authService.getAdminToken();
 const authHeaders = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

 const load = async () => {
 setLoading(true);
 try {
 const res = await fetch(`${backendUrl}/settings/payments`, { headers: authHeaders });
 const data = await res.json();
 const sorted = Array.isArray(data) ? data.sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
 setGateways(sorted);
 if (sorted.length > 0 && !expandedId) setExpandedId(sorted[0]._id);
 } catch { setGateways([]); } finally { setLoading(false); }
 };

 useEffect(() => { load(); }, []);

 const updateGateway = async (id: string, data: any) => {
 setSavingId(id);
 try {
 const res = await fetch(`${backendUrl}/settings/payments/${id}`, {
 method: 'PATCH',
 headers: authHeaders,
 body: JSON.stringify(data),
 });
 if (res.ok) {
 const updated = await res.json();
 setGateways(prev => prev.map(g => g._id === id ? updated : g).sort((a,b) => (a.order || 0) - (b.order || 0)));
 }
 } catch { alert('Failed to sync configuration'); } finally { setSavingId(null); }
 };

 const handleDelete = async (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 if (!confirm('Destroy this provider connection?')) return;
 try {
 const res = await fetch(`${backendUrl}/settings/payments/${id}`, { method: 'DELETE', headers: authHeaders });
 if (res.ok) setGateways(prev => prev.filter(g => g._id !== id));
 } catch { alert('Failed to remove provider'); }
 };

 const handleAdd = async () => {
 const name = prompt('Enter Provider Name:');
 if (!name) return;
 try {
 await fetch(`${backendUrl}/settings/payments`, {
 method: 'POST',
 headers: authHeaders,
 body: JSON.stringify({ name, slug: name.toLowerCase().replace(/\s+/g, '-'), isEnabled: false, isTestMode: true, order: gateways.length + 1 }),
 });
 load();
 } catch { alert('Failed to add provider'); }
 };

 const handleLogoUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;
 const reader = new FileReader();
 reader.onload = (ev) => {
 const img = new Image();
 img.onload = () => {
 const minW = 100;
 const minH = 50;
 const targetW = 400;
 const targetH = 200;

 if (img.width < minW || img.height < minH) {
 alert(`Premium UI Error: Payment logos must be at least ${minW}x${minH}px for clear display. Your image: ${img.width}x${img.height}px.`);
 return;
 }

 const canvas = document.createElement('canvas');
 canvas.width = targetW;
 canvas.height = targetH;
 const ctx = canvas.getContext('2d');
 if (ctx) {
 ctx.imageSmoothingEnabled = true;
 ctx.imageSmoothingQuality = 'high';
 const scale = Math.min(targetW / img.width, targetH / img.height);
 const x = (targetW / 2) - (img.width / 2) * scale;
 const y = (targetH / 2) - (img.height / 2) * scale;
 ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
 
 updateGateway(id, { logoUrl: canvas.toDataURL('image/png', 0.9) });
 }
 };
 img.src = ev.target?.result as string;
 };
 reader.readAsDataURL(file);
 };

 const copyToClipboard = (text: string) => {
 navigator.clipboard.writeText(text);
 alert('Copied to clipboard!');
 };

 const filteredGateways = gateways.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

 return (
 <div className="space-y-8 max-w-6xl mx-auto pb-24">
 <div className="flex items-center justify-between py-2 mb-4 border-b border-[var(--admin-border)]">
 <div className="space-y-1">
 <h2 className="text-sm font-black text-[var(--admin-text-main)] uppercase tracking-widest">Payment Gateways</h2>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">You can enable and disable your payment gateways from here</p>
 </div>
 </div>

 <div className="space-y-6">
 {loading ? (
 <div className="py-24 flex justify-center"><RefreshCw className="animate-spin text-primary opacity-20" size={40} /></div>
 ) : filteredGateways.map((g) => {
 const isExpanded = expandedId === g._id;
 const webhookUrl = `${backendUrl}/payments/webhook/${g.slug}`;
 const isSaving = savingId === g._id;

 return (
 <div key={g._id} className="bg-[#f8fafc] border border-[var(--admin-border)] rounded-app overflow-hidden transition-all hover:">
 {/* Provider Header Block */}
 <div 
 className="p-6 bg-[var(--admin-card-bg)] border-b border-[var(--admin-border)] flex items-center justify-between cursor-pointer group"
 onClick={() => setExpandedId(isExpanded ? null : g._id)}
 >
 <div className="flex items-center gap-4">
 <div className="p-2 bg-[var(--admin-bg)] rounded-app group-hover:bg-primary/5 transition-colors">
 {g.slug === 'paypal' ? <CreditCard className="text-[#003087]" size={20} /> : <Zap className="text-primary" size={20} />}
 </div>
 <span className="text-sm font-black text-[var(--admin-text-main)] tracking-tight">{g.name}</span>
 </div>
 <div className="flex items-center gap-6">
 <div className="hidden md:flex flex-col items-end mr-4">
 <span className={`text-[10px] font-black uppercase tracking-widest ${g.isEnabled ? 'text-blue-500' : 'text-[var(--admin-text-muted)]'}`}>
 {g.isEnabled ? 'ACTIVE' : 'INACTIVE'}
 </span>
 </div>
 <button onClick={(e) => handleDelete(g._id, e)} className="w-8 h-8 rounded-app text-[var(--admin-text-muted)] hover:text-red-500 transition-colors"><X size={14} /></button>
 <ChevronDown className={`text-[var(--admin-text-muted)] transition-transform duration-500 ${isExpanded ? 'rotate-180 text-primary' : ''}`} size={16} />
 </div>
 </div>

 <AnimatePresence>
 {isExpanded && (
 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
 <div className="p-8 space-y-10">
 {/* Toggle & Basic Info */}
 <div className="space-y-6 max-w-4xl">
 <div className="flex items-center gap-4">
 <Switch checked={g.isEnabled} onCheckedChange={(val) => updateGateway(g._id, { isEnabled: val })} />
 <span className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-tight">Active {g.name}</span>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] ml-1">Custom Name (EN)</label>
 <Input 
 value={g.name} 
 placeholder="Enter name (e.g. Credit Card)" 
 onChange={e => updateGateway(g._id, { name: e.target.value })} 
 className="h-12 bg-[var(--admin-card-bg)] border-[var(--admin-border)] rounded-app font-bold"
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] ml-1">Description (EN)</label>
 <Textarea 
 value={g.description || ''} 
 placeholder="Enter description" 
 onChange={e => updateGateway(g._id, { description: e.target.value })} 
 className="min-h-[100px] bg-[var(--admin-card-bg)] border-[var(--admin-border)] rounded-app font-bold resize-none" 
 />
 </div>

 {/* Logo Sector */}
 <div className="space-y-3">
 <label className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] ml-1">Logo</label>
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-app flex items-center justify-center p-3 ">
 {g.logoUrl ? <img src={g.logoUrl} className="w-full h-full object-contain" alt="Logo" /> : <ImageIcon className="text-slate-200" size={24} />}
 </div>
 <button 
 onClick={() => logoInputRefs.current[g._id]?.click()}
 className="h-9 px-6 rounded-app border border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] hover:border-primary hover:text-primary transition-all "
 >
 Browse image
 </button>
 <input 
 type="file" 
 className="hidden" 
 ref={el => { logoInputRefs.current[g._id] = el; }} 
 accept="image/*"
 onChange={e => handleLogoUpload(g._id, e)}
 />
 </div>
 </div>
 </div>

 {/* API Credentials Grid */}
 <div className="bg-[#f0f4f8]/50 p-8 rounded-app border border-[#e2e8f0] space-y-8">
 <div className="flex items-center justify-between">
 <h4 className="text-[11px] font-black text-[var(--admin-text-main)] uppercase tracking-[0.2em]">API Credentials</h4>
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Test Mode</span>
 <Switch checked={g.isTestMode} onCheckedChange={(val) => updateGateway(g._id, { isTestMode: val })} />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-2">
 <label className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] ml-1">
   {g.slug === 'paypal' ? (g.isTestMode ? 'Sandbox Client ID' : 'Live Client ID') : (g.isTestMode ? 'Test Public Key' : 'Live Public Key')}
 </label>
 <Input 
 value={g.clientId || ''} 
 onChange={e => updateGateway(g._id, { clientId: e.target.value })} 
 className="h-12 bg-[var(--admin-card-bg)] border-[var(--admin-border)] rounded-app font-mono text-[11px]" 
 />
 </div>
 <div className="space-y-2">
 <label className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] ml-1">{g.isTestMode ? 'Test Secret Key' : 'Live Secret Key'}</label>
 <Input 
 type="password"
 value={g.clientSecret || ''} 
 onChange={e => updateGateway(g._id, { clientSecret: e.target.value })} 
 className="h-12 bg-[var(--admin-card-bg)] border-[var(--admin-border)] rounded-app font-mono text-[11px]" 
 />
 </div>
 </div>

 <div className="space-y-2 max-w-md">
 <label className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] ml-1">Test Webhook Secret</label>
 <Input 
 value={g.webhookSecret || ''} 
 onChange={e => updateGateway(g._id, { webhookSecret: e.target.value })} 
 className="h-12 bg-[var(--admin-card-bg)] border-[var(--admin-border)] rounded-app font-mono text-[11px]" 
 />
 </div>

 {/* Configuration Help Module */}
 <div className="bg-[var(--admin-card-bg)] border-l-4 border-blue-500 rounded-r-[var(--app-radius)] p-6 space-y-4 ">
 <h5 className="text-[10px] font-black text-[var(--admin-text-main)] uppercase tracking-widest">Configuration Help</h5>
 <div className="space-y-3">
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-tight">Webhook URL (Copy to {g.name} Dashboard):</p>
 <div className="flex items-center justify-between gap-4 p-4 bg-[#f1f5f9] rounded-app border border-[var(--admin-border)] group">
 <code className="text-[11px] text-[#e11d48] font-mono truncate">{webhookUrl}</code>
 <button onClick={() => copyToClipboard(webhookUrl)} className="h-8 px-4 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] text-[9px] font-black uppercase text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-all">Copy</button>
 </div>
 </div>
 </div>
 </div>

 {isSaving && (
 <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">
 <RefreshCw size={12} className="animate-spin" /> Atomic Sync Operational
 </div>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
 })}
 </div>
 </div>
 );
}


export default function AdminSettingsView() {
 const { t } = useAdminTranslation();
 const { settings, updateSettings, loading: settingsLoading } = useSettings();
 const [activeTab, setActiveTab] = useState("general");
 const [formData, setFormData] = useState(settings);
 const [saving, setSaving] = useState(false);
 const [uploading, setUploading] = useState<string | null>(null);
 const [currentSection, setCurrentSection] = useState("hero");
 const [currentFooterSection, setCurrentFooterSection] = useState("social");
 const token = authService.getAdminToken();

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
 const taxesManagerRef = useRef<any>(null);
 const plansManagerRef = useRef<any>(null);
 const cancellationManagerRef = useRef<any>(null);

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
 logoDark: { minW: 100, minH: 50, targetW: 600, targetH: 300, mode: 'contain' },
 logoLight: { minW: 100, minH: 50, targetW: 600, targetH: 300, mode: 'contain' },
 favicon: { minW: 32, minH: 32, targetW: 64, targetH: 64, mode: 'contain' },
 heroImageUrl: { minW: 1200, minH: 600, targetW: 1920, targetH: 1080, mode: 'cover' },
 ctaImageRenter: { minW: 800, minH: 400, targetW: 1200, targetH: 800, mode: 'cover' },
 ctaImageHost: { minW: 800, minH: 400, targetW: 1200, targetH: 800, mode: 'cover' },
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

 const optimizedDataUrl = canvas.toDataURL('image/png', 0.8);
 
 // Upload to backend instead of storing base64
 fetch(`${backendUrl}/settings/upload`, {
 method: 'POST',
 headers: { 
 'Content-Type': 'application/json',
 ...(token ? { Authorization: `Bearer ${token}` } : {})
 },
 body: JSON.stringify({ fileName: file.name, base64: optimizedDataUrl }),
 })
 .then(res => res.json())
 .then(data => {
 if (data.url) {
 handleFieldChange(field, data.url);
 }
 })
 .catch(err => {
 console.error('Upload failed:', err);
 alert('Failed to save image to server');
 })
 .finally(() => setUploading(null));
 }
 } else {
 // Fallback for fields not in optimization config
 fetch(`${backendUrl}/settings/upload`, {
 method: 'POST',
 headers: { 
 'Content-Type': 'application/json',
 ...(token ? { Authorization: `Bearer ${token}` } : {})
 },
 body: JSON.stringify({ fileName: file.name, base64: event.target?.result as string }),
 })
 .then(res => res.json())
 .then(data => {
 if (data.url) {
 handleFieldChange(field, data.url);
 }
 })
 .catch(err => {
 console.error('Upload failed:', err);
 alert('Failed to save image to server');
 })
 .finally(() => setUploading(null));
 }
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
 <div className="bg-[var(--admin-card-bg)] rounded-app overflow-hidden flex-1 border border-[var(--admin-border)] flex flex-col">
 <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col md:flex-row h-full">
 {/* Engineered Modular CSS Sidebar */}
  <TabsList className="admin-sidebar-list">
 <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] mb-2 px-2">{t.settings.title}</div>
 {[
 { id: "general", label: t.settings.tabs.general, icon: Layout },
 { id: "footer", label: t.settings.tabs.footer || "Footer Settings", icon: Share2 },
 { id: "smtp", label: t.settings.tabs.smtp, icon: Mail },
 { id: "financials", label: t.settings.tabs.financials, icon: Wallet },
 { id: "listings", label: t.settings.tabs.listings, icon: ImageIcon },
 { id: "protection", label: "Protection Plans", icon: ShieldCheck },
 { id: "taxes", label: "Taxes & VAT", icon: Database },
 { id: "verification", label: "Verification Settings", icon: ShieldCheck },
 { id: "cancellation", label: "Cancellation Policy", icon: AlertCircle },
 { id: "payments", label: "Payments", icon: CreditCard },
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
 <div className="min-h-14 border-b border-[var(--admin-border)] px-4 md:px-6 py-2 flex flex-wrap items-center justify-between bg-[var(--admin-bg)]/20 backdrop-blur-sm sticky top-0 z-30 gap-3 md:gap-4">
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
 {activeTab === 'protection' && (
 <Button onClick={() => plansManagerRef.current?.addItem()} className="h-9 px-4 rounded-app bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ">
 <Plus size={14} /> Add Plan
 </Button>
 )}
 {activeTab === 'taxes' && (
 <Button onClick={() => taxesManagerRef.current?.addItem()} className="h-9 px-4 rounded-app bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ">
 <Plus size={14} /> Add Tax
 </Button>
 )}
 {activeTab === 'cancellation' && (
 <Button onClick={() => cancellationManagerRef.current?.addItem()} className="h-9 px-4 rounded-app bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ">
 <Plus size={14} /> Add Rule
 </Button>
 )}
 <Button
 onClick={handleSave}
 disabled={saving}
 className="h-9 px-6 rounded-app bg-primary text-white font-bold flex items-center gap-2 active:scale-95 transition-all text-xs"
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
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.general.name}</label>
 <Input
 value={formData.siteName || ""}
 onChange={(e) => handleFieldChange('siteName', e.target.value)}
 className="h-10 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-[var(--admin-text-main)] px-4 text-sm"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.general.url}</label>
 <div className="relative">
 <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
 <Input
 value={formData.siteUrl || ""}
 onChange={(e) => handleFieldChange('siteUrl', e.target.value)}
 className="h-10 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-[var(--admin-text-main)] pl-12 pr-4 text-sm"
 />
 </div>
 </div>

 <div className="space-y-3">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.general.logoDark}</label>
 <div className="flex items-center gap-6">
 <div className="w-28 h-28 bg-[var(--admin-bg)] rounded-app border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center overflow-hidden relative group/asset transition-all hover:border-primary/30">
 {formData.logoDark ? (
 <>
 <img src={resolveAsset(formData.logoDark) || ""} alt="Brand" className="w-full h-full object-contain p-2" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center gap-2">
 <button onClick={() => logoDarkInputRef.current?.click()} className="p-2 bg-[var(--admin-card-bg)] rounded-app text-primary "><Upload size={14} /></button>
 <button onClick={() => handleFieldChange('logoDark', '')} className="p-2 bg-[var(--admin-card-bg)] rounded-app text-red-500 "><X size={14} /></button>
 </div>
 </>
 ) : (
 <button onClick={() => logoDarkInputRef.current?.click()} className="flex flex-col items-center gap-2 text-[var(--admin-text-muted)] hover:text-primary transition-all">
 <ImageIcon size={20} />
 <span className="text-[9px] font-bold uppercase">Upload</span>
 </button>
 )}
 {uploading === 'logoDark' && (
 <div className="absolute inset-0 bg-[var(--admin-card-bg)]/90 flex items-center justify-center">
 <RefreshCw className="animate-spin text-primary" size={20} />
 </div>
 )}
 </div>
 <div className="flex-1">
 <Input
 value={formData.logoDark || ""}
 placeholder="Path..."
 onChange={(e) => handleFieldChange('logoDark', e.target.value)}
 className="h-10 text-[9px] bg-[var(--admin-bg)] rounded-app px-4"
 />
 </div>
 <input type="file" ref={logoDarkInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoDark')} />
 </div>
 </div>

 <div className="space-y-3">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.general.logoLight}</label>
 <div className="flex items-center gap-6">
 <div className="w-28 h-28 bg-slate-700 rounded-app border-2 border-dashed border-[var(--admin-border)]0 flex flex-col items-center justify-center overflow-hidden relative group/asset transition-all hover:border-white/30">
 {formData.logoLight ? (
 <>
 <img src={resolveAsset(formData.logoLight) || ""} alt="Brand" className="w-full h-full object-contain p-2" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center gap-2">
 <button onClick={() => logoLightInputRef.current?.click()} className="p-2 bg-[var(--admin-card-bg)] rounded-app text-primary "><Upload size={14} /></button>
 <button onClick={() => handleFieldChange('logoLight', '')} className="p-2 bg-[var(--admin-card-bg)] rounded-app text-red-500 "><X size={14} /></button>
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
 className="h-10 text-[9px] bg-[var(--admin-bg)] rounded-app px-4"
 />
 </div>
 <input type="file" ref={logoLightInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoLight')} />
 </div>
 </div>

 <div className="space-y-3">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.general.favicon}</label>
 <div className="flex items-center gap-6">
 <div className="w-28 h-28 bg-[var(--admin-bg)] rounded-app border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center overflow-hidden relative group/asset transition-all hover:border-primary/30">
 {formData.favicon ? (
 <>
 <img src={resolveAsset(formData.favicon) || ""} alt="Favicon" className="w-10 h-10 object-contain" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center gap-2">
 <button onClick={() => faviconInputRef.current?.click()} className="p-2 bg-[var(--admin-card-bg)] rounded-app text-primary "><Upload size={14} /></button>
 <button onClick={() => handleFieldChange('favicon', '')} className="p-2 bg-[var(--admin-card-bg)] rounded-app text-red-500 "><X size={14} /></button>
 </div>
 </>
 ) : (
 <button onClick={() => faviconInputRef.current?.click()} className="flex flex-col items-center gap-2 text-[var(--admin-text-muted)] hover:text-primary transition-all">
 <Smile size={20} />
 <span className="text-[9px] font-bold uppercase">Upload</span>
 </button>
 )}
 {uploading === 'favicon' && (
 <div className="absolute inset-0 bg-[var(--admin-card-bg)]/90 flex items-center justify-center">
 <RefreshCw className="animate-spin text-primary" size={20} />
 </div>
 )}
 </div>
 <div className="flex-1">
 <Input
 value={formData.favicon || ""}
 placeholder="Path..."
 onChange={(e) => handleFieldChange('favicon', e.target.value)}
 className="h-10 text-[9px] bg-[var(--admin-bg)] rounded-app px-4"
 />
 </div>
 <input type="file" ref={faviconInputRef} className="hidden" accept="image/*,.ico" onChange={(e) => handleFileUpload(e, 'favicon')} />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-[var(--admin-border)]">
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.general.defaultLanguage}</label>
 <EliteSelect
 value={(formData as any).defaultLanguage || "en"}
 onChange={(val) => handleFieldChange('defaultLanguage', val)}
 options={languages.map(lang => ({ value: lang.code, label: `${lang.name} (${lang.nativeName})` }))}
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.general.defaultCurrency}</label>
 <EliteSelect
 value={(formData as any).defaultCurrency || "USD"}
 onChange={(val) => handleFieldChange('defaultCurrency', val)}
 options={currencies.map(curr => ({ value: curr.code, label: `${curr.code} - ${curr.name} (${curr.symbol})` }))}
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.general.timezone}</label>
 <EliteSelect
 value={(formData as any).defaultTimezone || "America/New_York"}
 onChange={(val) => handleFieldChange('defaultTimezone', val)}
 options={timezones.map(tz => ({ value: tz.value, label: tz.label }))}
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.general.theme}</label>
 <EliteSelect
 value={(formData as any).theme || "light"}
 onChange={(val) => handleFieldChange('theme', val)}
 options={[
 { value: "light", label: t.settings.general.themeLight },
 { value: "dark", label: t.settings.general.themeDark }
 ]}
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

 <div className="pt-8 border-t border-[var(--admin-border)]">
 <div className="flex items-center gap-3 mb-6">
 <div className="p-2 bg-primary/10 rounded-app text-primary">
 <MapPin size={18} />
 </div>
 <div>
 <h3 className="text-sm font-black uppercase tracking-tight text-[var(--admin-text-main)]">Map Integration</h3>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Choose your preferred map engine for locations & car addresses</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-3">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">Map Provider</label>
 <EliteSelect
 value={formData.mapProvider || "osm"}
 onChange={(val) => handleFieldChange('mapProvider', val)}
 options={[
 { value: "osm", label: "OpenStreetMap (Free)" },
 { value: "google", label: "Google Maps (Premium)" }
 ]}
 />
 </div>

 {formData.mapProvider === 'google' && (
 <div className="space-y-3">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">Google Maps API Key</label>
 <div className="relative">
 <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
 <Input
 value={formData.googleMapsApiKey || ""}
 onChange={(e) => handleFieldChange('googleMapsApiKey', e.target.value)}
 placeholder="AIza..."
 className="h-11 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] font-mono text-xs pl-12"
 />
 </div>
 </div>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[var(--admin-border)]">
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.general.supportEmail}</label>
 <Input
 value={formData.email || ""}
 onChange={(e) => handleFieldChange('email', e.target.value)}
 className="h-10 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-[var(--admin-text-main)] px-4 text-sm"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.general.supportPhone}</label>
 <Input
 value={formData.phone || ""}
 onChange={(e) => handleFieldChange('phone', e.target.value)}
 className="h-10 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-[var(--admin-text-main)] px-4 text-sm"
 />
 </div>
 </div>
 </TabsContent>

 <TabsContent value="smtp" className="mt-0 p-4 md:p-6 space-y-6 outline-none">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="md:col-span-2 flex items-center justify-between p-4 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <div>
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-main)]">{t.settings.smtp.verification}</h4>
 <p className="text-[9px] text-[var(--admin-text-muted)] font-medium font-bold uppercase tracking-[0.1em]">{t.settings.smtp.otpDesc}</p>
 </div>
 <Switch 
 checked={formData.emailVerificationEnabled} 
 onCheckedChange={(val) => handleFieldChange('emailVerificationEnabled', val)}
 />
 </div>
 
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.smtp.host}</label>
 <Input
 value={formData.smtpHost || ""}
 placeholder="smtp.example.com"
 onChange={(e) => handleFieldChange('smtpHost', e.target.value)}
 className="h-12 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-[var(--admin-text-main)] px-6 text-sm"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.smtp.port}</label>
 <Input
 value={formData.smtpPort || ""}
 placeholder="587"
 onChange={(e) => handleFieldChange('smtpPort', e.target.value)}
 className="h-12 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-[var(--admin-text-main)] px-6 text-sm"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.smtp.user}</label>
 <Input
 value={formData.smtpUser || ""}
 placeholder="user@example.com"
 onChange={(e) => handleFieldChange('smtpUser', e.target.value)}
 className="h-12 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-[var(--admin-text-main)] px-6 text-sm"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.smtp.pass}</label>
 <Input
 type="password"
 value={formData.smtpPassword || ""}
 placeholder="••••••••"
 onChange={(e) => handleFieldChange('smtpPassword', e.target.value)}
 className="h-12 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-[var(--admin-text-main)] px-6 text-sm"
 />
 </div>
 <div className="md:col-span-2 space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.smtp.from}</label>
 <Input
 value={formData.smtpFrom || ""}
 placeholder="noreply@carrental.com"
 onChange={(e) => handleFieldChange('smtpFrom', e.target.value)}
 className="h-12 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-[var(--admin-text-main)] px-6 text-sm"
 />
 </div>
 </div>
 </TabsContent>

 <TabsContent value="financials" className="mt-0 p-4 md:p-6 space-y-8 outline-none">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

 <div className="bg-[var(--admin-bg)] p-6 rounded-app border border-[var(--admin-border)]">
 <div className="flex items-center gap-3 mb-4 text-[var(--admin-text-main)]">
 <Database size={18} />
 <h3 className="text-sm font-bold uppercase tracking-tight">{t.settings.financials.payoutMin}</h3>
 </div>
 <div className="relative">
 <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
 <Input
 type="number"
 value={formData.minWithdrawalAmount}
 onChange={(e) => handleFieldChange('minWithdrawalAmount', parseFloat(e.target.value))}
 className="h-12 pl-12 rounded-app border-[var(--admin-border)] font-bold text-xl"
 />
 </div>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase mt-2 px-1 tracking-widest">{t.settings.financials.payoutDesc}</p>
 </div>

 <div className="bg-[var(--admin-bg)] p-6 rounded-app border border-[var(--admin-border)]">
 <div className="flex items-center gap-3 mb-4 text-[var(--admin-text-main)]">
 <Percent size={18} />
 <h3 className="text-sm font-bold uppercase tracking-tight">{t.settings.financials.systemFee}</h3>
 </div>
 <div className="relative">
 <Input
 type="number"
 value={formData.commissionRate}
 onChange={(e) => handleFieldChange('commissionRate', parseFloat(e.target.value))}
 className="h-12 pr-12 rounded-app border-[var(--admin-border)] font-bold text-xl text-center"
 />
 <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[var(--admin-text-muted)]">%</span>
 </div>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase mt-2 px-1 tracking-widest">{t.settings.financials.feeDesc}</p>
 </div>
 </div>
 </TabsContent>

 <TabsContent value="listings" className="mt-0 p-4 md:p-6 space-y-8 outline-none pb-48">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="bg-[var(--admin-bg)] p-6 rounded-app border border-[var(--admin-border)]">
 <div className="flex items-center gap-3 mb-4 text-primary">
 <ImageIcon size={18} />
 <h3 className="text-sm font-bold uppercase tracking-tight">{t.settings.listings.uploadLimit}</h3>
 </div>
 <div className="relative">
 <Input
 type="number"
 value={(formData as any).maxImagesPerListing || 5}
 onChange={(e) => handleFieldChange('maxImagesPerListing', parseInt(e.target.value) || 1)}
 className="h-12 rounded-app border-[var(--admin-border)] font-bold text-xl text-center"
 />
 </div>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase mt-2 px-1 tracking-widest text-center">{t.settings.listings.limitDesc}</p>
 </div>

 <div className="bg-[var(--admin-bg)] p-6 rounded-app border border-[var(--admin-border)]">
 <div className="flex items-center gap-3 mb-4 text-primary">
 <LayoutDashboard size={18} />
 <h3 className="text-sm font-bold uppercase tracking-tight">Pagination Density</h3>
 </div>
 <div className="relative">
 <Input
 type="number"
 value={(formData as any).itemsPerPageLimit || 10}
 onChange={(e) => handleFieldChange('itemsPerPageLimit', parseInt(e.target.value) || 5)}
 className="h-12 rounded-app border-[var(--admin-border)] font-bold text-xl text-center"
 />
 </div>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase mt-2 px-1 tracking-widest text-center">Global record limit per governance table</p>
 </div>
 </div>
 <CustomFieldsManager 
  fields={(formData as any).listings?.customFields || (formData as any).customFields || []} 
  customSteps={(formData as any).listings?.customSteps || (formData as any).customSteps || []}
  onChange={(val, stepsVal) => {
    handleFieldChange("listings", { ...(formData as any).listings, customFields: val, customSteps: stepsVal || (formData as any).listings?.customSteps || [] });
  }} 
/>
</TabsContent>




 <TabsContent value="frontend" className="mt-0 p-4 md:p-6 space-y-8 outline-none pb-20">
 {currentSection === 'hero' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {/* Hero Management */}
 <div className="space-y-6">
 <div className="flex items-center justify-between p-4 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <div>
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-main)]">{t.settings.frontend.labels.showHero}</h4>
 <p className="text-[9px] text-[var(--admin-text-muted)] font-medium font-bold uppercase tracking-[0.1em]">Activate landing page hero section</p>
 </div>
 <Switch 
 checked={formData.showHeroSection} 
 onCheckedChange={(val) => handleFieldChange('showHeroSection', val)}
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">
 {t.settings.frontend.heroTitle} ({selectedHeroLang})
 </label>
 <Input
 value={formData.heroTranslations?.[selectedHeroLang]?.title || ""}
 onChange={(e) => handleTranslationChange('title', e.target.value)}
 className="h-12 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-[var(--admin-text-main)] px-6 text-sm"
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">
 {t.settings.frontend.heroSubtitle} ({selectedHeroLang})
 </label>
 <textarea
 value={formData.heroTranslations?.[selectedHeroLang]?.subtitle || ""}
 onChange={(e) => handleTranslationChange('subtitle', e.target.value)}
 className="w-full min-h-[100px] p-6 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-[var(--admin-text-main)] text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
 />
 </div>

 <div className="space-y-4 pt-4 border-t border-[var(--admin-border)]">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">Hero Section Statistics ({selectedHeroLang})</label>
 <div className="grid grid-cols-1 gap-4">
 {[0, 1, 2].map((idx) => (
 <div key={idx} className="flex gap-3 items-center bg-[var(--admin-card-bg)] p-3 rounded-app border border-[var(--admin-border)] ">
 <div className="flex-1 space-y-1">
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Value</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.heroStats?.[idx]?.value || ""}
 placeholder="500+"
 onChange={(e) => handleHeroStatChange(idx, 'value', e.target.value)}
 className="h-9 bg-[var(--admin-bg)]/50 border-[var(--admin-border)] font-black text-xs rounded-app"
 />
 </div>
 <div className="flex-[2] space-y-1">
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Label</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.heroStats?.[idx]?.label || ""}
 placeholder="Premium Cars"
 onChange={(e) => handleHeroStatChange(idx, 'label', e.target.value)}
 className="h-9 bg-[var(--admin-bg)]/50 border-[var(--admin-border)] font-bold text-xs rounded-app"
 />
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 <div className="space-y-6">
 <div className="space-y-3">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">{t.settings.frontend.heroImage}</label>
 <div className="flex items-center gap-6">
 <div className="w-full h-48 bg-[var(--admin-bg)] rounded-app border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center overflow-hidden relative group/asset transition-all hover:border-primary/30">
 {formData.heroImageUrl ? (
 <>
 <img src={resolveAsset(formData.heroImageUrl) || ""} alt="Hero" className="w-full h-full object-cover" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center gap-2">
 <button onClick={() => heroImageInputRef.current?.click()} className="p-3 bg-[var(--admin-card-bg)] rounded-app text-primary "><Upload size={18} /></button>
 <button onClick={() => handleFieldChange('heroImageUrl', '')} className="p-3 bg-[var(--admin-card-bg)] rounded-app text-red-500 "><X size={18} /></button>
 </div>
 </>
 ) : (
 <button onClick={() => heroImageInputRef.current?.click()} className="flex flex-col items-center gap-3 text-[var(--admin-text-muted)] hover:text-primary transition-all">
 <ImageIcon size={32} />
 <span className="text-[10px] font-bold uppercase tracking-widest">Upload Hero Asset</span>
 </button>
 )}
 {uploading === 'heroImageUrl' && (
 <div className="absolute inset-0 bg-[var(--admin-card-bg)]/90 flex items-center justify-center">
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
 <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--admin-text-main)]">{t.settings.frontend.navLinks}</h3>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase mt-1 tracking-tight">Sync and manage your website header links</p>
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
 className="h-9 px-4 rounded-app border-[var(--admin-border)] text-[var(--admin-text-main)] font-bold text-[10px] uppercase gap-2 hover:bg-[var(--admin-bg)]"
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
 className="bg-[var(--admin-card-bg)] p-4 py-3 rounded-app border border-[var(--admin-border)] flex items-center gap-4 relative group hover:border-primary/20 transition-all"
 >
 <div className="flex-1">
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Label ({selectedHeroLang})</label>
 <Input 
 value={displayValue}
 placeholder="Enter Translation..."
 onChange={(e) => handleNavLabelUpdate(link.id, e.target.value)}
 className="h-9 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app px-3"
 />
 </div>

 <div className="flex-[2]">
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">URL / Page Path (Global)</label>
 <div className="flex gap-2">
 <Input 
 value={link.url}
 onChange={(e) => handleNavLinkUpdate(index, 'url', e.target.value)}
 className="h-9 bg-[var(--admin-bg)] border-none font-bold text-xs flex-1 rounded-app px-3"
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
  ...staticPages.map((p: any) => ({ value: `/p/${p.slug}`, label: `Page: ${p.title}` })),
  ]}
 />
 </div>
 </div>

 <div className="w-24 text-center">
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">New Tab</label>
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
 className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/100 hover:text-white"
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
 <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <div>
 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-text-main)] mb-1">Brands Ecosystem</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Toggle visibility of the scrolling partner marquee</p>
 </div>
 <Switch 
 checked={formData.showBrandsSection}
 onCheckedChange={(val) => handleFieldChange('showBrandsSection', val)}
 />
 </div>

 <div className="grid grid-cols-1 gap-6">
 <div className="space-y-4 bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] ">
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Main Title ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.brandsTitle || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].brandsTitle = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 placeholder="e.g., Plan your trip"
 className="h-11 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app px-4 "
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Subtitle Title ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.brandsSubtitle || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].brandsSubtitle = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 placeholder="e.g., Explore Our Brands"
 className="h-11 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app px-4 "
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Description ({selectedHeroLang})</label>
 <Textarea 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.brandsDescription || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].brandsDescription = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 placeholder="Select your perfect ride from our diverse fleet of premium automotive partners..."
 className="min-h-[100px] bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app p-4 resize-none "
 />
 </div>
 </div>
 </div>
 </motion.div>
 )}

 {currentSection === 'featured' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
 <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <div>
 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-text-main)] mb-1">{t.settings.frontend.labels.showCars}</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Display top-tier listings on index</p>
 </div>
 <Switch 
 checked={formData.showFeaturedCars} 
 onCheckedChange={(val) => handleFieldChange('showFeaturedCars', val)}
 />
 </div>

 <div className="space-y-4 bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] ">
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Section Title ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.featuredTitle || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].featuredTitle = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 placeholder="e.g., Featured Fleet"
 className="h-11 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app px-4 "
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Section Subtitle ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.featuredSubtitle || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].featuredSubtitle = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 placeholder="e.g., Premium vehicles available for your next luxury experience."
 className="h-11 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app px-4 "
 />
 </div>
 </div>
 </motion.div>
 )}

 {currentSection === 'destinations' && (
 <DestinationsManager backendUrl={backendUrl} />
 )}

 {currentSection === 'cta' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
 <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <div>
 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-text-main)] mb-1">Dual pathways section</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Toggle visibility of Renter/Host CTA cards</p>
 </div>
 <Switch 
 checked={formData.showCTASection} 
 onCheckedChange={(val) => handleFieldChange('showCTASection', val)}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Renter CTA Card */}
 <div className="space-y-4 bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] relative overflow-hidden">
 <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-3xl flex items-center justify-center text-primary/30">
 <Users size={24} />
 </div>
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Renter pathway</h4>
 <div className="mb-4">
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Renter Card Image</label>
 <div className="flex items-center gap-4">
 <div className="w-20 h-20 bg-[var(--admin-bg)] rounded-app border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center overflow-hidden relative group/renter transition-all hover:border-primary/30">
 {formData.ctaImageRenter ? (
 <>
 <img src={resolveAsset(formData.ctaImageRenter) || ""} alt="Renter" className="w-full h-full object-contain p-2" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/renter:opacity-100 transition-opacity flex items-center justify-center gap-2">
 <button onClick={() => ctaRenterInputRef.current?.click()} className="p-1.5 bg-[var(--admin-card-bg)] rounded-app text-primary "><Upload size={12} /></button>
 <button onClick={() => handleFieldChange('ctaImageRenter', '')} className="p-1.5 bg-[var(--admin-card-bg)] rounded-app text-red-500 "><X size={12} /></button>
 </div>
 </>
 ) : (
 <button onClick={() => ctaRenterInputRef.current?.click()} className="flex flex-col items-center gap-1 text-[var(--admin-text-muted)] hover:text-primary transition-all">
 <ImageIcon size={18} />
 <span className="text-[8px] font-bold uppercase">Upload</span>
 </button>
 )}
 {uploading === 'ctaImageRenter' && (
 <div className="absolute inset-0 bg-[var(--admin-card-bg)]/90 flex items-center justify-center">
 <RefreshCw className="animate-spin text-primary" size={16} />
 </div>
 )}
 </div>
 <div className="flex-1 space-y-2">
 <Input 
 value={formData.ctaImageRenter || ""}
 placeholder="Path or Base64..."
 onChange={(e) => handleFieldChange('ctaImageRenter', e.target.value)}
 className="h-8 text-[9px] bg-[var(--admin-bg)] font-bold border-none"
 />
 <input type="file" ref={ctaRenterInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'ctaImageRenter')} />
 <p className="text-[8px] text-[var(--admin-text-muted)] italic">Recommended: 1:1 ratio, transparent BG</p>
 </div>
 </div>
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Title ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.ctaTitleRenter || ""}
 placeholder="e.g., Finding Your Ideal Match?"
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].ctaTitleRenter = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="h-10 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app"
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Subtitle ({selectedHeroLang})</label>
 <Textarea 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.ctaSubtitleRenter || ""}
 placeholder="e.g., Explore options for your next vehicle..."
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].ctaSubtitleRenter = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="min-h-[80px] bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app p-4 resize-none"
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Button Text ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.ctaButtonRenter || ""}
 placeholder="e.g., Explore Options"
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].ctaButtonRenter = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="h-10 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app"
 />
 </div>
 </div>

 {/* Host CTA Card */}
 <div className="space-y-4 bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] relative overflow-hidden">
 <div className="absolute top-0 right-0 w-16 h-16 bg-slate-800/10 rounded-bl-3xl flex items-center justify-center text-[var(--admin-text-main)]/20">
 <Car size={24} />
 </div>
 <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-main)] mb-2">Host pathway</h4>
 <div className="mb-4">
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Host Card Image</label>
 <div className="flex items-center gap-4">
 <div className="w-20 h-20 bg-[var(--admin-bg)] rounded-app border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center overflow-hidden relative group/host transition-all hover:border-primary/30">
 {formData.ctaImageHost ? (
 <>
 <img src={resolveAsset(formData.ctaImageHost) || ""} alt="Host" className="w-full h-full object-contain p-2" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/host:opacity-100 transition-opacity flex items-center justify-center gap-2">
 <button onClick={() => ctaHostInputRef.current?.click()} className="p-1.5 bg-[var(--admin-card-bg)] rounded-app text-primary "><Upload size={12} /></button>
 <button onClick={() => handleFieldChange('ctaImageHost', '')} className="p-1.5 bg-[var(--admin-card-bg)] rounded-app text-red-500 "><X size={12} /></button>
 </div>
 </>
 ) : (
 <button onClick={() => ctaHostInputRef.current?.click()} className="flex flex-col items-center gap-1 text-[var(--admin-text-muted)] hover:text-primary transition-all">
 <ImageIcon size={18} />
 <span className="text-[8px] font-bold uppercase">Upload</span>
 </button>
 )}
 {uploading === 'ctaImageHost' && (
 <div className="absolute inset-0 bg-[var(--admin-card-bg)]/90 flex items-center justify-center">
 <RefreshCw className="animate-spin text-primary" size={16} />
 </div>
 )}
 </div>
 <div className="flex-1 space-y-2">
 <Input 
 value={formData.ctaImageHost || ""}
 placeholder="Path or Base64..."
 onChange={(e) => handleFieldChange('ctaImageHost', e.target.value)}
 className="h-8 text-[9px] bg-[var(--admin-bg)] font-bold border-none"
 />
 <input type="file" ref={ctaHostInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'ctaImageHost')} />
 <p className="text-[8px] text-[var(--admin-text-muted)] italic">Recommended: 1:1 ratio, transparent BG</p>
 </div>
 </div>
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Title ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.ctaTitleHost || ""}
 placeholder="e.g., Managing Your Car Journey?"
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].ctaTitleHost = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="h-10 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app"
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Subtitle ({selectedHeroLang})</label>
 <Textarea 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.ctaSubtitleHost || ""}
 placeholder="e.g., Unlock tools to track, manage, or find a new home..."
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].ctaSubtitleHost = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="min-h-[80px] bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app p-4 resize-none"
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Button Text ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.ctaButtonHost || ""}
 placeholder="e.g., List Your Car"
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].ctaButtonHost = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="h-10 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app"
 />
 </div>
 </div>
 </div>
 </motion.div>
 )}



 {currentSection === 'testimonials' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
 <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <div>
 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-text-main)] mb-1">{t.settings.frontend.labels.showTestimonials}</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Display verification testimonials</p>
 </div>
 <Switch 
 checked={formData.showTestimonials} 
 onCheckedChange={(val) => handleFieldChange('showTestimonials', val)}
 />
 </div>

 <div className="space-y-4 bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] ">
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Upper Title ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.testimonialsTitle || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].testimonialsTitle = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 placeholder="e.g., What Our Clients Say"
 className="h-11 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app px-4 "
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Main Heading ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.testimonialsSubtitle || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].testimonialsSubtitle = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 placeholder="e.g., Trusted by Thousands"
 className="h-11 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app px-4 "
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Short Description ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.testimonialsDescription || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].testimonialsDescription = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 placeholder="e.g., Real stories from real CarRental clients around the world."
 className="h-11 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app px-4 "
 />
 </div>
 </div>
 </motion.div>
 )}

 {currentSection === 'enhance' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
 <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <div>
 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-text-main)] mb-1">Enhance Experience Section</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Section for accessories and premium services</p>
 </div>
 <Switch 
 checked={formData.showEnhanceSection !== false} 
 onCheckedChange={(val) => handleFieldChange('showEnhanceSection', val)}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-4 bg-[var(--admin-card-bg)] p-4 md:p-6 rounded-app border border-[var(--admin-border)] relative overflow-hidden">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Content Details</h4>
 <div className="space-y-4">
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Main Title ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.enhanceTitle || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].enhanceTitle = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="h-10 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app"
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Sub-Description ({selectedHeroLang})</label>
 <Textarea 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.enhanceSubtitle || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].enhanceSubtitle = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="min-h-[100px] bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app p-4 resize-none"
 />
 </div>
 </div>
 </div>

 <div className="space-y-4 bg-[var(--admin-card-bg)] p-4 md:p-6 rounded-app border border-[var(--admin-border)] ">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Section Media</h4>
 <div className="space-y-4">
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Experience Feature Image</label>
 <div className="w-full h-48 bg-[var(--admin-bg)] rounded-app border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center overflow-hidden relative group/enhance transition-all hover:border-primary/30">
 {formData.enhanceImage ? (
 <>
 <img src={resolveAsset(formData.enhanceImage) || ""} alt="Enhance" className="w-full h-full object-cover" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/enhance:opacity-100 transition-opacity flex items-center justify-center gap-2">
 <button onClick={() => enhanceImageInputRef.current?.click()} className="p-3 bg-[var(--admin-card-bg)] rounded-app text-primary "><Upload size={18} /></button>
 <button onClick={() => handleFieldChange('enhanceImage', '')} className="p-3 bg-[var(--admin-card-bg)] rounded-app text-red-500 "><X size={18} /></button>
 </div>
 </>
 ) : (
 <button onClick={() => enhanceImageInputRef.current?.click()} className="flex flex-col items-center gap-3 text-[var(--admin-text-muted)] hover:text-primary transition-all">
 <ImageIcon size={32} />
 <span className="text-[10px] font-bold uppercase tracking-widest">Upload Experience Photo</span>
 </button>
 )}
 {uploading === 'enhanceImage' && (
 <div className="absolute inset-0 bg-[var(--admin-card-bg)]/90 flex items-center justify-center">
 <RefreshCw className="animate-spin text-primary" size={32} />
 </div>
 )}
 </div>
 <Input 
 value={formData.enhanceImage || ""}
 placeholder="Path or Base64..."
 onChange={(e) => handleFieldChange('enhanceImage', e.target.value)}
 className="h-9 bg-[var(--admin-bg)] border-none font-bold text-[10px] rounded-app"
 />
 <input type="file" ref={enhanceImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'enhanceImage')} />
 </div>
 </div>
 </div>
 </motion.div>
 )}

 {currentSection === 'app' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
 <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <div>
 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-text-main)] mb-1">Mobile App Download Section</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Promote your iOS and Android drive apps</p>
 </div>
 <Switch 
 checked={formData.showAppSection !== false} 
 onCheckedChange={(val) => handleFieldChange('showAppSection', val)}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-4 bg-[var(--admin-card-bg)] p-4 md:p-6 rounded-app border border-[var(--admin-border)] ">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Marketing Copy</h4>
 <div className="space-y-4">
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">App Title ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.appTitle || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].appTitle = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="h-10 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app"
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Detailed Description ({selectedHeroLang})</label>
 <Textarea 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.appSubtitle || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].appSubtitle = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="min-h-[120px] bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app p-4 resize-none"
 />
 </div>
 </div>
 </div>

 <div className="space-y-4 bg-[var(--admin-card-bg)] p-4 md:p-6 rounded-app border border-[var(--admin-border)] ">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Display Mockup</h4>
 <div className="space-y-4">
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Phone / App Image</label>
 <div className="w-full h-48 bg-[var(--admin-bg)] rounded-app border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center overflow-hidden relative group/app transition-all hover:border-primary/30">
 {formData.appImage ? (
 <>
 <img src={resolveAsset(formData.appImage) || ""} alt="App" className="w-full h-full object-contain p-4" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/app:opacity-100 transition-opacity flex items-center justify-center gap-2">
 <button onClick={() => appImageInputRef.current?.click()} className="p-3 bg-[var(--admin-card-bg)] rounded-app text-primary "><Upload size={18} /></button>
 <button onClick={() => handleFieldChange('appImage', '')} className="p-3 bg-[var(--admin-card-bg)] rounded-app text-red-500 "><X size={18} /></button>
 </div>
 </>
 ) : (
 <button onClick={() => appImageInputRef.current?.click()} className="flex flex-col items-center gap-3 text-[var(--admin-text-muted)] hover:text-primary transition-all">
 <ImageIcon size={32} />
 <span className="text-[10px] font-bold uppercase tracking-widest">Upload Device Mockup</span>
 </button>
 )}
 {uploading === 'appImage' && (
 <div className="absolute inset-0 bg-[var(--admin-card-bg)]/90 flex items-center justify-center">
 <RefreshCw className="animate-spin text-primary" size={32} />
 </div>
 )}
 </div>
 <Input 
 value={formData.appImage || ""}
 placeholder="/app-mockup.png"
 onChange={(e) => handleFieldChange('appImage', e.target.value)}
 className="h-9 bg-[var(--admin-bg)] border-none font-bold text-[10px] rounded-app"
 />
 <input type="file" ref={appImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'appImage')} />
 </div>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
 <div className="space-y-4 bg-[var(--admin-card-bg)] p-4 md:p-6 rounded-app border border-[var(--admin-border)] ">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">App Store Settings</h4>
 <div className="space-y-4">
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Button Label ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.appStoreLabel || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].appStoreLabel = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="h-10 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app"
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Redirect URL</label>
 <Input 
 value={(formData as any).appStoreLink || ""}
 onChange={(e) => handleFieldChange('appStoreLink', e.target.value)}
 placeholder="https://apple.com/app-store"
 className="h-10 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app"
 />
 </div>
 </div>
 </div>

 <div className="space-y-4 bg-[var(--admin-card-bg)] p-4 md:p-6 rounded-app border border-[var(--admin-border)] ">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Google Play Settings</h4>
 <div className="space-y-4">
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Button Label ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.googlePlayLabel || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].googlePlayLabel = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="h-10 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app"
 />
 </div>
 <div>
 <label className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mb-1 block">Redirect URL</label>
 <Input 
 value={(formData as any).googlePlayLink || ""}
 onChange={(e) => handleFieldChange('googlePlayLink', e.target.value)}
 placeholder="https://play.google.com/store"
 className="h-10 bg-[var(--admin-bg)] border-none font-bold text-xs rounded-app"
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
 <div className="flex items-center justify-between p-4 md:p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <div>
 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-text-main)] mb-1">Social Networks</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Manage your custom social links</p>
 </div>
 <Button 
 onClick={() => {
 const links = [...((formData as any).socialLinks || [])];
 links.push({ id: `social_${Date.now()}`, icon: '', url: '' });
 handleFieldChange('socialLinks', links);
 }}
 className="h-9 px-4 rounded-app bg-primary text-[10px] font-bold tracking-widest uppercase text-white flex-shrink-0"
 >
 + Add Platform
 </Button>
 </div>
 <div className="space-y-4">
 {((formData as any).socialLinks || []).map((social: any, idx: number) => (
 <div key={social.id || idx} className="flex flex-col md:flex-row gap-4 bg-[var(--admin-card-bg)] p-4 rounded-app border border-[var(--admin-border)] relative group items-center">
 <div className="flex-none">
 <label className="text-[8px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1 mb-1 block text-center">Icon</label>
 <div className="w-12 h-12 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] flex items-center justify-center overflow-hidden relative group/icon ">
 {social.icon ? (
 <img src={social.icon} className="w-6 h-6 object-contain" alt="social icon" />
 ) : (
 <div className="text-[8px] font-bold text-[var(--admin-text-muted)]">LOGO</div>
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
 <label className="text-[8px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1 mb-1 block">Platform URL</label>
 <Input 
 value={social.url || ""}
 onChange={(e) => {
 const links = [...(formData as any).socialLinks];
 links[idx].url = e.target.value;
 handleFieldChange('socialLinks', links);
 }}
 placeholder="https://"
 className="h-12 bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-xs rounded-app focus:border-primary transition-all"
 />
 </div>
 <button 
 onClick={() => {
 const links = [...(formData as any).socialLinks];
 links.splice(idx, 1);
 handleFieldChange('socialLinks', links);
 }}
 className="w-10 h-10 mt-4 md:mt-2 rounded-app bg-red-500/10 text-red-500 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0"
 >
 <X size={16} />
 </button>
 </div>
 ))}
 {(!(formData as any).socialLinks || (formData as any).socialLinks.length === 0) && (
 <div className="py-8 border-2 border-dashed border-[var(--admin-border)] rounded-app flex flex-col items-center justify-center text-[var(--admin-text-muted)]">
 <Share2 size={24} className="mb-2 opacity-20" />
 <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">No social platforms</span>
 </div>
 )}
 </div>
 </motion.div>
 )}

 {currentFooterSection === 'links' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
 <div className="flex items-center justify-between p-4 md:p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <div>
 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-text-main)] mb-1">Quick Links</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Manage footer navigation links</p>
 </div>
 <Button 
 onClick={() => {
 const links = [...((formData as any).footerLinks || [])];
 links.push({ id: `footer_link_${Date.now()}`, label: 'New Link', url: '#' });
 handleFieldChange('footerLinks', links);
 }}
 className="h-9 px-4 rounded-app bg-primary text-[10px] font-bold tracking-widest uppercase text-white "
 >
 + Add Link
 </Button>
 </div>
 <div className="space-y-3">
 {(formData as any).footerLinks && (formData as any).footerLinks.map((link: any, idx: number) => (
 <div key={idx} className="flex flex-col md:flex-row gap-4 bg-[var(--admin-card-bg)] p-4 rounded-app border border-[var(--admin-border)] relative group items-center">
 <div className="flex-1 w-full">
 <label className="text-[8px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1 mb-1 block">Translation Label ({selectedHeroLang})</label>
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
 className="h-10 bg-[var(--admin-bg)] border border-[var(--admin-border)] focus:border-primary transition-all font-bold text-xs rounded-app"
 />
 </div>
 <div className="flex-1 w-full">
 <label className="text-[8px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1 mb-1 block">URL Path</label>
 <Input 
 value={link.url || ""}
 onChange={(e) => {
 const links = [...(formData as any).footerLinks];
 links[idx].url = e.target.value;
 handleFieldChange('footerLinks', links);
 }}
 className="h-10 bg-[var(--admin-bg)] border border-[var(--admin-border)] focus:border-primary transition-all font-bold text-xs rounded-app"
 />
 </div>
 <button 
 onClick={() => {
 const links = [...(formData as any).footerLinks];
 links.splice(idx, 1);
 handleFieldChange('footerLinks', links);
 }}
 className="w-10 h-10 mt-4 md:mt-2 rounded-app bg-red-500/10 text-red-500 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0"
 >
 <X size={16} />
 </button>
 </div>
 ))}
 {(!(formData as any).footerLinks || (formData as any).footerLinks.length === 0) && (
 <div className="py-12 border-2 border-dashed border-[var(--admin-border)] rounded-app flex flex-col items-center justify-center text-[var(--admin-text-muted)]">
 <LinkIcon size={32} className="mb-3 opacity-20" />
 <span className="text-xs font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">No quick links added</span>
 </div>
 )}
 </div>
 </motion.div>
 )}

 {currentFooterSection === 'text' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
 <div className="space-y-2 max-w-xl">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">Copyright Disclaimer ({selectedHeroLang})</label>
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
 className="h-12 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] focus:border-primary transition-all font-bold text-[var(--admin-text-main)] px-6 text-sm"
 />
 </div>
 </motion.div>
 )}

 {currentFooterSection === 'newsletter' && (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
 <div className="flex items-center justify-between p-4 md:p-6 bg-[var(--admin-bg)] rounded-app border border-[var(--admin-border)]">
 <div>
 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-text-main)] mb-1">Newsletter Setup</h4>
 <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Collect emails directly above your footer</p>
 </div>
 <Switch 
 checked={(formData as any).showNewsletter ?? true} 
 onCheckedChange={(val) => handleFieldChange('showNewsletter', val)}
 />
 </div>
 <div className="grid grid-cols-1 gap-6 bg-[var(--admin-card-bg)] p-4 md:p-6 rounded-app border border-[var(--admin-border)] ">
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] px-1">Heading ({selectedHeroLang})</label>
 <Input 
 value={(formData.heroTranslations?.[selectedHeroLang] as any)?.newsletterTitle || ""}
 onChange={(e) => {
 const current = { ...(formData.heroTranslations || {}) };
 if (!current[selectedHeroLang]) (current as any)[selectedHeroLang] = {};
 (current as any)[selectedHeroLang].newsletterTitle = e.target.value;
 handleFieldChange('heroTranslations', current);
 }}
 className="h-12 bg-[var(--admin-bg)] border border-[var(--admin-border)] font-bold text-sm rounded-app focus:border-primary transition-all"
 />
 </div>
 </div>
 </motion.div>
 )}
 </TabsContent>

 <TabsContent value="protection" className="mt-0 p-4 md:p-6 outline-none pb-20">
 <ProtectionPlansManager 
 ref={plansManagerRef}
 plans={(formData as any).plans || []} 
 onChange={(val) => handleFieldChange("plans", val)} 
 />
 </TabsContent>
 <TabsContent value="taxes" className="mt-0 p-4 md:p-6 outline-none pb-20">
 <TaxesManager 
 ref={taxesManagerRef}
 taxes={(formData as any).taxes?.items || []}
 onChange={(val) => handleFieldChange("taxes", { ...((formData as any).taxes || {}), items: val })}
 />
 </TabsContent>
 <TabsContent value="cancellation" className="mt-0 p-4 md:p-6 outline-none pb-20">
 <CancellationManager 
 ref={cancellationManagerRef}
 config={(formData as any).cancellation || { rules: [], isCancellationEnabled: true, defaultRefundPercentage: 0 }}
 onChange={(val) => handleFieldChange("cancellation", val)}
 />
 </TabsContent>
 <TabsContent value="verification" className="mt-0 p-4 md:p-6 outline-none pb-20">
 <VerificationFieldsManager 
 fields={(formData as any).verification?.fields || (formData as any).fields || []}
 onChange={(val) => handleFieldChange("verification", { fields: val })}
 />
 </TabsContent>
 <TabsContent value="payments" className="mt-0 p-4 md:p-6 outline-none">
 <PaymentSettingsManager backendUrl={backendUrl} />
 </TabsContent>
 </div>
 </div>
 </div>
 </Tabs>
 </div>
 </motion.div>
 );
}
