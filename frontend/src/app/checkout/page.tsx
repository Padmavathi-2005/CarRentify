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
 Zap, 
 CheckCircle2, 

 Lock,
 Key,
 Percent,
 Receipt,
 ShieldPlus,
 ArrowRight,
 User,
 Mail,
 Phone,
 Wallet,
 Globe,
 ChevronDown,
 Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthContext";
import { useLocale } from "@/components/LocaleContext";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import { authService } from "@/services/authService";
import { CustomDatePicker, PremiumRangePicker, PremiumTimeRangePicker } from "@/components/CustomDateTimePicker";
import VerificationModal from "@/components/VerificationModal";

function CheckoutContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const { user, setUserType } = useAuth();
 const { t, formatPrice } = useLocale();
 
 const carId = searchParams.get("carId");
 const [car, setCar] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [gateways, setGateways] = useState<any[]>([]);
 const [paymentMethod, setPaymentMethod] = useState("card");
 const [isProcessing, setIsProcessing] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [commissionRate, setCommissionRate] = useState<number>(0);
 const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
 const [dob, setDob] = useState("");
 const [phoneNumber, setPhoneNumber] = useState("");
 const [phoneError, setPhoneError] = useState<string | null>(null);
 const [email, setEmail] = useState("");
 const [emailError, setEmailError] = useState<string | null>(null);

 useEffect(() => {
    if (user) {
      if (user.dob) setDob(new Date(user.dob).toISOString().split('T')[0]);
      if (user.phone) {
        const digits = user.phone.replace(/\D/g, "").slice(-10);
        setPhoneNumber(digits);
      }
      if (user.email) setEmail(user.email);
    }
  }, [user]);
 
 // Date/Time States for Summary & Editing
 const [isEditingDates, setIsEditingDates] = useState(false);
 const [startDate, setStartDate] = useState(searchParams.get("start") || "");
 const [endDate, setEndDate] = useState(searchParams.get("end") || "");
 const [pickupTime, setPickupTime] = useState(searchParams.get("pickup") || "10:00");
 const [returnTime, setReturnTime] = useState(searchParams.get("return") || "10:00");
 const [message, setMessage] = useState("");
 const [ageError, setAgeError] = useState<string | null>(null);

 // Protection Plans Logic
 const [protectionPlans, setProtectionPlans] = useState<any[]>([]);
 const [selectedProtection, setSelectedProtection] = useState<string | null>(null);
 const [isProtectionExpand, setIsProtectionExpand] = useState(false);
 const [taxes, setTaxes] = useState<any[]>([]);

 // Coupon State
 const [couponCode, setCouponCode] = useState("");
 const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
 const [isCouponExpanded, setIsCouponExpanded] = useState(false);
 const [couponError, setCouponError] = useState("");
 const [couponSuccess, setCouponSuccess] = useState("");
 const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

 // Verification Gate State
 const [verificationStatus, setVerificationStatus] = useState<string>('loading');
 const [showVerifModal, setShowVerifModal] = useState(false);

 const formatDateWithDay = (dateStr: string) => {
 if (!dateStr) return "";
 const date = new Date(dateStr);
 if (isNaN(date.getTime())) return dateStr;
 return date.toLocaleDateString('en-US', { 
 month: 'short', 
 day: 'numeric', 
 weekday: 'short' 
 });
 };
 
 // Info Modal states
 const [infoModal, setInfoModal] = useState<string | null>(null);

 // Custom Country Select Logic
 const [isCountryOpen, setIsCountryOpen] = useState(false);
 const [selectedCountry, setSelectedCountry] = useState({ code: '+1', name: 'USA', flag: '🇺🇸', id: 'us' });
 const [showSuccess, setShowSuccess] = useState(false);
 const [lastBookingId, setLastBookingId] = useState("");
 const [lastBookingHash, setLastBookingHash] = useState("");

 const countries = [
 { id: 'us', name: 'USA', code: '+1', full: 'United States', flag: '🇺🇸' },
 { id: 'uk', name: 'UK', code: '+44', full: 'United Kingdom', flag: '🇬🇧' },
 { id: 'in', name: 'India', code: '+91', full: 'India', flag: '🇮🇳' },
 { id: 'ae', name: 'UAE', code: '+971', full: 'United Arab Emirates', flag: '🇦🇪' },
 { id: 'ca', name: 'Canada', code: '+1', full: 'Canada', flag: '🇨🇦' },
 { id: 'au', name: 'Australia', code: '+61', full: 'Australia', flag: '🇦🇺' },
 { id: 'de', name: 'Germany', code: '+49', full: 'Germany', flag: '🇩🇪' },
 { id: 'fr', name: 'France', code: '+33', full: 'France', flag: '🇫🇷' },
 ];

 useEffect(() => {
 let isMounted = true;

 async function initializeCheckout() {
 if (!carId) {
 if (isMounted) {
 setLoading(false);
 setError(t('checkout.no_id'));
 }
 return;
 }

 setLoading(true);
 setError(null);

 // Safety timeout: dismiss loading state if initialization hangs for more than 10s
 const timeoutId = setTimeout(() => {
 if (isMounted) setLoading(false);
 }, 10000);

 try {
 const token = authService.getToken();
 const [carRes, settingsRes, paymentRes, verifRes] = await Promise.all([
 fetch(`${API_BASE_URL}/cars/${carId}`),
 fetch(`${API_BASE_URL}/settings`),
 fetch(`${API_BASE_URL}/settings/payments`),
 token ? fetch(`${API_BASE_URL}/verification/my-status`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null),
 ]);

 if (!carRes.ok) throw new Error("Asset retrieval failed");
 
 // Set verification status from response
  if (verifRes && verifRes.ok) {
  const verifData = await verifRes.json();
  setVerificationStatus(verifData.status || 'not_submitted');
  
  // Auto-fill from verification documents if state is still empty
  if (verifData.documents) {
  const dobDoc = verifData.documents.find((d: any) => d.fieldId === 'dob');
  const phoneDoc = verifData.documents.find((d: any) => d.fieldId === 'phone_verification' || d.fieldId === 'phone');
  
  if (dobDoc?.value) {
  try {
  setDob(new Date(dobDoc.value).toISOString().split('T')[0]);
  } catch(e) {}
  }
  if (phoneDoc?.value) {
  const digits = phoneDoc.value.replace(/\D/g, "").slice(-10);
  setPhoneNumber(digits);
  }
  }
  } else {
  setVerificationStatus('not_submitted');
  }
 
 const carData = await carRes.json();
 const settingsData = await settingsRes.json();
 const paymentData = await paymentRes.json();

 if (!isMounted) return;

 if (!carData || carData.error) {
 setError(t('checkout.not_available'));
 setLoading(false);
 return;
 }

 setCar(carData);
 
 // Safe check for paymentData being an array
 const gatewaysList = Array.isArray(paymentData) ? paymentData : [];
 const activeGateways = gatewaysList.filter(g => g.isEnabled);
 setGateways(activeGateways);
 if (activeGateways.length > 0) {
 setPaymentMethod(activeGateways[0].slug);
 }
 
 // Use financials branch for commission rate matching backend logic
 const commission = settingsData.financials?.commissionRate ?? (settingsData.commissionRate ?? 15);
 setCommissionRate(Number(commission));
 setProtectionPlans(settingsData.plans || settingsData.protection?.plans || []);
 
 // Robust path for taxes items in frontend
 const taxesList = settingsData.taxes?.taxes?.items || settingsData.taxes?.items || [];
 setTaxes(taxesList);
 
 if (activeGateways.length > 0) {
 setPaymentMethod(activeGateways[0].slug);
 }
 } catch (err) {
 console.error("Checkout initialization error:", err);
 if (isMounted) {
 setError(t('checkout.conn_error'));
 }
 } finally {
 clearTimeout(timeoutId);
 if (isMounted) {
 setLoading(false);
 }
 }
 }

 setIsProcessing(false);
 initializeCheckout();

 // Redirect admins away from checkout
 if (user?.role?.toLowerCase() === 'admin') {
 router.push('/admin');
 return;
 }

 return () => {
 isMounted = false;
 };
 }, [carId, user]);

 if (loading) {
 return (
 <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-4" />
 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('checkout.initializing')}</p>
 </div>
 );
 }

 if (!car) {
 return (
 <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
 <h2 className="text-2xl font-bold text-slate-900 mb-4">{error || t('checkout.not_found')}</h2>
 <p className="text-slate-500 mb-8 max-w-md">
 {error || t('checkout.not_available')}
 </p>
 <Link href="/vehicles">
 <Button className="h-12 px-10 rounded-app bg-primary text-white font-bold uppercase tracking-widest text-xs border-none">
 {t('checkout.browse_btn')}
 </Button>
 </Link>
 </div>
 );
 }

 const days = (() => {
 if (!startDate || !endDate) return 1;
 const s = new Date(startDate);
 const e = new Date(endDate);
 const diff = e.getTime() - s.getTime();
 return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
 })();

 const extrasTotal = (car.extras || [])
 .filter((e: any) => selectedExtras.includes(e.name))
 .reduce((acc: number, e: any) => acc + (e.price || 0), 0);

 const subtotal = (days * (car.pricePerDay || car.price || 0)) + extrasTotal;
 
 const couponDiscount = appliedCoupon 
 ? (appliedCoupon.discountType === 'percentage' 
 ? (subtotal * (appliedCoupon.amount / 100)) 
 : appliedCoupon.amount)
 : 0;

 const protectionPlan = protectionPlans.find(p => p.id === selectedProtection);
 const protectionCost = protectionPlan ? (days * (car.pricePerDay || car.price || 0) * (protectionPlan.pricePercentage / 100)) : 0;

 const securityDeposit = car.securityDeposit || 0;
 const platformFee = Math.max(0, (subtotal * (commissionRate || 0)) / 100);
 
 const taxableAmount = Math.max(0, subtotal - couponDiscount) + protectionCost + platformFee;
 const activeTaxes = taxes.filter(t => t.isEnabled);
 const taxesTotal = activeTaxes.reduce((acc, t) => acc + (taxableAmount * (t.percentage / 100)), 0);

 const total = taxableAmount + securityDeposit + taxesTotal;

 const handleApplyCoupon = async () => {
 if(!couponCode) return;
 setIsApplyingCoupon(true);
 setCouponError("");
 setCouponSuccess("");
 try {
 const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ code: couponCode, userId: user?._id || user?.id, subtotal })
 });
 if (res.ok) {
 const validCoupon = await res.json();
 setAppliedCoupon(validCoupon);
 setCouponSuccess(`Applied: ${validCoupon.discountType === 'percentage' ? validCoupon.amount + '%' : '$' + validCoupon.amount} off!`);
 } else {
 const err = await res.json();
 setCouponError(err.message || "Invalid or expired coupon.");
 setAppliedCoupon(null);
 }
 } catch (err) {
 setCouponError("Could not validate coupon.");
 setAppliedCoupon(null);
 } finally {
 setIsApplyingCoupon(false);
 }
 };


 const handleConfirmPayment = async () => {
 if (isProcessing) return;
 if (!user) {
 router.push("/login?redirect=/checkout");
 return;
 }

 // If not verified and user is not an admin, open modal instead of proceeding
 if (user?.role !== 'admin' && verificationStatus !== 'approved') {
 setShowVerifModal(true);
 return;
 }

 if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
 setEmailError("Please enter a valid email address");
 const emailField = document.getElementById('email-field');
 if (emailField) emailField.scrollIntoView({ behavior: 'smooth', block: 'center' });
 return;
 }
 setEmailError(null);

 if (!phoneNumber || phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
 setPhoneError(t('checkout.labels.placeholder_mobile'));
 // Scroll to phone field
 const phoneField = document.getElementById('phone-field');
 if (phoneField) phoneField.scrollIntoView({ behavior: 'smooth', block: 'center' });
 return;
 }
 setPhoneError(null);

 setIsProcessing(true);
 try {
 const res = await fetch(`${API_BASE_URL}/bookings`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "Authorization": `Bearer ${authService.getToken()}`
 },
 body: JSON.stringify({
 carId: car._id,
 startDate,
 endDate,
 pickupTime,
 returnTime,
 totalPrice: total,
 phoneNumber: `${selectedCountry.code}${phoneNumber}`,
 extras: selectedExtras,
 bookingType: car.bookingType,
 dob: dob,
 protectionPlanId: selectedProtection,
 paymentMethod: paymentMethod,
 message: message,
 couponId: appliedCoupon ? appliedCoupon._id : undefined,
 breakdown: {
 subtotal,
 couponDiscount,
 protectionCost,
 platformFee,
 securityDeposit,
 taxesTotal
 }
 })
 });

 const data = await res.json();

 if (res.ok) {
 const bookingId = data._id;
 const bookingHash = data.bookingHash;
 setLastBookingId(bookingId);
 setLastBookingHash(bookingHash || bookingId);

 // If an online payment method is selected and it is an instant booking, initialize the checkout session
 if (['stripe', 'paypal'].includes(paymentMethod.toLowerCase()) && car?.bookingType === 'Instant') {
 try {
 setIsProcessing(true); // Keep processing state while redirecting
 const sessionRes = await fetch(`${API_BASE_URL}/payments/create-session/${bookingId}`, {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${authService.getToken()}`
 }
 });
 
 if (!sessionRes.ok) {
 const errorData = await sessionRes.json();
 alert(`Payment Error: ${errorData.message || 'Could not initialize gateway'}`);
 setIsProcessing(false);
 return;
 }

 const sessionData = await sessionRes.json();
 if (sessionData.url) {
 // Use window.location.replace to prevent back-button loops during payment
 window.location.href = sessionData.url;
 return;
 } else {
 alert("Payment URL not provided by gateway.");
 setIsProcessing(false);
 return;
 }
 } catch (pErr) {
 console.error("Payment Bridge Error:", pErr);
 alert("A network error occurred while connecting to the payment gateway.");
 setIsProcessing(false);
 return;
 }
 }

 // Show Success Overlay instead of instant redirect ONLY for non-online methods or Request bookings
 setUserType('renter');
 setShowSuccess(true);
 setTimeout(() => {
 router.push(`/dashboard/bookings/${bookingId}/agreement?promptSign=true`);
 }, 5000);
 } else {
 alert(data.message || "Failed to process booking.");
 }
 } catch (err) {
 console.error("Booking error:", err);
 alert("Something went wrong while processing your reservation.");
 } finally {
 if (!['stripe', 'paypal'].includes(paymentMethod.toLowerCase()) || car?.bookingType !== 'Instant') {
 setIsProcessing(false);
 }
 }
 };

 return (
 <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-primary selection:text-white">
 <Header />

 {/* Soft Verification Banner — only shows if not verified, non-blocking */}
 {user?.role !== 'admin' && verificationStatus !== 'loading' && verificationStatus !== 'approved' && (
 <div className={`fixed top-20 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none`}>
 <div className={`pointer-events-auto flex items-center gap-4 px-6 py-3 rounded-app border text-[10px] font-bold uppercase tracking-widest ${
 verificationStatus === 'pending'
 ? 'bg-amber-50 border-amber-100 text-amber-600'
 : 'bg-rose-50 border-rose-100 text-rose-600'
 }`}>
 <ShieldCheck size={14} />
 <span>
 {verificationStatus === 'pending'
 ? t('checkout.verification.review')
 : t('checkout.verification.required')}
 </span>
 {verificationStatus !== 'pending' && (
 <button
 onClick={() => setShowVerifModal(true)}
 className="ml-2 px-3 py-1 bg-rose-500 text-white rounded-app hover:bg-rose-600 transition-all"
 >
 {t('checkout.verification.verify_now')}
 </button>
 )}
 </div>
 </div>
 )}

 <main className="max-w-7xl mx-auto px-6 pt-24">
 <div className="flex items-center gap-6 mb-4">
 <Link href={`/vehicles/${car.permalink || carId}`} className="group flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-all shrink-0">
 <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t('checkout.back')}
 </Link>
 <div className="w-px h-6 bg-slate-200" />
 <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">{t('checkout.title')}</h1>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
 <section className="bg-white p-6 rounded-app border border-slate-200 relative overflow-visible">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{t('checkout.labels.full_name')}</label>
 <div className="relative group/input">
 <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-primary transition-all" />
 <Input 
 defaultValue={user?.displayName || user?.name || ""} 
 placeholder={t('checkout.labels.placeholder_name')}
 className="h-12 pl-12 bg-slate-50 border-none rounded-app text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
 />
 </div>
 </div>
 <div className="space-y-2" id="email-field">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{t('checkout.labels.email')}</label>
 <div className="relative group/input">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-primary transition-all" />
 <Input 
 value={email} 
 onChange={(e) => {
   setEmail(e.target.value);
   if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) setEmailError(null);
 }}
 placeholder={t('checkout.labels.placeholder_email')}
 className={`h-12 pl-12 bg-slate-50 border-none rounded-app text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none ${emailError ? 'ring-2 ring-red-500 ' : ''}`}
 />
 </div>
 {emailError && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest px-1 animate-pulse">{emailError}</p>}
 </div>
 <div className="space-y-2">
 <CustomDatePicker 
 label={t('checkout.labels.dob')}
 value={dob}
 maxDate={(() => {
 const d = new Date();
 d.setFullYear(d.getFullYear() - 21);
 return d.toISOString().split('T')[0];
 })()}
 defaultViewDate={(() => {
 const d = new Date();
 d.setFullYear(d.getFullYear() - 21);
 return d.toISOString().split('T')[0];
 })()}
 onChange={(val) => {
 setDob(val);
 if (val) {
 const birthDate = new Date(val);
 const today = new Date();
 let age = today.getFullYear() - birthDate.getFullYear();
 const m = today.getMonth() - birthDate.getMonth();
 if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
 
 if (age < 21) setAgeError("Must be at least 21 to drive");
 else setAgeError(null);
 }
 }}
 />
 {ageError && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest px-1 animate-pulse">{ageError}</p>}
 </div>
 <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-6">
 <div className="md:col-span-5 space-y-2">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{t('checkout.labels.country')}</label>
 <div className="relative">
 <div 
 onClick={() => setIsCountryOpen(!isCountryOpen)}
 className={`h-12 flex items-center justify-between px-5 bg-slate-50 border rounded-app cursor-pointer transition-all ${isCountryOpen ? 'bg-white border-primary ring-4 ring-primary/5 ' : 'border-transparent hover:border-slate-200'}`}
 >
 <div className="flex items-center gap-3">
 <span className="text-xl leading-none">{selectedCountry.flag}</span>
 <span className="text-sm font-bold text-slate-900 uppercase leading-none">{selectedCountry.code}</span>
 </div>
 <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
 </div>
 
 <AnimatePresence>
 {isCountryOpen && (
 <>
 <div className="fixed inset-0 z-40" onClick={() => setIsCountryOpen(false)} />
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-app p-3 pr-4 z-50 max-h-72 overflow-y-auto custom-scrollbar"
 >
 <div className="px-4 py-3 border-b border-slate-50 mb-2">
 <span className="text-[9px] font-bold text-slate-500/50 uppercase tracking-[0.2em]">Select Dial Protocol</span>
 </div>
 {countries.map((c) => (
 <div 
 key={c.id}
 onClick={() => { setSelectedCountry(c); setIsCountryOpen(false); }}
 className={`flex items-center justify-between p-3 rounded-app transition-all cursor-pointer group ${selectedCountry.id === c.id ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
 >
 <div className="flex items-center gap-4">
 <span className="text-xl group-hover:scale-110 transition-transform">{c.flag}</span>
 <div className="flex flex-col">
 <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight leading-none mb-1">{c.full}</span>
 <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{c.code}</span>
 </div>
 </div>
 {selectedCountry.id === c.id && <CheckCircle2 size={12} className="text-emerald-500" />}
 </div>
 ))}
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>
 </div>
 <div className="md:col-span-7 space-y-2" id="phone-field">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{t('checkout.labels.mobile')}</label>
 <div className="relative group/input">
 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-primary transition-all" />
 <Input 
 placeholder={t('checkout.labels.placeholder_mobile')}
 value={phoneNumber}
 onChange={(e) => {
 const val = e.target.value.replace(/\D/g, '').slice(0, 10);
 setPhoneNumber(val);
 if (val.length === 10) setPhoneError(null);
 }}
 className={`h-12 pl-12 bg-slate-50 border-none rounded-app text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none ${phoneError ? 'ring-2 ring-red-500 ' : ''}`}
 />
 </div>
 {phoneError && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest px-1 animate-pulse">{phoneError}</p>}
 </div>
 <div className="md:col-span-12">
 <p className="text-[9px] font-bold text-slate-400 leading-tight px-1 pt-1 opacity-70">
 {t('checkout.sms_consent')}
 </p>
 </div>
 </div>
 </div>
 </section>

 <section className="bg-white p-6 rounded-app border border-slate-200 relative overflow-visible">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-1.5 h-6 bg-primary rounded-full" />
 <div>
 <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest leading-none mb-1">{t('checkout.message.title')}</h2>
 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t('checkout.message.subtitle')}</p>
 </div>
 </div>
 <textarea 
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 placeholder={t('checkout.message.placeholder')}
 className="w-full min-h-[120px] p-4 bg-slate-50 border-none rounded-app text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
 />
 </section>

 <section className="bg-white p-6 rounded-app border border-slate-200 relative overflow-visible">
 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-4">{t('checkout.payment.title')}</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
 {gateways.length > 0 ? gateways.map((g) => (
 <button 
 key={g._id}
 onClick={() => setPaymentMethod(g.slug)}
 className={`flex items-center gap-4 p-4 rounded-app border-2 transition-all group relative ${paymentMethod === g.slug ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white'}`}
 >
 <div className={`w-10 h-10 rounded-app flex items-center justify-center p-2 transition-all ${paymentMethod === g.slug ? 'bg-white ' : 'bg-slate-100 grayscale'}`}>
 <img src={g.logoUrl || 'https://cdn-icons-png.flaticon.com/512/174/174861.png'} className="w-full h-full object-contain" alt={g.name} />
 </div>
 <span className="text-[10px] font-bold uppercase tracking-widest">{g.name}</span>
 {paymentMethod === g.slug && (
 <div className="absolute top-2 right-2 bg-primary text-white p-0.5 rounded-full"><CheckCircle2 size={10} /></div>
 )}
 </button>
 )) : (
 <div className="col-span-full p-6 text-center border-2 border-dashed border-slate-200 rounded-app">
 <span className="text-slate-300">{t('checkout.payment.no_pipelines')}</span>
 </div>
 )}
 </div>
 </section>

 {/* Protection Plans */}
 {protectionPlans.length > 0 && (
 <section className="bg-white p-6 rounded-app border border-slate-200 relative overflow-visible">
 <div 
 className="flex items-center justify-between cursor-pointer"
 onClick={() => setIsProtectionExpand(!isProtectionExpand)}
 >
 <div className="flex items-center gap-3">
 <div className="w-1.5 h-6 bg-primary rounded-full" />
 <div>
 <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest leading-none mb-1">{t('checkout.protection.title')}</h2>
 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t('checkout.protection.subtitle')}</p>
 </div>
 </div>
 <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProtectionExpand ? 'rotate-180' : ''}`} />
 </div>

 <AnimatePresence>
 {isProtectionExpand && (
 <motion.div 
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden"
 >
 <div className="grid grid-cols-1 gap-4 mt-8">
 {protectionPlans.map((plan) => {
 const isSelected = selectedProtection === plan.id;
 const perDayPrice = (car?.pricePerDay || car?.price || 0) * (plan.pricePercentage / 100);
 const outOfPocket = (car?.pricePerDay || car?.price || 0) * (plan.outOfPocketPercentage / 100);
 
 return (
 <div 
 key={plan.id}
 onClick={() => setSelectedProtection(isSelected ? null : plan.id)}
 className={`group p-6 rounded-app border-2 transition-all cursor-pointer flex items-start gap-4 ${isSelected ? 'border-primary bg-primary/5' : 'border-slate-50 bg-slate-50 hover:bg-white hover:border-slate-200'}`}
 >
 <div className={`w-12 h-12 rounded-app flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-white ' : 'bg-white text-slate-300'}`}>
 <ShieldCheck size={24} />
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <h4 className="text-sm font-bold text-slate-900">{plan.name}</h4>

 <span className="text-[9px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-full">{t('checkout.protection.out_of_pocket', { amount: formatPrice(outOfPocket, car.currency) })}</span>
 </div>
 <div className="text-right">
 <span className="text-xs font-bold text-slate-900">{formatPrice(perDayPrice, car.currency)}</span>
 <span className="text-[9px] font-bold text-slate-400 block">{t('checkout.protection.per_day')}</span>
 </div>
 </div>
 <p className="text-xs font-bold text-slate-400 leading-relaxed mb-4">{plan.description}</p>
 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-900 uppercase tracking-widest group-hover:text-primary transition-colors">
 <span>{outOfPocket === 0 ? t('checkout.protection.max_oop_zero') : t('checkout.protection.max_oop', { amount: formatPrice(outOfPocket, car.currency) })}</span>
 </div>
 </div>
 {isSelected && <div className="bg-primary text-white p-1 rounded-full shrink-0"><CheckCircle2 size={16} /></div>}
 </div>
 );
 })}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </section>
 )}

 {/* 3. Enhance Your Journey (Extras) */}
 {car.extras && car.extras.length > 0 && (
 <section className="bg-white p-6 rounded-app border border-slate-200 relative overflow-visible">
 <div className="flex items-center gap-3 mb-8">
 <div className="w-1.5 h-6 bg-primary rounded-full" />
 <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest text-[11px]">{t('checkout.extras.title')}</h2>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {car.extras.map((extra: any, idx: number) => {
 const isSelected = selectedExtras.includes(extra.name);
 return (
 <div key={idx} onClick={() => {
 if (isSelected) setSelectedExtras(selectedExtras.filter(i => i !== extra.name));
 else setSelectedExtras([...selectedExtras, extra.name]);
 }}
 className={`p-6 rounded-app border-2 transition-all cursor-pointer group flex items-start gap-4 ${isSelected ? 'border-primary bg-primary/5' : 'border-slate-50 bg-slate-50 hover:bg-white hover:border-slate-200'}`}
 >
 <div className={`w-12 h-12 rounded-app flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-white ' : 'bg-white text-slate-300 group-hover:text-primary'}`}><Zap size={20} /></div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-1">
 <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{extra.name}</h4>
 <span className={`text-[10px] font-bold ${isSelected ? 'text-primary' : 'text-slate-400'}`}>+{formatPrice(extra.price, car.currency)}</span>
 </div>
 <p className="text-[10px] font-bold text-slate-400 line-clamp-1 italic">{extra.description || "Premium addition to your rental."}</p>
 </div>
 {isSelected && <div className="bg-primary text-white p-1 rounded-full shrink-0"><CheckCircle2 size={12} /></div>}
 </div>
 );
 })}
 </div>
 </section>
 )}

 <div className="bg-emerald-50 p-6 rounded-app border border-emerald-100 flex items-start gap-4">
 <div className="w-10 h-10 rounded-app bg-white border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0"><CheckCircle2 size={18} /></div>
 <div>
 <h4 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-2">Free Cancellation</h4>
 <p className="text-[10px] font-bold text-emerald-500/80 leading-relaxed mb-1">Cancel for a full refund up to 24 hours before your journey starts.</p>
 <Link href="/pages/cancellation-policy" target="_blank" className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-300 hover:text-black hover:border-black transition-all">Read Cancellation Policy</Link>
 </div>
 </div>
 </div>

 {/* Right Column: Journey Summary (Sticky) */}
 <div className="lg:col-span-5 order-1 lg:order-2">
 <div className="lg:sticky lg:top-20 space-y-6">
 <section className="bg-white p-6 rounded-app border border-slate-200 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
 <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-8 relative z-10">{t('checkout.summary.title')}</h2>
 <div className="flex items-center gap-6 mb-4 pb-4 relative z-10">
 <div className="w-24 h-24 rounded-app overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
  <img src={getImageUrl(car.image || (car.images && car.images[0]))} alt={car.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=400'; }} />
 </div>
 <div>
 <h3 className="text-lg font-bold text-slate-900 leading-none mb-2">{car.name}</h3>
 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><MapPin size={12} className="text-primary" /> {car.location?.city || "NYC"}, {car.location?.country || "USA"}</div>
 </div>
 </div>
 <div className="flex items-center justify-between mb-4 pb-4 relative z-10">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-app bg-primary/5 flex items-center justify-center text-primary">
 <Calendar size={18} />
 </div>
 <div className="space-y-1">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('checkout.summary.rental_period')}</p>
 <p className="text-xs font-bold text-slate-900 leading-none">
 {formatDateWithDay(startDate)} • {pickupTime} <span className="text-slate-300 mx-2">to</span> {formatDateWithDay(endDate)} • {returnTime}
 </p>
 </div>

 </div>
 <button 
 onClick={() => setIsEditingDates(!isEditingDates)}
 className="px-4 py-2 bg-slate-50 hover:bg-primary/5 border border-slate-200 rounded-app text-[10px] font-bold text-primary uppercase tracking-widest transition-all"
 >
 {isEditingDates ? 'CLOSE' : 'EDIT'}
 </button>
 </div>

 <AnimatePresence>
 {isEditingDates && (
 <motion.div 
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="space-y-6 mb-4 pb-4 overflow-hidden"
 >
 <PremiumRangePicker 
 startDate={startDate}
 endDate={endDate}
 onRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }}
 align="right"
 customWidth={900}
 />
 <PremiumTimeRangePicker 
 startTime={pickupTime}
 endTime={returnTime}
 onRangeTimeChange={(start, end) => { setPickupTime(start); setReturnTime(end); }}
 align="right"
 customWidth={400}
 />
 </motion.div>
 )}
 </AnimatePresence>
 <div className="space-y-4 mb-4 relative z-10">
 <div className="flex justify-between items-center px-1">
 <span 
 onClick={() => setInfoModal('rental')}
 className="text-xs font-bold text-slate-400 border-b border-dashed border-transparent hover:text-primary hover:border-primary transition-all cursor-pointer"
 >
 Total Rental ({days} days)
 </span>
 <span className="text-xs font-bold text-slate-900">{formatPrice(days * (car.pricePerDay || car.price || 0), car.currency)}</span>
 </div>
 {selectedExtras.length > 0 && (
 <div className="flex justify-between items-center px-1">
 <span className="text-xs font-bold text-slate-400">Add-ons ({selectedExtras.length})</span>
 <span className="text-xs font-bold text-slate-900">+{formatPrice(extrasTotal, car.currency)}</span>
 </div>
 )}
 {selectedProtection && protectionPlan && (
 <div className="flex justify-between items-center px-1">
 <span 
 onClick={() => setInfoModal('protection')}
 className="text-xs font-bold text-slate-400 border-b border-dashed border-transparent hover:text-primary hover:border-primary transition-all cursor-pointer"
 >
 Protection Plan ({protectionPlan.name})
 </span>
 <span className="text-xs font-bold text-slate-900">+{formatPrice(protectionCost, car.currency)}</span>
 </div>
 )}
 <div className="flex justify-between items-center px-1">
 <span 
 onClick={() => setInfoModal('platform')}
 className="text-xs font-bold text-slate-400 border-b border-dashed border-transparent hover:text-primary hover:border-primary transition-all cursor-pointer"
 >
 Platform Fee ({commissionRate}%)
 </span>
 <span className="text-xs font-bold text-slate-900">{formatPrice(platformFee, car.currency)}</span>
 </div>

 {appliedCoupon && (
 <div className="flex justify-between items-center px-1">
 <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
 Coupon ({appliedCoupon.code})
 </span>
 <span className="text-xs font-bold text-emerald-500">-{formatPrice(couponDiscount, car.currency)}</span>
 </div>
 )}
 <div className="flex justify-between items-center px-1">
 <span 
 onClick={() => setInfoModal('deposit')}
 className="text-xs font-bold text-slate-400 border-b border-dashed border-transparent hover:text-primary hover:border-primary transition-all cursor-pointer"
 >
 Security Deposit (Refundable)
 </span>
 <span className="text-xs font-bold text-slate-900">{formatPrice(securityDeposit, car.currency)}</span>
 </div>
 {activeTaxes.map(tax => (
 <div key={tax.id} className="flex justify-between items-center px-1">
 <span 
 onClick={() => setInfoModal('tax')}
 className="text-xs font-bold text-slate-400 border-b border-dashed border-transparent hover:text-primary hover:border-primary transition-all cursor-pointer"
 >
 {tax.name} ({tax.percentage}%)
 </span>
 <span className="text-xs font-bold text-slate-900">{formatPrice(taxableAmount * (tax.percentage / 100), car.currency)}</span>
 </div>
 ))}
 <div className="flex justify-between items-center p-4 bg-primary/5 rounded-app border border-primary/10 mt-4">
 <span className="text-sm font-bold text-primary uppercase tracking-widest">Final Total</span>
 <span className="text-xl font-bold text-primary">{formatPrice(total, car.currency)}</span>
 </div>
 </div>
 <Button onClick={handleConfirmPayment} disabled={isProcessing || !!ageError || !dob} className="w-full h-16 bg-primary hover:bg-primary-hover text-white text-sm font-bold uppercase tracking-widest rounded-app transition-all active:scale-95 border-none disabled:opacity-50">
 {isProcessing ? "Processing Securely..." : <div className="flex items-center gap-2">Confirm & Pay <ArrowRight size={18} /></div>}
 </Button>

 {/* Coupon Section completely refactored */}
 <div className="mt-6 border-t border-slate-200 pt-6 group">
 <div 
 className="flex items-center justify-between cursor-pointer"
 onClick={() => setIsCouponExpanded(!isCouponExpanded)}
 >
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shrink-0">
 <Zap size={14} />
 </div>
 <span className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Promo Code</span>
 </div>
 <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCouponExpanded ? 'rotate-180' : ''}`} />
 </div>
 <AnimatePresence>
 {isCouponExpanded && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden mt-4"
 >
 <div className="flex flex-col gap-2 relative">
 <div className="flex gap-2 w-full">
 <div className="relative flex-1">
 <Input 
 placeholder="Enter Code..." 
 value={couponCode}
 onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
 disabled={!!appliedCoupon}
 className="h-12 bg-slate-50 border-slate-200 focus:bg-white text-sm font-bold uppercase tracking-widest outline-none pr-4 w-full"
 />
 </div>
 {!appliedCoupon ? (
 <Button 
 onClick={handleApplyCoupon} 
 disabled={isApplyingCoupon || !couponCode}
 className="h-12 px-6 shrink-0 bg-slate-900 hover:bg-primary-hover text-white font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 rounded-app"
 >
 {isApplyingCoupon ? '...' : 'Apply'}
 </Button>
 ) : (
 <Button 
 onClick={() => { setAppliedCoupon(null); setCouponCode(""); setCouponSuccess(""); }} 
 className="h-12 px-6 shrink-0 bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 rounded-app border border-rose-100"
 >
 Clear
 </Button>
 )}
 </div>
 {couponError && <p className="text-[9px] font-bold text-red-500 uppercase tracking-[0.1em] px-1 animate-pulse">{couponError}</p>}
 {couponSuccess && <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.1em] px-1 ">{couponSuccess}</p>}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-6 flex items-center justify-center gap-2"><ShieldCheck size={12} /> Protected by CarRental Escrow</p>
 </section>
 </div>
 </div>
 </div>
 </main>
 <Footer />

 <AnimatePresence>
 {showSuccess && <SuccessOverlay bookingId={lastBookingHash} />}
 </AnimatePresence>

 {/* Verification Modal — triggered by Confirm & Pay when not verified */}
 {user && (
 <VerificationModal
 isOpen={showVerifModal}
 onClose={() => setShowVerifModal(false)}
 userId={user._id || user.id || ''}
 />
 )}

 <Modal isOpen={!!infoModal} onClose={() => setInfoModal(null)} title="Fee Information">
 <div className="p-8">
 {infoModal === 'rental' && (
 <div className="space-y-4">

 <div className="text-center">
  <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">Total Rental Price</h4>
  <div className="w-12 h-1 bg-primary mx-auto rounded-full mb-6" />
  <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest max-w-sm mx-auto">
  This is the base cost for renting the vehicle for <strong>{days} days</strong>. It is calculated as the car's daily rate ({formatPrice(car?.pricePerDay || car?.price || 0, car.currency)}) multiplied by the number of days in your journey.
  </p>
  </div>
 <div className="p-4 bg-slate-50 rounded-app border border-slate-100 flex justify-between items-center mt-6">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculation</span>
 <span className="text-sm font-bold text-slate-900">{formatPrice(car?.pricePerDay || car?.price || 0, car.currency)} × {days} {days === 1 ? 'day' : 'days'} = {formatPrice((car?.pricePerDay || car?.price || 0) * days, car.currency)}</span>
 </div>
 </div>
 )}
 {infoModal === 'platform' && (
 <div className="space-y-4">

 <div className="text-center">
  <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">Platform Fee</h4>
  <div className="w-12 h-1 bg-blue-500 mx-auto rounded-full mb-6" />
  <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest max-w-sm mx-auto">
  This fee helps us run the platform and provide premium services like 24/7 road assistance, secure encrypted payments, and the CarRental Escrow protection. It is calculated as <strong>{commissionRate}%</strong> of the rental subtotal.
  </p>
  </div>
  <div className="p-4 bg-slate-50 rounded-app border border-slate-100 flex justify-between items-center mt-6">
  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculation</span>
  <span className="text-sm font-bold text-slate-900">{commissionRate}% of {formatPrice((car?.pricePerDay || car?.price || 0) * days, car.currency)} = {formatPrice(platformFee, car.currency)}</span>
  </div>
  </div>
 )}
 {infoModal === 'deposit' && (
  <div className="space-y-5">

  <div className="text-center">
  <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">Security Deposit</h4>
  <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full mb-6" />
  <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest max-w-sm mx-auto">
  A refundable deposit of <strong className="text-slate-900">{formatPrice(securityDeposit, car.currency)}</strong> is required. This amount is held securely and will be released back to your original payment method automatically within 48 hours after the car is returned safely.
  </p>
  </div>
  </div>
  )}
  {infoModal === 'tax' && (
  <div className="space-y-5">

  <div className="text-center">
  <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">Taxes & Surcharges</h4>
  <div className="w-12 h-1 bg-amber-500 mx-auto rounded-full mb-6" />
  <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest max-w-sm mx-auto">
  Standard governmental taxes and regional surcharges applicable to automotive rentals. These are mandatory fees collected on behalf of the local authorities.
  </p>
  </div>
  </div>
  )}
  {infoModal === 'protection' && (
  <div className="space-y-5">

  <div className="text-center">
  <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">{protectionPlan?.name} Coverage</h4>
  <div className="w-12 h-1 bg-purple-600 mx-auto rounded-full mb-6" />
  <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest max-w-sm mx-auto">
  The cost for your selected coverage level. This protects you against high liability in case of accidental damage during your trip.
  </p>
  </div>
  </div>
  )}

  {/* Specific Plan Details */}
  {protectionPlans.find(p => p.id === infoModal) && (() => {
    const plan = protectionPlans.find(p => p.id === infoModal);
    const outOfPocket = (car?.pricePerDay || car?.price || 0) * (plan.outOfPocketPercentage / 100);
    return (
      <div className="space-y-5">

        <div className="text-center">
          <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">{plan.name} Details</h4>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest mb-6">
            {plan.description}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="p-4 bg-slate-50 rounded-app border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 text-center">Financial Responsibility</span>
            <div className="text-center space-y-1">
              {outOfPocket === 0 ? (
                <>
                  <p className="text-sm font-bold text-emerald-500">Zero Financial Responsibility</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">We cover 100% of all damage and repair costs</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-900">You pay maximum: <span className="text-primary">{formatPrice(outOfPocket, car.currency)}</span></p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">We cover 100% of any additional repair costs</p>
                </>
              )}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-app border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1 text-center">Coverage Scope</span>
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed text-center italic">Comprehensive protection against vehicle damage, theft, and third-party liabilities during your journey.</p>
          </div>
        </div>
      </div>
    );
  })()}
  <Button onClick={() => setInfoModal(null)} className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-app text-xs font-bold uppercase tracking-[0.1em] mt-10 shadow-none border-none transition-all">
  Got It
  </Button>
 </div>
 </Modal>
 </div>
 );
}

function SuccessOverlay({ bookingId }: { bookingId: string }) {
 return (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-2xl"
 >
 <div className="max-w-md w-full p-12 text-center">
 <motion.div 
 initial={{ scale: 0.5, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ type: "spring", damping: 15, stiffness: 200 }}
 className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 -500/30"
 >
 <CheckCircle2 size={64} className="text-white" />
 </motion.div>
 
 <motion.h2 
 initial={{ y: 20, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 transition={{ delay: 0.2 }}
 className="text-4xl font-bold text-slate-900 tracking-tighter mb-4"
 >
 CONGRATS!
 </motion.h2>
 
 <motion.p 
 initial={{ y: 20, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 transition={{ delay: 0.3 }}
 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8"
 >
 Your premium journey starts now
 </motion.p>
 
 <div className="space-y-4">
 <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: '100%' }}
 transition={{ duration: 4.5, ease: "linear" }}
 className="h-full bg-primary"
 />
 </div>
 <p className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Redirecting to My Orders...</p>
 </div>

 <div className="mt-12 flex items-center justify-center gap-2">
 <Zap size={14} className="text-primary animate-pulse" />
 <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest italic">Booking ID: {bookingId}</span>
 </div>
 </div>
 </motion.div>
 );
}

export default function CheckoutPage() {
 return (
 <Suspense fallback={
 <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-4" />
 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Context...</p>
 </div>
 }>
 <CheckoutContent />
 </Suspense>
 );
}
