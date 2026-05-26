"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 ShieldCheck, 
 Search, 
 Filter, 
 CheckCircle2, 
 XCircle, 
 Clock, 
 Eye, 
 User, 
 FileText,
 AlertCircle,
 Loader2,
 ExternalLink,
 MessageSquare
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import Modal from "../../components/ui/modal";
import { API_BASE_URL, BACKEND_URL, getImageUrl } from "@/config/api";
import { authService } from "@/services/authService";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";

import { useSearchParams } from "next/navigation";

export default function AdminVerificationView() {
 const draggable = useDraggableScroll();
 const searchParams = useSearchParams();
 const [submissions, setSubmissions] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState(searchParams.get('search') || "");
 const [selectedTab, setSelectedTab] = useState("All");
 const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
 const [isPreviewOpen, setIsPreviewOpen] = useState(false);
 const [adminNote, setAdminNote] = useState("");
 const [processing, setProcessing] = useState(false);
 const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

 useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (fullImageUrl) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [fullImageUrl]);

 const fetchSubmissions = async () => {
 setLoading(true);
 try {
 const token = authService.getAdminToken();
 const res = await fetch(`${API_BASE_URL}/verification`, {
 headers: { Authorization: `Bearer ${token}` },
 });
 
 if (res.ok) {
 const data = await res.json();
 console.log("Fetched submissions:", data.length);
 setSubmissions(data);
 } else {
 const errText = await res.text();
 console.error(`Fetch failed (${res.status}):`, errText);
 if (res.status === 401) {
 authService.adminLogout();
 return;
 }
 if (res.status === 403) {
 alert("Access Denied: Admin session may have expired or role is insufficient.");
 }
 }
 } catch (err) {
 console.error("Failed to fetch verifications:", err);
 } finally {
 setLoading(false);
 }
 };

 const handleApprove = async () => {
 if (!selectedSubmission) return;
 setProcessing(true);
 try {
 const res = await fetch(`${API_BASE_URL}/verification/${selectedSubmission._id}/approve`, {
 method: "PATCH",
 headers: { 
 "Content-Type": "application/json",
 Authorization: `Bearer ${authService.getAdminToken()}` 
 },
 body: JSON.stringify({ adminNote }),
 });
 if (res.ok) {
 setIsPreviewOpen(false);
 fetchSubmissions();
 setAdminNote("");
 }
 } catch (err) {
 console.error("Approve error:", err);
 } finally {
 setProcessing(false);
 }
 };

 const handleReject = async () => {
 if (!selectedSubmission || !adminNote) {
 alert("Please provide a reason for rejection.");
 return;
 }
 setProcessing(true);
 try {
 const res = await fetch(`${API_BASE_URL}/verification/${selectedSubmission._id}/reject`, {
 method: "PATCH",
 headers: { 
 "Content-Type": "application/json",
 Authorization: `Bearer ${authService.getAdminToken()}` 
 },
 body: JSON.stringify({ adminNote }),
 });
 if (res.ok) {
 setIsPreviewOpen(false);
 fetchSubmissions();
 setAdminNote("");
 }
 } catch (err) {
 console.error("Reject error:", err);
 } finally {
 setProcessing(false);
 }
 };

 const filtered = submissions.filter(sub => {
 const firstName = sub.userId?.firstName || "";
 const lastName = sub.userId?.lastName || "";
 const email = sub.userId?.email || "";
 const status = sub.status || "";

 const matchesSearch = 
 firstName.toLowerCase().includes(search.toLowerCase()) ||
 lastName.toLowerCase().includes(search.toLowerCase()) ||
 email.toLowerCase().includes(search.toLowerCase()) ||
 status.toLowerCase().includes(search.toLowerCase());
 
 if (selectedTab === "All") return matchesSearch;
 return matchesSearch && status.toLowerCase() === selectedTab.toLowerCase();
 });

 return (
  <>
  <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6"
 >
 <Card className="rounded-app border-none overflow-hidden bg-[var(--admin-card-bg)]">
 <div className="p-8 border-b border-[var(--admin-border)] flex flex-col md:flex-row justify-between items-center gap-6 bg-[var(--admin-bg)]/20">
 <div className="relative w-full md:w-96 group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)] group-focus-within:text-primary transition-colors" />
 <Input 
 placeholder="Search by name or email..." 
 className="w-full pl-12 h-14 bg-[var(--admin-card-bg)] border-[var(--admin-border)] rounded-app focus-visible:ring-primary/20 text-sm font-bold text-[var(--admin-text-main)]"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>
 
 <div className="flex items-center bg-[var(--admin-bg)] p-1 rounded-app border border-[var(--admin-border)] h-12 w-full md:w-auto overflow-x-auto scrollbar-none">
 {["All", "Pending", "Approved", "Rejected"].map((tab) => {
 const count = tab === "All" 
 ? submissions.length 
 : submissions.filter(s => s.status?.toLowerCase() === tab.toLowerCase()).length;
 
 return (
 <button
 key={tab}
 onClick={() => setSelectedTab(tab)}
 className={`h-full px-6 rounded-app text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center whitespace-nowrap ${
 selectedTab === tab
 ? "bg-primary text-white shadow-sm"
 : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] hover:bg-white/50"
 }`}
 >
 {tab} {count > 0 && <span className={`ml-2 ${selectedTab === tab ? 'text-white/60' : 'text-[var(--admin-text-muted)]/50'}`}>({count})</span>}
 </button>
 );
 })}
 </div>
 </div>

 <div className="p-4">
 {loading ? (
 <div className="py-24 flex flex-col items-center gap-4">
 <Loader2 className="w-10 h-10 text-primary animate-spin" />
 <p className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Querying Identity Registry...</p>
 </div>
 ) : filtered.length > 0 ? (
 <div {...draggable} className="w-full overflow-x-auto custom-scrollbar border border-[var(--admin-border)] rounded-app">
 <table className="w-full text-left border-collapse relative min-w-[1000px]">
 <thead className="bg-white ">
 <tr className="bg-[var(--admin-bg)]/80 backdrop-blur-md border-b border-[var(--admin-border)]">
 <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Principal</th>
 <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Documents</th>
 <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Submitted At</th>
 <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Status</th>
 <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y admin-dash-border">
 {filtered.map((sub, i) => (
 <motion.tr 
 key={sub._id}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: i * 0.05 }}
 className="group hover:bg-[var(--admin-bg)]/50 transition-colors"
 >
 <td className="p-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-app bg-white border border-[var(--admin-border)] flex items-center justify-center text-primary overflow-hidden font-black uppercase">
 {sub.userId?.profileImage ? <img src={sub.userId.profileImage} className="w-full h-full object-cover" /> : <User size={20} />}
 </div>
 <div>
 <div className="font-black text-[var(--admin-text-main)] text-sm tracking-tight">{sub.userId?.firstName} {sub.userId?.lastName}</div>
 <div className="text-[10px] font-bold text-[var(--admin-text-muted)] tracking-wider truncate max-w-[200px]">{sub.userId?.email}</div>
 </div>
 </div>
 </td>
 <td className="p-6">
 <div className="flex items-center gap-2">
 <Badge className="bg-[var(--admin-bg)] text-[var(--admin-text-muted)] border-none font-black text-[9px] px-3 py-1 uppercase">{sub.documents?.length || 0} Assets</Badge>
 </div>
 </td>
 <td className="p-6 text-[var(--admin-text-muted)] text-[11px] font-bold">
 {new Date(sub.createdAt).toLocaleString()}
 </td>
 <td className="p-6">
 <Badge className={`h-8 px-4 rounded-app font-black uppercase text-[9px] tracking-widest border-none ${sub.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : sub.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
 {sub.status}
 </Badge>
 </td>
 <td className="p-6 text-right">
 <Button 
 onClick={() => {
 setSelectedSubmission(sub);
 setIsPreviewOpen(true);
 setAdminNote(sub.adminNote || "");
 }}
 className="h-10 px-5 rounded-app bg-[var(--admin-text-main)] hover:opacity-90 text-[var(--admin-card-bg)] border-none font-black uppercase text-[9px] tracking-widest gap-2"
 >
 <Eye size={14} /> Review
 </Button>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <div className="py-32 text-center text-[var(--admin-text-muted)]">
 <ShieldCheck size={64} className="mx-auto mb-6 opacity-10" />
 <p className="text-xl font-black text-[var(--admin-text-muted)]/50 uppercase tracking-widest">No Identities to Govern</p>
 </div>
 )}
 </div>
 </Card>

 {/* Review Modal */}
 <Modal 
 isOpen={isPreviewOpen} 
 onClose={() => setIsPreviewOpen(false)}
 title="Verification Review"
 description={`Identity Analysis for ${selectedSubmission?.userId?.firstName || 'User'}`}
 icon={<ShieldCheck size={24} className="text-primary" />}
 maxWidth="max-w-4xl"
 >
 {selectedSubmission && (
 <div className="space-y-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {selectedSubmission.documents.map((doc: any) => (
 <div key={doc.fieldId} className="space-y-3">
 <p className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">{doc.fieldName}</p>
 {doc.fieldType === 'image' ? (
 <>
 <div 
 onClick={() => setFullImageUrl(getImageUrl(doc.value))}
 className="relative aspect-video bg-[var(--admin-bg)] rounded-app overflow-hidden border border-[var(--admin-border)] group cursor-zoom-in"
 >
 <img 
 src={getImageUrl(doc.value)} 
 className="w-full h-full object-cover transition-transform group-hover:scale-105" 
 alt={doc.fieldName} 
 />
 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white font-black text-[10px] uppercase tracking-widest gap-2">
 <Eye size={16} /> Click to Inspect
 </div>
 </div>
 <p className="text-[8px] text-rose-500 break-all">{getImageUrl(doc.value)}</p>
 </>
 ) : (
 <div className="p-4 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-app font-black text-[var(--admin-text-main)]">
 {doc.value}
 </div>
 )}
 </div>
 ))}
 </div>

 

 <div className="space-y-4 pt-6 border-t border-[var(--admin-border)]">
 <div className="flex items-center gap-3 text-[var(--admin-text-muted)]">
 <MessageSquare size={18} />
 <p className="text-[10px] font-black uppercase tracking-widest">Admin Notification / Note</p>
 </div>
 <Textarea 
 placeholder="Provide feedback or justification..."
 className="min-h-[100px] border-2 border-[var(--admin-border)] bg-[var(--admin-bg)] rounded-app p-6 font-bold text-[var(--admin-text-main)] focus:bg-white focus:border-primary transition-all text-sm "
 value={adminNote}
 onChange={(e: any) => setAdminNote(e.target.value)}
 />
 </div>

 <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
 <Button 
 onClick={handleReject} 
 disabled={processing}
 className="w-full sm:flex-1 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-app font-black uppercase text-[10px] tracking-widest"
 >
 {processing ? <Loader2 className="animate-spin" /> : <><XCircle size={18} className="mr-2" /> Reject Protocol</>}
 </Button>
 <Button 
 onClick={handleApprove} 
 disabled={processing}
 className="w-full sm:flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-app font-black uppercase text-[10px] tracking-widest"
 >
 {processing ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} className="mr-2" /> Verify Identity</>}
 </Button>
 </div>
 </div>
 )}
 </Modal>
  </motion.div>

  <AnimatePresence>
    {fullImageUrl && (
      <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 lg:p-20 overflow-hidden">
        <div className="fixed inset-0" onClick={() => setFullImageUrl(null)} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-full max-h-full flex items-center justify-center"
        >
          <img 
            src={fullImageUrl} 
            className="max-w-full max-h-[85vh] object-contain rounded-app " 
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            onClick={() => setFullImageUrl(null)}
            className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all border border-white/20"
          >
            <XCircle size={20} />
          </button>
          <div className="absolute -bottom-12 left-0 right-0 text-center">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Identity Evidence Full Specification • Secure View</p>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
  </>
  );
}

function Textarea(props: any) {
 return (
 <textarea
 {...props}
 className={`w-full ${props.className} outline-none`}
 />
 );
}
