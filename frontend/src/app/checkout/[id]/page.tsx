'use client';

import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Zap,
  Lock,
  Calendar,
  Clock,
  Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { loadStripe } from "@stripe/stripe-js";
import { authService } from "@/services/authService";
import { useLocale } from "@/components/LocaleContext";

export default function CheckoutPage({ params }: { params: any }) {
  const router = useRouter();
  const { t } = useLocale();
  const resolvedParams: any = React.use(params);
  const bookingId = resolvedParams?.id;

  const [booking, setBooking] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let foundBooking = null;
        if (res.ok) {
          const data = await res.json();
          foundBooking = data.find((b: any) => b._id === bookingId);
          if (foundBooking) setBooking(foundBooking);
          else setError(t('checkout.final_valuation.not_found'));
        }
        
        // Fetch User Profile for Age and License verification
        const profile = await authService.getProfile();
        setUser(profile);

        if (foundBooking && (!profile.licenseExpiryDate || new Date(profile.licenseExpiryDate).getTime() < new Date(foundBooking.endDate).getTime())) {
          setError(t('checkout.final_valuation.license_expired') || "Your driver's license is missing or will expire before this trip ends. Please update it in your profile.");
        }
      } catch (err) { setError("Network error synchronizing telemetry."); }
      finally { setLoading(false); }
    };
    if (bookingId) fetchBooking();
  }, [bookingId]);

  const calculateAge = (dob: string) => {
    if (!dob) return "Unknown";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  const handleStripePayment = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/payments/create-session/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || "Failed to initialize payment gateway.");
      }
    } catch (err) {
      setError("Payment bridge connection failed.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
       <div className="w-10 h-10 border-4 border-slate-900/10 border-t-slate-900 rounded-full animate-spin mb-4" />
       <p className="text-slate-400 font-black uppercase tracking-widest text-[8px]">{t('checkout.final_valuation.initializing')}</p>
    </div>
  );

  if (error || !booking) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
       <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6"><Lock size={32} /></div>
       <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">{t('checkout.final_valuation.error')}</h2>
       <p className="text-slate-500 font-bold mb-8 max-w-sm mx-auto">{error || t('checkout.final_valuation.registry_error')}</p>
       <div className="flex gap-4 justify-center">
         <Link href="/dashboard/bookings"><Button className="bg-slate-900 hover:bg-black text-white px-10 h-14 rounded-app font-bold uppercase tracking-widest text-[10px]">{t('checkout.final_valuation.back_dashboard')}</Button></Link>
         {error.includes('license') && (
           <Link href="/dashboard/profile?updateLicense=true"><Button className="bg-primary hover:bg-secondary text-white px-10 h-14 rounded-app font-bold uppercase tracking-widest text-[10px]">Update License</Button></Link>
         )}
       </div>
    </div>
  );

  const car = booking.carId;

  return (
    <div className="bg-white min-h-screen font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
           
           <div className="lg:col-span-7 space-y-12">
              <div className="space-y-4">
                 <Link href="/dashboard/bookings" className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-900 transition-all">
                    <ArrowLeft size={14} /> {t('checkout.final_valuation.back_registry')}
                 </Link>
                 <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2">{t('checkout.final_valuation.title')}</h1>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('checkout.final_valuation.subtitle')}</p>
              </div>

              <div className="bg-slate-50/50 rounded-app p-10 border-2 border-slate-50 space-y-8 shadow-inner">
                 <div className="flex items-start gap-8">
                    <div className="w-32 h-32 rounded-app overflow-hidden border-2 border-white shadow-xl bg-slate-100">
                       <img src={car?.images?.[0] || car?.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                       <span className="bg-slate-900 text-white px-3 py-1 rounded-app text-[8px] font-black uppercase tracking-widest">{t('checkout.final_valuation.selected_asset')}</span>
                       <h2 className="text-3xl font-black text-slate-900 leading-none">{car?.name}</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{car?.brandName} • {car?.model}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                    <div className="space-y-4">
                       <div className="flex items-center gap-4 text-slate-400"><Calendar size={18} /><span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('checkout.final_valuation.temporal_frame')}</span></div>
                       <p className="text-sm font-black text-slate-900">{booking.startDate} to {booking.endDate}</p>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-4 text-slate-400"><Clock size={18} /><span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('checkout.final_valuation.handoff_logic')}</span></div>
                       <p className="text-sm font-black text-slate-900">{booking.pickupTime} @ {booking.city || "Hub"}</p>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-emerald-50 rounded-app flex items-center justify-center text-emerald-500">
                          <CheckCircle2 size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('checkout.final_valuation.driver_qual')}</p>
                          <p className="text-sm font-black text-slate-900">Age: {user?.dob ? calculateAge(user.dob) : "Verified"}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('checkout.final_valuation.phone_link')}</p>
                       <p className="text-sm font-black text-slate-900">{user?.phone || "Registry Match"}</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('checkout.final_valuation.select_protocol')}</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={handleStripePayment} disabled={processing} className="p-8 rounded-app border-2 border-slate-900 bg-white text-left group transition-all hover:shadow-2xl active:scale-95 disabled:opacity-50">
                       <div className="flex items-center justify-between mb-6">
                          <img src="https://cdn-icons-png.flaticon.com/512/5968/5968382.png" className="h-8 grayscale group-hover:grayscale-0 transition-all" />
                          <div className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center bg-slate-900 text-white"><CheckCircle2 size={16} /></div>
                       </div>
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">{t('checkout.final_valuation.stripe')}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{t('checkout.final_valuation.encrypted_card')}</p>
                    </button>
                    
                    <div className="p-8 rounded-app border-2 border-slate-50 bg-slate-50/30 text-left opacity-30 cursor-not-allowed grayscale">
                       <div className="flex items-center justify-between mb-6">
                          <img src="https://cdn-icons-png.flaticon.com/512/174/174861.png" className="h-8" />
                       </div>
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">{t('checkout.final_valuation.paypal')}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{t('checkout.final_valuation.coming_soon')}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
              <div className="bg-slate-900 rounded-app p-12 text-white shadow-2xl space-y-12 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rounded-full blur-3xl" />
                 
                 <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">{t('checkout.final_valuation.invoice_summary')}</span>
                    <h3 className="text-4xl font-black tracking-tighter">{t('checkout.final_valuation.machine_valuation')}</h3>
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between items-center text-white/60 font-black text-[10px] uppercase tracking-widest">
                       <span>{t('checkout.final_valuation.base_rate')}</span>
                       <span className="text-white">${(booking.baseAmount ?? booking.totalPrice)?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60 font-black text-[10px] uppercase tracking-widest">
                       <span>{t('dashboard.overview.stats.net_profit')} ({(booking.commissionRateApplied ?? 0).toFixed(0)}%)</span>
                       <span className="text-white">${(booking.platformFee ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60 font-black text-[10px] uppercase tracking-widest">
                       <span>{t('checkout.final_valuation.security_deposit') || "Security Deposit"}</span>
                       <span className="text-white">${(booking.securityDeposit ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60 font-black text-[10px] uppercase tracking-widest">
                       <span>{t('checkout.final_valuation.taxes_levies') || "Taxes & Levies"}</span>
                       <span className="text-white">{t('checkout.final_valuation.included')}</span>
                    </div>
                    
                    <div className="h-px bg-white/10 my-4" />
                    
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">{t('checkout.final_valuation.grand_auth')}</p>
                          <p className="text-5xl font-black tracking-tighter">${booking.totalPrice?.toFixed(2)}</p>
                       </div>
                       <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-app border border-emerald-500/20"><ShieldCheck size={28} /></div>
                    </div>
                 </div>

                 <Button onClick={handleStripePayment} disabled={processing} className="w-full h-20 bg-white hover:bg-slate-100 text-slate-900 rounded-app font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                    {processing ? <div className="w-6 h-6 border-4 border-slate-900/10 border-t-slate-900 rounded-full animate-spin" /> : t('checkout.final_valuation.authorize_btn')}
                 </Button>

                 <div className="flex items-center justify-center gap-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                    <Lock size={12} /> {t('checkout.final_valuation.ssl_encrypted')}
                 </div>
              </div>
              
              <div className="p-8 bg-slate-50 rounded-app border border-slate-100 flex items-start gap-4">
                 <div className="bg-slate-900 text-white p-2 rounded-app shrink-0"><Zap size={16} /></div>
                 <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">{t('checkout.final_valuation.secure_processing')}</p>
              </div>
           </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
