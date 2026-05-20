"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PriceOptimizerProps {
 hourlyRate: number;
 selectedHours: number;
 dailyRate: number;
 isUpgraded: boolean;
 isDismissed: boolean;
 onUpgrade: () => void;
 onDismiss: () => void;
}

export default function PriceOptimizer({
 hourlyRate,
 selectedHours,
 dailyRate,
 isUpgraded,
 isDismissed,
 onUpgrade,
 onDismiss
}: PriceOptimizerProps) {
 const [isOpen, setIsOpen] = useState(false);
 
 const hourlyTotal = selectedHours * hourlyRate;
 const savings = hourlyTotal - dailyRate;

 // Only show if savings exist and not yet upgraded/dismissed
 if (isUpgraded || isDismissed || savings <= 0) return null;

 return (
 <div className="space-y-3 mb-6">
 {/* ✅ Green Savings Bar (Toggle) */}
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 onClick={() => setIsOpen(!isOpen)}
 className="bg-[#22C55E] text-white px-5 py-3.5 rounded-app flex justify-between items-center -500/10 cursor-pointer hover:bg-[#16A34A] transition-all group"
 >
 <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
 💰 Save ${savings.toFixed(0)} with daily plan
 </div>
 <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">
 {isOpen ? <ChevronDown size={14} /> : <div className="flex items-center gap-1">View Offer <ChevronRight size={14} /></div>}
 </div>
 </motion.div>

 {/* ✅ Expandable Special Offer Box */}
 <motion.div 
 initial={false}
 animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
 className="overflow-hidden"
 >
 <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-app p-6">
 <h3 className="text-[#15803D] font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
 <span>🎁</span> Special Offer
 </h3>

 <div className="space-y-1 mb-4">
 <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
 Current: {selectedHours}h × ${hourlyRate} = ${hourlyTotal.toFixed(2)}
 </p>
 <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
 Offer: <span className="text-slate-900 font-black">${dailyRate} for 24h</span>
 </p>
 </div>

 <p className="text-[#15803D] font-black text-lg mb-6 tracking-tighter uppercase italic">
 You save ${savings.toFixed(2)}
 </p>

 <div className="flex flex-col gap-3">
 <Button 
 onClick={onUpgrade}
 className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white rounded-app h-12 font-black text-[9px] uppercase tracking-widest -600/10 border-none"
 >
 Upgrade to 24h
 </Button>
 <button 
 onClick={onDismiss}
 className="w-full text-center text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
 >
 Keep Current
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 );
}
