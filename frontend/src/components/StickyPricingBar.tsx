"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/LocaleContext";

interface StickyPricingBarProps {
 hourlyRate: number;
 selectedHours: number;
 tierPrice: number;
 tierLabel: string;
 isUpgraded: boolean;
 onUpgrade: () => void;
 onKeepCurrent: () => void;
 onBook: () => void;
 carCurrency?: any;
}

export default function StickyPricingBar({
 hourlyRate,
 selectedHours,
 tierPrice,
 tierLabel,
 isUpgraded,
 onUpgrade,
 onKeepCurrent,
 onBook,
 carCurrency
}: StickyPricingBarProps) {
 const { formatPrice } = useLocale();
 const [isOpen, setIsOpen] = useState(false);
 
 const hourlyTotal = selectedHours * hourlyRate;
 const savings = hourlyTotal - tierPrice;
 const currentTotal = isUpgraded ? tierPrice : hourlyTotal;

 // Only show if there are actual savings and not already upgraded
 const hasOffer = savings > 0 && !isUpgraded;

 return (
 <div className="fixed bottom-0 left-0 w-full bg-slate-100 border-t border-slate-200 p-4 md:p-6 z-[100] ">
 <div className="max-w-3xl mx-auto space-y-3">
 
 {/* ✅ Green Savings Bar */}
 <AnimatePresence>
 {hasOffer && (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 onClick={() => setIsOpen(!isOpen)}
 className="bg-[#22C55E] text-white px-6 py-3.5 rounded-app flex justify-between items-center cursor-pointer hover:bg-[#16A34A] transition-all"
 >
 <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
 <span>💰</span> Save {formatPrice(savings, carCurrency)} with {tierLabel}
 </div>
 <div className="flex items-center gap-1 text-sm font-medium opacity-90">
 View Offer <ChevronRight size={16} />
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* ✅ Expandable Special Offer Box */}
 <motion.div 
 initial={false}
 animate={{ height: isOpen && hasOffer ? "auto" : 0 }}
 className="overflow-hidden"
 >
 <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-app p-6 mb-3">
 <h3 className="text-[#15803D] font-bold text-lg flex items-center gap-2 mb-4">
 <span>🎁</span> Special Offer
 </h3>

 <div className="space-y-1.5 mb-5">
 <p className="text-sm text-slate-500 font-medium">
 Current: {selectedHours}h × {formatPrice(hourlyRate, carCurrency)} = {formatPrice(hourlyTotal, carCurrency)}
 </p>
 <p className="text-sm text-slate-500 font-medium">
 Offer: <span className="text-slate-900 font-bold">{formatPrice(tierPrice, carCurrency)} for {tierLabel === 'daily plan' ? '24h' : tierLabel}</span>
 </p>
 </div>

 <p className="text-[#15803D] font-black text-xl mb-6 tracking-tight">
 You save {formatPrice(savings, carCurrency)}
 </p>

 <div className="flex gap-4">
 <Button 
 onClick={() => { onUpgrade(); setIsOpen(false); }}
 className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-app h-14 font-black text-xs uppercase tracking-widest border-none -600/20"
 >
 Upgrade to {tierLabel === 'daily plan' ? '24h' : 'Tier'}
 </Button>
 <Button 
 onClick={() => { onKeepCurrent(); setIsOpen(false); }}
 variant="outline"
 className="flex-1 bg-white border-slate-200 text-slate-500 rounded-app h-14 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
 >
 Keep Current
 </Button>
 </div>
 </div>
 </motion.div>

 {/* ✅ Final Price + Book Action */}
 <div className="flex justify-between items-center bg-white/50 py-3 rounded-app">
 <div className="space-y-0.5">
 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p>
 <p className="text-4xl font-black text-slate-900 leading-none">{formatPrice(currentTotal, carCurrency)}</p>
 </div>
 <Button 
 onClick={onBook}
 className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-10 h-16 rounded-app font-black text-xs uppercase tracking-widest -600/20 border-none transition-all active:scale-95"
 >
 Book Now
 </Button>
 </div>

 </div>
 </div>
 );
}
