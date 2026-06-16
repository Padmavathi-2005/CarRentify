"use client";

import React from "react";
import { Star, Clock } from "lucide-react";
import { formatTimeDisplay } from "./CustomDateTimePicker";
import Link from "next/link";
import { Button } from "./ui/button";

export const HostSection = ({ car, reviews }: { car: any, reviews: any[] }) => {
  const vendor = car?.vendor;
  const vendorName = vendor?.displayName || vendor?.name || vendor?.firstName || 'Host';
  const vendorImage = vendor?.profileImage || vendor?.image;
  const joinYear = vendor?.createdAt ? new Date(vendor.createdAt).getFullYear() : new Date().getFullYear();
  
  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : "New";

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-foreground tracking-tight uppercase">About the Host</h2>
      <div className="bg-muted/10 border border-border/50 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-border/50 bg-background flex shrink-0 items-center justify-center shadow-sm">
            {vendorImage ? (
              <img
                src={vendorImage}
                className="w-full h-full object-cover"
                alt={vendorName}
              />
            ) : (
              <span className="text-2xl font-black text-primary uppercase tracking-widest">
                {vendorName.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex flex-col flex-1 gap-2 items-center sm:items-start justify-center pt-1">
            <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
              <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">{vendorName}</h3>
              {vendor?.isVerified ? (
                <span className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">Verified Identity</span>
              ) : (
                <span className="bg-muted text-muted-foreground text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">Unverified</span>
              )}
            </div>
            
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 text-center sm:text-left">
              Professional Host since {joinYear}
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start mb-2">
              <div className="flex items-center gap-2 bg-background border border-border/40 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rating</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black text-foreground">{avgRating}</span>
                  {reviews.length > 0 && <Star size={12} className="text-amber-400 fill-amber-400" />}
                </div>
              </div>
            </div>
            
            <div className="mt-2 shrink-0">
              <Link href={`/profile/${vendor?.slug || vendor?._id || vendor}`}>
                <Button variant="outline" className="h-10 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white border-border/50 rounded-xl transition-all shadow-sm bg-background w-full sm:w-auto">
                  View Host Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ThingsToKnow = ({ car, t }: { car: any, t: any }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-foreground tracking-tight uppercase">Things to know</h2>
      <div className="space-y-8">
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em]">Rental Rules</h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 text-foreground/80">
              <Clock size={16} className="text-primary" />
              <span className="text-sm font-bold">Pickup available after: <span className="font-bold">{(!car?.pickupTime || formatTimeDisplay(car?.pickupTime) === '--:--') ? '09:00 AM' : formatTimeDisplay(car?.pickupTime)}</span></span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <Clock size={16} className="text-primary" />
              <span className="text-sm font-bold">Return by: <span className="font-bold">{(!car?.returnTime || formatTimeDisplay(car?.returnTime) === '--:--') ? '08:00 PM' : formatTimeDisplay(car?.returnTime)}</span></span>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-border/50">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Cancellation Policy</p>
          <p className="text-sm font-bold text-rose-600 uppercase tracking-tighter">Flexible: Full refund up to 24h before trip</p>
        </div>
      </div>
    </div>
  );
};
