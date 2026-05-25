"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { 
 Wallet, 
 ArrowUpRight, 
 ArrowDownLeft, 
 Plus, 
 History, 
 CreditCard, 
 Filter, 
 Search,
 ChevronRight,
 TrendingUp,
 ShieldCheck,
 Zap,
 DollarSign,
 X,
 FileText,
 Download,
 Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { walletService } from "@/services/walletService";
import { useAuth } from "@/components/AuthContext";
import { useLocale } from "@/components/LocaleContext";
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

export default function WalletPage() {
 const { user } = useAuth();
 const { t, formatPrice, formatCurrency, currencies, currency: userCurrencyCode } = useLocale();
 const userCurrency = currencies.find(c => c.code === userCurrencyCode) || { symbol: '$' };
 const [balance, setBalance] = useState({ balance: 0, currency: "USD" });
 const [stats, setStats] = useState({ totalEarnings: 0, pendingPayouts: 0 });
 const [transactions, setTransactions] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isAddingFunds, setIsAddingFunds] = useState(false);
 const [isWithdrawing, setIsWithdrawing] = useState(false);
 const [isManagingPayout, setIsManagingPayout] = useState(false);
 const [amountToAdd, setAmountToAdd] = useState("");
 const [amountToWithdraw, setAmountToWithdraw] = useState("");
 const [bankDetails, setBankDetails] = useState({
 accountName: "",
 accountNumber: "",
 bankName: "",
 routingNumber: "",
 ifscCode: ""
 });
 const [payoutMethod, setPayoutMethod] = useState<any>(null);
 const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("stripe");
 const [viewingInvoice, setViewingInvoice] = useState<any>(null);
 const [isAddingBankInWithdraw, setIsAddingBankInWithdraw] = useState(false);
 const [isViewingAll, setIsViewingAll] = useState(false);
 const [isPdfGenerating, setIsPdfGenerating] = useState(false);

 useEffect(() => {
 if (isAddingFunds || isWithdrawing || isManagingPayout || viewingInvoice || isViewingAll) {
 document.body.style.overflow = 'hidden';
 document.documentElement.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = 'unset';
 document.documentElement.style.overflow = 'unset';
 }
 return () => {
 document.body.style.overflow = 'unset';
 document.documentElement.style.overflow = 'unset';
 };
 }, [isAddingFunds, isWithdrawing, isManagingPayout, viewingInvoice, isViewingAll]);

 const fetchData = async () => {
 try {
 const [balData, transData, payoutData, statsData] = await Promise.all([
 walletService.getBalance(),
 walletService.getTransactions(),
 walletService.getPayoutMethod(),
 walletService.getStats()
 ]);
 setBalance(balData);
 setTransactions(transData);
 setStats(statsData);
 if (payoutData) {
 setPayoutMethod(payoutData);
 setBankDetails(payoutData);
 }
 } catch (error) {
 console.error("Error fetching wallet data:", error);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
  fetchData();
  
  // Handle payment success from URL params
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('success') === 'true') {
    const gateway = searchParams.get('gateway');
    const token = searchParams.get('token'); // PayPal Order ID
    const sessionId = searchParams.get('session_id'); // Stripe Session ID
    
    if (gateway === 'paypal' && token) {
      handlePayPalCapture(token);
    } else if (sessionId) {
      handleStripeCapture(sessionId);
    }
  }
 }, []);

 const handleStripeCapture = async (sessionId: string) => {
   setLoading(true);
   try {
     const token = localStorage.getItem("token");
     const res = await fetch(`${API_BASE_URL}/wallet/capture-stripe/${sessionId}`, {
       method: 'POST',
       headers: { 
         'Authorization': `Bearer ${token}`
       }
     });
     
     if (res.ok) {
       alert("Funds added successfully via Stripe!");
       await fetchData(); // Fetch fresh balance
     } else {
       const errorData = await res.json().catch(() => ({}));
       console.error("Stripe capture failed:", errorData);
       alert("Failed to confirm Stripe payment.");
     }
   } catch (err) {
     console.error("Stripe capture error:", err);
   } finally {
     setLoading(false);
     window.history.replaceState({}, '', '/dashboard/wallet');
   }
 };

 const handlePayPalCapture = async (orderId: string) => {
 setLoading(true);
 try {
 const token = localStorage.getItem("token");
 const res = await fetch(`${API_BASE_URL}/wallet/capture-paypal/${orderId}`, {
 method: 'POST',
 headers: { 
 'Authorization': `Bearer ${token}`
 }
 });
 
 if (res.ok) {
 alert("Funds added successfully via PayPal!");
 fetchData();
 } else {
 alert("PayPal payment capture failed.");
 }
 } catch (err) {
 console.error("PayPal capture error:", err);
 } finally {
 setLoading(false);
 window.history.replaceState({}, '', '/dashboard/wallet');
 }
 };

  const handleDownloadPDF = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    setIsPdfGenerating(true);
    try {
      const imgData = await toPng(element, { 
        cacheBust: true, 
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node) => {
          if (node.classList && node.classList.contains('print:hidden')) {
            return false;
          }
          return true;
        }
      });
      
      const width = element.offsetWidth;
      const height = element.offsetHeight;

      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

 const handleAddFunds = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!amountToAdd || isNaN(Number(amountToAdd))) return;

 try {
 if (selectedPaymentMethod === 'stripe') {
 const { url } = await walletService.createStripeSession(Number(amountToAdd));
 window.location.href = url;
 return;
 }
 
 if (selectedPaymentMethod === 'paypal') {
 const { url } = await walletService.createCheckoutSession(Number(amountToAdd), 'paypal');
 window.location.href = url;
 return;
 }
 
 // Fallback for other methods or testing
 await walletService.addFunds(Number(amountToAdd), "Funds added by user");
 setAmountToAdd("");
 setIsAddingFunds(false);
 fetchData();
 } catch (error) {
 console.error("Error adding funds:", error);
 alert("Failed to initiate deposit. Please try again.");
 }
 };

 const handleWithdraw = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!amountToWithdraw || isNaN(Number(amountToWithdraw))) return;
 if (Number(amountToWithdraw) > balance.balance) {
 alert("Insufficient balance");
 return;
 }
 if (!payoutMethod) {
 alert("Please add a payout method first");
 setIsWithdrawing(false);
 setIsManagingPayout(true);
 return;
 }

 try {
 await walletService.requestWithdrawal(Number(amountToWithdraw));
 alert("Withdrawal request sent to admin for approval.");
 setIsWithdrawing(false);
 setAmountToWithdraw("");
 fetchData();
 } catch (err) {
 alert("Withdrawal request failed");
 }
 };

 const handleSavePayoutMethod = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 const updated = await walletService.savePayoutMethod(bankDetails);
 setPayoutMethod(updated);
 setIsManagingPayout(false);
 setIsAddingBankInWithdraw(false);
 alert("Payout method saved successfully");
 } catch (err) {
 alert("Failed to save payout method");
 }
 };

 const getSourceIcon = (source: string) => {
 switch (source) {
 case "admin": return <ShieldCheck className="text-purple-500" size={16} />;
 case "booking": return <CreditCard className="text-blue-500" size={16} />;
 case "refund": return <Zap className="text-green-500" size={16} />;
 default: return <DollarSign className="text-gray-500" size={16} />;
 }
 };

 const defaultCurrencyObj = currencies.find(c => c.exchangeRate === 1) || { symbol: '$', code: 'USD' };

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[60vh]">
 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
 </div>
 );
 }

 return (
    <div className="relative space-y-6 animate-in fade-in duration-700 pb-10 min-h-screen bg-white dark:bg-black p-6 rounded-app border border-slate-100 dark:border-white/10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            {t('dashboard.wallet.title') || "Digital Wallet"}
          </h1>
          <p className="text-slate-500 dark:text-slate-300 text-[13px]">
            {t('dashboard.wallet.subtitle') || "Manage your funds, track earnings and booking transactions."}
          </p>
        </div>
 
 <div className="flex items-center gap-2">
 <Button 
 onClick={() => setIsWithdrawing(true)}
 variant="ghost"
 className="h-10 px-4 rounded-app bg-slate-100 dark:bg-white/20 !important text-slate-600 dark:text-white !important hover:bg-slate-200 dark:hover:bg-white/30 transition-all text-xs font-semibold flex items-center gap-2 border border-slate-200 dark:border-white/40"
 >
 <ArrowUpRight size={14} className="dark:text-white" />
 <span className="dark:text-white !important">{t('dashboard.wallet.withdraw_funds') || "Withdraw"}</span>
 </Button>
 <Button 
 onClick={() => setIsAddingFunds(true)}
 className="h-10 px-6 rounded-app bg-primary hover:bg-primary-hover text-white transition-all active:scale-95 flex items-center gap-2 group"
 >
 <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
 <span className="text-xs font-semibold text-white">{t('dashboard.wallet.add_funds')}</span>
 </Button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
 {/* Main Content Area */}
 <div className="lg:col-span-7 space-y-4">
 {/* Simple Balance Section */}
 <div className="bg-white dark:bg-black rounded-app border border-slate-100 dark:border-white/20 p-6 flex flex-col items-center text-center space-y-3 relative overflow-hidden group min-h-[180px] justify-center">
 <div className="w-12 h-12 rounded-app bg-slate-50 dark:bg-white/10 flex items-center justify-center text-primary border border-slate-100 dark:border-white/20">
 <Wallet size={20} />
 </div>

 <div className="space-y-1">
 <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{t('dashboard.wallet.available_balance') || "Available Balance"}</p>
 <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
 {balance ? formatPrice(balance.balance, { code: balance.currency, exchangeRate: 1 }) : formatPrice(0)}
 </h2>
 </div>

 <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-app border border-slate-100 dark:border-slate-800">
 <ShieldCheck size={12} className="text-emerald-500" />
 <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('dashboard.wallet.secured_by')}</span>
 </div>
 </div>

  {/* Quick Stats */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div className="bg-white dark:bg-black p-6 rounded-app border border-slate-100 dark:border-white/20 flex items-center gap-4 group hover:border-primary/20 transition-all">
  <div className="w-14 h-14 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
  <TrendingUp size={24} />
  </div>
  <div className="space-y-1">
  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Earnings</p>
  <p className="text-xl font-bold text-slate-900 dark:text-white">{formatPrice(stats.totalEarnings, { code: balance.currency, exchangeRate: 1 })}</p>
  </div>
  </div>
  <div className="bg-white dark:bg-black p-6 rounded-app border border-slate-100 dark:border-white/20 flex items-center gap-4 group hover:border-primary/20 transition-all">
  <div className="w-14 h-14 rounded-[1.5rem] bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
  <Banknote size={24} />
  </div>
  <div className="space-y-1">
  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Payouts</p>
  <p className="text-xl font-bold text-slate-900 dark:text-white">{formatPrice(stats.pendingPayouts, { code: balance.currency, exchangeRate: 1 })}</p>
  </div>
  </div>
  </div>

 {/* Payout Methods Section */}
 <div className="bg-white dark:bg-black rounded-app border border-slate-100 dark:border-white/20 overflow-hidden ">
 <div className="p-5 border-b border-slate-100 dark:border-white/20 flex items-center justify-between bg-slate-50/50 dark:bg-white/10">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-app bg-white dark:bg-white/10 text-primary flex items-center justify-center border border-slate-100 dark:border-white/20">
 <CreditCard size={18} />
 </div>
 <div>
 <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('dashboard.wallet.payout_methods') || "Payout Methods"}</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.wallet.manage_bank') || "Manage your bank details"}</p>
 </div>
 </div>
 <Button 
 onClick={() => setIsManagingPayout(true)}
 variant="ghost" 
 className="h-8 px-4 rounded-app bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold"
 >
 {payoutMethod ? "Update" : "Link Account"}
 </Button>
 </div>
 
 <div className="p-6">
 {payoutMethod ? (
 <div className="flex items-center justify-between bg-white dark:bg-white/10 p-6 rounded-app border border-slate-100 dark:border-white/20">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-app bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
 <ShieldCheck size={20} />
 </div>
 <div>
 <p className="text-sm font-bold text-slate-900 dark:text-white">{payoutMethod.bankName}</p>
 <p className="text-xs text-slate-500 dark:text-slate-400">**** {payoutMethod.accountNumber.slice(-4)}</p>
 </div>
 </div>
 <div className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-app -500/20">
 Verified
 </div>
 </div>
 ) : (
 <div className="py-8 text-center flex flex-col items-center gap-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-app bg-white/50 dark:bg-slate-900/20">
 <div className="w-12 h-12 rounded-app bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-600">
 <Plus size={24} />
 </div>
 <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Connect a payout destination</p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Side History */}
 <div className="lg:col-span-5">
 <div className="bg-white dark:bg-black rounded-app border border-slate-100 dark:border-white/20 p-6 h-full flex flex-col min-h-[500px] ">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-white/20">
 <History size={18} />
 </div>
 <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('dashboard.wallet.recent_activity')}</h3>
 </div>
 </div>

 <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
 {transactions.length === 0 ? (
 <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
 <div className="w-20 h-20 rounded-app bg-slate-50 dark:bg-white/10 flex items-center justify-center text-slate-200 dark:text-slate-700">
 <History size={40} />
 </div>
 <p className="text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">{t('dashboard.wallet.no_activities')}</p>
 </div>
 ) : (
 transactions.map((tx: any) => (
 <div 
 key={tx._id} 
 className="p-4 rounded-app bg-white dark:bg-black border border-slate-100 dark:border-white/20 hover:border-primary/20 dark:hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group flex items-center gap-4"
 >
 <div className={`w-10 h-10 rounded-app flex items-center justify-center shrink-0 ${
 tx.type === 'credit' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
 }`}>
 {tx.type === 'credit' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
 </div>
 
 <div className="flex-1 min-w-0">
 <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1">{tx.description || 'Transaction'}</p>
 <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{new Date(tx.createdAt).toLocaleDateString()}</p>
 </div>

 <div className="flex items-center gap-3">
 <div className="text-right flex flex-col items-end gap-1">
 <p className={`text-sm font-bold tracking-tight ${
 tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
 }`}>
 {tx.type === 'credit' ? '+' : '-'}{formatPrice(tx.amount, { code: balance.currency, exchangeRate: 1 })}
 </p>
 {tx.status && (
 <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
 tx.status === 'pending' || tx.status === 'SUCCESS' || tx.status === 'approved' ? 
 (tx.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30') :
 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
 }`}>
 {tx.status}
 </span>
 )}
 </div>
 <Button 
 onClick={() => setViewingInvoice(tx)}
 variant="ghost" 
 className="h-8 w-8 p-0 rounded-app bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-primary transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
 >
 <FileText size={16} />
 </Button>
 </div>
 </div>
 ))
 )}
 </div>

 <Button 
                    onClick={() => {
                      console.log("Opening Statement Modal");
                      setIsViewingAll(true);
                    }}
                    className="w-full h-14 mt-8 rounded-app border-2 border-slate-100 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('dashboard.wallet.view_all')}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
 </div>
 </div>
 </div>

 {/* Add Funds Modal/Overlay */}
 {isAddingFunds && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 animate-in fade-in duration-300">
 <div className="bg-white rounded-app w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col ">
 <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50 shrink-0">
 <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('dashboard.wallet.deposit_funds').split(' ')[0]} <span className="text-primary italic">{t('dashboard.wallet.deposit_funds').split(' ')[1]}</span></h2>
 <Button 
 onClick={() => setIsAddingFunds(false)}
 variant="ghost" 
 className="h-10 w-10 p-0 rounded-app hover:bg-slate-100"
 >
 <X size={20} className="text-slate-400" />
 </Button>
 </div>

 <form onSubmit={handleAddFunds} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
 <div className="space-y-4">
 <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{t('dashboard.wallet.amount_to_deposit')} ({defaultCurrencyObj.code})</label>
 <div className="relative group">
 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-primary transition-colors">{defaultCurrencyObj.symbol}</div>
 <input 
 type="number"
 value={amountToAdd}
 onChange={(e) => setAmountToAdd(e.target.value)}
 placeholder="0.00"
 className="w-full h-20 bg-slate-50 border-2 border-slate-50 rounded-app pl-14 pr-10 text-3xl font-black text-slate-900 placeholder:text-slate-200 focus:bg-white focus:border-primary transition-all outline-none"
 autoFocus
 />
 </div>
 </div>

 <div className="grid grid-cols-4 gap-3">
 {[50, 100, 500, 1000].map(amt => (
 <button 
 key={amt}
 type="button"
 onClick={() => setAmountToAdd(amt.toString())}
 className="h-12 rounded-app bg-slate-50 hover:bg-primary/5 text-slate-500 hover:text-primary border-2 border-transparent hover:border-primary/20 transition-all text-xs font-black"
 >
 +{defaultCurrencyObj.symbol}{amt}
 </button>
 ))}
 </div>

 <div className="space-y-4">
 <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Select Payment Method</label>
 <div className="grid grid-cols-2 gap-4">
 <button 
 type="button"
 onClick={() => setSelectedPaymentMethod("stripe")}
 className={`p-4 rounded-app border-2 transition-all flex flex-col items-center gap-2 ${selectedPaymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}
 >
 <CreditCard size={20} className={selectedPaymentMethod === 'stripe' ? 'text-primary' : 'text-slate-400'} />
 <span className={`text-[10px] font-black uppercase tracking-widest ${selectedPaymentMethod === 'stripe' ? 'text-primary' : 'text-slate-400'}`}>Stripe</span>
 </button>
 <button 
 type="button"
 onClick={() => setSelectedPaymentMethod("paypal")}
 className={`p-4 rounded-app border-2 transition-all flex flex-col items-center gap-2 ${selectedPaymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}
 >
 <div className="font-black italic text-xl flex items-center gap-0.5">
 <span className={selectedPaymentMethod === 'paypal' ? 'text-[#003087]' : 'text-slate-300'}>Pay</span>
 <span className={selectedPaymentMethod === 'paypal' ? 'text-[#009cde]' : 'text-slate-300'}>Pal</span>
 </div>
 <span className={`text-[10px] font-black uppercase tracking-widest ${selectedPaymentMethod === 'paypal' ? 'text-primary' : 'text-slate-400'}`}>PayPal</span>
 </button>
 </div>
 </div>

 <Button 
 type="submit"
 className="w-full h-16 rounded-app bg-primary hover:bg-primary-hover text-white transition-all font-black uppercase tracking-widest text-xs"
 >
 {selectedPaymentMethod === 'paypal' ? 'Pay with PayPal' : t('dashboard.wallet.confirm_deposit')}
 </Button>

 <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
 {t('dashboard.wallet.terms')}
 </p>
 </form>
 </div>
 </div>
 )}

      {/* Full Statement Modal */}
      {isViewingAll && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsViewingAll(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-app w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col border border-slate-100 dark:border-white/10 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 pt-8 pb-6 flex justify-between items-center border-b border-slate-50 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-app bg-slate-50 dark:bg-white/10 flex items-center justify-center text-primary border border-slate-100 dark:border-white/10">
                  <History size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('dashboard.wallet.view_all')}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Full Transaction History</p>
                </div>
              </div>
              <Button 
                onClick={() => setIsViewingAll(false)}
                variant="ghost" 
                className="h-10 w-10 p-0 rounded-app hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={20} className="text-slate-400" />
              </Button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="rounded-app border border-slate-100 dark:border-white/10 overflow-hidden bg-white dark:bg-black">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-sm">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx: any) => (
                        <tr key={tx._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-app flex items-center justify-center shrink-0 ${
                                tx.type === 'credit' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}>
                                {tx.type === 'credit' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{tx.description || 'Transaction'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border inline-block ${
                              tx.status === 'pending' || tx.status === 'SUCCESS' || tx.status === 'approved' ? 
                              (tx.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30') :
                              'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-black tracking-tight ${
                              tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                            }`}>
                              {tx.type === 'credit' ? '+' : '-'}{formatPrice(tx.amount, { code: balance.currency, exchangeRate: 1 })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Button 
                              onClick={() => {
                                setViewingInvoice(tx);
                                // Don't close setIsViewingAll here, so they can go back
                              }}
                              variant="ghost" 
                              className="h-8 w-8 p-0 rounded-app bg-slate-50 dark:bg-white/10 text-slate-400 hover:text-primary transition-all"
                            >
                              <FileText size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

 {/* Withdraw Funds Modal */}
 {isWithdrawing && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 animate-in fade-in duration-300">
 <div className="bg-white rounded-app w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col ">
 <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50 shrink-0">
 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Withdraw <span className="text-primary italic">Funds</span></h2>
 <Button onClick={() => setIsWithdrawing(false)} variant="ghost" className="h-10 w-10 p-0 rounded-app hover:bg-slate-100">
 <X size={20} className="text-slate-400" />
 </Button>
 </div>

 <form onSubmit={handleWithdraw} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
 <div className="space-y-4">
 <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Amount to Withdraw ({balance.currency})</label>
 <div className="relative group">
 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-primary transition-colors">{userCurrency.symbol || '$'}</div>
 <input 
 type="number"
 min="0"
 onKeyDown={(e) => {
 if (e.key === '-' || e.key === 'e') e.preventDefault();
 }}
 value={amountToWithdraw}
 onChange={(e) => {
 const val = e.target.value;
 if (parseFloat(val) < 0) return;
 setAmountToWithdraw(val);
 }}
 placeholder="0.00"
 className={`w-full h-20 bg-slate-50 border-2 rounded-app pl-14 pr-10 text-3xl font-black text-slate-900 placeholder:text-slate-200 focus:bg-white transition-all outline-none ${
 amountToWithdraw && parseFloat(amountToWithdraw) > balance.balance ? 'border-rose-500 bg-rose-50/30' : 'border-slate-50 focus:border-primary'
 }`}
 autoFocus
 />
 </div>
 <div className="flex justify-between px-2">
 <span className={`text-[10px] font-bold uppercase tracking-widest ${amountToWithdraw && parseFloat(amountToWithdraw) > balance.balance ? 'text-rose-500' : 'text-slate-400'}`}>
 {amountToWithdraw && parseFloat(amountToWithdraw) > balance.balance ? 'Amount exceeds available balance' : `Available: ${formatPrice(balance.balance)}`}
 </span>
 <button type="button" onClick={() => setAmountToWithdraw(balance.balance.toString())} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Withdraw All</button>
 </div>
 </div>

 {!payoutMethod && !isAddingBankInWithdraw && (
 <div className="p-8 text-center flex flex-col items-center gap-4 border-2 border-dashed border-slate-200 rounded-app bg-slate-50/50">
 <Banknote className="text-slate-300" size={32} />
 <div className="space-y-1">
 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
 No bank account linked
 </p>
 <Button 
 type="button"
 onClick={() => setIsAddingBankInWithdraw(true)}
 className="h-8 px-4 rounded-app bg-primary text-white text-[9px] font-black uppercase tracking-widest"
 >
 Add Bank Details
 </Button>
 </div>
 </div>
 )}

 {isAddingBankInWithdraw && (
 <div className="p-6 bg-slate-50 rounded-app border border-slate-100 space-y-6 animate-in slide-in-from-bottom-2 duration-500">
 <div className="flex items-center justify-between">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter Bank Details</p>
 <button onClick={() => setIsAddingBankInWithdraw(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
 <X size={14} />
 </button>
 </div>
 
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bank Name</label>
 <input 
 value={bankDetails.bankName}
 onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})}
 className="w-full h-10 bg-white border border-slate-100 rounded-app px-3 text-xs font-bold outline-none focus:border-primary"
 placeholder="Chase Bank"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Holder Name</label>
 <input 
 value={bankDetails.accountName}
 onChange={e => {
 const val = e.target.value.replace(/[0-9]/g, '');
 setBankDetails({...bankDetails, accountName: val});
 }}
 className="w-full h-10 bg-white border border-slate-100 rounded-app px-3 text-xs font-bold outline-none focus:border-primary"
 placeholder="Full Name"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Number</label>
 <input 
 value={bankDetails.accountNumber}
 onChange={e => {
 const val = e.target.value.replace(/\D/g, '');
 setBankDetails({...bankDetails, accountNumber: val});
 }}
 className="w-full h-10 bg-white border border-slate-100 rounded-app px-3 text-xs font-bold outline-none focus:border-primary"
 placeholder="00000000"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IFSC Code</label>
 <input 
 value={bankDetails.ifscCode}
 onChange={e => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
 className="w-full h-10 bg-white border border-slate-100 rounded-app px-3 text-xs font-bold outline-none focus:border-primary"
 placeholder="HDFC0001"
 />
 </div>
 </div>
 <Button 
 onClick={handleSavePayoutMethod}
 className="w-full h-10 rounded-app bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest"
 >
 Save and Continue
 </Button>
 </div>
 </div>
 )}

 <Button 
 type="submit"
 disabled={!amountToWithdraw || parseFloat(amountToWithdraw) <= 0 || parseFloat(amountToWithdraw) > balance.balance || !payoutMethod}
 className="w-full h-16 rounded-app bg-primary hover:bg-primary-hover text-white transition-all font-black uppercase tracking-widest text-xs disabled:opacity-50"
 >
 Confirm Withdrawal
 </Button>
 </form>
 </div>
 </div>
 )}

 {/* Payout Method (Bank Details) Modal */}
 {isManagingPayout && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 animate-in fade-in duration-300">
 <div className="bg-white rounded-app w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col ">
 <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50 shrink-0">
 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payout <span className="text-primary italic">Settings</span></h2>
 <Button onClick={() => setIsManagingPayout(false)} variant="ghost" className="h-10 w-10 p-0 rounded-app hover:bg-slate-100">
 <X size={20} className="text-slate-400" />
 </Button>
 </div>

 <form onSubmit={handleSavePayoutMethod} className="p-10 space-y-6 overflow-y-auto custom-scrollbar">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
 <input 
 value={bankDetails.bankName}
 onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})}
 className="w-full h-12 bg-slate-50 border border-slate-100 rounded-app px-4 font-bold text-sm focus:bg-white focus:border-primary transition-all outline-none"
 placeholder="e.g. Chase Bank"
 required
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Holder Name</label>
 <input 
 value={bankDetails.accountName}
 onChange={e => {
 const val = e.target.value.replace(/[0-9]/g, '');
 setBankDetails({...bankDetails, accountName: val});
 }}
 className="w-full h-12 bg-slate-50 border border-slate-100 rounded-app px-4 font-bold text-sm focus:bg-white focus:border-primary transition-all outline-none"
 placeholder="Full Name"
 required
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
 <input 
 type="text"
 value={bankDetails.accountNumber}
 onChange={e => {
 const val = e.target.value.replace(/\D/g, '');
 setBankDetails({...bankDetails, accountNumber: val});
 }}
 className="w-full h-12 bg-slate-50 border border-slate-100 rounded-app px-4 font-bold text-sm focus:bg-white focus:border-primary transition-all outline-none"
 placeholder="0000000000"
 required
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
 <input 
 value={bankDetails.ifscCode}
 onChange={e => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
 className="w-full h-12 bg-slate-50 border border-slate-100 rounded-app px-4 font-bold text-sm focus:bg-white focus:border-primary transition-all outline-none"
 placeholder="HDFC0001234"
 required
 />
 </div>
 </div>

 <div className="pt-4">
 <Button 
 type="submit"
 className="w-full h-16 rounded-app bg-primary hover:bg-primary-hover text-white transition-all font-black uppercase tracking-widest text-xs"
 >
 Save Payout Method
  </Button>
  </div>
  </form>
  </div>
  </div>
  )}

 {/* Invoice Modal */}
{viewingInvoice && (
 <div 
   className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm transition-all duration-300"
   onClick={() => setViewingInvoice(null)}
 >
   <div 
     id="wallet-invoice-print-area"
     className="bg-white dark:bg-slate-900 rounded-app w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-slate-100 dark:border-white/10 relative"
     onClick={(e) => e.stopPropagation()}
   >
     {isPdfGenerating && (
       <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center print:hidden">
         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
       </div>
     )}
 <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-app bg-primary flex items-center justify-center text-white">
 <FileText size={24} />
 </div>
 <div>
 <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Invoice</h3>
 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">#{viewingInvoice._id?.slice(-8).toUpperCase()}</p>
 </div>
 </div>
 <div className="flex items-center gap-2 print:hidden">
 <Button 
 onClick={() => handleDownloadPDF('wallet-invoice-print-area', `Wallet-Invoice-${viewingInvoice._id?.slice(-8).toUpperCase()}.pdf`)}
 variant="outline" 
 disabled={isPdfGenerating}
 className="h-10 px-6 rounded-app border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
 >
 <Download size={14} />
 {isPdfGenerating ? 'GENERATING...' : 'Download PDF'}
 </Button>
 <Button 
 onClick={() => setViewingInvoice(null)}
 variant="ghost" 
 className="h-10 w-10 p-0 rounded-app hover:bg-slate-200"
 >
 <X size={20} className="text-slate-400" />
 </Button>
 </div>
 </div>

 <div className="p-10 space-y-8 print:p-0 overflow-y-auto custom-scrollbar">
 <div className="flex justify-between items-start">
 <div className="space-y-4">
 <div>
 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Billed To</p>
 <p className="font-black text-slate-900">{user?.displayName || user?.firstName}</p>
 <p className="text-xs text-slate-500">{user?.email}</p>
 </div>
 <div>
 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Provider</p>
 <p className="font-black text-slate-900">Rentify Car Rentals Ltd.</p>
 <p className="text-xs text-slate-500">finance@rentify.io</p>
 </div>
 </div>
 <div className="text-right space-y-4">
 <div>
 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Issue Date</p>
 <p className="font-black text-slate-900">{new Date(viewingInvoice.createdAt).toLocaleDateString()}</p>
 </div>
 <div>
 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Status</p>
 <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Paid</span>
 </div>
 </div>
 </div>

 {viewingInvoice.status === 'rejected' && viewingInvoice.rejectionReason && (
 <div className="p-6 bg-rose-50 rounded-app border border-rose-100">
 <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-1">Rejection Reason</p>
 <p className="text-sm font-bold text-rose-600 italic">"{viewingInvoice.rejectionReason}"</p>
 </div>
 )}

 <div className="rounded-app border border-slate-100 overflow-hidden">
 <table className="w-full text-left">
 <thead className="bg-slate-50 border-b border-slate-100">
 <tr>
 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50 text-sm">
 <tr>
 <td className="px-6 py-4 font-bold text-slate-700">{viewingInvoice.description}</td>
 <td className="px-6 py-4 font-black text-slate-900 text-right">{formatPrice(viewingInvoice.amount)}</td>
 </tr>
 </tbody>
 </table>
 </div>

 <div className="flex justify-end pt-4">
 <div className="w-64 space-y-3">
 <div className="flex justify-between items-center text-xs">
 <span className="text-slate-400 font-bold uppercase tracking-widest">Subtotal</span>
 <span className="font-black text-slate-900">{formatPrice(viewingInvoice.amount)}</span>
 </div>
 <div className="flex justify-between items-center text-xs">
 <span className="text-slate-400 font-bold uppercase tracking-widest">Tax (0%)</span>
 <span className="font-black text-slate-900">{formatPrice(0)}</span>
 </div>
 <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
 <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Total</span>
 <span className="text-xl font-black text-primary">{formatPrice(viewingInvoice.amount)}</span>
 </div>
 </div>
 </div>
 </div>
 <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Thank you for using Rentify Car Rentals</p>
 </div>
 </div>
 </div>
 )}

 <style jsx>{`
 .custom-scrollbar::-webkit-scrollbar {
 width: 4px;
 }
 .custom-scrollbar::-webkit-scrollbar-track {
 background: #f8fafc;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb {
 background: #e2e8f0;
 border-radius: 10px;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover {
 background: #cbd5e1;
 }
 `}</style>
 </div>
 );
}
