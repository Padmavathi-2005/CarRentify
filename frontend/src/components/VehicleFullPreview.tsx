"use client";

import React, { useState, useEffect } from "react";
import { 
 Heart, 
 MapPin, 
 Star, 
 Fuel, 
 Gauge, 
 User as UserIcon, 
 Briefcase, 
 CheckCircle2, 
 Clock, 
 MessageSquare, 
 Zap,
 Settings,
 Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthContext";
import { API_BASE_URL, getImageUrl, PLACEHOLDER_IMAGE } from "@/config/api";
import { PremiumRangePicker, PremiumTimeRangePicker } from "@/components/CustomDateTimePicker";
import { motion } from "framer-motion";
import { useLocale } from "@/components/LocaleContext";

interface VehicleFullPreviewProps {
 carId: string;
 isModal?: boolean;
}

export default function VehicleFullPreview({ carId, isModal = false }: VehicleFullPreviewProps) {
 const { user } = useAuth();
 const { formatPrice } = useLocale();
 const [car, setCar] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [activeImg, setActiveImg] = useState(0);
 
 const [reviews, setReviews] = useState<any[]>([]);
 const [rating, setRating] = useState(5);
 const [comment, setComment] = useState("");
 const [submitting, setSubmitting] = useState(false);
 const [fetchError, setFetchError] = useState(false);
 const [allAmenities, setAllAmenities] = useState<string[]>([]);

 const [startDate, setStartDate] = useState("");
 const [endDate, setEndDate] = useState("");
 const [pickupTime, setPickupTime] = useState("");
 const [returnTime, setReturnTime] = useState("");
 const [bookedSlots, setBookedSlots] = useState<any[]>([]);

 useEffect(() => {
 const fetchCar = async () => {
 try {
 setFetchError(false);
 const res = await fetch(`${API_BASE_URL}/cars/${carId}`);
 if (res.ok) {
 const data = await res.json();
 setCar(data);
 } else {
 setFetchError(true);
 }
 } catch (err) {
 console.error("Car fetch error:", err);
 setFetchError(true);
 } finally {
 setLoading(false);
 }
 };

 if (carId) {
 setLoading(true);
 fetchCar();
 fetch(`${API_BASE_URL}/reviews/car/${carId}`)
 .then(res => res.json())
 .then(data => { if (Array.isArray(data)) setReviews(data); })
 .catch(err => console.error("Review fetch error:", err));

 fetch(`${API_BASE_URL}/amenities`)
 .then(res => res.json())
 .then(data => { if (Array.isArray(data)) setAllAmenities(data.map((a: any) => a.name)); })
 .catch(err => console.error("Amenities fetch error:", err));

 fetch(`${API_BASE_URL}/bookings/availability/${carId}?t=${Date.now()}`)
 .then(res => res.json())
 .then(data => {
 if (Array.isArray(data)) {
 setBookedSlots(data);
 // Simple default slot logic
 const now = new Date();
 setStartDate(now.toISOString().split('T')[0]);
 setPickupTime("10:00");
 const end = new Date();
 end.setDate(end.getDate() + 1);
 setEndDate(end.toISOString().split('T')[0]);
 setReturnTime("10:00");
 }
 })
 .catch(err => console.error("Availability fetch error:", err));
 }
 }, [carId]);

 const getApplicableDayRate = (fullDays: number) => {
 const tiers = Array.isArray((car as any)?.priceTiers) ? (car as any).priceTiers : [];
 const normalized = tiers
 .map((t: any) => ({ days: Number(t.days), pricePerDay: Number(t.pricePerDay) }))
 .filter((t: any) => Number.isFinite(t.days) && Number.isFinite(t.pricePerDay) && t.days >= 1)
 .sort((a: any, b: any) => a.days - b.days);

 if (normalized.length > 0 && fullDays >= 1) {
 const applicable = normalized.filter((t: any) => t.days <= fullDays);
 const chosen = (applicable.length ? applicable[applicable.length - 1] : normalized.find((t: any) => t.days === 1)) || normalized[0];
 return { rate: chosen.pricePerDay, tierDays: chosen.days };
 }

 if (fullDays >= 5 && Number((car as any)?.pricePerFiveDays || 0) > 0) return { rate: Number((car as any).pricePerFiveDays), tierDays: 5 };
 if (fullDays >= 2 && Number((car as any)?.pricePerTwoDays || 0) > 0) return { rate: Number((car as any).pricePerTwoDays), tierDays: 2 };
 return { rate: Number((car as any)?.pricePerDay || 0), tierDays: 1 };
 };

 const calculateTotal = () => {
 if (!startDate || !endDate || !pickupTime || !returnTime || !car) return 0;
 const start = new Date(`${startDate}T${pickupTime}`);
 const end = new Date(`${endDate}T${returnTime}`);
 const diffMs = end.getTime() - start.getTime();
 if (diffMs <= 0) return 0;
 const totalHours = diffMs / (1000 * 60 * 60);
 const baseDayRate = Number(car.pricePerDay || 0);
 const pricePerHour = Number(car.pricePerHour || (baseDayRate / 24) || 0);

 if (totalHours >= 24) {
 const fullDays = Math.floor(totalHours / 24);
 const remainingHours = totalHours % 24;
 const dayRate = getApplicableDayRate(fullDays).rate;
 return (fullDays * dayRate) + (remainingHours * pricePerHour);
 } else {
 return totalHours * pricePerHour;
 }
 };

 const getPricingDetails = () => {
 if (!startDate || !endDate || !pickupTime || !returnTime || !car) return null;
 const start = new Date(`${startDate}T${pickupTime}`);
 const end = new Date(`${endDate}T${returnTime}`);
 const diffMs = end.getTime() - start.getTime();
 if (diffMs <= 0) return null;

 const totalHours = diffMs / (1000 * 60 * 60);
 const baseDayRate = Number(car.pricePerDay || 0);
 const pricePerHour = Number(car.pricePerHour || (baseDayRate / 24) || 0);
 if (!isFinite(totalHours) || totalHours <= 0) return null;
 if (!isFinite(pricePerHour) || pricePerHour <= 0) return null;

 const pureHourlyTotal = totalHours * pricePerHour;
 const hybridTotal = calculateTotal();
 const savings = Math.max(0, pureHourlyTotal - hybridTotal);
 const fullDays = totalHours >= 24 ? Math.floor(totalHours / 24) : 0;
 const appliedTier = fullDays >= 1 ? getApplicableDayRate(fullDays) : null;

 return {
 totalHours,
 pricePerDay: appliedTier?.rate ?? baseDayRate,
 appliedTierDays: appliedTier?.tierDays ?? null,
 pricePerHour,
 pureHourlyTotal,
 hybridTotal,
 savings,
 totalDays: fullDays,
 };
 };

 if (loading) return (
 <div className="flex flex-col items-center justify-center p-24 space-y-4">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Configuring Asset Preview...</p>
 </div>
 );

 if (fetchError || !car) return (
 <div className="p-24 text-center">
 <h2 className="text-xl font-black text-slate-800 mb-2">Asset Sync Failed</h2>
 <p className="text-sm font-medium text-slate-400">Unable to retrieve vehicle configuration from the grid.</p>
 </div>
 );

 return (
 <div className={`w-full bg-[#FBFCFE] ${isModal ? '' : 'min-h-screen'}`}>
 <div className="max-w-7xl mx-auto px-6 py-10">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 {/* Left Column: Pricing & Availability */}
 <div className="lg:col-span-4 order-2 lg:order-1 space-y-6">
 <div className="bg-white p-10 rounded-app border border-slate-100 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
 
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Rental Structure</p>
 <div className="space-y-1 relative z-10 mb-8">
 <h2 className="text-4xl font-black text-slate-900">{formatPrice(car.pricePerDay, car.currency)} <span className="text-sm font-bold text-slate-400 uppercase">/ Day</span></h2>
 <p className="text-xs font-bold text-primary italic">or {formatPrice(car.pricePerHour || (car.pricePerDay/24), car.currency)} / Hour</p>
 </div>

 <div className="space-y-6 relative z-10 pt-6 border-t border-slate-50">
 <PremiumRangePicker 
 startDate={startDate} 
 endDate={endDate} 
 onRangeChange={(s, e) => { setStartDate(s); setEndDate(e); }} 
 bookedSlots={bookedSlots}
 />
 <PremiumTimeRangePicker 
 startTime={pickupTime} 
 endTime={returnTime} 
 onRangeTimeChange={(s, e) => { setPickupTime(s); setReturnTime(e); }} 
 startDate={startDate}
 endDate={endDate}
 bookedSlots={bookedSlots}
 />

 <div className="pt-4">
 <div className="flex justify-between items-center px-6 py-6 bg-primary/5 rounded-app border border-primary/10">
 <span className="text-[10px] font-black text-primary uppercase tracking-widest">Projected Total</span>
 <span className="text-2xl font-black text-primary">
 {formatPrice(calculateTotal(), car.currency)}
 </span>
 </div>
 </div>

 {(() => {
 const d = getPricingDetails();
 if (!d) return null;
 return (
 <div className="px-6 py-5 bg-slate-50 rounded-app border border-slate-100 space-y-3">
 <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
 <span>Temporal Registry</span>
 <span>{d.totalDays} {d.totalDays === 1 ? 'Day' : 'Days'}</span>
 </div>
 <div className="space-y-2">
 <div className="flex justify-between items-center text-[11px] font-black text-slate-700">
 <span>Day rate{d.appliedTierDays ? ` (tier ${d.appliedTierDays}+ days)` : ""}</span>
 <span>{formatPrice(d.pricePerDay, car.currency)}/day</span>
 </div>
 </div>
 {d.savings > 0 && (
 <div className="flex items-center justify-between pt-2 border-t border-slate-100">
 <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Dynamic Savings</span>
 <span className="text-[11px] font-black text-emerald-700">-{formatPrice(d.savings, car.currency)}</span>
 </div>
 )}
 </div>
 );
 })()}

 <Button className="w-full h-16 bg-primary hover:bg-primary-hover text-white rounded-app font-black text-xs uppercase tracking-widest transition-all scale-100 hover:scale-[1.02]">
 {car.bookingType === 'Instant' ? 'Instant Booking' : 'Request Booking'}
 </Button>
 </div>
 </div>

 {/* Location Micro-widget */}
 <div className="bg-white p-8 rounded-app border border-slate-100 space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-app bg-slate-50 flex items-center justify-center text-primary border border-slate-100">
 <MapPin size={20} />
 </div>
 <div>
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Location</p>
 <p className="text-[10px] font-bold text-slate-600 line-clamp-1">{car.location?.address || "City Hub Arrival"}</p>
 </div>
 </div>
 </div>
 </div>

 {/* Right Column: Gallery & Details */}
 <div className="lg:col-span-8 order-1 lg:order-2 space-y-8">
 {/* Visual Suite */}
 <div className="space-y-4">
 <div className="aspect-[16/9] rounded-app overflow-hidden bg-white border border-slate-100 relative group">
  <img 
  src={car.images?.[activeImg] ? getImageUrl(car.images[activeImg]) : PLACEHOLDER_IMAGE} 
  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
  onError={(e) => {
    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
  }}
  />
 <div className="absolute top-8 left-8 flex gap-3">
 <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-app border border-white/20">
 <span className="text-[10px] font-black text-primary uppercase tracking-widest">High Definition</span>
 </div>
 </div>
 </div>
 
 <div className="grid grid-cols-4 gap-4">
 {car.images?.map((img: string, idx: number) => (
 <button 
 key={idx} 
 onClick={() => setActiveImg(idx)}
 className={`aspect-[4/3] rounded-app overflow-hidden border-2 transition-all ${activeImg === idx ? 'border-primary scale-[0.98]' : 'border-transparent opacity-60 hover:opacity-100'}`}
 >
  <img 
    src={getImageUrl(img)} 
    className="w-full h-full object-cover" 
    onError={(e) => {
      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
    }}
  />
 </button>
 ))}
 </div>
 </div>

 {/* Technical specs grid */}
 <div className="bg-white p-10 rounded-app border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8">
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-primary mb-1">
 <Fuel size={16} />
 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fuel</span>
 </div>
 <p className="text-xs font-black text-slate-800 uppercase">{typeof car.fuelType === 'object' ? String(car.fuelType?.name || "Premium") : String(car.fuelType || "V8 Engine")}</p>
 </div>
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-primary mb-1">
 <Settings size={16} />
 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Drivetrain</span>
 </div>
 <p className="text-xs font-black text-slate-800 uppercase">{typeof car.transmission === 'object' ? String(car.transmission?.name || "Auto") : String(car.transmission || "Automatic")}</p>
 </div>
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-primary mb-1">
 <UserIcon size={16} />
 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capacity</span>
 </div>
 <p className="text-xs font-black text-slate-800 uppercase">{car.seats || 5} Seats</p>
 </div>
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-primary mb-1">
 <Gauge size={16} />
 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Year</span>
 </div>
 <p className="text-xs font-black text-slate-800 uppercase">{car.year || 2024}</p>
 </div>
 </div>

 {/* Technical Specifications */}
 <div className="bg-white p-10 rounded-app border border-slate-100 space-y-8">
 <div className="flex items-center gap-3">
 <div className="w-1.5 h-6 bg-primary rounded-full" />
 <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Technical Specifications</h2>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-12">
 <div className="space-y-1">
 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Odometer</p>
 <p className="text-xs font-black text-slate-800">{car.mileage?.toLocaleString() || "0"} <span className="text-[10px] text-slate-400">Miles</span></p>
 </div>
 <div className="space-y-1">
 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Horsepower</p>
 <p className="text-xs font-black text-slate-800">{car.horsepower || "350"} HP</p>
 </div>
 <div className="space-y-1">
 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">VIN Number</p>
 <p className="text-xs font-black text-slate-800 tracking-wider uppercase">{car.vin || "NOT_DECLARED"}</p>
 </div>
 </div>
 </div>

 {/* Narrative */}
 <div className="bg-white p-10 rounded-app border border-slate-100 space-y-6">
 <div className="flex items-center gap-3">
 <div className="w-1.5 h-6 bg-primary rounded-full" />
 <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Asset Narrative</h2>
 </div>
 <p className="text-sm font-medium text-slate-500 leading-relaxed">
 {String(car.description || car.content || "No narrative details provided for this vehicle.")}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
