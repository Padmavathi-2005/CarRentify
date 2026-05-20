"use client";

import React, { useState, useEffect } from "react";
import { 
 AlertCircle, 
 Search, 
 ChevronRight, 
 Clock, 
 User, 
 Car, 
 ShieldAlert,
 ArrowRight,
 Filter
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function AdminReportsView() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/reports`, {
        headers: { Authorization: `Bearer ${authService.getAdminToken()}` }
      });
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (r.reason?.toLowerCase() || "").includes(query) ||
      (r.reporterId?.firstName?.toLowerCase() || "").includes(query) ||
      (r.reportedId?.firstName?.toLowerCase() || "").includes(query)
    );
  });

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-[var(--admin-text-main)] tracking-tight">Host Dispute Registry</h1>
          <p className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.2em] opacity-70">Administrative oversight for handover failures and critical escalations.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] opacity-50" size={14} />
            <input 
              type="text" 
              placeholder="FILTER INCIDENTS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-11 pr-4 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-app text-[10px] font-black focus:ring-2 focus:ring-primary/10 transition-all outline-none uppercase tracking-widest text-[var(--admin-text-main)] placeholder:opacity-40"
            />
          </div>
          <Button variant="outline" className="h-10 w-10 p-0 rounded-app border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:text-primary bg-[var(--admin-card-bg)]">
            <Filter size={16} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Scanning Registry...</p>
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => (
            <motion.div 
              key={report._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] hover:border-primary/30 transition-all group relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start gap-5 flex-1">
                  <div className="w-11 h-11 rounded-app bg-rose-500/10 flex items-center justify-center text-rose-500 flex-shrink-0">
                    <ShieldAlert size={20} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-[0.1em]">Critical Escalation</span>
                      <span className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest opacity-50">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-sm font-black text-[var(--admin-text-main)] uppercase tracking-tight">{report.reason}</h3>
                    <p className="text-xs font-bold text-[var(--admin-text-muted)] leading-relaxed italic opacity-80 max-w-xl">"{report.details}"</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8 lg:border-l lg:pl-8 border-[var(--admin-border)]">
                  <div className="flex gap-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[var(--admin-bg)] flex items-center justify-center text-[var(--admin-text-muted)] border border-[var(--admin-border)]"><User size={12} /></div>
                        <div>
                          <p className="text-[7px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest opacity-50">REPORTER</p>
                          <p className="text-[10px] font-black text-[var(--admin-text-main)] uppercase tracking-tight">{report.reporterId?.firstName} {report.reporterId?.lastName || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><ShieldAlert size={12} /></div>
                        <div>
                          <p className="text-[7px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest opacity-50">REPORTED HOST</p>
                          <p className="text-[10px] font-black text-[var(--admin-text-main)] uppercase tracking-tight">{report.reportedId?.firstName} {report.reportedId?.lastName || ''}</p>
                        </div>
                      </div>
                    </div>

                    <div className="hidden xl:block min-w-[120px]">
                      <p className="text-[7px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 opacity-50">TRANSACTION REF</p>
                      <div className="flex items-center gap-2 text-[10px] font-black text-[var(--admin-text-main)] uppercase">
                        <Car size={12} className="text-primary opacity-60" />
                        {(report.bookingId?._id || "").slice(-8).toUpperCase() || "N/A"}
                      </div>
                      <p className="text-[9px] font-black text-primary mt-1 uppercase tracking-widest">${report.bookingId?.totalPrice?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <Button className="h-10 px-6 bg-[var(--admin-text-main)] hover:bg-primary text-[var(--admin-card-bg)] hover:text-white rounded-app text-[9px] font-black uppercase tracking-[0.2em] transition-all border-none shadow-sm">
                    INVESTIGATE <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="h-96 bg-[var(--admin-bg)]/30 rounded-app border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center text-center p-12 group transition-all hover:bg-[var(--admin-bg)]/40">
          <div className="w-16 h-16 rounded-full bg-[var(--admin-card-bg)] border border-[var(--admin-border)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <AlertCircle className="text-[var(--admin-text-muted)] opacity-20" size={32} />
          </div>
          <h3 className="text-base font-black text-[var(--admin-text-main)] tracking-tight uppercase tracking-[0.1em]">Registry Clear</h3>
          <p className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.2em] mt-3 max-w-xs leading-relaxed opacity-60">No host disputes or critical handover protocol violations have been registered in the system.</p>
        </div>
      )}
    </div>
  );
}
