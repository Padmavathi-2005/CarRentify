"use client";

import React, { useState } from "react";
import { Star, ChevronRight, Share2, Info, Clock, User as UserIcon, Sparkles, CheckCircle2, Key, MessageSquare, MapPin, Tag } from "lucide-react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useSettings } from "../ThemeProvider";
import { formatDateDisplay } from "../CustomDateTimePicker";

interface Review {
 _id: string;
 user: {
 displayName: string;
 firstName: string;
 lastName: string;
 image: string;
 };
 rating: number;
 comment: string;
 vehicleCleanliness?: number;
 listingAccuracy?: number;
 pickupExperience?: number;
 hostCommunication?: number;
 vehicleLocation?: number;
 valueForMoney?: number;
 createdAt: string;
}

export const ReviewSection = ({ reviews }: { reviews: Review[] }) => {
 const { settings } = useSettings();
 const [showAllReviews, setShowAllReviews] = useState(false);

 if (!reviews || reviews.length === 0) {
 return (
 <div className="space-y-8" id="reviews-section">
 <div className="flex items-center gap-3">
 <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Review</h2>
 <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full border border-border">
 <Star size={14} className="text-muted/30" />
 <span className="text-xs font-bold text-muted-foreground">No reviews yet</span>
 </div>
 </div>
 <div className="bg-card border border-border dark:border-white/20 rounded-app p-10 space-y-3">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground/30">
 <UserIcon size={24} />
 </div>
 <div>
 <p className="text-sm font-black text-foreground">No ratings or reviews available</p>
 <p className="text-xs font-bold text-muted-foreground">Be the first to share your experience after your trip.</p>
 </div>
 </div>
 </div>
 </div>
 );
 }

 const formatDate = (dateStr: string) => {
 return formatDateDisplay(dateStr, settings.defaultDateFormat);
 };

 const formatModalDate = (dateStr: string) => {
 return formatDateDisplay(dateStr, settings.defaultDateFormat);
 };

 const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
 const latestReview = reviews[0];

 const categoryAverages = {
 cleanliness: (reviews.reduce((acc, r) => acc + (r.vehicleCleanliness || 0), 0) / reviews.length).toFixed(1),
 accuracy: (reviews.reduce((acc, r) => acc + (r.listingAccuracy || 0), 0) / reviews.length).toFixed(1),
 pickupExperience: (reviews.reduce((acc, r) => acc + (r.pickupExperience || 0), 0) / reviews.length).toFixed(1),
 communication: (reviews.reduce((acc, r) => acc + (r.hostCommunication || 0), 0) / reviews.length).toFixed(1),
 location: (reviews.reduce((acc, r) => acc + (r.vehicleLocation || 0), 0) / reviews.length).toFixed(1),
 value: (reviews.reduce((acc, r) => acc + (r.valueForMoney || 0), 0) / reviews.length).toFixed(1),
 };

 const categories = [
 { label: 'Vehicle Cleanliness', icon: Sparkles, value: categoryAverages.cleanliness },
 { label: 'Listing Accuracy', icon: CheckCircle2, value: categoryAverages.accuracy },
 { label: 'Pickup Experience', icon: Key, value: categoryAverages.pickupExperience },
 { label: 'Host Communication', icon: MessageSquare, value: categoryAverages.communication },
 { label: 'Vehicle Location', icon: MapPin, value: categoryAverages.location },
 { label: 'Value for Money', icon: Tag, value: categoryAverages.value },
 ];

 return (
 <div className="space-y-12" id="reviews-section">
 <div className="flex items-center gap-4">
 <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Review</h2>
 <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
 <Star size={18} className="text-amber-400 fill-amber-400" />
 <span className="text-lg font-black text-foreground">{averageRating}</span>
 <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">. {reviews.length} reviews</span>
 </div>
 </div>

 {/* Category Breakdown - Airbnb Style */}
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-8 border-y border-border/50">
 {categories.map((cat, i) => (
 <div key={i} className="flex flex-col items-center gap-3 px-4 border-r border-border/50 last:border-0">
 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{cat.label}</span>
 <div className="flex items-baseline gap-1">
 <span className="text-lg font-black text-foreground">{cat.value}</span>
 </div>
 <cat.icon size={20} className="text-foreground/80" />
 </div>
 ))}
 </div>

 <div className="bg-card border border-border dark:border-white/20 rounded-app p-8 space-y-8 ">
 {/* Latest Review Preview */}
 <div className="space-y-6">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-full overflow-hidden bg-muted border border-border shrink-0">
 {latestReview.user?.image ? (
 <img src={latestReview.user.image} className="w-full h-full object-cover" alt="User" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-primary font-black uppercase tracking-widest">
 {latestReview.user?.firstName?.charAt(0) || "U"}
 </div>
 )}
 </div>
 <div>
 <h4 className="text-sm font-black text-foreground tracking-tight uppercase">
 {latestReview.user?.displayName || `${latestReview.user?.firstName || 'User'} ${latestReview.user?.lastName || ''}`}
 </h4>
 <div className="flex items-center gap-2 mt-1">
 <Clock size={12} className="text-muted-foreground" />
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
 {formatDate(latestReview.createdAt)}
 </span>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex items-center gap-1">
 {[...Array(5)].map((_, i) => (
 <Star
 key={i}
 size={14}
 className={i < latestReview.rating ? "text-amber-400 fill-amber-400" : "text-muted/30"}
 />
 ))}
 </div>
 <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">
 "{latestReview.comment}"
 </p>
 </div>
 </div>

 <Button
 onClick={() => setShowAllReviews(true)}
 variant="outline"
 className="h-12 px-8 rounded-app font-black uppercase text-[11px] tracking-widest gap-3 border-2 hover:bg-muted/50 transition-all"
 >
 View Other Reviews
 </Button>
 </div>

 {/* All Reviews Modal */}
 <Modal 
 isOpen={showAllReviews} 
 onClose={() => setShowAllReviews(false)} 
 title={`All Reviews (${reviews.length})`}
 >
 <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
 {reviews.map((review) => (
 <div key={review._id} className="space-y-4 pb-8 border-b border-border last:border-0 last:pb-0">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
 {review.user?.image ? (
 <img src={review.user.image} className="w-full h-full object-cover" alt="User" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-primary font-black uppercase tracking-widest text-xs">
 {review.user?.firstName?.charAt(0) || "U"}
 </div>
 )}
 </div>
 <div>
 <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">
 {review.user?.displayName || `${review.user?.firstName || 'User'} ${review.user?.lastName || ''}`}
 </h4>
 <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 {formatModalDate(review.createdAt)}
 </span>
 </div>
 </div>
 <div className="flex items-center gap-1">
 {[...Array(5)].map((_, i) => (
 <Star
 key={i}
 size={12}
 className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted/30"}
 />
 ))}
 </div>
 <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">
 "{review.comment}"
 </p>
 </div>
 ))}
 </div>
 </Modal>
 </div>
 );
};
