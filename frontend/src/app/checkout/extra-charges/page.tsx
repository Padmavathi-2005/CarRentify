"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
 ChevronLeft, 
 CreditCard, 
 ShieldCheck, 
 Calendar, 
 Clock, 
 MapPin, 
 AlertCircle,
 CheckCircle2, 
 Info,
 Lock,
 ArrowRight,
 Wallet,
 Gauge
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthContext";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import { authService } from "@/services/authService";

function ExtraChargesContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const { user } = useAuth();
 
 const bookingId = searchParams.get("id");
 const [booking, setBooking] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [paymentMethod, setPaymentMethod] = useState("stripe");
 const [isProcessing, setIsProcessing] = useState(false);
 const [gateways, setGateways] = useState<any[]>([]);

 useEffect(() => {
 async function fetchBookingDetails() {
 if (!bookingId) {
 setError("No booking identifier provided.");
 setLoading(false);
 return;
 }

 const token = authService.getToken();
 if (!token) {
 router.push(`/login?redirect=/checkout/extra-charges?id=${bookingId}`);
 return;
 }

 try {
 const [bookingRes, paymentRes] = await Promise.all([
 fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
 headers: { Authorization: `Bearer ${token}` }
 }),
 fetch(`${API_BASE_URL}/settings/payments`)
 ]);

 if (!bookingRes.ok) {
 const errData = await bookingRes.json().catch(() => ({}));
 throw new Error(errData.message || "Could not retrieve booking details.");
 }
 
 const bookingData = await bookingRes.json();
 const paymentData = await paymentRes.json();

 setBooking(bookingData);
 
 const activeGateways = (Array.isArray(paymentData) ? paymentData : []).filter(g => g.isEnabled);
 setGateways(activeGateways);
 if (activeGateways.length > 0) {
 setPaymentMethod(activeGateways[0].slug);
 }
 } catch (err) {
 console.error("Fetch error:", err);
 setError("Failed to connect to secure servers.");
 } finally {
 setLoading(false);
 }
 }

 fetchBookingDetails();
 }, [bookingId]);

 const handlePaySettlement = async () => {
 if (!booking) return;
 setIsProcessing(true);

 try {
 const res = await fetch(`${API_BASE_URL}/payments/create-session/${booking._id}`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "Authorization": `Bearer ${authService.getToken()}`
 },
 body: JSON.stringify({ type: "settlement", paymentMethod })
 });

 const data = await res.json();
 if (res.ok && data.url) {
 window.location.href = data.url;
 } else {
 alert(data.message || "Failed to initialize payment gateway.");
 setIsProcessing(false);
 }
 } catch (err) {
 console.error("Payment error:", err);
 alert("Something went wrong. Please try again.");
 setIsProcessing(false);
 }
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-4" />
 <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Verifying Settlement Protocol...</p>
 </div>
 );
 }

 if (error || !booking || booking.settlementAmount <= 0) {
 return (
 <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
 <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-8">
 <AlertCircle className="text-rose-500" size={32} />
 </div>
 <h2 className="text-2xl font-black text-slate-900 mb-4">{error || "No Settlement Found"}</h2>
 <p className="text-slate-500 mb-8 max-w-md uppercase text-[10px] font-bold tracking-widest leading-relaxed">
 The booking identifier provided does not have any pending extra charges or you may not have permission to view it.
 </p>
 <Link href="/dashboard/bookings">
 <Button className="h-12 px-10 rounded-app bg-primary text-white font-black uppercase tracking-widest text-xs border-none">
 Back to Bookings
 </Button>
 </Link>
 </div>
 );
 }

  const car = booking.carId;
  const travelled = (booking.checkOutMileage || booking.returnMileage || 0) - (booking.checkInMileage || booking.hostMileage || 0);
  const paidDays = Math.max(1, Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 3600 * 24)));
  const dailyLimit = car.distanceIncluded || car.mileageAllowance || 200;
  const totalAllowed = dailyLimit * paidDays;
  const extraMiles = Math.max(0, travelled - totalAllowed);
  const extraMilesCharge = extraMiles * (car.extraDistanceFee || car.extraMileageCharge || 0.5);
  
  // Use the backend's official settlement amount
  const liveSettlementAmount = booking.settlementAmount || 0;
  
  // Calculate remaining charges (overdue penalty + extensions)
  const otherCharges = Math.max(0, liveSettlementAmount - extraMilesCharge);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-primary selection:text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="flex items-center gap-6 mb-8">
          <Link href="/dashboard/bookings" className="group flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest hover:text-primary transition-all shrink-0">
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
          </Link>
          <div className="w-px h-6 bg-slate-200" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Extra Usage Settlement</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Settlement Details */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white p-8 rounded-app border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-app bg-primary/10 flex items-center justify-center text-primary">
                  <Gauge size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Settlement Breakdown</h2>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest">Analysis of your trip overages</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {extraMiles > 0 && (
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-app border border-slate-100">
                    <div>
                      <p className="text-sm font-black text-slate-900">Mileage Overage ({extraMiles} KM)</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Allowed: {totalAllowed} KM | Travelled: {travelled} KM</p>
                    </div>
                    <p className="text-lg font-black text-slate-900">${extraMilesCharge.toFixed(2)}</p>
                  </div>
                )}

                {otherCharges > 0 && (
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-app border border-slate-100">
                    <div>
                      <p className="text-sm font-black text-slate-900">Trip Extension & Overdue Penalties</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Extra Days added to booking</p>
                    </div>
                    <p className="text-lg font-black text-slate-900">${otherCharges.toFixed(2)}</p>
                  </div>
                )}
                
                {liveSettlementAmount === 0 && (
                   <div className="p-4 bg-emerald-50 rounded-app border border-emerald-100 text-emerald-700 text-sm font-bold">
                     No extra charges found.
                   </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Info size={12} className="text-primary" />
                  <p className="text-[11px] font-bold text-slate-900">Charge Assessment Policy</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-app border border-slate-100">
                  <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                    "Settlement charges include excess mileage beyond the allowance (${car.extraDistanceFee || car.extraMileageCharge || 0.50} per additional KM), late return penalties (1 extra day per 24hrs overdue), and any unpaid trip extensions."
                  </p>
                </div>
              </div>
            </section>

 <section className="bg-white p-8 rounded-app border border-slate-100 ">
 <div className="flex items-center gap-3 mb-8">
 <div className="w-1.5 h-6 bg-primary rounded-full" />
 <h2 className="text-sm font-black text-slate-900">Select Payment Method</h2>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {gateways.map((g) => (
 <button 
 key={g._id}
 onClick={() => setPaymentMethod(g.slug)}
 className={`flex items-center gap-4 p-5 rounded-app border-2 transition-all group relative ${paymentMethod === g.slug ? 'border-primary bg-primary/5 text-primary ' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
 >
 <div className={`w-12 h-12 rounded-app flex items-center justify-center p-2 transition-all ${paymentMethod === g.slug ? 'bg-white ' : 'bg-slate-100 grayscale opacity-50'}`}>
 <img src={g.logoUrl || 'https://cdn-icons-png.flaticon.com/512/174/174861.png'} className="w-full h-full object-contain" alt={g.name} />
 </div>
 <div className="text-left">
 <span className="text-[11px] font-black tracking-tight block mb-1">{g.name}</span>
 <span className="text-[9px] font-bold text-slate-400">Secure Pipeline</span>
 </div>
 {paymentMethod === g.slug && (
 <div className="absolute top-3 right-3 bg-primary text-white p-0.5 rounded-full "><CheckCircle2 size={12} /></div>
 )}
 </button>
 ))}
 </div>
 </section>
 </div>

 {/* Right Column: Settlement Summary */}
 <div className="lg:col-span-5">
 <div className="lg:sticky lg:top-24 space-y-6">
 <section className="bg-white p-8 rounded-app border border-slate-100 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
 
 <div className="flex items-center justify-between mb-8 relative z-10">
 <h2 className="text-[11px] font-black text-primary tracking-[0.2em]">Settlement Invoice</h2>
 <Link 
 href="/dashboard/bookings"
 className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all "
 title="Cancel & Close"
 >
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
 </Link>
 </div>
 
 <div className="flex items-center gap-6 mb-4 pb-4 border-b border-slate-100 relative z-10">
 <div className="w-20 h-20 rounded-app overflow-hidden bg-slate-50 border border-slate-100 shrink-0 ">
 <img src={getImageUrl(car.image || (car.images && car.images[0]))} alt={car.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=400'; }} />
 </div>
 <div>
 <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{car.name}</h3>
 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest"><MapPin size={10} className="text-primary" /> Booking #{bookingId?.slice(-6).toUpperCase()}</div>
 </div>
 </div>

 <div className="space-y-4 mb-4 relative z-10">
 {extraMiles > 0 && (
   <div className="flex justify-between items-center text-[13px] font-bold text-slate-600 group/row hover:bg-slate-50 p-2 -mx-2 rounded-app transition-all">
     <span>Mileage Overage ({extraMiles} KM)</span>
     <span className="text-slate-900">${extraMilesCharge.toFixed(2)}</span>
   </div>
 )}
 
 {otherCharges > 0 && (
   <div className="flex justify-between items-center text-[13px] font-bold text-slate-600 group/row hover:bg-slate-50 p-2 -mx-2 rounded-app transition-all">
     <span>Overdue & Extensions</span>
     <span className="text-slate-900">${otherCharges.toFixed(2)}</span>
   </div>
 )}
 
 <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
 <div>
 <p className="text-[11px] font-black text-primary tracking-widest mb-1">Total to Pay</p>
 <p className="text-4xl font-black text-slate-900 tracking-tighter">${liveSettlementAmount.toFixed(2)}</p>
 </div>
 <div className="text-right flex flex-col items-end gap-2">
 <div className="flex items-center gap-2 text-[9px] font-black text-primary tracking-widest px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
 <Lock size={10} /> Secure
 </div>
 </div>
 </div>
 </div>

 <Button 
 disabled={isProcessing || gateways.length === 0}
 onClick={handlePaySettlement}
 className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-app text-[13px] font-black tracking-[0.2em] transition-all border-none group relative overflow-hidden"
 >
 <span className="relative z-10 flex items-center justify-center gap-3">
 {isProcessing ? "Processing..." : <><CreditCard size={18} /> Authorize Payment</>}
 </span>
 </Button>

 <p className="mt-4 text-center text-[10px] font-medium text-slate-400 leading-relaxed">
 By authorizing, you agree to settle the outstanding charges. Payment is processed securely via encrypted protocols.
 </p>
 </section>
 </div>
 </div>
 </div>
 </main>

 <Footer />
 </div>
 );
}

export default function ExtraChargesPage() {
 return (
 <Suspense fallback={
 <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-4" />
 <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Secure Portal...</p>
 </div>
 }>
 <ExtraChargesContent />
 </Suspense>
 );
}
