"use client";

import React from "react";
import { Zap, ShieldCheck, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumRangePicker, PremiumTimeRangePicker, PremiumLocationPicker, formatTimeDisplay, formatDateDisplay } from "@/components/CustomDateTimePicker";
import { useSettings } from "../ThemeProvider";

export const BookingWidget = ({
 car,
 startDate,
 endDate,
 setStartDate,
 setEndDate,
 pickupTime,
 setPickupTime,
 returnTime,
 setReturnTime,
 pickupLocation,
 setPickupLocation,
 returnLocation,
 setReturnLocation,
 locationOptions,
 bookedSlots,
 formatPrice,
 calculateTotal,
 getPricingDetails,
 handleBooking,
 submitting,
 bookingError,
 isAdmin,
 t
}: any) => {
 const { settings } = useSettings();
 const d = getPricingDetails();
 const total = calculateTotal();

 return (
 <div className="lg:col-span-4 lg:order-3 order-2 space-y-6 lg:sticky lg:top-24">
 <div className="bg-card border border-border dark:border-white/20 rounded-app p-6 space-y-6 relative overflow-hidden group/card">
 {/* Header: Price, Rating, Reviews */}
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div className="flex items-baseline gap-1">
 <span className="text-2xl font-black text-primary tracking-tighter">{formatPrice(d?.pricePerDay || car.pricePerDay || 0)}</span>
 <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">/ day</span>
 </div>
 <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest">
 <Star size={14} className="fill-amber-400 text-amber-400" />
 <span className="text-foreground">{car.rating || '0.0'}</span>
 <span className="text-muted-foreground/30 mx-0.5">.</span>
 <button className="text-muted-foreground hover:text-primary underline transition-colors">
 {car.reviewCount || 0} reviews
 </button>
 </div>
 </div>

 {/* The Grid: Dates & Times */}
 <div className="border border-border dark:border-white/20 rounded-xl overflow-hidden divide-y divide-border">
 {/* Dates Row */}
 <PremiumRangePicker
 startDate={startDate}
 endDate={endDate}
 onRangeChange={(s: string, e: string) => { setStartDate(s); setEndDate(e); }}
 bookedSlots={bookedSlots}
 position="side"
 sideDirection="left"
 align="left"
 sideGap={220}
 sideOffsetTop="-80px"
 customWidth={620}
 minDays={car.minBookingDays || 1}
 trigger={(onClick: () => void) => (
 <div className="grid grid-cols-2 divide-x divide-border cursor-pointer group/dates" onClick={onClick}>
 <div className="p-4 space-y-1 hover:bg-muted/30 transition-colors">
 <span className="text-[9px] font-black uppercase tracking-widest text-foreground block">From Date</span>
 <span className="text-[11px] font-bold text-muted-foreground block truncate">
 {startDate ? formatDateDisplay(startDate, settings.defaultDateFormat) : 'DD/MM/YYYY'}
 </span>
 </div>
 <div className="p-4 space-y-1 hover:bg-muted/30 transition-colors">
 <span className="text-[9px] font-black uppercase tracking-widest text-foreground block">To Date</span>
 <span className="text-[11px] font-bold text-muted-foreground block truncate">
 {endDate ? formatDateDisplay(endDate, settings.defaultDateFormat) : 'DD/MM/YYYY'}
 </span>
 </div>
 </div>
 )}
 />

 {/* Times Row */}
 <PremiumTimeRangePicker
 startTime={pickupTime}
 endTime={returnTime}
 onRangeTimeChange={(s: string, e: string) => { setPickupTime(s); setReturnTime(e); }}
 position="side"
 sideDirection="left"
 align="left"
 sideGap={30}
 sideOffsetTop="-80px"
 trigger={(onClick: (f: 'start' | 'end') => void) => (
 <div className="grid grid-cols-2 divide-x divide-border">
 <div className="p-4 space-y-1 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onClick('start')}>
 <span className="text-[9px] font-black uppercase tracking-widest text-foreground block">Pickup Time</span>
 <span className="text-[11px] font-bold text-muted-foreground block">
 {formatTimeDisplay(pickupTime) || '00:00'}
 </span>
 </div>
 <div className="p-4 space-y-1 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onClick('end')}>
 <span className="text-[9px] font-black uppercase tracking-widest text-foreground block">Return Time</span>
 <span className="text-[11px] font-bold text-muted-foreground block">
 {formatTimeDisplay(returnTime) || '00:00'}
 </span>
 </div>
 </div>
 )}
 />
 </div>

 {/* Location Section */}
 <div className="border border-border dark:border-white/20 rounded-xl overflow-hidden">
 <PremiumLocationPicker
 value={pickupLocation}
 onChange={setPickupLocation}
 locations={locationOptions.map((o: any) => o.name)}
 label="Location"
 position="bottom"
 align="left"
 trigger={(onClick: () => void) => (
 <div className="p-4 space-y-1 hover:bg-muted/30 transition-colors cursor-pointer" onClick={onClick}>
 <span className="text-[9px] font-black uppercase tracking-widest text-foreground block">Location</span>
 <span className="text-[11px] font-bold text-muted-foreground block truncate">
 {pickupLocation?.name || pickupLocation || 'Select Pickup Location'}
 </span>
 </div>
 )}
 />
 </div>

 {/* Total Calculation */}
 {startDate && endDate ? (
 <>
 <div className="pt-4 border-t border-border space-y-3">
 <div className="flex justify-between items-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
 <span>{formatPrice(d?.pricePerDay || car.pricePerDay || 0)} x {Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))} days</span>
 <span>{formatPrice(total)}</span>
 </div>
 <div className="flex justify-between items-center pt-2 border-t border-border">
 <span className="text-xs font-black uppercase tracking-widest">Total</span>
 <span className="text-xl font-black text-primary tracking-tighter">{formatPrice(total)}</span>
 </div>
 </div>
 {car.minBookingDays > 1 && (
 <div className="text-[10px] font-bold text-amber-600 text-center uppercase tracking-tight py-3 px-4 bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-center justify-center gap-2">
 <Info size={14} className="shrink-0" />
 Note: This host requires a minimum of {car.minBookingDays} days for this trip
 </div>
 )}
 </>
 ) : (
 <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center pt-4 opacity-40">
 Select dates to calculate total
 </div>
 )}

 {bookingError && (
 <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-[10px] font-black text-destructive uppercase tracking-widest text-center flex items-center justify-center gap-2">
 <Info size={14} /> {bookingError}
 </div>
 )}

 <Button
 disabled={submitting || isAdmin}
 onClick={handleBooking}
 className="w-full h-14 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] bg-primary hover:bg-secondary hover:text-white transition-all duration-300 border-none"
 >
 {submitting ? 'Processing...' : (car.bookingType === 'Instant' ? 'Instant Booking' : 'Request Booking')}
 </Button>

 </div>
 </div>
 );
};
