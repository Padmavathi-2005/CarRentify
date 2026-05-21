"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthContext";
import { useLocale } from "@/components/LocaleContext";
import { API_BASE_URL, BACKEND_URL, getImageUrl, PLACEHOLDER_IMAGE } from "@/config/api";

interface CarCardProps {
 car: {
 id: string | number;
 _id?: string;
 permalink?: string;
 name?: string;
 brandName?: string;
 model?: string;
 year?: number;
 price: number;
 pricePerDay?: number;
 currency?: any;
 image: any;
 images?: any[];
 type?: string;
 vehicleType?: { name: string } | string;
 rating: number;
 reviews: number;
 badge?: string | null;
 badges?: string[];
 bookingType?: 'Instant' | 'Request';
 createdAt?: string;
 seoImage?: string;
 status?: string;
 };
 index?: number;
 isOwner?: boolean;
 onEdit?: (car: any) => void;
 onDelete?: (id: string | number) => void;
}

export default function CarCard({ car, index = 0, isOwner = false, onEdit, onDelete }: CarCardProps) {
 const router = useRouter();
 const { user, setUser, setShowLoginModal } = useAuth();
 const { formatPrice } = useLocale();
 const [isWishlisted, setIsWishlisted] = useState(false);
 const [loadingWishlist, setLoadingWishlist] = useState(false);

 // Safe field access for both mock data and DB model
 const carId = car._id || car.id;
 const carName = car.name || `${car.brandName} ${car.model}`.trim();
 const carPrice = car.price || car.pricePerDay || 0;
 const carImage = car.image && typeof car.image === 'string' ? getImageUrl(car.image) : (car.images && car.images[0] ? getImageUrl(car.images[0]) : PLACEHOLDER_IMAGE);

 useEffect(() => {
 // Check if user has this car in wishlist
 if (user?.wishlist?.includes(String(carId))) {
 setIsWishlisted(true);
 }
 }, [user, carId]);

 const handleNavigate = () => {
 router.push(`/vehicles/${car.permalink || carId}`);
 };

 const toggleWishlist = async (e: React.MouseEvent) => {
 e.stopPropagation();
 if (!user) {
 setShowLoginModal(true);
 return;
 }

 setLoadingWishlist(true);
 try {
 const res = await fetch(`${API_BASE_URL}/users/wishlist/toggle`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ userId: user._id || user.id, carId: String(carId) })
 });

 if (res.ok) {
 setIsWishlisted(!isWishlisted);
 const { wishlist } = await res.json();
 if (user) {
 setUser({ ...user, wishlist });
 }
 }
 } catch (err) {
 console.error("Wishlist toggle failure:", err);
 } finally {
 setLoadingWishlist(false);
 }
 };

 const fadeInUp = {
 initial: { opacity: 0, y: 20 },
 animate: { opacity: 1, y: 0 },
 transition: { duration: 0.5, delay: index * 0.1 }
 };

 return (
 <motion.div {...fadeInUp}>
 <Card
 onClick={handleNavigate}
 className="group overflow-hidden rounded-app border-border dark:border-white/50 bg-card hover:border-primary-hover/60 transition-all duration-500 cursor-pointer h-full flex flex-col relative "
 >
 <div className="relative aspect-[4/3] overflow-hidden bg-muted/20">
 <img
 src={carImage}
 alt={carName}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
 onError={(e) => {
 (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
 }}
 />
 <div className="absolute top-4 start-4 flex flex-col gap-2 pointer-events-none z-30">
 {(() => {
 const allBadges = [...(car.badges || [])];
 
 // Automatically add 'New Listing' if created recently
 if (car.createdAt) {
 const createdDate = new Date(car.createdAt);
 const diffDays = Math.ceil(Math.abs(Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
 if (diffDays <= 14 && !allBadges.includes('New Listing') && !allBadges.includes('New')) {
 allBadges.push('New Listing');
 }
 }

 // Normalize 'New' to 'New Listing'
 const normalized = allBadges.map(b => b === 'New' ? 'New Listing' : b);

 // Priority: New Listing > Rare Find > Great Value > Top Rated > Superhost > Free Delivery
 const priorityOrder = ['New Listing', 'Rare Find', 'Great Value', 'Top Rated', 'Superhost', 'Free Delivery'];
 
 // Find the highest priority badge that exists
 const topBadge = priorityOrder.find(p => normalized.includes(p)) || normalized[0];

 if (!topBadge && !car.status) return null;

 return (
 <div className="flex flex-col gap-2">
   {topBadge && (
     <Badge className={`${
     topBadge === 'Great Value' ? 'bg-emerald-600 text-white' : 
     topBadge === 'Rare Find' ? 'bg-orange-500 text-white' : 
     topBadge === 'New Listing' ? 'bg-indigo-600 text-white' : 
     topBadge === 'Superhost' ? 'bg-foreground text-background' :
     topBadge === 'Top Rated' ? 'bg-amber-400 text-slate-900' :
     topBadge === 'Free Delivery' ? 'bg-emerald-400 text-slate-900' :
     'bg-foreground text-background'
     } border-none px-2.5 py-1 rounded-app text-[8px] font-black uppercase tracking-wider`}>
     {topBadge}
     </Badge>
   )}
   {(isOwner || user?.role?.toLowerCase() === 'admin') && car.status && car.status !== 'approved' && (
     <Badge className={`${
       car.status === 'rejected' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
     } border-none px-2.5 py-1 rounded-app text-[8px] font-black uppercase tracking-wider animate-pulse`}>
       {car.status}
     </Badge>
   )}
 </div>
 );
 })()}
 </div>
 
 <button 
 onClick={toggleWishlist}
 disabled={loadingWishlist}
 className={`absolute top-4 end-4 w-11 h-11 bg-card/90 backdrop-blur-md rounded-app flex items-center justify-center transition-all z-20 group/heart border border-border/40 ${isWishlisted ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 'text-muted-foreground/80 dark:text-white/60 hover:text-rose-500 hover:border-rose-500/30'}`}
 >
 <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current animate-pulse' : 'group-hover:scale-125 transition-transform'}`} />
 </button>
 </div>

 <CardContent className="p-6 flex-1 flex flex-col">
 <div className="text-[9px] font-bold text-muted-foreground dark:text-primary uppercase tracking-widest mb-2 leading-none">
 {car.type || (typeof car.vehicleType === 'object' && car.vehicleType?.name) || 'Elite Class'}
 </div>
 <h3 className="font-bold text-xl text-foreground mb-2 line-clamp-1 tracking-tight">{carName}</h3>
 
 <div className="flex items-center gap-1.5 mb-6 text-xs font-bold text-muted-foreground">
 <Star className={`w-4 h-4 ${car.reviews && car.reviews > 0 ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 dark:text-white/30'}`} />
 <span className="font-black text-foreground">{car.reviews && car.reviews > 0 ? (car.rating?.toFixed(1) || '0.0') : '0'}</span>
 <span className="opacity-60">({car.reviews || 0} reviews)</span>
 </div>

 <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
 <div className="flex flex-col">
 <span className="text-2xl font-bold text-primary dark:text-white leading-none uppercase tracking-tighter">{formatPrice(carPrice, car.currency)}</span>
 <div className="flex items-center gap-1.5 mt-1">
 <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">/ day</span>
 </div>
 </div>

 {(isOwner || user?.role?.toLowerCase() === 'admin') ? (
 <div className="flex gap-2">
 <button 
 className="w-10 h-10 rounded-app bg-muted/50 border border-border dark:border-white/20 flex items-center justify-center text-muted-foreground hover:text-white dark:hover:bg-primary dark:hover:border-white transition-all "
 onClick={(e) => { e.stopPropagation(); onEdit && onEdit(car); }}
 >
 <Edit size={16} />
 </button>
 <button 
 className="w-10 h-10 rounded-app bg-muted/50 border border-border dark:border-white/20 flex items-center justify-center text-muted-foreground hover:text-white dark:hover:bg-red-500 dark:hover:border-white transition-all "
 onClick={(e) => { e.stopPropagation(); onDelete && onDelete(carId); }}
 >
 <Trash2 size={16} />
 </button>
 </div>
 ) : (
 car.bookingType === 'Instant' && (
 <Button 
 disabled={user?.role?.toLowerCase() === 'admin'}
 onClick={(e) => {
 e.stopPropagation();
 if (!user) setShowLoginModal(true);
 else if (user.role?.toLowerCase() === 'admin') {
 // Already disabled, but just in case
 return;
 }
 else handleNavigate();
 }}
 className={`rounded-app h-8 px-4 text-[11px] font-black uppercase tracking-normal transition-all border-none ${user?.role?.toLowerCase() === 'admin' ? 'bg-slate-100 text-slate-300' : 'bg-primary text-white hover:bg-primary-hover active:scale-95'}`}
 >
 {user?.role?.toLowerCase() === 'admin' ? 'Admin Mode' : 'Book'}
 </Button>
 )
 )}
 </div>
 </CardContent>
 </Card>
 </motion.div>
 );
}
