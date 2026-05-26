"use client";

import React, { useEffect, useState } from "react";
import { 
 Banknote, 
 CheckCircle2, 
 XCircle, 
 Clock, 
 Search, 
 Filter,
 User,
 ArrowUpRight,
 ChevronRight,
 MessageSquare,
 ShieldCheck,
 X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/LocaleContext";
import { walletService } from "@/services/walletService";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminWithdrawalsView() {
 const { formatPrice } = useLocale();
 const [requests, setRequests] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [fetchError, setFetchError] = useState<string | null>(null);
 const [searchTerm, setSearchTerm] = useState("");
 const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
 const [selectedRequest, setSelectedRequest] = useState<any>(null);
 const [rejectionReason, setRejectionReason] = useState("");
 const [isRejecting, setIsRejecting] = useState(false);

 useEffect(() => {
 fetchRequests();
 }, []);

 const fetchRequests = async () => {
 setLoading(true);
 setFetchError(null);
 try {
 const data = await walletService.getWithdrawalRequests();
 console.log('[AdminWithdrawals] Fetched', data.length, 'records:', data);
 setRequests(data);
 } catch (err: any) {
 console.error("Failed to fetch withdrawal requests:", err);
 setFetchError(err?.message || 'Failed to load withdrawal requests');
 setRequests([]);
 } finally {
 setLoading(false);
 }
 };

 const handleApprove = async (id: string) => {
 if (!confirm("Are you sure you want to approve this withdrawal?")) return;
 try {
 await walletService.approveWithdrawal(id);
 fetchRequests();
 } catch (err) {
 alert("Failed to approve withdrawal");
 }
 };

 const handleReject = async () => {
 if (!rejectionReason) return alert("Please provide a reason for rejection");
 try {
 await walletService.rejectWithdrawal(selectedRequest._id, rejectionReason);
 setIsRejecting(false);
 setRejectionReason("");
 setSelectedRequest(null);
 fetchRequests();
 } catch (err) {
 alert("Failed to reject withdrawal");
 }
 };

 const filteredRequests = requests.filter(req => {
 if (!req.user) return false;
 const matchesSearch = searchTerm === '' ||
 (req.user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
 (req.user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
 const matchesFilter = filter === "all" || req.status === filter;
 return matchesSearch && matchesFilter;
 });

 return (
 <div className="space-y-6 animate-in fade-in duration-700">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div className="space-y-1">
 <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Withdrawal <span className="text-primary italic">Requests</span></h1>
 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Manage and process user fund transfers</p>
 </div>
 
 <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
 <div className="relative w-full md:w-64">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
 <input 
 type="text"
 placeholder="Search users..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="h-11 pl-9 pr-4 bg-white border border-slate-100 rounded-app text-xs font-bold focus:outline-none focus:border-primary transition-all w-full"
 />
 </div>
 <select 
 value={filter}
 onChange={(e) => setFilter(e.target.value)}
 className="h-11 w-full md:w-40 px-4 bg-white border border-slate-100 rounded-app text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer focus:border-primary transition-all"
 >
 <option value="all">All Status</option>
 <option value="pending">Pending</option>
 <option value="success">Approved</option>
 <option value="failed">Rejected</option>
 </select>
 </div>
 </div>

 <div className="bg-white rounded-app border border-slate-100 overflow-hidden ">
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-100">
 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User / Transmission</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Method</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50">
 {loading ? (
 <tr>
 <td colSpan={5} className="py-20 text-center">
 <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
 </td>
 </tr>
 ) : fetchError ? (
 <tr>
 <td colSpan={5} className="py-20 text-center">
 <XCircle className="mx-auto text-rose-300 mb-3" size={40} />
 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">{fetchError}</p>
 <button onClick={fetchRequests} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Retry</button>
 </td>
 </tr>
 ) : filteredRequests.length === 0 ? (
 <tr>
 <td colSpan={5} className="py-20 text-center">
 <Banknote className="mx-auto text-slate-200 mb-3" size={40} />
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No withdrawal requests found</p>
 </td>
 </tr>
 ) : (
 filteredRequests.map((req) => (
 <tr key={req._id} className="hover:bg-slate-50/50 transition-colors group">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-app bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs uppercase">
 {req.user.firstName[0]}{req.user.lastName[0]}
 </div>
 <div>
 <p className="text-sm font-black text-slate-900 tracking-tight">{req.user.firstName} {req.user.lastName}</p>
 <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(req.createdAt).toLocaleDateString()}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4 text-center">
 <div className="inline-flex flex-col items-center">
 <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{req.bankDetails?.bankName}</p>
 <p className="text-[8px] text-slate-400 font-bold">{req.bankDetails?.accountNumber}</p>
 </div>
 </td>
 <td className="px-6 py-4 text-right">
 <span className="text-sm font-black text-slate-900">{formatPrice(req.amount)}</span>
 </td>
 <td className="px-6 py-4 text-center">
 <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
 req.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
 req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
 'bg-rose-50 text-rose-600 border border-rose-100'
 }`}>
 {req.status}
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 {req.status === 'pending' ? (
 <div className="flex items-center justify-end gap-2">
 <Button 
 onClick={() => handleApprove(req._id)}
 className="h-8 px-3 rounded-app bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
 >
 <CheckCircle2 size={12} />
 Approve
 </Button>
 <Button 
 onClick={() => { setSelectedRequest(req); setIsRejecting(true); }}
 className="h-8 px-3 rounded-app bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
 >
 <XCircle size={12} />
 Reject
 </Button>
 </div>
 ) : (
 <Button variant="ghost" className="h-8 w-8 p-0 text-slate-300">
 <ChevronRight size={14} />
 </Button>
 )}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Rejection Modal */}
 {isRejecting && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 animate-in fade-in duration-300">
 <div className="bg-white rounded-app w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500 ">
 <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50">
 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reject <span className="text-rose-500 italic">Request</span></h2>
 <Button onClick={() => { setIsRejecting(false); setSelectedRequest(null); }} variant="ghost" className="h-10 w-10 p-0 rounded-app hover:bg-slate-100">
 <X size={20} className="text-slate-400" />
 </Button>
 </div>

 <div className="p-10 space-y-6">
 <div className="p-4 bg-slate-50 rounded-app border border-slate-100">
 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Request Details</p>
 <p className="text-sm font-black text-slate-900">{selectedRequest?.user.firstName} {selectedRequest?.user.lastName}</p>
 <p className="text-xs font-bold text-primary">{formatPrice(selectedRequest?.amount)}</p>
 </div>

 <div className="space-y-3">
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Rejection</label>
 <textarea 
 value={rejectionReason}
 onChange={(e) => setRejectionReason(e.target.value)}
 placeholder="e.g. Insufficient identification provided..."
 className="w-full h-32 bg-slate-50 border border-slate-100 rounded-app p-4 text-sm font-bold focus:bg-white focus:border-rose-500 transition-all outline-none resize-none"
 />
 </div>

 <Button 
 onClick={handleReject}
 className="w-full h-14 rounded-app bg-rose-500 hover:bg-rose-600 text-white transition-all font-black uppercase tracking-widest text-xs"
 >
 Confirm Rejection
 </Button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
