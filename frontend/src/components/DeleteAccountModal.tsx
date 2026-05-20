'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, ChevronRight, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DeleteAccountModalProps {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: () => void;
 loading?: boolean;
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm, loading }: DeleteAccountModalProps) {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
 <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 />

 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative bg-white w-full max-w-[550px] rounded-app overflow-hidden z-10 flex flex-col"
 >
 {/* Header */}
 <div className="p-8 lg:p-10 border-b border-slate-50 relative">
 <button 
 onClick={onClose}
 className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
 >
 <X size={20} />
 </button>
 
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-app bg-rose-50 text-rose-500 flex items-center justify-center">
 <ShieldAlert size={28} />
 </div>
 <div>
 <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Deactivate Profile</h2>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Action is reversible for 7 days only</p>
 </div>
 </div>
 </div>

 {/* Content */}
 <div className="p-8 lg:p-10 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
 
 <div className="space-y-4">
 <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Important Disclosures</h3>
 
 <div className="space-y-4">
 <div className="flex gap-4">
 <div className="mt-1 w-5 h-5 shrink-0 rounded-full bg-primary/5 flex items-center justify-center text-primary">
 <CheckCircle2 size={12} strokeWidth={3} />
 </div>
 <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
 All your personal identifiers including <strong>Name, Email, and Phone Number</strong> will be permanently anonymized after the 7-day grace period.
 </p>
 </div>

 <div className="flex gap-4">
 <div className="mt-1 w-5 h-5 shrink-0 rounded-full bg-primary/5 flex items-center justify-center text-primary">
 <CheckCircle2 size={12} strokeWidth={3} />
 </div>
 <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
 Financial records, booking history, and transaction logs are kept for 7 years to comply with <strong>HMRC Tax and Liability Regulations</strong>.
 </p>
 </div>

 <div className="flex gap-4">
 <div className="mt-1 w-5 h-5 shrink-0 rounded-full bg-primary/5 flex items-center justify-center text-primary">
 <CheckCircle2 size={12} strokeWidth={3} />
 </div>
 <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
 All your active vehicle listings will be hidden from search results immediately and cannot be booked by others during the frozen state.
 </p>
 </div>
 </div>
 </div>

 <div className="bg-slate-50 p-6 rounded-app border border-slate-100 flex items-start gap-4">
 <Info className="text-primary mt-0.5 shrink-0" size={16} />
 <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wide">
 By deactivating, you agree to our <Link href="/policy/deletion" target="_blank" className="text-primary hover:underline underline-offset-4">Deletion & Retention Policy</Link>. You can recover your account anytime before the grace period ends.
 </p>
 </div>

 {/* Accept Checkbox */}
 <label className="flex items-center gap-4 cursor-pointer group select-none">
 <div className={`w-6 h-6 rounded-app border-2 flex items-center justify-center transition-all ${hasAccepted ? 'bg-primary border-primary' : 'border-slate-200 group-hover:border-primary/50'}`}>
 <input 
 type="checkbox" 
 className="hidden" 
 checked={hasAccepted} 
 onChange={(e) => setHasAccepted(e.target.checked)} 
 />
 {hasAccepted && <CheckCircle2 size={14} className="text-white" strokeWidth={3} />}
 </div>
 <span className="text-xs font-black text-slate-700 uppercase tracking-tight">I understand and accept these terms</span>
 </label>
 </div>

 {/* Actions */}
 <div className="p-8 lg:p-10 bg-slate-50/50 border-t border-slate-50 flex gap-4">
 <Button 
 variant="outline" 
 onClick={onClose}
 className="flex-1 h-12 rounded-app font-black uppercase text-[10px] tracking-widest border-slate-200 hover:bg-white transition-all"
 >
 Cancel
 </Button>
 <Button 
 disabled={!hasAccepted || loading}
 onClick={onConfirm}
 className={`flex-1 h-12 rounded-app font-black uppercase text-[10px] tracking-widest transition-all ${hasAccepted ? 'bg-rose-500 text-white hover:bg-rose-600 -200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
 >
 {loading ? 'Processing...' : 'Confirm Deactivation'}
 </Button>
 </div>
  </motion.div>
  </div>,
  document.body
  );
}
