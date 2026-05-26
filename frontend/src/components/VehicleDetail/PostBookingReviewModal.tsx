"use client";

import React, { useState } from "react";
import {
 Star,
 Sparkles,
 CheckCircle2,
 Key,
 MessageSquare,
 Tag,
 Send,
 Car,
 User,
 X,
 ThumbsUp,
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PostBookingReviewModalProps {
 isOpen: boolean;
 onClose: () => void;
 carId: string;
 bookingId: string;
 userId: string;
 carName?: string;
 hostName?: string;
}

const StarRating = ({
 value,
 onChange,
 size = 20,
}: {
 value: number;
 onChange: (v: number) => void;
 size?: number;
}) => {
 const [hovered, setHovered] = useState(0);

 // Sentiment color per star position: 1=red, 2=orange, 3=amber, 4=lime, 5=green
 const starColors = [
 "fill-red-500 text-red-500",
 "fill-orange-500 text-orange-500",
 "fill-amber-400 text-amber-400",
 "fill-lime-500 text-lime-500",
 "fill-emerald-500 text-emerald-500",
 ];
 const labelColors = [
 "", "text-red-500", "text-orange-500", "text-amber-500", "text-lime-600", "text-emerald-600"
 ];
 const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

 const activeLevel = hovered || value;

 return (
 <div className="flex items-center gap-1">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 key={star}
 onClick={() => onChange(star)}
 onMouseEnter={() => setHovered(star)}
 onMouseLeave={() => setHovered(0)}
 className="focus:outline-none active:scale-95 transition-transform"
 >
 <Star
 size={size}
 className={`transition-colors duration-150 ${
 star <= activeLevel
 ? starColors[activeLevel - 1]
 : "text-slate-200"
 }`}
 />
 </button>
 ))}
 {/* Fixed-width label slot — always rendered to prevent layout shift */}
 <span className={`ml-2 text-[10px] font-black uppercase tracking-widest transition-colors w-16 inline-block ${activeLevel > 0 ? labelColors[activeLevel] : 'text-transparent'}`}>
 {activeLevel > 0 ? labels[activeLevel] : 'Rate'}
 </span>
 </div>
 );
};

export default function PostBookingReviewModal({
 isOpen,
 onClose,
 carId,
 bookingId,
 userId,
 carName = "Your Vehicle",
 hostName = "Your Host",
}: PostBookingReviewModalProps) {
  const [carRatings, setCarRatings] = useState({
    vehicleCleanliness: 5,
    listingAccuracy: 5,
    pickupExperience: 5,
    valueForMoney: 5,
  });

  const [hostRatings, setHostRatings] = useState({
    hostCommunication: 5,
    vehicleLocation: 5,
  });

  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const carCategories = [
    { id: "vehicleCleanliness", label: "Cleanliness", icon: Sparkles, desc: "Was the car clean & fresh?" },
    { id: "listingAccuracy", label: "Accuracy", icon: CheckCircle2, desc: "Matched the description?" },
    { id: "pickupExperience", label: "Pickup Experience", icon: Car, desc: "Smooth pickup process?" },
    { id: "valueForMoney", label: "Value for Money", icon: Tag, desc: "Was the price fair?" },
  ];

  const hostCategories = [
    { id: "hostCommunication", label: "Communication", icon: MessageSquare, desc: "Responsive & easy to reach?" },
    { id: "vehicleLocation", label: "Location", icon: Key, desc: "Convenient vehicle location?" },
  ];

  const allRatings = { ...carRatings, ...hostRatings };

 const handleSubmit = async () => {
   setSubmitting(true);
   try {
     const overallRating =
       Object.values(allRatings).reduce((a, b) => a + b, 0) /
       Object.values(allRatings).length;

     const res = await fetch(`${API_BASE_URL}/reviews`, {
       method: "POST",
       headers: { 
         "Content-Type": "application/json",
         "Authorization": `Bearer ${authService.getToken()}`
       },
       body: JSON.stringify({
         car: carId,
         user: userId,
         booking: bookingId,
         rating: Math.round(overallRating),
         comment: comment.trim() || "No comment provided.",
         ...allRatings,
       }),
     });

     if (res.ok) {
       setSubmitted(true);
       setTimeout(() => {
         onClose();
         setSubmitted(false);
       }, 2200);
     } else {
       const data = await res.json().catch(() => ({}));
       toast.error(data?.message || "Failed to submit review");
     }
   } catch {
     toast.error("Connection error. Please try again.");
   } finally {
     setSubmitting(false);
   }
 };

 if (!isOpen) return null;

 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60">
 <motion.div
 initial={{ opacity: 0, scale: 0.96, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: 20 }}
 transition={{ type: "spring", damping: 24, stiffness: 300 }}
 className="w-full max-w-lg bg-white rounded-app overflow-hidden flex flex-col max-h-[88vh]"
 >
 {/* Header */}
 <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
 <div>
 <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Completed</p>
 <h2 className="text-lg font-black text-foreground tracking-tight leading-none">Rate Your Experience</h2>
 </div>
 <button onClick={onClose} className="w-9 h-9 rounded-app bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 flex items-center justify-center transition-all">
 <X size={16} />
 </button>
 </div>

 {/* Success State */}
 {submitted ? (
 <div className="flex flex-col items-center justify-center p-14 text-center">
 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 14 }}
 className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-4">
 <ThumbsUp size={26} className="text-emerald-500" />
 </motion.div>
 <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">Thank You!</h3>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your feedback helps the community</p>
 </div>
 ) : (
 <div className="p-6 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

 {/* ── Car Section ── */}
 <div>
 <div className="flex items-center gap-2 mb-3">
 <Car size={13} className="text-primary" />
 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Vehicle — <span className="text-slate-700 dark:text-slate-300">{carName}</span></p>
 </div>
 <div className="space-y-2">
 {carCategories.map((cat) => (
 <div key={cat.id} className="flex items-center justify-between py-2 px-3 rounded-app hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
 <div className="flex items-center gap-2 min-w-[130px]">
 <cat.icon size={13} className={`transition-colors ${carRatings[cat.id as keyof typeof carRatings] > 0 ? "text-primary" : "text-slate-300 group-hover:text-slate-400"}`} />
 <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{cat.label}</span>
 </div>
 <StarRating
 value={carRatings[cat.id as keyof typeof carRatings]}
 onChange={(v) => setCarRatings((prev) => ({ ...prev, [cat.id]: v }))}
 size={16}
 />
 </div>
 ))}
 </div>
 </div>

 {/* Divider */}
 <div className="border-t border-border" />

 {/* ── Host Section ── */}
 <div>
 <div className="flex items-center gap-2 mb-3">
 <User size={13} className="text-amber-500" />
 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Host — <span className="text-slate-700 dark:text-slate-300">{hostName}</span></p>
 </div>
 <div className="space-y-2">
 {hostCategories.map((cat) => (
 <div key={cat.id} className="flex items-center justify-between py-2 px-3 rounded-app hover:bg-amber-50/40 dark:hover:bg-amber-500/10 transition-colors group">
 <div className="flex items-center gap-2 min-w-[130px]">
 <cat.icon size={13} className={`transition-colors ${hostRatings[cat.id as keyof typeof hostRatings] > 0 ? "text-amber-500" : "text-slate-300 group-hover:text-slate-400"}`} />
 <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{cat.label}</span>
 </div>
 <StarRating
 value={hostRatings[cat.id as keyof typeof hostRatings]}
 onChange={(v) => setHostRatings((prev) => ({ ...prev, [cat.id]: v }))}
 size={16}
 />
 </div>
 ))}
 </div>
 </div>

 {/* Divider */}
 <div className="border-t border-border" />

 {/* ── Comment ── */}
 <textarea
 value={comment}
 onChange={(e) => setComment(e.target.value)}
 placeholder="Share your experience — what stood out or could be improved?"
 rows={3}
 className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-app px-4 py-3 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
 />

 {/* Submit */}
 <button
 onClick={handleSubmit}
 disabled={submitting}
 className="w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-app font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all"
 >
 {submitting ? (
 <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
 ) : (
 <><Send size={14} /> Submit Review</>
 )}
 </button>
 </div>
 )}
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 );
}

