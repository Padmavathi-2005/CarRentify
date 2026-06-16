"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, ChevronRight, MoreVertical, CheckCircle2, XCircle, Clock, MapPin, Phone, Mail, User, Car } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { useLocale } from "@/components/LocaleContext";
import { API_BASE_URL } from "@/config/api";
import { authService } from "@/services/authService";
import { useSettings } from "@/components/ThemeProvider";

import "../styles/AdminBookingsView.css";

export default function BookingsPage() {
  const { formatPrice } = useLocale();
  const { settings } = useSettings();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (settings?.itemsPerPageLimit) setItemsPerPage(settings.itemsPerPageLimit);
  }, [settings?.itemsPerPageLimit]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/bookings`, {
          headers: { Authorization: `Bearer ${authService.getAdminToken()}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
        if (res.status === 401 || res.status === 403) {
          authService.adminLogout();
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(bk => {
    if (activeTab !== "All" && bk.status !== activeTab) return false;
    
    const query = search.toLowerCase();
    const bkId = (bk.bookingHash || bk._id).toLowerCase();
    const carName = (bk.carId?.name || "").toLowerCase();
    const userName = `${bk.customerId?.firstName || ""} ${bk.customerId?.lastName || ""}`.toLowerCase();
    
    return bkId.includes(query) || carName.includes(query) || userName.includes(query);
  });

  // Pagination Logic
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const getPaginationRange = () => {
    const totalNumbers = 5;
    if (totalPages <= totalNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const range: (number | string)[] = [];
    if (currentPage <= 3) {
      range.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      range.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      range.push(1, "...", currentPage, "...", totalPages);
    }
    return range;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="admin-bookings-container"
    >
      <div className="admin-booking-header">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--admin-text-main)] mb-2">Reservation System</h1>
          <p className="text-[var(--admin-text-muted)] font-medium tracking-wide">Track, modify, and optimize your global booking schedule.</p>
        </div>
      </div>

      <Card className="admin-bookings-card border-[var(--admin-border)]">
        <div className="p-8 border-b border-[var(--admin-border)] flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--admin-bg)]/20">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)] group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search ID, Customer, or Car..." 
              className="w-full pl-10 h-12 bg-[var(--admin-card-bg)] border-[var(--admin-border)] rounded-app focus-visible:ring-primary/20 text-sm font-medium text-[var(--admin-text-main)]"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {["All", "Active", "Pending", "Completed", "Cancelled"].map((tab) => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`px-4 h-10 rounded-app text-xs font-bold tracking-wide transition-all border border-[var(--admin-border)] ${tab === activeTab ? 'bg-[var(--primary-brand-color)] text-white border-none shadow-md shadow-primary/20' : 'bg-[var(--admin-card-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left admin-bookings-table min-w-[1000px]">
              <thead>
                <tr className="border-b border-[var(--admin-border)]">
                  <th className="text-xs font-extrabold uppercase tracking-widest text-[var(--admin-text-muted)] p-5">Reservation ID</th>
                  <th className="text-xs font-extrabold uppercase tracking-widest text-[var(--admin-text-muted)] p-5">Customer Details</th>
                  <th className="text-xs font-extrabold uppercase tracking-widest text-[var(--admin-text-muted)] p-5">Vehicle</th>
                  <th className="text-xs font-extrabold uppercase tracking-widest text-[var(--admin-text-muted)] p-5">Period</th>
                  <th className="text-xs font-extrabold uppercase tracking-widest text-[var(--admin-text-muted)] p-5">Total Price</th>
                  <th className="text-xs font-extrabold uppercase tracking-widest text-[var(--admin-text-muted)] p-5">Status</th>
                  <th className="p-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                <AnimatePresence mode="popLayout">
                  {paginatedBookings.map((bk: any, i) => (
                    <motion.tr 
                      key={bk._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-[var(--admin-bg)]/50 transition-colors"
                    >
                      <td className="p-5">
                        <span className="font-extrabold text-[var(--admin-text-main)] group-hover:text-[var(--primary-brand-color)] transition-colors text-sm">{bk.bookingHash || bk._id.slice(-8).toUpperCase()}</span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-app bg-[var(--admin-bg)] overflow-hidden flex items-center justify-center text-[var(--admin-text-muted)] border border-[var(--admin-border)]">
                            {bk.customerId?.avatar ? (
                              <img src={bk.customerId.avatar} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <User size={20} />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--admin-text-main)] text-sm">{bk.customerId?.firstName || 'Unknown'} {bk.customerId?.lastName || ''}</div>
                            <div className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">{bk.customerId?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <Car size={20} className="text-primary opacity-50" />
                          <span className="font-bold text-[var(--admin-text-muted)] text-sm">{bk.carId?.name || "Unknown Vehicle"}</span>
                        </div>
                      </td>
                      <td className="p-5 text-[var(--admin-text-muted)] text-xs font-bold whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-primary opacity-30" /> {formatDate(bk.startDate)} - {formatDate(bk.endDate)}
                        </div>
                      </td>
                      <td className="p-5 font-extrabold text-[var(--admin-text-main)] text-sm">{formatPrice(bk.totalPrice, bk.currency || 'USD')}</td>
                      <td className="p-5">
                        <Badge className={`admin-status-badge ${bk.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : bk.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : bk.status === 'Completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                          {bk.status}
                        </Badge>
                      </td>
                      <td className="p-5 text-right">
                        <button className="admin-table-action-btn">
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredBookings.length > 0 && (
            <div className="mt-4 border-t border-[var(--admin-border)] pt-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--admin-card-bg)]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Show</span>
                  <select 
                    className="h-8 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-2 text-[10px] font-black text-[var(--admin-text-main)] outline-none focus:ring-2 focus:ring-primary/20 transition-all border"
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  >
                    {[...new Set([5, 10, 20, 50, settings?.itemsPerPageLimit || 10])].sort((a,b)=>a-b).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <p className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} bookings
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] disabled:opacity-30 transition-all hover:bg-primary/5"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </Button>
                
                <div className="flex items-center gap-1 mx-2">
                  {getPaginationRange().map((page, idx) => (
                    page === "..." ? (
                      <div key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-[var(--admin-text-muted)] font-bold text-[10px]">...</div>
                    ) : (
                      <button
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(Number(page))}
                        className={`w-8 h-8 rounded-app text-[10px] font-black transition-all ${
                          currentPage === page 
                          ? 'bg-primary text-white' 
                          : 'bg-[var(--admin-card-bg)] text-[var(--admin-text-muted)] hover:bg-primary/5'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] disabled:opacity-30 transition-all hover:bg-primary/5"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {filteredBookings.length === 0 && !loading && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-[var(--admin-bg)] rounded-app flex items-center justify-center mx-auto mb-6 border border-[var(--admin-border)]">
            <Search className="w-10 h-10 text-[var(--admin-text-muted)] opacity-20" />
          </div>
          <h3 className="text-2xl font-bold text-[var(--admin-text-main)]">No Reservations Found.</h3>
          <p className="text-[var(--admin-text-muted)] mt-2">Adjust your filters or try a different search term.</p>
        </div>
      )}
    </motion.div>
  );
}
