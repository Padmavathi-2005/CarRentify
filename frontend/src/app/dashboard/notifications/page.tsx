"use client";

import React, { useState, useEffect } from "react";
import {
 Bell,
 Clock,
 CheckCircle2,
 ShieldCheck,
 MoreHorizontal,
 Check,
 Trash2,
 Filter,
 ArrowRight,
 ArrowLeft,
 Eye,
 ChevronLeft,
 ChevronRight,
 CalendarCheck,
 MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthContext";
import { API_BASE_URL } from "@/config/api";
import { authService } from "@/services/authService";
import { useLocale } from "@/components/LocaleContext";
import { useSettings } from "@/components/ThemeProvider";

import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const { user, userType, setUserType } = useAuth();
 const { t } = useLocale();
 const router = useRouter();
 const [notifications, setNotifications] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState<'all' | 'unread'>('all');
 const [expandedId, setExpandedId] = useState<string | null>(null);
  const { settings } = useSettings();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = settings?.itemsPerPageLimit || 8;

 const fetchNotifications = async () => {
 try {
 const res = await fetch(`${API_BASE_URL}/notifications`, {
 headers: { Authorization: `Bearer ${authService.getToken()}` },
 });
 if (res.ok) {
 setNotifications(await res.json());
 }
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 if (user) fetchNotifications();
 }, [user]);

 const markAsRead = async (id: string) => {
 try {
 const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
 method: "PATCH",
 headers: { Authorization: `Bearer ${authService.getToken()}` },
 });
 if (res.ok) {
 setNotifications((prev) =>
 prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
 );
 }
 } catch (err) {
 console.error(err);
 }
 };

 const handleViewDetails = (n: any) => {
 if (!n.isRead) markAsRead(n._id);
 
 if (expandedId === n._id) {
 setExpandedId(null);
 } else {
 setExpandedId(n._id);
 }
 };

 const navigateToResource = (n: any) => {
 if (n.data?.type === 'verification_request') {
 router.push(`/admin/users?search=${encodeURIComponent(n.data.email || n.data.userId)}`);
  } else if (n.data?.type === 'booking') {
    let targetType = n.data?.userType;

    // Fallback for older notifications without explicit userType
    if (!targetType) {
      const title = n.title?.toLowerCase() || '';
      const body = n.body?.toLowerCase() || '';
      
      if (title.includes('placed') || title.includes('approved') || title.includes('rejected') || title.includes('return condition')) {
        targetType = 'renter';
      } else if (title.includes('request') || title.includes('instant') || title.includes('picked up') || title.includes('reported')) {
        targetType = 'host';
      } else if (title.includes('upcoming trip')) {
        if (body.includes('your trip')) targetType = 'renter';
        else if (body.includes('your car')) targetType = 'host';
      }
    }

    if (targetType && targetType !== userType) {
      setUserType(targetType as any);
    }
    router.push(`/dashboard/bookings?id=${n.data.bookingId}`);
 } else if (n.data?.type === 'chat') {
 router.push(`/dashboard/messages?id=${n.data.conversationId}`);
 }
 };

 const markAllRead = async () => {
 try {
 const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
 method: "PATCH",
 headers: { Authorization: `Bearer ${authService.getToken()}` },
 });
 if (res.ok) {
 setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
 }
 } catch (err) {
 console.error(err);
 }
 };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('notifications.just_now');
    if (diffMins < 60) return t('notifications.mins_ago', { m: diffMins });
    if (diffHours < 24) return t('notifications.hours_ago', { h: diffHours });
    return t('notifications.days_ago', { d: diffDays });
  };

 const filtered = filter === 'all' 
 ? notifications 
 : notifications.filter(n => !n.isRead);

 const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
 const paginatedNotifications = filtered.slice(
 (currentPage - 1) * ITEMS_PER_PAGE,
 currentPage * ITEMS_PER_PAGE
 );

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

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 text-center lg:text-left">{t('notifications.title')}</h1>
          <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest text-center lg:text-left">
            {t('notifications.subtitle')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-app border border-slate-100 dark:border-white/10 flex items-center gap-1 w-full sm:w-auto">
            <button 
              onClick={() => { setFilter('all'); setCurrentPage(1); }}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-app text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-800 text-primary border border-slate-100 dark:border-white/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              {t('notifications.all')}
            </button>
            <button 
              onClick={() => { setFilter('unread'); setCurrentPage(1); }}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-app text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-white dark:bg-slate-800 text-primary border border-slate-100 dark:border-white/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              {t('notifications.unread')}
            </button>
          </div>
          <Button 
            variant="ghost" 
            onClick={markAllRead}
            disabled={notifications.every(n => n.isRead)}
            className="h-12 w-full sm:w-auto px-6 bg-white dark:bg-transparent border border-slate-100 dark:border-white/10 rounded-app text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all"
          >
            {t('notifications.mark_all_read')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('notifications.loading')}</p>
          </div>
        ) : paginatedNotifications.length > 0 ? (
          paginatedNotifications.map((n, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={n._id}
              onClick={() => handleViewDetails(n)}
              className={`p-4 md:p-6 rounded-app border transition-all cursor-pointer group flex flex-col sm:flex-row items-start gap-4 md:gap-6 relative overflow-hidden ${
                n.isRead 
                  ? 'bg-white dark:bg-transparent border-slate-100/50 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/20' 
                  : 'bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20 hover:border-primary/20 dark:hover:border-primary/30 ring-1 ring-primary/5'
              }`}
            >
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-app shrink-0 flex items-center justify-center relative z-10
                ${n.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 
                  n.type === 'error' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400' : 
                  n.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400' : 'bg-primary/10 text-primary'}
              `}>
                {n.type === 'success' ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : 
                  n.type === 'error' ? <Trash2 className="w-5 h-5 md:w-6 md:h-6" /> : 
                  n.type === 'warning' ? <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" /> : <Bell className="w-5 h-5 md:w-6 md:h-6" />}
              </div>
              <div className="flex-1 min-w-0 w-full relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className={`text-base md:text-lg font-black tracking-tight transition-colors ${n.isRead ? 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white' : 'text-slate-900 dark:text-white'}`}>{n.title}</h3>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-2 md:px-3 py-1 rounded-full whitespace-nowrap">{formatTime(n.createdAt)}</span>
                    <div className={`w-2 h-2 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-primary animate-pulse'}`} />
                  </div>
                </div>
                
                <p className={`text-sm font-bold leading-relaxed transition-all ${expandedId === n._id ? 'text-slate-600 mb-6' : (n.isRead ? 'text-slate-400 group-hover:text-slate-500 line-clamp-1' : 'text-slate-600 line-clamp-1')}`}>
                  {expandedId === n._id ? (
                    <span className="whitespace-pre-line">{n.body}</span>
                  ) : n.body}
                </p>
                
                <AnimatePresence>
                  {expandedId === n._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 pt-2">
                        {n.data?.type === 'booking' && (
                          <Button 
                            onClick={(e) => { e.stopPropagation(); navigateToResource(n); }}
                            className="h-9 md:h-10 w-full sm:w-auto px-4 md:px-8 bg-primary rounded-app text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary-hover transition-all border-none "
                          >
                            <CalendarCheck className="mr-2" size={14} /> {t('notifications.review_journey')}
                          </Button>
                        )}
                        {n.data?.type === 'verification_request' && (
                          <Button 
                            onClick={(e) => { e.stopPropagation(); navigateToResource(n); }}
                            className="h-9 md:h-10 w-full sm:w-auto px-4 md:px-8 bg-slate-900 rounded-app text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary-hover transition-all border-none"
                          >
                            <ShieldCheck className="mr-2" size={14} /> {t('notifications.review_identity')}
                          </Button>
                        )}
                        {n.data?.type === 'chat' && (
                          <Button 
                            onClick={(e) => { e.stopPropagation(); navigateToResource(n); }}
                            className="h-9 md:h-10 w-full sm:w-auto px-4 md:px-8 bg-primary rounded-app text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary-hover transition-all border-none "
                          >
                            <MessageSquare className="mr-2" size={14} /> {t('notifications.reply_message') || 'Reply to Message'}
                          </Button>
                        )}
                        <Button 
                          onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                          variant="ghost"
                          className="h-9 md:h-10 w-full sm:w-auto px-4 md:px-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                        >
                          {t('notifications.collapse')}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!n.isRead && expandedId !== n._id && (
                  <div className="mt-2 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('notifications.read_expand')}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
              
              {!n.isRead && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary opacity-50" />
              )}
            </motion.div>
          ))
        ) : (
          <div className="py-32 text-center bg-slate-50/50 rounded-app border border-slate-100 border-dashed">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white border border-slate-100 rounded-app flex items-center justify-center mx-auto mb-6">
              <Bell size={32} className="text-slate-200" />
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 mb-2 tracking-tight">{t('notifications.empty_title')}</h2>
            <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">
              {t('notifications.empty_desc', { type: filter === 'unread' ? t('notifications.unread').toLowerCase() : '' })}
            </p>
            {filter === 'unread' && (
              <Button 
                variant="link" 
                onClick={() => setFilter('all')}
                className="mt-6 text-primary font-black uppercase tracking-widest text-[10px]"
              >
                {t('notifications.view_archived')}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-12">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
            {t('notifications.showing', { 
              start: ((currentPage - 1) * ITEMS_PER_PAGE) + 1, 
              end: Math.min(currentPage * ITEMS_PER_PAGE, filtered.length), 
              total: filtered.length 
            })}
          </p>
          <div className="flex items-center gap-1.5 md:gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 md:w-10 md:h-10 rounded-app bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            {getPaginationRange().map((page, idx) => (
              page === "..." ? (
                <div key={`dots-${idx}`} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-300 font-black text-[9px] md:text-[10px] tracking-widest">...</div>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(Number(page))}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-app text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all border ${
                    currentPage === page
                      ? 'bg-primary text-white border-primary '
                      : 'bg-white border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20'
                  }`}
                >
                  {page}
                </button>
              )
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 md:w-10 md:h-10 rounded-app bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
 );
}
