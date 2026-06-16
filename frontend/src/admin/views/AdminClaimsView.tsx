"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  User, 
  Loader2,
  MessageSquare
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import Modal from "../../components/ui/modal";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import { authService } from "@/services/authService";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";

export default function AdminClaimsView() {
  const draggable = useDraggableScroll();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchClaims();
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

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const token = authService.getAdminToken();
      const res = await fetch(`${API_BASE_URL}/bookings/admin/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setClaims(data);
      } else {
        const errText = await res.text();
        console.error(`Fetch failed (${res.status}):`, errText);
      }
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedClaim) return;
    if (status === 'Rejected' && !adminNote) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/admin/claims/${selectedClaim._id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getAdminToken()}` 
        },
        body: JSON.stringify({ status, notes: adminNote }),
      });
      if (res.ok) {
        setIsPreviewOpen(false);
        fetchClaims();
        setAdminNote("");
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const filtered = claims.filter(claim => {
    const firstName = claim.customerId?.firstName || "";
    const lastName = claim.customerId?.lastName || "";
    const email = claim.customerId?.email || "";
    const carName = claim.carId?.name || "";
    const status = claim.claimDetails?.status || "";
    const bookingHash = claim.bookingHash || "";

    const matchesSearch = 
      firstName.toLowerCase().includes(search.toLowerCase()) ||
      lastName.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      carName.toLowerCase().includes(search.toLowerCase()) ||
      bookingHash.toLowerCase().includes(search.toLowerCase());
    
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
                placeholder="Search claims..." 
                className="w-full pl-12 h-14 bg-[var(--admin-card-bg)] border-[var(--admin-border)] rounded-app focus-visible:ring-primary/20 text-sm font-bold text-[var(--admin-text-main)]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center bg-[var(--admin-bg)] p-1 rounded-app border border-[var(--admin-border)] h-12 w-full md:w-auto overflow-x-auto scrollbar-none">
              {["All", "Pending", "Approved", "Rejected"].map((tab) => {
                const count = tab === "All" 
                  ? claims.length 
                  : claims.filter(c => c.claimDetails?.status?.toLowerCase() === tab.toLowerCase()).length;
                
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
                <p className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Querying Claims Registry...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div {...draggable} className="w-full overflow-x-auto custom-scrollbar border border-[var(--admin-border)] rounded-app">
                <table className="w-full text-left border-collapse relative min-w-[1000px]">
                  <thead className="bg-white ">
                    <tr className="bg-[var(--admin-bg)]/80 backdrop-blur-md border-b border-[var(--admin-border)]">
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Booking</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">User</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Incident Date</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Status</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y admin-dash-border">
                    {filtered.map((claim, i) => (
                      <motion.tr 
                        key={claim._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-[var(--admin-bg)]/50 transition-colors"
                      >
                        <td className="p-6">
                          <div className="font-black text-[var(--admin-text-main)] text-sm tracking-tight">#{claim.bookingHash || claim._id.slice(-8).toUpperCase()}</div>
                          <div className="text-[10px] font-bold text-[var(--admin-text-muted)] tracking-wider mt-1">{claim.carId?.name || "Unknown Car"}</div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-app bg-white border border-[var(--admin-border)] flex items-center justify-center text-primary overflow-hidden font-black uppercase">
                              {claim.customerId?.avatar ? <img src={getImageUrl(claim.customerId.avatar)} className="w-full h-full object-cover" /> : <User size={16} />}
                            </div>
                            <div>
                              <div className="font-black text-[var(--admin-text-main)] text-xs tracking-tight">{claim.customerId?.firstName} {claim.customerId?.lastName}</div>
                              <div className="text-[9px] font-bold text-[var(--admin-text-muted)] tracking-wider truncate max-w-[150px]">{claim.customerId?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-[var(--admin-text-muted)] text-[11px] font-bold">
                          {new Date(claim.claimDetails?.dateOfIncident).toLocaleDateString()}
                        </td>
                        <td className="p-6">
                          <Badge variant="outline" className={`h-8 px-4 rounded-app font-black uppercase text-[9px] tracking-widest border-none ${claim.claimDetails?.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : claim.claimDetails?.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                            {claim.claimDetails?.status || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="p-6 text-right">
                          <Button 
                            onClick={() => {
                              setSelectedClaim(claim);
                              setIsPreviewOpen(true);
                              setAdminNote(claim.claimDetails?.adminNotes || "");
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
                <ShieldAlert size={64} className="mx-auto mb-6 opacity-10" />
                <p className="text-xl font-black text-[var(--admin-text-muted)]/50 uppercase tracking-widest">No Claims Found</p>
              </div>
            )}
          </div>
        </Card>

        {/* Review Modal */}
        <Modal 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)}
          title="Protection Plan Claim Review"
          description={`Reviewing claim for booking #${selectedClaim?.bookingHash || selectedClaim?._id?.slice(-8).toUpperCase()}`}
          icon={<ShieldAlert size={24} className="text-primary" />}
          maxWidth="max-w-4xl"
        >
          {selectedClaim && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Incident Description</h3>
                <div className="p-4 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-app font-medium text-sm text-[var(--admin-text-main)]">
                  {selectedClaim.claimDetails?.description || "No description provided."}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Incident Date</h3>
                <div className="p-4 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-app font-bold text-sm text-[var(--admin-text-main)]">
                  {new Date(selectedClaim.claimDetails?.dateOfIncident).toLocaleString()}
                </div>
              </div>

              {selectedClaim.claimDetails?.photos && selectedClaim.claimDetails.photos.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Incident Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedClaim.claimDetails.photos.map((photo: string, index: number) => (
                      <div 
                        key={index}
                        onClick={() => setFullImageUrl(getImageUrl(photo))}
                        className="relative aspect-video bg-[var(--admin-bg)] rounded-app overflow-hidden border border-[var(--admin-border)] group cursor-zoom-in"
                      >
                        <img 
                          src={getImageUrl(photo)} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                          alt={`Claim Photo ${index + 1}`} 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white font-black text-[10px] uppercase tracking-widest gap-2">
                          <Eye size={16} /> View
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-6 border-t border-[var(--admin-border)]">
                <div className="flex items-center gap-3 text-[var(--admin-text-muted)]">
                  <MessageSquare size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Admin Note / Reason</p>
                </div>
                <Textarea 
                  placeholder="Provide feedback or justification for the decision..."
                  className="min-h-[100px] border-2 border-[var(--admin-border)] bg-[var(--admin-bg)] rounded-app p-6 font-bold text-[var(--admin-text-main)] focus:bg-white focus:border-primary transition-all text-sm "
                  value={adminNote}
                  onChange={(e: any) => setAdminNote(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Button 
                  onClick={() => handleUpdateStatus('Rejected')} 
                  disabled={processing || selectedClaim.claimDetails?.status !== 'Pending'}
                  className="w-full sm:flex-1 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-app font-black uppercase text-[10px] tracking-widest"
                >
                  {processing ? <Loader2 className="animate-spin" /> : <><XCircle size={18} className="mr-2" /> Reject Claim</>}
                </Button>
                <Button 
                  onClick={() => handleUpdateStatus('Approved')} 
                  disabled={processing || selectedClaim.claimDetails?.status !== 'Pending'}
                  className="w-full sm:flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-app font-black uppercase text-[10px] tracking-widest"
                >
                  {processing ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} className="mr-2" /> Approve Claim</>}
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
