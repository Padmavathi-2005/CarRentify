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
 displayName?: string;
 firstName?: string;
 lastName?: string;
 image?: string;
 name?: string;
 profileImage?: string;
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

const ReviewCard = ({ review, isLatest = false }: { review: Review, isLatest?: boolean }) => {
  const { settings } = useSettings();

  const formatDate = (dateStr: string) => {
    return formatDateDisplay(dateStr, settings.defaultDateFormat);
  };
  
  return (
    <div 
      className={`transition-all duration-300 ${isLatest ? 'bg-card border border-border dark:border-white/20 rounded-app p-6 md:p-8' : 'pb-8 border-b border-border/50 last:border-0 last:pb-0'}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile, Rating, Comment */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`rounded-full overflow-hidden bg-muted border border-border shrink-0 ${isLatest ? 'w-12 h-12' : 'w-10 h-10'}`}>
                {(review.user?.image || review.user?.profileImage) ? (
                  <img src={review.user.image || review.user.profileImage} className="w-full h-full object-cover" alt="User" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-black uppercase tracking-widest text-xs">
                    {review.user?.firstName?.charAt(0) || review.user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div>
                <h4 className={`${isLatest ? 'text-sm' : 'text-xs'} font-black text-foreground tracking-tight uppercase`}>
                  {review.user?.displayName || review.user?.name || `${review.user?.firstName || 'User'} ${review.user?.lastName || ''}`}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock size={10} className="text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted/30"} />
              ))}
            </div>
            <p className="text-sm font-bold text-foreground leading-relaxed">
              "{review.comment || 'No comment provided.'}"
            </p>
          </div>
        </div>

        {/* Right Column: Detailed Ratings */}
        <div className="lg:col-span-5 bg-muted/20 p-5 rounded-xl border border-border/50">
          <h5 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4">Detailed Ratings</h5>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <div className="flex justify-between items-center pr-2 border-r border-border/50">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Sparkles size={10}/> Clean</span>
              <div className="flex items-center gap-1 mr-2">
                <span className="text-xs font-black text-foreground">{review.vehicleCleanliness || 5}</span><Star size={10} className="text-amber-400 fill-amber-400" /> 
              </div>
            </div>
            <div className="flex justify-between items-center pl-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 size={10}/> Accur</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-foreground">{review.listingAccuracy || 5}</span><Star size={10} className="text-amber-400 fill-amber-400" /> 
              </div>
            </div>
            <div className="flex justify-between items-center pr-2 border-r border-border/50">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Key size={10}/> Pick</span>
              <div className="flex items-center gap-1 mr-2">
                <span className="text-xs font-black text-foreground">{review.pickupExperience || 5}</span><Star size={10} className="text-amber-400 fill-amber-400" /> 
              </div>
            </div>
            <div className="flex justify-between items-center pl-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Tag size={10}/> Val</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-foreground">{review.valueForMoney || 5}</span><Star size={10} className="text-amber-400 fill-amber-400" /> 
              </div>
            </div>
            <div className="flex justify-between items-center pr-2 border-r border-border/50">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><MessageSquare size={10}/> Host</span>
              <div className="flex items-center gap-1 mr-2">
                <span className="text-xs font-black text-foreground">{review.hostCommunication || 5}</span><Star size={10} className="text-amber-400 fill-amber-400" /> 
              </div>
            </div>
            <div className="flex justify-between items-center pl-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><MapPin size={10}/> Loc</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-foreground">{review.vehicleLocation || 5}</span><Star size={10} className="text-amber-400 fill-amber-400" /> 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReviewSection = ({ reviews }: { reviews: Review[] }) => {
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

 <ReviewCard review={latestReview} isLatest={true} />

 {reviews.length > 1 && !showAllReviews && (
 <Button
 onClick={() => setShowAllReviews(true)}
 variant="outline"
 className="h-12 px-8 rounded-app font-black uppercase text-[11px] tracking-widest gap-3 border-2 hover:bg-muted/50 transition-all w-full md:w-auto mt-6"
 >
 View All {reviews.length} Reviews
 </Button>
 )}
 
 {showAllReviews && (
 <div className="space-y-2 pt-8 border-t border-border/50 mt-6">
 {reviews.slice(1).map((review) => (
   <ReviewCard key={review._id} review={review} />
 ))}
 </div>
 )}
 </div>
 );
};
