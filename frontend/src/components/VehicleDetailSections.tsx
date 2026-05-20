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
    : "5.0";

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-foreground tracking-tight uppercase">About the Host</h2>
      <div className="bg-card border border-border dark:border-white/10 rounded-app p-8 flex flex-col md:flex-row gap-8 items-start ">
        <div className="flex flex-col items-center text-center gap-4 min-w-[140px]">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border dark:border-white/10 flex items-center justify-center bg-muted/30">
            {vendorImage ? (
              <img
                src={vendorImage}
                className="w-full h-full object-cover"
                alt={vendorName}
              />
            ) : (
              <span className="text-2xl font-bold text-primary uppercase tracking-widest">
                {vendorName.charAt(0)}
              </span>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground tracking-tight leading-none">{vendorName}</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Certified Host</p>
            <div className="pt-2">
              <Link href={`/profile/${vendor?.slug || vendor?._id || vendor}`}>
                <Button variant="ghost" className="h-8 px-4 text-[9px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white border border-primary/10 rounded-app transition-all">
                  View Host Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full grid grid-cols-2 gap-6 pt-2">
          <div className="space-y-1">
            <span className="text-2xl font-bold text-foreground">Verified</span>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Identity Status</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold text-foreground">
                {avgRating}
              </span>
              <Star size={16} className="text-amber-400 fill-amber-400" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Host Rating</p>
          </div>
          <div className="col-span-2 pt-4 border-t border-border/50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Professional Host since {joinYear}
            </p>
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
              <span className="text-sm font-bold">Pickup available after: <span className="font-bold">{formatTimeDisplay(car?.pickupTime) || '09:00 AM'}</span></span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <Clock size={16} className="text-primary" />
              <span className="text-sm font-bold">Return by: <span className="font-bold">{formatTimeDisplay(car?.returnTime) || '08:00 PM'}</span></span>
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
