"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Share2, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getImageUrl, PLACEHOLDER_IMAGE, API_BASE_URL } from "@/config/api";
import { useAuth } from "@/components/AuthContext";

export const ImageGallery = ({ 
 images, 
 car, 
 onShare 
}: { 
 images: string[], 
 car: any, 
 onShare: () => void 
}) => {
 const [activeImg, setActiveImg] = useState(0);
 const { user, setUser, setShowLoginModal } = useAuth();
 const [loadingWishlist, setLoadingWishlist] = useState(false);

 const carId = car?._id || car?.id;
 const isFavorite = user?.wishlist?.includes(String(carId)) || false;

 const toggleWishlist = async (e: React.MouseEvent) => {
 e.stopPropagation();
 if (!user) {
 setShowLoginModal(true);
 return;
 }
 setLoadingWishlist(true);
 try {
 const res = await fetch(`${API_BASE_URL}/users/wishlist/toggle`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${localStorage.getItem("token")}`,
 },
 body: JSON.stringify({ userId: user._id, carId }),
 });
 if (res.ok) {
 const { wishlist } = await res.json();
 if (wishlist) {
 setUser({ ...user, wishlist });
 }
 }
 } catch (err) {
 console.error("Wishlist toggle failure:", err);
 } finally {
 setLoadingWishlist(false);
 }
 };

 if (!images || images.length === 0) return null;

 return (
 <div className="mb-14">
 <div className="space-y-8">
 <div className="relative rounded-app overflow-hidden bg-muted/20 border border-border group transition-all duration-700 mx-auto h-[280px] sm:h-[400px] md:h-[550px] w-full touch-auto">
 <AnimatePresence mode="wait">
 <motion.img
 key={images[activeImg]}
 initial={{ opacity: 0, scale: 1.02 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.5 }}
 src={getImageUrl(images[activeImg])}
 className="h-full w-full object-cover transition-all duration-700"
 onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
 />
 </AnimatePresence>
 
 <div className="absolute top-8 start-8 flex flex-col gap-3 z-40 pointer-events-none">
 {car?.badges && car.badges.map((badgeText: string, bIdx: number) => (
 <motion.div
 key={bIdx}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.5 + (bIdx * 0.1) }}
 >
 <Badge className="bg-slate-900 text-white border-none px-5 py-2.5 rounded-app text-[10px] font-black uppercase tracking-[0.1em] ">
 {badgeText}
 </Badge>
 </motion.div>
 ))}
 </div>

 <div className="absolute top-4 end-4 sm:top-6 sm:end-6 z-[40] flex flex-col gap-2 sm:gap-3">
 <button
 onClick={toggleWishlist}
 disabled={loadingWishlist}
 className={`w-10 h-10 sm:w-12 sm:h-12 rounded-app flex items-center justify-center transition-all bg-black/20 backdrop-blur-md border border-white/20 group/save ${isFavorite ? 'bg-white text-rose-500' : 'text-white hover:bg-white hover:text-rose-500'} ${loadingWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 <Heart size={20} className={isFavorite ? "fill-rose-500" : "group-hover/save:scale-110 transition-transform duration-300"} />
 </button>
 <button
 onClick={(e) => { e.stopPropagation(); onShare(); }}
 className="w-10 h-10 sm:w-12 sm:h-12 rounded-app flex items-center justify-center transition-all bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-primary group/share"
 >
 <Share2 size={20} className="group-hover/share:scale-110 transition-transform duration-300" />
 </button>
 </div>

 {images.length > 1 && (
 <>
 <button
 onClick={(e) => {
 e.stopPropagation();
 setActiveImg((prev) => (prev - 1 + images.length) % images.length);
 }}
 className="absolute start-3 sm:start-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center opacity-70 hover:opacity-100 transition-all hover:scale-110 active:scale-90 z-30"
 >
 <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
 </button>
 <button
 onClick={(e) => {
 e.stopPropagation();
 setActiveImg((prev) => (prev + 1) % images.length);
 }}
 className="absolute end-3 sm:end-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center opacity-70 hover:opacity-100 transition-all hover:scale-110 active:scale-90 z-30"
 >
 <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
 </button>
 </>
 )}
 </div>

 {images.length > 1 && (
 <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar px-4 justify-start md:justify-center touch-auto">
 {images.map((img: string, i: number) => (
 <motion.div
 key={i}
 whileHover={{ scale: 1.05 }}
 onMouseEnter={() => setActiveImg(i)}
 className={`flex-shrink-0 w-28 md:w-44 aspect-[16/11] rounded-app overflow-hidden cursor-pointer border-2 transition-all duration-300 ${activeImg === i ? 'border-primary scale-105 z-10' : 'border-transparent opacity-50 hover:opacity-100'}`}
 >
 <img src={getImageUrl(img)} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }} />
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
};
