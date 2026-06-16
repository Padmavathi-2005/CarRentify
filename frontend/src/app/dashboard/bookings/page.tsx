"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  Calendar,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Clock,
  Car,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Info,
  X,
  CreditCard,
  Zap,
  Phone,
  Mail,
  Quote,
  FileText,
  Printer,
  Download,
  Upload,
  UploadCloud,
  FileImage,
  Repeat,
  History,
  MessageSquare,
  Check,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthContext";
import { BACKEND_URL, API_BASE_URL, getImageUrl, PLACEHOLDER_IMAGE } from "@/config/api";
import { chatService } from "@/services/chatService";
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useLocale } from "@/components/LocaleContext";
import { cn } from "@/lib/utils";
import TripLifecycleManager from "@/components/TripLifecycleManager";
import SignaturePad from "@/components/SignaturePad";
import { CustomDatePicker, CustomTimePicker } from "@/components/CustomDateTimePicker";
import PostBookingReviewModal from "@/components/VehicleDetail/PostBookingReviewModal";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useToast } from "@/components/Toast";

interface Booking {
  _id: string;
  carId: any;
  startDate: string;
  endDate: string;
  pickupTime: string;
  returnTime: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  bookingType: string;
  customerId: any;
  vendorId: any;
  paymentMethod?: string;
  platformFee?: number;
  securityDeposit?: number;
  message?: string;
  bookingHash?: string;
  hostMileage?: number;
  hostConditionImage?: string;
  returnMileage?: number;
  returnConditionImage?: string;
  handoverRejectionCount?: number;
  customerAcceptedCondition?: boolean;
  customerAcceptedReturn?: boolean;
  isSettled?: boolean;
  baseAmount?: number;
  taxesTotal?: number;
  protectionCost?: number;
  settlementAmount?: number;
  updatedAt: string;
  tripStatus?: string;
  checkInPhotos?: string[];
  checkInMileage?: number;
  checkInFuelLevel?: number;
  checkInNotes?: string;
  checkOutPhotos?: string[];
  checkOutMileage?: number;
  checkOutFuelLevel?: number;
  checkOutNotes?: string;
}

export default function MyBookingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <MyBookingsContent />
    </Suspense>
  );
}

function MyBookingsContent() {
  const { user, userType, setUserType } = useAuth();
  const { t, formatPrice, formatCurrency } = useLocale();
  const router = useRouter();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [refundPreview, setRefundPreview] = useState<{ refundPercentage: number, refundAmount: number } | null>(null);
  const [cancellationSettings, setCancellationSettings] = useState<any>(null);
  const [showCancelPolicy, setShowCancelPolicy] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get('id');
  const carIdParam = searchParams.get('carId');
  const successParam = searchParams.get('success');
  const typeParam = searchParams.get('type');
  const gatewayParam = searchParams.get('gateway');
  const tokenParam = searchParams.get('token'); // PayPal Order ID
  const sessionIdParam = searchParams.get('session_id'); // Stripe Session ID

  // Phase Actions State
  const [actionMileage, setActionMileage] = useState<number>(0);
  const [actionImage, setActionImage] = useState<string>("");
  const [isUploadingAction, setIsUploadingAction] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [showInvoice, setShowInvoice] = useState(false);
  const [showSettlementInvoice, setShowSettlementInvoice] = useState(false);
  const [isEvidenceExpanded, setIsEvidenceExpanded] = useState(false);
  
  // Renter Signature State
  const [signatureModal, setSignatureModal] = useState<{ isOpen: boolean; type: 'check-in' | 'check-out' | null; bookingId: string | null }>({ isOpen: false, type: null, bookingId: null });
  const [renterSignature, setRenterSignature] = useState<string | null>(null);

  const [isCheckInAuditExpanded, setIsCheckInAuditExpanded] = useState(false);
  const [isCheckOutAuditExpanded, setIsCheckOutAuditExpanded] = useState(false);
  const [isReviewExpanded, setIsReviewExpanded] = useState(false);
  const [isDocumentAccepted, setIsDocumentAccepted] = useState(false);
  const [isSettlementDetailExpanded, setIsSettlementDetailExpanded] = useState(false);

  // Claim State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimDescription, setClaimDescription] = useState("");
  const [claimDate, setClaimDate] = useState("");
  const [claimImage, setClaimImage] = useState("");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [isUploadingClaimPhoto, setIsUploadingClaimPhoto] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Overdue and Extension State
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayReason, setDelayReason] = useState("");
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendEndDate, setExtendEndDate] = useState("");
  const [extendReturnTime, setExtendReturnTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);

  useEffect(() => {
    if (showExtendModal && selectedBooking) {
      // Initialize with current booking values
      if (selectedBooking.endDate) {
        setExtendEndDate(selectedBooking.endDate.split('T')[0]);
      }
      if (selectedBooking.returnTime) {
        setExtendReturnTime(selectedBooking.returnTime);
      }

      const carId = selectedBooking.carId?._id || selectedBooking.carId;
      if (!carId) return;
      
      fetch(`${API_BASE_URL}/bookings/availability/${carId}?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          setBookedSlots(data);
        })
        .catch(err => console.error("Error fetching booked slots:", err));
    }
  }, [showExtendModal, selectedBooking]);

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
  const [quickReviews, setQuickReviews] = useState<Record<string, any>>({});
  const [filterStatus, setFilterStatus] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isLifecycleModalOpen, setIsLifecycleModalOpen] = useState(false);
  const [lifecycleType, setLifecycleType] = useState<'check-in' | 'check-out'>('check-in');
  const [lifecycleReadOnly, setLifecycleReadOnly] = useState(false);

  const STATUS_FILTERS = React.useMemo(() => [
    { label: t('bookings.status.all'), value: "All" },
    { label: t('bookings.status.booked_request'), value: "Pending" },
    { label: t('bookings.status.confirmed'), value: "Confirmed" },
    { label: t('bookings.status.ongoing_trip'), value: "Active" },
    { label: t('bookings.status.completed'), value: "Completed" },
    { label: t('bookings.status.cancelled'), value: "Cancelled" },
    { label: t('bookings.status.rejected'), value: "Rejected" }
  ], [t]);

  useEffect(() => {
    if (user?._id || user?.id) {
      fetchBookings();
    }
    fetchCancellationSettings();
  }, [user?._id, user?.id, userType]);

  useEffect(() => {
    if (selectedBooking) {
      const updated = bookings.find(b => b._id === (selectedBooking as any)._id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedBooking)) {
        setSelectedBooking(updated);
      }
    }
  }, [bookings, selectedBooking]);

  useEffect(() => {
    if (bookings.length > 0) {
      if (bookingIdParam) {
        const b = bookings.find(x => x._id === bookingIdParam);
        if (b) {
          openDetails(b);
        }
      } else if (carIdParam) {
        const b = bookings.find(x => (x.carId?._id || x.carId) === carIdParam && (x.status === 'Active' || x.status === 'Confirmed' || x.status === 'Pending'));
        if (b) {
          openDetails(b);
        }
      }
    }
  }, [bookingIdParam, carIdParam, bookings]);

  useEffect(() => {
    if (successParam === 'true') {
      handlePaymentSuccess();
    }
  }, [successParam, gatewayParam, tokenParam, sessionIdParam]);

  const handlePaymentSuccess = async () => {
    setIsFinalizing(true);
    const token = authService.getToken();

    try {
      if (gatewayParam === 'paypal' && tokenParam) {
        const bId = bookingIdParam || "";
        const res = await fetch(`${API_BASE_URL}/payments/capture-paypal/${tokenParam}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ bookingId: bId, type: typeParam })
        });

        if (!res.ok) throw new Error("PayPal capture failed");
        showToast(typeParam === 'settlement' ? t('bookings.messages.settle_success') : t('bookings.messages.booking_payment_success'), 'success');
      } else if (sessionIdParam && bookingIdParam) {
        const res = await fetch(`${API_BASE_URL}/payments/finalize-stripe/${sessionIdParam}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ bookingId: bookingIdParam, type: typeParam })
        });

        if (!res.ok) throw new Error("Stripe finalization failed");
        showToast(typeParam === 'settlement' ? t('bookings.messages.settle_confirmed_concluded') : t('bookings.messages.payment_successful'), 'success');
      }

      await fetchBookings();
      window.history.replaceState({}, '', '/dashboard/bookings');
    } catch (err) {
      console.error("Payment finalization error:", err);
      showToast(t('bookings.messages.payment_verify_fail') || "Payment verification failed", 'error');
    } finally {
      setIsFinalizing(false);
    }
  };

  const fetchBookings = async () => {
    const userId = user?._id || user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const endpoint = userType === "host" ? "vendor-bookings" : "my-bookings";
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/bookings/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const sortedData = (Array.isArray(data) ? data : []).sort((a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        );
        setBookings(sortedData);
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCancellationSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setCancellationSettings(data.cancellation || null);
      }
    } catch (err) {
      console.error("Fetch settings error:", err);
    }
  };

  const fetchRefundPreview = async (id: string) => {
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/refund-preview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRefundPreview(await res.json());
      }
    } catch (err) {
      console.error("Refund preview error:", err);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm(t('bookings.messages.cancel_confirm'))) return;

    setIsCancelling(true);
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/cancel-customer`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert(t('bookings.messages.cancel_success'));
        setIsDetailModalOpen(false);
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.message || t('bookings.messages.cancel_fail'));
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Something went wrong.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm(t('bookings.messages.approve_confirm'))) return;
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authService.getToken()}` }
      });
      if (res.ok) {
        alert(t('bookings.messages.approve_success'));
        fetchBookings();
        setIsDetailModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm(t('bookings.messages.reject_confirm'))) return;
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authService.getToken()}` }
      });
      if (res.ok) {
        alert(t('bookings.messages.reject_success'));
        fetchBookings();
        setIsDetailModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleImageActionUpload = async (file: File) => {
    setIsUploadingAction(true);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
      });

      const res = await fetch(`${API_BASE_URL}/media/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ fileName: file.name, base64 }),
      });

      if (res.ok) {
        const data = await res.json();
        setActionImage(data.url || data.path || "");
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploadingAction(false);
    }
  };

  const handleVerifyConditionHost = async (id: string) => {
    if ((actionMileage === undefined || actionMileage === null) || !actionImage) {
      alert(t('bookings.messages.condition_req'));
      return;
    }
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/verify-condition`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mileage: actionMileage, conditionImage: actionImage })
      });
      if (res.ok) {
        const updated = await res.json();
        alert(t('bookings.messages.condition_success'));
        fetchBookings();
        setSelectedBooking(updated);
        setActionImage("");
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmittingAction(false); }
  };

  const handleAcceptTripAction = async (id: string, type: 'check-in' | 'check-out') => {
    if (!renterSignature) {
      alert("Please provide your signature.");
      return;
    }
    setIsSubmittingAction(true);
    try {
      const endpoint = type === 'check-in' ? 'accept-condition' : 'accept-return';
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/${endpoint}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ signature: renterSignature })
      });
      if (res.ok) {
        const updated = await res.json();
        alert(t('bookings.messages.success'));
        fetchBookings();
        setSelectedBooking(updated);
        setSignatureModal({ isOpen: false, type: null, bookingId: null });
        setRenterSignature(null);
      } else {
        const errorData = await res.json();
        showToast(errorData.message || "Failed to submit signature.", 'error');
      }
    } catch (err: any) { 
      console.error(err); 
      showToast(err.message || "Network error occurred.", 'error');
    }
    finally { setIsSubmittingAction(false); }
  };

  const handleRejectCondition = async (id: string) => {
    const reason = window.prompt(t('bookings.messages.reject_reason_prompt'));
    if (!reason) return;

    setIsSubmittingAction(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/reject-condition`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        const updated = await res.json();
        alert(t('bookings.messages.reject_success_notified'));
        fetchBookings();
        setSelectedBooking(updated);
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmittingAction(false); }
  };

  const handleReportHost = async (id: string) => {
    const details = window.prompt(t('bookings.messages.report_host_prompt'));
    if (!details) return;

    setIsSubmittingAction(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/report-host`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: "Repeated handover failures", details })
      });
      if (res.ok) {
        const updated = await res.json();
        alert(t('bookings.messages.host_reported'));
        fetchBookings();
        setSelectedBooking(updated);
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmittingAction(false); }
  };

  const handleVerifyReturnHost = async (id: string) => {
    if ((actionMileage === undefined || actionMileage === null) || !actionImage) {
      alert(t('bookings.messages.return_req'));
      return;
    }
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/verify-return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mileage: actionMileage, conditionImage: actionImage })
      });
      if (res.ok) {
        const updated = await res.json();
        alert(t('bookings.messages.return_success'));
        fetchBookings();
        setSelectedBooking(updated);
        setActionImage("");
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmittingAction(false); }
  };

  const handleRejectReturn = async (id: string) => {
    const reason = window.prompt(t('bookings.messages.reject_settle_prompt') || "Please provide the reason for disputing the settlement/condition:");
    if (!reason) return;

    setIsSubmittingAction(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/reject-return`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        const updated = await res.json();
        alert(t('bookings.messages.dispute_submitted') || "Your dispute has been recorded. The host and support have been notified.");
        fetchBookings();
        setSelectedBooking(updated);
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmittingAction(false); }
  };

  const handleRequestDelay = async (id: string) => {
    if (!delayReason.trim()) {
      showToast("Please provide a reason for the delay.", 'error');
      return;
    }
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/request-delay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: delayReason })
      });
      if (res.ok) {
        const updated = await res.json();
        showToast("Delay requested. The host has been notified.", 'success');
        fetchBookings();
        setSelectedBooking(updated);
        setShowDelayModal(false);
        setDelayReason("");
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to request delay", 'error');
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmittingAction(false); }
  };

  const handleExtendTrip = async (id: string) => {
    if (!extendEndDate || !extendReturnTime) {
      showToast("Please select the new end date and time.", 'error');
      return;
    }
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/extend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endDate: extendEndDate, returnTime: extendReturnTime })
      });
      if (res.ok) {
        const updated = await res.json();
        showToast("Trip successfully extended!", 'success');
        fetchBookings();
        setSelectedBooking(updated);
        setShowExtendModal(false);
      } else {
        const errData = await res.json();
        showToast(errData.message || "Failed to extend trip.", 'error');
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmittingAction(false); }
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

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStartChat = async (targetUserId: string) => {
    if (!user?._id || !targetUserId) return;
    setIsStartingChat(true);
    try {
      const chat = await chatService.startConversation([user._id, targetUserId]);
      setIsDetailModalOpen(false);
      router.push(`/dashboard/messages?id=${chat._id}`);
    } catch (err) {
      console.error('Failed to start chat:', err);
      alert('Failed to open chat. Please try again.');
    } finally {
      setIsStartingChat(false);
    }
  };

  const openDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
    setShowInvoice(false);
    setShowSettlementInvoice(false);
    setRefundPreview(null);
    setExistingReview(null);
    if (booking.status?.toLowerCase() === 'completed') {
      fetchExistingReview(booking._id);
    }
    setShowCancelPolicy(false);
    setIsDocumentAccepted(false);
    const b = booking as any;
    if (booking.status === 'Confirmed') {
      setActionMileage(b.checkInMileage || b.hostMileage || 0);
      setActionImage(b.hostConditionImage || "");
    } else if (booking.status === 'Active') {
      setActionMileage(b.checkOutMileage || b.returnMileage || b.checkInMileage || b.hostMileage || 0);
      setActionImage(b.returnConditionImage || "");
    } else {
      setActionMileage(0);
      setActionImage("");
    }
    if (booking.status !== 'Cancelled' && booking.status !== 'Completed') {
      fetchRefundPreview(booking._id);
    }
  };

  const fetchExistingReview = async (bookingId: string) => {
    setLoadingReview(true);
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/reviews/booking/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExistingReview(data?._id ? data : null);
      } else {
        setExistingReview(null);
      }
    } catch {
      setExistingReview(null);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleClaimImageUpload = async (file: File) => {
    setIsUploadingClaimPhoto(true);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
      });

      const res = await fetch(`${API_BASE_URL}/media/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ fileName: file.name, base64 }),
      });

      if (res.ok) {
        const data = await res.json();
        setClaimImage(data.url || data.path || "");
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploadingClaimPhoto(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!claimDescription || !claimDate) {
      alert("Please fill in all required fields (Date and Description)");
      return;
    }
    
    setIsSubmittingClaim(true);
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/bookings/${(selectedBooking as any)?._id}/claim`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: claimDescription,
          dateOfIncident: claimDate,
          photos: claimImage ? [claimImage] : []
        })
      });
      if (res.ok) {
        alert("Claim submitted successfully");
        setShowClaimModal(false);
        fetchBookings();
      } else {
        alert("Failed to submit claim");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting claim");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = (b.carId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      b._id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
      case 'awaiting payment': return 'bg-amber-50 text-amber-500 border-amber-100';
      case 'pending': return 'bg-amber-50 text-amber-500 border-amber-100';
      case 'cancelled': return 'bg-rose-50 text-rose-500 border-rose-100';
      case 'completed': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'active': return 'bg-primary/5 text-primary border-primary/20';
      case 'rejected': return 'bg-slate-50 text-slate-400 border-slate-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getDisplayStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return t('bookings.status.pending');
      case 'awaiting payment': return t('bookings.status.awaiting_payment');
      case 'confirmed': return t('bookings.status.confirmed');
      case 'active': return t('bookings.status.active');
      case 'completed': return t('bookings.status.completed');
      case 'cancelled': return t('bookings.status.cancelled');
      case 'rejected': return t('bookings.status.rejected');
      default: return status;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Link href="/dashboard" className="hover:text-primary">{t('bookings.nav.dashboard')}</Link>
            <ChevronRight size={10} />
            <span className="text-primary">{userType === 'host' ? t('bookings.nav.fleet_bookings') : t('bookings.nav.my_journeys')}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{userType === 'host' ? t('bookings.manage_title') : t('bookings.title')}</h1>
            <button
              onClick={() => {
                setUserType(userType === 'host' ? 'renter' : 'host');
                setSearchQuery("");
                setFilterStatus("All");
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-primary text-white rounded-app text-[9px] font-black uppercase tracking-[0.15em] hover:bg-primary-hover hover:text-white transition-all flex items-center gap-2 w-fit border-none"
            >
              <Repeat size={14} />
              {userType === 'host' ? t('bookings.actions.view_journeys') : t('bookings.actions.manage_fleet')}
            </button>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('bookings.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('bookings.labels.search')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-app text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none uppercase tracking-widest"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="h-12 pl-12 pr-10 bg-white border border-slate-100 rounded-app text-[9px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer min-w-[180px] text-slate-900"
            >
              {STATUS_FILTERS.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('bookings.labels.accessing')}</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            {paginatedBookings.map((booking) => (
              <motion.div
                key={booking._id}
                whileHover={{ y: -4 }}
                className="bg-white p-4 sm:p-6 rounded-app border border-slate-100 hover:border-primary/20 transition-all cursor-pointer group flex flex-col sm:flex-row items-start gap-4 sm:gap-8"
                onClick={() => openDetails(booking)}
              >
                <div className="w-full md:w-48 h-32 rounded-app overflow-hidden bg-slate-50 border border-slate-100 shrink-0 relative">
                  <img
                    src={getImageUrl(booking.carId?.image || (booking.carId?.images && booking.carId.images[0]))}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={booking.carId?.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-app text-[8px] font-black uppercase tracking-widest border border-slate-100 flex items-center gap-1 ">
                    <Zap size={8} fill="currentColor" className="text-primary" /> {booking.bookingType}
                  </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2">
                        {booking.carId?.name || t('bookings.labels.premium_vehicle')}
                        {userType === 'host' && booking.customerId && (
                          <span className="text-primary font-bold text-xs ml-3 bg-primary/5 px-3 py-1 rounded-app border border-primary/10">
                            {booking.customerId.firstName} {booking.customerId.lastName}
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {(() => {
                          const status = booking.status?.toLowerCase();
                          if (status === 'completed') {
                            return <div className="flex items-center gap-1 text-emerald-500"><CheckCircle2 size={12} /> COMPLETED: {formatDate(booking.updatedAt)}</div>;
                          }
                          if (status === 'cancelled' || status === 'rejected') {
                            return <div className="flex items-center gap-1 text-rose-500"><XCircle size={12} /> {status.toUpperCase()}: {formatDate(booking.updatedAt)}</div>;
                          }
                          if (status === 'active' || status === 'confirmed') {
                            return <div className="flex items-center gap-1 text-primary"><Clock size={12} /> PICKUP: {formatDate(booking.startDate)} • {booking.pickupTime}</div>;
                          }
                          return <div className="flex items-center gap-1 text-slate-500"><Calendar size={12} /> BOOKED: {formatDate(booking.createdAt)}</div>;
                        })()}
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                      {getDisplayStatus(booking.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-6 pt-2 border-t border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">{t('bookings.labels.total_investment')}</p>
                      <p className="text-sm font-black text-slate-900 tracking-tight">{formatPrice(booking.totalPrice, booking.carId?.currency)}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">{t('bookings.labels.booking_hash')}</p>
                      <p className="text-[10px] font-black text-slate-600 tracking-widest italic">{booking.bookingHash || booking._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="hidden md:flex ml-auto items-center gap-2 text-slate-400 dark:text-slate-300 group-hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest">
                      {t('bookings.actions.detail_view')} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t('bookings.labels.showing_range', { start: ((currentPage - 1) * ITEMS_PER_PAGE) + 1, end: Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length), total: filteredBookings.length })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-app bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPaginationRange().map((page, idx) => (
                  page === "..." ? (
                    <div key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-300 font-black text-[10px] tracking-widest">...</div>
                  ) : (
                    <button
                      key={`page-${page}`}
                      onClick={() => setCurrentPage(Number(page))}
                      className={`w-10 h-10 rounded-app text-[11px] font-black uppercase tracking-widest transition-all border ${currentPage === page
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
                  className="w-10 h-10 rounded-app bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-[400px] bg-slate-50/50 dark:bg-white/5 rounded-app border-2 border-dashed border-slate-100 dark:border-white/10 flex flex-col items-center justify-center text-center p-12">
          <div className="w-20 h-20 rounded-app bg-white dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-500 mb-8 border border-slate-50 dark:border-white/10">
            <Calendar size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            {userType === 'host' ? t('bookings.labels.empty_title_host') : t('bookings.labels.empty_title')}
          </h3>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest max-w-sm leading-relaxed mb-8">
            {userType === 'host' ? t('bookings.labels.empty_desc_host') : t('bookings.labels.empty_desc')}
          </p>
          <Link href={userType === 'host' ? "/dashboard/cars" : "/vehicles"}>
            <Button className="bg-primary hover:bg-primary-hover text-white h-14 px-10 rounded-app font-black text-[10px] uppercase tracking-[0.2em] transition-all border-none">
              {userType === 'host' ? t('bookings.actions.manage_fleet') : t('bookings.actions.browse_fleet')} <ArrowRight size={14} className="ml-2" />
            </Button>
          </Link>
        </div>
      )}

      {/* Booking Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setShowInvoice(false); }}
        maxWidth="max-w-6xl"
        noPadding={true}
        noHeader={true}
      >
        {selectedBooking && (
          <div className="p-0 flex flex-col overflow-hidden relative">
            <div className="sticky top-0 p-4 lg:p-6 border-b border-slate-50 flex items-center justify-between bg-white z-30 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-app bg-primary/10 flex items-center justify-center text-primary">
                  <Car size={20} />
                </div>
                <div>
                  <h2 className="text-sm lg:text-base font-black text-slate-900 tracking-tight uppercase leading-none">
                    {showInvoice ? t('bookings.labels.invoice_title') : t('bookings.labels.journey_manifesto')}
                  </h2>
                  <p className="text-slate-400 font-bold text-[9px] lg:text-[10px] mt-1 uppercase tracking-widest"> Registry ID: {selectedBooking._id.toUpperCase()} </p>
                </div>
              </div>
              <button
                onClick={() => { setIsDetailModalOpen(false); setShowInvoice(false); }}
                className="w-10 h-10 rounded-app bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-stretch">
              <div className="w-full md:w-[320px] bg-slate-50 dark:bg-black p-6 lg:p-8 space-y-8 border-r border-slate-100 dark:border-white/10 shrink-0">
                <div className="aspect-square rounded-app overflow-hidden border border-slate-200 relative bg-white">
                  <img src={getImageUrl(selectedBooking.carId?.image || (selectedBooking.carId?.images && selectedBooking.carId.images[0]) || "")} className="w-full h-full object-contain p-2" onError={(e) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-sm font-black text-slate-900 leading-none mb-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-sm ">{selectedBooking.carId?.name}</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-app bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-primary "><ShieldCheck size={18} /></div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Protocol</p>
                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{selectedBooking.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-app bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-primary "><CreditCard size={18} /></div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Liquidity</p>
                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{formatPrice(selectedBooking.totalPrice, selectedBooking.carId?.currency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-app bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-primary "><Zap size={18} /></div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Booking Hash</p>
                      <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest italic">{selectedBooking.bookingHash || selectedBooking._id.toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
                  <button
                    onClick={() => { setShowInvoice(!showInvoice); setShowSettlementInvoice(false); setShowClaimModal(false); }}
                    className={`w-full h-12 rounded-app border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${showInvoice ? 'bg-slate-100 dark:bg-white/10' : 'bg-white dark:bg-transparent'}`}
                  >
                    {showInvoice ? <ChevronLeft size={16} /> : <FileText size={16} />}
                    {showInvoice ? "Back to Tracking" : "View Invoice"}
                  </button>

                  {selectedBooking.status !== 'Pending' && selectedBooking.status !== 'Awaiting Payment' && (
                    <button
                      onClick={() => window.open(`/dashboard/bookings/${selectedBooking._id}/agreement`, '_blank')}
                      className={`w-full h-12 rounded-app border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-white dark:bg-transparent`}
                    >
                      <FileText size={16} />
                      View Rental Agreement
                    </button>
                  )}

                  {((selectedBooking.settlementAmount || 0) > 0) && (
                    <button
                      onClick={() => { setShowSettlementInvoice(!showSettlementInvoice); setShowInvoice(false); setShowClaimModal(false); }}
                      className={`w-full h-12 rounded-app border border-primary/20 text-primary hover:bg-primary/5 dark:hover:bg-primary/10 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${showSettlementInvoice ? 'bg-primary/10 dark:bg-primary/20' : 'bg-white dark:bg-transparent'}`}
                    >
                      {showSettlementInvoice ? <ChevronLeft size={16} /> : <Zap size={16} />}
                      {showSettlementInvoice ? "Back to Tracking" : "View Settlement"}
                    </button>
                  )}

                  {((selectedBooking as any).protectionCost > 0 || (selectedBooking as any).protectionPlanId) && (
                    <button
                      onClick={() => { setShowClaimModal(!showClaimModal); setShowInvoice(false); setShowSettlementInvoice(false); }}
                      className={`w-full h-12 rounded-app border border-rose-200 dark:border-rose-500/20 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${showClaimModal ? 'bg-rose-50 dark:bg-rose-500/20' : 'bg-white dark:bg-transparent'}`}
                    >
                      {showClaimModal ? <ChevronLeft size={16} /> : <ShieldCheck size={16} />}
                      {showClaimModal ? "Back to Tracking" : "File a Claim"}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 p-6 lg:p-8 space-y-8">
                {selectedBooking.status?.toLowerCase() === 'completed' && userType === 'renter' && !existingReview && !loadingReview && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-4 p-4 rounded-app bg-primary/5 border border-primary/20"
                  >
                    <div>
                      <p className="text-[9px] font-black text-primary uppercase tracking-[0.15em] mb-0.5">Journey Completed</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Rate your experience & help the community</p>
                    </div>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="shrink-0 px-4 h-9 bg-primary text-white rounded-app text-[9px] font-black uppercase tracking-widest hover:bg-primary-hover transition-all"
                    >
                      Rate Us
                    </button>
                  </motion.div>
                )}

                {showClaimModal ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-4 md:p-8 rounded-app border border-slate-100 space-y-6"
                  >
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="w-10 h-10 rounded-app bg-rose-50 flex items-center justify-center text-rose-500">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">File a Claim</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protection Plan Incident Report</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {(selectedBooking as any)?.claimDetails ? (
                        <div className="p-6 bg-slate-50 rounded-app border border-slate-100 space-y-4 text-center">
                          <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary mx-auto">
                            <ShieldCheck size={28} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 uppercase">Claim Submitted</h4>
                            <p className="text-xs font-bold text-slate-500">Your claim has been recorded and is currently being processed. Status: {(selectedBooking as any).claimDetails.status}</p>
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-200">
                            Incident Date: {new Date((selectedBooking as any).claimDetails.dateOfIncident).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Incident</label>
                            <input 
                              type="date"
                              value={claimDate}
                              onChange={(e) => setClaimDate(e.target.value)}
                              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-app text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incident Description</label>
                            <textarea
                              value={claimDescription}
                              onChange={(e) => setClaimDescription(e.target.value)}
                              rows={4}
                              placeholder="Describe what happened in detail..."
                              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-app text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none custom-scrollbar resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Photographic Evidence</label>
                            {claimImage ? (
                              <div className="relative w-full h-40 bg-slate-100 rounded-app overflow-hidden border border-slate-200">
                                  <img src={getImageUrl(claimImage)} className="w-full h-full object-cover" />
                                  <button onClick={() => setClaimImage("")} className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 shadow-sm transition-all"><X size={14} /></button>
                              </div>
                            ) : (
                              <div className="relative w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-app flex flex-col items-center justify-center hover:bg-slate-100 hover:border-primary/30 transition-all group">
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { if (e.target.files?.[0]) handleClaimImageUpload(e.target.files[0]); }} />
                                {isUploadingClaimPhoto ? (
                                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
                                ) : (
                                    <UploadCloud size={24} className="text-slate-400 group-hover:text-primary transition-colors mb-2" />
                                )}
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isUploadingClaimPhoto ? 'Uploading...' : 'Click to Upload Proof'}</p>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 flex justify-end gap-3">
                            <button onClick={() => setShowClaimModal(false)} className="h-10 px-6 bg-slate-100 text-slate-600 rounded-app text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                            <button onClick={handleSubmitClaim} disabled={isSubmittingClaim} className="h-10 px-6 bg-primary text-white rounded-app text-[9px] font-black uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center gap-2">
                              {isSubmittingClaim ? <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={14} />}
                              Submit Claim
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                ) : showInvoice ? (
                  <motion.div
                    id="invoice-print-area"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-4 md:p-12 rounded-app border border-slate-100 space-y-10 print:p-0 print:border-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-primary rounded-app flex items-center justify-center text-white"><Car size={24} /></div>
                          <span className="text-xl font-black tracking-tight text-slate-900">CarRental</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                          Premium Fleet Management<br />
                          Global Logistics Division<br />
                          support@carrental.com
                        </div>
                      </div>
                      <div className="text-left sm:text-right space-y-1">
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Invoice</h2>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{selectedBooking.bookingHash || selectedBooking._id.toUpperCase()}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Issued: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billed To</h4>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-900 uppercase">{selectedBooking.customerId?.firstName} {selectedBooking.customerId?.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedBooking.customerId?.email}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedBooking.customerId?.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</h4>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-900 uppercase">{selectedBooking.vendorId?.firstName} {selectedBooking.vendorId?.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedBooking.carId?.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedBooking.carId?.location?.city}, {selectedBooking.carId?.location?.state}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="hidden md:grid md:grid-cols-12 border-b-2 border-slate-900 pb-4 gap-4">
                        <div className="md:col-span-6 text-[10px] font-black uppercase tracking-[0.2em]">Description</div>
                        <div className="md:col-span-2 text-[10px] font-black uppercase tracking-[0.2em] flex justify-end">Quantity</div>
                        <div className="md:col-span-2 text-[10px] font-black uppercase tracking-[0.2em] flex justify-end">Unit Price</div>
                        <div className="md:col-span-2 text-[10px] font-black uppercase tracking-[0.2em] flex justify-end">Amount</div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-6">
                            <p className="text-sm font-black text-slate-900 uppercase">Vehicle Rental</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Journey: {selectedBooking.startDate} to {selectedBooking.endDate}</p>
                          </div>
                          <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                            <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantity</span>
                            <span className="text-sm font-bold text-slate-600">1 Trip</span>
                          </div>
                          <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                            <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit Price</span>
                            <span className="text-sm font-bold text-slate-600">{formatCurrency(((selectedBooking as any).baseAmount || (selectedBooking.totalPrice || 0) * 0.8 || 0), selectedBooking.carId?.currency)}</span>
                          </div>
                          <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                            <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                            <span className="text-sm font-black text-slate-900">{formatCurrency(((selectedBooking as any).baseAmount || (selectedBooking.totalPrice || 0) * 0.8 || 0), selectedBooking.carId?.currency)}</span>
                          </div>
                        </div>

                        {(selectedBooking as any).platformFee !== undefined && (
                          <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            <div className="md:col-span-6 text-sm text-slate-500">Service Fee</div>
                            <div className="md:col-span-2 hidden md:flex justify-end text-sm text-slate-400">---</div>
                            <div className="md:col-span-2 hidden md:flex justify-end text-sm text-slate-400">---</div>
                            <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                              <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                              <span className="text-sm font-bold text-slate-900">{formatCurrency(((selectedBooking as any).platformFee || 0), selectedBooking.carId?.currency)}</span>
                            </div>
                          </div>
                        )}

                        {(selectedBooking as any).protectionCost !== undefined && (
                          <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            <div className="md:col-span-6 text-sm text-slate-500">Protection Plan</div>
                            <div className="md:col-span-2 hidden md:flex justify-end text-sm text-slate-400">---</div>
                            <div className="md:col-span-2 hidden md:flex justify-end text-sm text-slate-400">---</div>
                            <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                              <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                              <span className="text-sm font-bold text-slate-900">{formatCurrency(((selectedBooking as any).protectionCost || 0), selectedBooking.carId?.currency)}</span>
                            </div>
                          </div>
                        )}

                        {(selectedBooking as any).settlementAmount !== undefined && (selectedBooking as any).settlementAmount > 0 && (
                          <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            <div className="md:col-span-6 text-sm text-slate-500 font-bold text-primary">Distance Settlement</div>
                            <div className="md:col-span-2 hidden md:flex justify-end text-sm text-slate-400">---</div>
                            <div className="md:col-span-2 hidden md:flex justify-end text-sm text-slate-400">---</div>
                            <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                              <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                              <span className="text-sm font-black text-primary">{formatCurrency(((selectedBooking as any).settlementAmount || 0), selectedBooking.carId?.currency)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:flex md:justify-between md:items-start pt-10 gap-10 md:gap-12 relative z-10">
                      <div className="w-full md:w-[320px] space-y-4 relative z-20">
                        <div className="flex justify-between items-center text-slate-400 px-2">
                          <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                          <span className="text-sm font-bold">{formatCurrency(((selectedBooking as any).baseAmount || (selectedBooking.totalPrice || 0) * 0.8 || 0), selectedBooking.carId?.currency)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 px-2">
                          <span className="text-[10px] font-black uppercase tracking-widest">Taxes & Logistics</span>
                          <span className="text-sm font-bold">{formatCurrency(((selectedBooking as any).taxesTotal || 0), selectedBooking.carId?.currency)}</span>
                        </div>
                        {(selectedBooking as any).securityDeposit !== undefined && (
                          <div className="flex justify-between items-center text-slate-500 pt-2 px-2">
                            <span className="text-[10px] font-black uppercase tracking-widest">Security Deposit</span>
                            <span className="text-sm font-black">{formatCurrency(((selectedBooking as any).securityDeposit || 0), selectedBooking.carId?.currency)}</span>
                          </div>
                        )}
                        <div className="h-px bg-slate-900 my-4" />
                        <div className="bg-slate-900 p-6 rounded-app text-white shadow-xl shadow-slate-900/10">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Amount</span>
                            <span className="text-xl font-black">{formatCurrency(((selectedBooking.totalPrice || 0) + ((selectedBooking as any).settlementAmount || 0)), selectedBooking.carId?.currency)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:max-w-[280px] space-y-6 relative z-10">
                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-app border border-slate-100 dark:border-white/10">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Method</p>
                          <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-relaxed">Wallet Liquidity /<br />Settlement Funds</p>
                        </div>
                        <p className="text-[9px] font-bold text-slate-300 dark:text-slate-500 leading-relaxed uppercase tracking-[0.15em]">
                          This is a system generated document. All transactions are final and subject to CarRental's Terms of Logistics.
                        </p>
                      </div>
                    </div>

                    <div className="pt-10 flex flex-wrap justify-end gap-3 print:hidden">
                      <button
                        onClick={() => { setShowInvoice(false); window.scrollTo(0, 0); }}
                        className="h-10 px-6 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 dark:hover:text-white rounded-app text-[9px] font-black uppercase tracking-widest border-none flex items-center gap-2 transition-all transition-colors"
                      >
                        <ChevronLeft size={16} /> Back to Details
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="h-10 px-6 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-app text-[9px] font-black uppercase tracking-widest border-none flex items-center gap-2 transition-all transition-colors"
                      >
                        <Printer size={16} /> Print Document
                      </button>
                      <button
                        onClick={() => handleDownloadPDF('invoice-print-area', `Invoice-${selectedBooking.bookingHash || selectedBooking._id.slice(-8)}.pdf`)}
                        disabled={isPdfGenerating}
                        className={`h-10 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-app text-[9px] font-black uppercase tracking-widest border-none flex items-center gap-2 transition-all ${isPdfGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Download size={16} /> {isPdfGenerating ? 'Generating...' : 'Download PDF'}
                      </button>
                    </div>
                  </motion.div>

                ) : showSettlementInvoice ? (
                  <motion.div
                    id="settlement-print-area"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-4 md:p-12 rounded-app border border-slate-100 space-y-10 print:p-0 print:border-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-primary rounded-app flex items-center justify-center text-white"><Zap size={24} /></div>
                          <span className="text-xl font-black tracking-tight text-slate-900">Settlement Statement</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                          Operational Over-limit Adjustment<br />
                          Post-Trip Logistics Audit<br />
                          registry@carrental.sangvish.com
                        </div>
                      </div>
                      <div className="text-left sm:text-right space-y-1">
                        <h2 className="text-3xl font-black text-rose-500 uppercase tracking-tight">Overage</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SL-{selectedBooking._id.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Calculated: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-rose-50/50 p-6 rounded-app border border-rose-100 flex items-center gap-4">
                      <AlertCircle className="text-rose-500" size={24} />
                      <div>
                        <p className="text-xs font-black text-rose-900 uppercase tracking-widest">Operational Over-limit Detected</p>
                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">The following charges apply for exceeding the agreed distance allowance.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="hidden md:grid md:grid-cols-12 border-b-2 border-slate-900 pb-4 gap-4">
                        <div className="md:col-span-6 text-[10px] font-black uppercase tracking-[0.2em]">Item Description</div>
                        <div className="md:col-span-2 text-[10px] font-black uppercase tracking-[0.2em] flex justify-end">Metric</div>
                        <div className="md:col-span-2 text-[10px] font-black uppercase tracking-[0.2em] flex justify-end">Unit Rate</div>
                        <div className="md:col-span-2 text-[10px] font-black uppercase tracking-[0.2em] flex justify-end">Adjustment</div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {(() => {
                          const car = selectedBooking.carId;
                          const start = new Date(selectedBooking.startDate);
                          const end = new Date(selectedBooking.endDate);
                          const paidDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                          const allowancePerDay = car?.distanceIncluded || car?.mileageAllowance || 200;
                          const totalAllowance = allowancePerDay * paidDays;
                          const actualTravelled = (selectedBooking.checkOutMileage || selectedBooking.returnMileage || 0) - (selectedBooking.checkInMileage || selectedBooking.hostMileage || 0);
                          const overage = Math.max(0, actualTravelled - totalAllowance);

                          return (
                            <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                              <div className="md:col-span-6">
                                <p className="text-sm font-black text-slate-900 uppercase">Mileage Overage</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                  Trip Allowance: {totalAllowance} KM ({allowancePerDay} KM/day x {paidDays} days)
                                </p>
                              </div>
                              <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                                <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">Metric</span>
                                <span className="text-sm font-bold text-slate-600">{overage} KM</span>
                              </div>
                              <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                                <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit Rate</span>
                                <span className="text-sm font-bold text-slate-600">{formatCurrency((car?.extraDistanceFee || 0.5), car?.currency)} / KM</span>
                              </div>
                              <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                                <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">Adjustment</span>
                                <span className="text-sm font-black text-rose-600">+ {formatCurrency((overage * (car?.extraDistanceFee || 0.5)), car?.currency)}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:flex md:justify-between md:items-start pt-10 gap-10 md:gap-12 relative z-10">
                      <div className="w-full md:w-[320px] space-y-4 relative z-20">
                        <div className="flex justify-between items-center text-slate-400 px-2">
                          <span className="text-[10px] font-black uppercase tracking-widest">Overage Fee</span>
                          <span className="text-sm font-bold">{formatCurrency(((selectedBooking as any).settlementAmount || 0), selectedBooking.carId?.currency)}</span>
                        </div>
                        <div className="h-px bg-rose-500 my-4" />
                        <div className="bg-rose-500 p-6 rounded-app text-white shadow-xl shadow-rose-900/10">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Balance Due</span>
                            <span className="text-xl font-black">{formatCurrency(((selectedBooking as any).settlementAmount || 0), selectedBooking.carId?.currency)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:max-w-[280px] space-y-4 relative z-10">
                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-app border border-slate-100 dark:border-white/10">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Audit Reference</p>
                          <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-relaxed">
                            Odometer: {selectedBooking.checkInMileage || selectedBooking.hostMileage} KM → {selectedBooking.checkOutMileage || selectedBooking.returnMileage} KM
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-10 flex flex-wrap justify-end gap-3 print:hidden">
                      <button
                        onClick={() => { setShowSettlementInvoice(false); window.scrollTo(0, 0); }}
                        className="h-10 px-6 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 dark:hover:text-white rounded-app text-[9px] font-black uppercase tracking-widest border-none flex items-center gap-2 transition-all transition-colors"
                      >
                        <ChevronLeft size={16} /> Back to Details
                      </button>
                      {userType !== 'host' && !selectedBooking.isSettled && (
                        <Button
                          onClick={() => setSignatureModal({ isOpen: true, type: 'check-out', bookingId: selectedBooking._id })}
                          disabled={isSubmittingAction}
                          className="h-14 px-10 bg-primary hover:bg-primary-hover text-white rounded-app text-[11px] font-black uppercase tracking-widest border-none flex items-center gap-2 transition-all"
                        >
                          <CreditCard size={20} /> Authorize & Pay Settlement
                        </Button>
                      )}
                      <button
                        onClick={() => window.print()}
                        className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-app text-[9px] font-black uppercase tracking-widest border-none flex items-center gap-2 transition-all"
                      >
                        <Printer size={16} /> Print Audit
                      </button>
                      <button
                        onClick={() => handleDownloadPDF('settlement-print-area', `Settlement-${selectedBooking.bookingHash || selectedBooking._id.slice(-8)}.pdf`)}
                        disabled={isPdfGenerating}
                        className={`h-10 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-app text-[9px] font-black uppercase tracking-widest border-none flex items-center gap-2 transition-all ${isPdfGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Download size={16} /> {isPdfGenerating ? 'Generating...' : 'Download PDF'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-10">
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-black p-6 rounded-app border border-slate-100 dark:border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-app bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                          {(() => {
                            const target = userType === 'host' ? selectedBooking.customerId : selectedBooking.vendorId;
                            const firstName = target?.firstName || '';
                            const lastName = target?.lastName || '';
                            if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
                            if (firstName) return firstName.slice(0, 2).toUpperCase();
                            return userType === 'host' ? 'CU' : 'VL';
                          })()}
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{userType === 'host' ? 'Customer Contact' : 'Host Liaison'}</p>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                            {userType === 'host' ?
                              `${selectedBooking.customerId?.firstName} ${selectedBooking.customerId?.lastName}` :
                              `${selectedBooking.vendorId?.firstName} ${selectedBooking.vendorId?.lastName}`}
                          </h4>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => {
                            const targetId = userType === 'host'
                              ? (selectedBooking.customerId?._id || selectedBooking.customerId)
                              : (selectedBooking.vendorId?._id || selectedBooking.vendorId);
                            handleStartChat(targetId);
                          }}
                          disabled={isStartingChat}
                          title={userType === 'host' ? 'Message Renter' : 'Message Host'}
                          className="flex items-center gap-1.5 px-3 h-9 bg-primary text-white rounded-app text-[9px] font-black uppercase tracking-widest hover:bg-primary-hover transition-all border-none disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
                        >
                          <MessageCircle size={13} />
                          {isStartingChat ? 'Opening...' : (userType === 'host' ? 'Msg Renter' : 'Msg Host')}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-primary rounded-full" />
                        <Car size={12} className="text-primary" />
                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Vehicle Registry</h4>
                      </div>
                      <div className="bg-slate-50 dark:bg-black p-6 rounded-app border border-slate-100 dark:border-white/10 flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                        <div className="space-y-1 relative z-10">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {typeof selectedBooking.carId?.brand === 'object' ? selectedBooking.carId.brand.name : ''} {selectedBooking.carId?.model}
                          </p>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {selectedBooking.carId?.name || selectedBooking.carId?.title || 'Vehicle'}
                          </h3>
                        </div>
                        <div className="text-right relative z-10">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Color State</p>
                          <p className="text-sm font-black text-primary uppercase">{selectedBooking.carId?.color || 'Original'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                          <Calendar size={12} className="text-emerald-500" />
                          <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Journey Start</h4>
                        </div>
                        <div className="bg-slate-50 dark:bg-black p-5 rounded-app border border-slate-100 dark:border-white/10 space-y-3">
                          <div className="flex items-center gap-3">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{formatDate(selectedBooking.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{selectedBooking.pickupTime || "10:00 AM"}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{selectedBooking.carId?.location?.city || "New York Hub"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-slate-300 rounded-full" />
                          <History size={12} className="text-slate-400" />
                          <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Return State</h4>
                        </div>
                        <div className="bg-slate-50 dark:bg-black p-5 rounded-app border border-slate-100 dark:border-white/10 space-y-3 opacity-80">
                          <div className="flex items-center gap-3">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{formatDate(selectedBooking.endDate)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{selectedBooking.returnTime || "10:00 AM"}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{selectedBooking.carId?.location?.city || "New York Hub"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedBooking.message && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-amber-400 rounded-full " />
                          <MessageSquare size={12} className="text-amber-500" />
                          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Travel Message</h4>
                        </div>
                        <div className="bg-amber-50/30 p-6 rounded-app border border-amber-100 flex items-start gap-4">
                          <Quote size={20} className="text-amber-400 shrink-0" />
                          <p className="text-xs font-bold text-slate-600 leading-relaxed italic uppercase tracking-widest">"{selectedBooking.message}"</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-primary rounded-full " />
                        <ShieldCheck size={12} className="text-primary" />
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Registry Timeline & Verification Evidence</h4>
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
                        <div className="space-y-8">
                          <div className="relative flex items-start gap-6">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-white relative z-10 shrink-0 mt-0.5">
                              <CheckCircle2 size={12} />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Booking Created</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(selectedBooking.createdAt)}</p>
                            </div>
                          </div>

                          <div className="relative flex items-start gap-6">
                            <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white relative z-10 shrink-0 mt-0.5 ${selectedBooking.status === 'Active' || selectedBooking.status === 'Completed' ? 'bg-emerald-500' : (selectedBooking.status === 'Confirmed' ? 'bg-primary' : 'bg-slate-200')}`}>
                              <Car size={12} />
                            </div>
                            <div className="flex-1 space-y-4">
                              <div>
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Handover Process (Pickup Stage)</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                  {(selectedBooking as any).customerAcceptedCondition || selectedBooking.status === 'Completed' ? 'Handover Successfully Completed' : 'Awaiting Operational Handover'}
                                </p>
                              </div>

                              {((selectedBooking.checkInPhotos && selectedBooking.checkInPhotos.length > 0) || selectedBooking.hostConditionImage) && (
                                <div className="bg-white rounded-app border border-slate-100 shadow-sm overflow-hidden">
                                  <div
                                    onClick={() => setIsCheckInAuditExpanded(!isCheckInAuditExpanded)}
                                    className="p-3 sm:p-4 bg-slate-50 flex flex-wrap justify-between items-center gap-y-2 cursor-pointer hover:bg-slate-100/80 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 shrink-0 rounded-full bg-emerald-500" />
                                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Pre-Trip Handover Audit</p>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                        {isCheckInAuditExpanded ? "Hide Audit" : <><span className="hidden sm:inline">View Audit </span>(Verified)</>}
                                      </span>
                                      <div className={`p-1 text-slate-400 transition-transform duration-300 ${isCheckInAuditExpanded ? '-rotate-90 sm:rotate-180' : 'rotate-90 sm:rotate-0'}`}>
                                        <ChevronRight size={12} />
                                      </div>
                                    </div>
                                  </div>

                                  <div className={`transition-all duration-500 ease-in-out px-5 ${isCheckInAuditExpanded ? 'py-5 max-h-[2000px] opacity-100 space-y-4 border-t border-slate-100' : 'max-h-0 opacity-0 overflow-hidden py-0'}`}>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="p-3 bg-slate-50 rounded-app border border-slate-100 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Odometer</span>
                                        <span className="text-xs font-black text-slate-800">{(selectedBooking.checkInMileage || selectedBooking.hostMileage)?.toLocaleString()} KM</span>
                                      </div>
                                      <div className="p-3 bg-slate-50 rounded-app border border-slate-100 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fuel Level</span>
                                        <span className="text-xs font-black text-slate-800">{selectedBooking.checkInFuelLevel ?? 100}%</span>
                                      </div>
                                    </div>

                                    {selectedBooking.checkInNotes && (
                                      <div className="p-3 bg-slate-50 rounded-app border border-slate-100 space-y-1">
                                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                          <Quote size={10} /> Host Observations
                                        </span>
                                        <p className="text-xs font-medium text-slate-700 italic leading-relaxed">{selectedBooking.checkInNotes}</p>
                                      </div>
                                    )}

                                    {(() => {
                                      const photosList = selectedBooking.checkInPhotos?.length ? selectedBooking.checkInPhotos : (selectedBooking.hostConditionImage ? [selectedBooking.hostConditionImage] : []);
                                      return (
                                        <div className="space-y-2">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Verification Evidence ({photosList.length})</span>
                                          <div className="grid grid-cols-3 gap-2">
                                            {photosList.map((photo: string, i: number) => (
                                              <div
                                                key={i}
                                                onClick={() => window.open(getImageUrl(photo), '_blank')}
                                                className="relative aspect-square rounded-app overflow-hidden border border-slate-100 cursor-pointer group bg-slate-50"
                                              >
                                                <img src={getImageUrl(photo)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE} />
                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                  <ExternalLink size={14} />
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })()}

                                    <Button
                                      onClick={() => {
                                        setLifecycleType('check-in');
                                        setLifecycleReadOnly(true);
                                        setIsLifecycleModalOpen(true);
                                      }}
                                      variant="ghost"
                                      className="w-full h-10 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 border border-slate-200 mt-2"
                                    >
                                      View Full Check-In Registry Form
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="relative flex items-start gap-6">
                            <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white relative z-10 shrink-0 mt-0.5 ${selectedBooking.status === 'Completed' ? 'bg-emerald-500' : (selectedBooking.status === 'Active' ? 'bg-amber-500' : 'bg-slate-200')}`}>
                              <History size={12} />
                            </div>
                            <div className="flex-1 space-y-4">
                              <div>
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Return & Settlement (Drop-off Stage)</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                  {selectedBooking.status === 'Completed' || (selectedBooking as any).customerAcceptedReturn ? 'Journey Successfully Concluded' : 'Post-trip Closure Protocol'}
                                </p>
                              </div>

                              {((selectedBooking.checkOutPhotos && selectedBooking.checkOutPhotos.length > 0) || selectedBooking.returnConditionImage) && (
                                <div className="bg-white rounded-app border border-slate-100 shadow-sm overflow-hidden">
                                  <div
                                    onClick={() => setIsCheckOutAuditExpanded(!isCheckOutAuditExpanded)}
                                    className="p-3 sm:p-4 bg-slate-50 flex flex-wrap justify-between items-center gap-y-2 cursor-pointer hover:bg-slate-100/80 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 shrink-0 rounded-full bg-amber-500" />
                                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Post-Trip Return Audit</p>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                        {isCheckOutAuditExpanded ? "Hide Audit" : <><span className="hidden sm:inline">View Audit </span>(Verified)</>}
                                      </span>
                                      <div className={`p-1 text-slate-400 transition-transform duration-300 ${isCheckOutAuditExpanded ? '-rotate-90 sm:rotate-180' : 'rotate-90 sm:rotate-0'}`}>
                                        <ChevronRight size={12} />
                                      </div>
                                    </div>
                                  </div>

                                  <div className={`transition-all duration-500 ease-in-out px-5 ${isCheckOutAuditExpanded ? 'py-5 max-h-[2000px] opacity-100 space-y-4 border-t border-slate-100' : 'max-h-0 opacity-0 overflow-hidden py-0'}`}>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="p-3 bg-slate-50 rounded-app border border-slate-100 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Odometer</span>
                                        <span className="text-xs font-black text-slate-800">{(selectedBooking.checkOutMileage || selectedBooking.returnMileage)?.toLocaleString()} KM</span>
                                      </div>
                                      <div className="p-3 bg-slate-50 rounded-app border border-slate-100 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fuel Level</span>
                                        <span className="text-xs font-black text-slate-800">{selectedBooking.checkOutFuelLevel ?? 100}%</span>
                                      </div>
                                    </div>

                                    {selectedBooking.checkOutNotes && (
                                      <div className="p-3 bg-slate-50 rounded-app border border-slate-100 space-y-1">
                                        <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                          <Quote size={10} /> Return Observations
                                        </span>
                                        <p className="text-xs font-medium text-slate-700 italic leading-relaxed">{selectedBooking.checkOutNotes}</p>
                                      </div>
                                    )}

                                    {(() => {
                                      const photosList = selectedBooking.checkOutPhotos?.length ? selectedBooking.checkOutPhotos : (selectedBooking.returnConditionImage ? [selectedBooking.returnConditionImage] : []);
                                      return (
                                        <div className="space-y-2">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Verification Evidence ({photosList.length})</span>
                                          <div className="grid grid-cols-3 gap-2">
                                            {photosList.map((photo: string, i: number) => (
                                              <div
                                                key={`${photo}-${i}`}
                                                onClick={() => window.open(getImageUrl(photo), '_blank')}
                                                className="relative aspect-square rounded-app overflow-hidden border border-slate-100 cursor-pointer group bg-slate-50"
                                              >
                                                <img key={getImageUrl(photo)} src={getImageUrl(photo)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE} />
                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                  <ExternalLink size={14} />
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })()}

                                    <Button
                                      onClick={() => {
                                        setLifecycleType('check-out');
                                        setLifecycleReadOnly(true);
                                        setIsLifecycleModalOpen(true);
                                      }}
                                      variant="ghost"
                                      className="w-full h-10 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 border border-slate-200 mt-2"
                                    >
                                      View Full Check-Out Registry Form
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      {(() => {
                        const status = selectedBooking.status;
                        const isHost = userType === 'host';
                        const b: any = selectedBooking;
                        const rejectionCount = b.handoverRejectionCount || 0;

                        if (status === 'Completed') {
                          return (
                            <div className="bg-emerald-50 p-6 rounded-app border border-emerald-100 flex flex-col items-center justify-center text-center space-y-4 py-12">
                              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white -500/20">
                                <CheckCircle2 size={32} />
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-xl font-black text-slate-900 tracking-tighter">Journey Successfully Concluded</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">This booking registry is now permanently archived</p>
                                <div className="pt-4 flex gap-4 w-full flex-wrap">
                                  <Button onClick={() => setShowInvoice(true)} className="flex-1 h-12 bg-white border border-slate-100 text-slate-900 rounded-app text-[9px] font-black uppercase tracking-widest hover:bg-slate-50">View Rental Invoice</Button>
                                  {b.isSettled && <Button onClick={() => setShowSettlementInvoice(true)} className="flex-1 h-12 bg-white border border-slate-100 text-slate-900 rounded-app text-[9px] font-black uppercase tracking-widest hover:bg-slate-50">Settlement Invoice</Button>}
                                  {userType === 'renter' && !existingReview && (
                                    <Button onClick={() => setShowReviewModal(true)} className="flex-1 h-12 bg-primary hover:bg-primary-hover text-white rounded-app text-[9px] font-black uppercase tracking-widest border-none">Rate Experience</Button>
                                  )}
                                </div>
                                {existingReview && (
                                  <div className="mt-4 p-4 rounded-app bg-emerald-50 border border-emerald-100 space-y-2 cursor-pointer hover:bg-emerald-100/50 transition-colors" onClick={() => setIsReviewExpanded(!isReviewExpanded)}>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Your Review</p>
                                        <div className="flex items-center gap-1 mt-1">
                                          {[1, 2, 3, 4, 5].map(s => (
                                            <span key={s} className={`text-sm ${s <= (existingReview.rating || 0) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                                          ))}
                                          <span className="ml-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">{existingReview.rating}/5</span>
                                        </div>
                                      </div>
                                      <div className={`p-1 text-slate-400 transition-transform duration-300 ${isReviewExpanded ? '-rotate-90 sm:rotate-180' : 'rotate-90 sm:rotate-0'}`}>
                                        <ChevronRight size={12} />
                                      </div>
                                    </div>
                                    {existingReview.comment && <p className="text-xs font-medium text-slate-600 leading-relaxed">&ldquo;{existingReview.comment}&rdquo;</p>}
                                    <div className={`transition-all duration-500 ease-in-out ${isReviewExpanded ? 'max-h-[500px] opacity-100 pt-3 mt-3 border-t border-emerald-200/50' : 'max-h-0 opacity-0 overflow-hidden pt-0 mt-0'}`}>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Cleanliness</p>
                                          <p className="text-xs font-black text-slate-700">{existingReview.vehicleCleanliness}/5</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</p>
                                          <p className="text-xs font-black text-slate-700">{existingReview.listingAccuracy}/5</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Pickup</p>
                                          <p className="text-xs font-black text-slate-700">{existingReview.pickupExperience}/5</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Value</p>
                                          <p className="text-xs font-black text-slate-700">{existingReview.valueForMoney}/5</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Host Comms</p>
                                          <p className="text-xs font-black text-slate-700">{existingReview.hostCommunication}/5</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                                          <p className="text-xs font-black text-slate-700">{existingReview.vehicleLocation}/5</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }

                        if (status === 'Pending' && isHost) {
                          return (
                            <div className="space-y-6">
                              {b.customerId?.verificationSubmission?.documents?.length > 0 ? (
                                <div className="bg-white p-6 rounded-app border border-slate-200 space-y-4 shadow-sm">
                                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <ShieldCheck size={18} className="text-primary" />
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Customer Identity & Verification Evidence</h4>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {b.customerId.verificationSubmission.documents.map((doc: any) => (
                                      <div key={doc.fieldId} className="space-y-2 bg-slate-50 p-4 rounded-app border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.fieldName}</p>
                                        {doc.fieldType === 'image' ? (
                                          <div
                                            onClick={() => window.open(doc.value.startsWith('http') ? doc.value : `${BACKEND_URL}${doc.value}`, '_blank')}
                                            className="relative aspect-video bg-slate-100 rounded-app overflow-hidden border border-slate-200 group cursor-pointer"
                                          >
                                            <img
                                              src={doc.value.startsWith('http') ? doc.value : `${BACKEND_URL}${doc.value}`}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                              alt={doc.fieldName}
                                              onError={(e) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase tracking-widest gap-2">
                                              <ExternalLink size={14} /> Click to Inspect
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="font-black text-xs text-slate-800">
                                            {doc.value}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="bg-primary/5 p-4 rounded-app border border-primary/20 flex items-center gap-3">
                                    <Info size={16} className="text-primary shrink-0" />
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                                      Please verify the customer's uploaded identification documents before approving the rental request.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-amber-50 p-6 rounded-app border border-amber-100 flex items-center gap-3">
                                  <AlertCircle size={18} className="text-amber-500 shrink-0" />
                                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
                                    No verification documents found for this customer. Proceed with caution.
                                  </p>
                                </div>
                              )}

                              <div className="bg-slate-50 p-6 rounded-app border border-slate-100 space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-app bg-primary/10 flex items-center justify-center text-primary"><Clock size={14} /></div>
                                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Awaiting Approval</span>
                                </div>
                                
                                {b.customerId?.verificationSubmission?.documents?.length > 0 && (
                                  <label className="flex items-start gap-3 p-4 border border-primary/20 bg-primary/5 rounded-app cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      className="mt-0.5"
                                      checked={isDocumentAccepted}
                                      onChange={(e) => setIsDocumentAccepted(e.target.checked)}
                                    />
                                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest leading-relaxed">
                                      I confirm that I have reviewed the customer's verification documents and approve this rental.
                                    </span>
                                  </label>
                                )}

                                <div className="flex gap-3">
                                  <Button 
                                    onClick={() => handleApprove(b._id)} 
                                    disabled={b.customerId?.verificationSubmission?.documents?.length > 0 && !isDocumentAccepted}
                                    className="flex-1 h-12 bg-primary hover:bg-primary-hover text-white rounded-app text-[10px] font-black uppercase tracking-widest border-none disabled:opacity-50"
                                  >
                                    Approve Request
                                  </Button>
                                  <Button onClick={() => handleReject(b._id)} variant="ghost" className="flex-1 h-12 bg-white border border-slate-100 text-rose-500 hover:bg-rose-50 rounded-app text-[10px] font-black uppercase tracking-widest">Decline</Button>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (status === 'Awaiting Payment') {
                          if (!isHost) {
                            return (
                              <div className="bg-amber-50 p-6 rounded-app border border-amber-100 space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-app bg-amber-500/10 flex items-center justify-center text-amber-500"><CreditCard size={14} /></div>
                                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{t('bookings.status.awaiting_payment')}</span>
                                </div>
                                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                  Your booking is confirmed, but payment is required to activate the journey.
                                </p>
                                <Button
                                  onClick={() => {
                                    setIsFinalizing(true);
                                    const method = b.paymentMethod?.toLowerCase() || 'stripe';
                                    fetch(`${API_BASE_URL}/payments/create-session/${b._id}`, {
                                      method: 'POST',
                                      headers: {
                                        'Authorization': `Bearer ${authService.getToken()}`,
                                        'Content-Type': 'application/json'
                                      },
                                      body: JSON.stringify({ paymentMethod: method })
                                    })
                                      .then(r => r.json())
                                      .then(data => {
                                        if (data.url) window.location.href = data.url;
                                        else alert("Failed to initialize payment.");
                                      })
                                      .catch(() => alert("Error connecting to payment gateway."))
                                      .finally(() => setIsFinalizing(false));
                                  }}
                                  className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-app text-[10px] font-black uppercase tracking-widest border-none"
                                >
                                  {isFinalizing ? "INITIALIZING..." : "Complete Payment"}
                                </Button>
                              </div>
                            );
                          }
                          return (
                            <div className="bg-slate-50 p-6 rounded-app border border-slate-100 flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Clock size={18} /></div>
                              <div>
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Payment Pending</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Waiting for customer to complete payment.</p>
                              </div>
                            </div>
                          );
                        }

                        if (status === 'Confirmed') {
                          if (isHost && (!b.hostConditionImage && (!b.checkInPhotos || b.checkInPhotos.length === 0))) {
                            return (
                              <div className="bg-primary/5 p-8 rounded-app border border-primary/20 space-y-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Upload size={18} /></div>
                                    <div>
                                      <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Ready for Check-In</h3>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document the vehicle condition to authorize handover</p>
                                    </div>
                                  </div>
                                  {rejectionCount > 0 && (
                                    <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-app uppercase tracking-widest border border-rose-100">
                                      Deficiency Flagged: Attempt {rejectionCount}/3
                                    </span>
                                  )}
                                </div>
                                <Button
                                  onClick={() => {
                                    setLifecycleType('check-in');
                                    setLifecycleReadOnly(false);
                                    setIsLifecycleModalOpen(true);
                                  }}
                                  className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-app border-none shadow-xl shadow-primary/10 group"
                                >
                                  Begin Trip Check-In <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                              </div>
                            );
                          } else if (isHost && (b.tripStatus === 'host_submitted_check_in' || (b.hostConditionImage && !b.customerAcceptedCondition))) {
                            const photosList = b.checkInPhotos?.length ? b.checkInPhotos : (b.hostConditionImage ? [b.hostConditionImage] : []);
                            return (
                              <div className="bg-amber-50/50 p-6 rounded-app border border-amber-100 space-y-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0"><Clock size={18} /></div>
                                  <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Handover Registry Pending</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Reviewing documentation. Waiting for renter's formal acceptance.</p>
                                  </div>
                                </div>
                                <div className="p-4 bg-white rounded-app border border-amber-100 space-y-4">
                                  <div className="flex items-center justify-between border-b border-amber-100/50 pb-3">
                                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Your Submitted Documentation</p>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">First Viewable Preview</span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-app border border-slate-100 flex items-center justify-between">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Odometer</span>
                                      <span className="text-xs font-black text-slate-800">{(b.checkInMileage || b.hostMileage)?.toLocaleString()} KM</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-app border border-slate-100 flex items-center justify-between">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fuel Level</span>
                                      <span className="text-xs font-black text-slate-800">{b.checkInFuelLevel ?? 100}%</span>
                                    </div>
                                  </div>

                                  {b.checkInNotes && (
                                    <div className="p-3 bg-amber-50/30 rounded-app border border-amber-100/50 space-y-1">
                                      <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                        <Quote size={10} /> Host Observations
                                      </span>
                                      <p className="text-xs font-medium text-slate-700 italic leading-relaxed">{b.checkInNotes}</p>
                                    </div>
                                  )}

                                  <div className="space-y-2">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Uploaded Verification Evidence ({photosList.length})</span>
                                    <div className="grid grid-cols-3 gap-2">
                                      {photosList.map((photo: string, i: number) => (
                                        <div
                                          key={i}
                                          onClick={() => window.open(getImageUrl(photo), '_blank')}
                                          className="relative aspect-square rounded-app overflow-hidden border border-slate-100 cursor-pointer group bg-slate-50"
                                        >
                                          <img src={getImageUrl(photo)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE} />
                                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                            <ExternalLink size={14} />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <Button
                                    onClick={() => {
                                      setLifecycleType('check-in');
                                      setLifecycleReadOnly(true);
                                      setIsLifecycleModalOpen(true);
                                    }}
                                    variant="ghost"
                                    className="w-full h-10 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 border border-slate-100 mt-2"
                                  >
                                    Open Full Registry Modal
                                  </Button>
                                </div>
                              </div>
                            );
                          } else if (!isHost && (b.tripStatus === 'host_submitted_check_in' || (b.hostConditionImage && !b.customerAcceptedCondition))) {
                            const photosList = b.checkInPhotos?.length ? b.checkInPhotos : (b.hostConditionImage ? [b.hostConditionImage] : []);
                            return (
                              <div className="bg-emerald-50 p-6 rounded-app border border-emerald-100 space-y-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-app bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0"><ShieldCheck size={14} /></div>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Handover Protocol: Verify Condition</span>
                                  </div>
                                  {rejectionCount > 0 && (
                                    <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-app uppercase tracking-widest border border-rose-100">
                                      Attempt {rejectionCount}/3 Failed
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-4">
                                  <div className="space-y-3">
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest px-1 flex items-center justify-between">
                                      <span className="flex items-center gap-2"><FileText size={10} /> Handover Documentation</span>
                                      <span className="text-[8px] font-bold text-slate-400">First Viewable Evidence</span>
                                    </p>

                                    <div className="bg-white p-4 rounded-app border border-emerald-100 space-y-4">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-50 rounded-app border border-slate-100 flex items-center justify-between">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Odometer</span>
                                          <span className="text-xs font-black text-slate-900">{(b.checkInMileage || b.hostMileage)?.toLocaleString()} KM</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-app border border-slate-100 flex items-center justify-between">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fuel Level</span>
                                          <span className="text-xs font-black text-slate-900">{b.checkInFuelLevel ?? 100}%</span>
                                        </div>
                                      </div>

                                      {b.checkInNotes && (
                                        <div className="p-3 bg-emerald-50/50 rounded-app border border-emerald-100 space-y-1">
                                          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                            <Quote size={10} /> Host Observations
                                          </span>
                                          <p className="text-xs font-medium text-slate-700 italic leading-relaxed">{b.checkInNotes}</p>
                                        </div>
                                      )}

                                      <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Uploaded Verification Evidence ({photosList.length})</span>
                                        <div className="grid grid-cols-3 gap-2">
                                          {photosList.map((photo: string, i: number) => (
                                            <div
                                              key={i}
                                              onClick={() => window.open(getImageUrl(photo), '_blank')}
                                              className="relative aspect-square rounded-app overflow-hidden border border-slate-100 cursor-pointer group bg-slate-50"
                                            >
                                              <img src={getImageUrl(photo)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE} />
                                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                <ExternalLink size={14} />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <Button
                                        variant="ghost"
                                        className="w-full h-10 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 border border-slate-100 mt-2"
                                        onClick={() => {
                                          setLifecycleType('check-in');
                                          setLifecycleReadOnly(true);
                                          setIsLifecycleModalOpen(true);
                                        }}
                                      >
                                        Open Full Registry Modal
                                      </Button>
                                    </div>
                                  </div>

                                  <div
                                    onClick={() => setIsDocumentAccepted(!isDocumentAccepted)}
                                    className={`p-4 rounded-app border flex items-start gap-3 cursor-pointer transition-all ${isDocumentAccepted ? 'bg-emerald-100/50 border-emerald-200' : 'bg-white border-slate-100'}`}
                                  >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${isDocumentAccepted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200'}`}>
                                      {isDocumentAccepted && <Check size={12} />}
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                      I have reviewed the handover condition documents and I accept the terms to start the journey.
                                    </p>
                                  </div>

                                  <div className="flex gap-3">
                                    <Button
                                      disabled={isSubmittingAction || !isDocumentAccepted}
                                      onClick={() => {
                                        if (!b.renterAgreementSignature) {
                                          showToast("You must sign the Rental Agreement before Check-In.", "error");
                                          router.push(`/dashboard/bookings/${b._id}/agreement`);
                                          return;
                                        }
                                        setSignatureModal({ isOpen: true, type: 'check-in', bookingId: b._id });
                                      }}
                                      className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-app text-[10px] font-black uppercase tracking-widest border-none disabled:opacity-50 disabled:grayscale transition-all"
                                    >
                                      {isSubmittingAction ? "PROCESSING..." : "Authorize & Start Journey"}
                                    </Button>
                                    <Button
                                      disabled={isSubmittingAction}
                                      onClick={() => handleRejectCondition(b._id)}
                                      variant="ghost"
                                      className="flex-1 h-12 bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-app text-[10px] font-black uppercase tracking-widest"
                                    >
                                      Reject
                                    </Button>
                                  </div>

                                  {rejectionCount >= 3 && (
                                    <div className="pt-4 border-t border-emerald-100 mt-2">
                                      <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-3 leading-relaxed">
                                        Host has failed to provide accurate documentation 3 times.
                                        You are entitled to cancel this journey with a FULL refund.
                                      </p>
                                      <Button
                                        disabled={isSubmittingAction}
                                        onClick={() => handleReportHost(b._id)}
                                        className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-app text-[10px] font-black uppercase tracking-widest border-none -600/20"
                                      >
                                        Report Host & Full Refund
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          } else if (!isHost && (!b.hostConditionImage && (!b.checkInPhotos || b.checkInPhotos.length === 0))) {
                            const isActualVendor = (user?._id || user?.id) === (b.vendorId?._id || b.vendorId);
                            if (isActualVendor) {
                              return (
                                <div className="bg-primary/5 p-6 rounded-app border border-primary/10 space-y-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-app bg-primary/20 flex items-center justify-center text-primary"><AlertCircle size={14} /></div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Persona Mismatch Detected</span>
                                  </div>
                                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] leading-relaxed">
                                    You are the Host of this vehicle, but you are currently in Renter Mode.
                                    Switch to Host Mode to authorize the handover.
                                  </p>
                                  <Button
                                    onClick={() => setUserType('host')}
                                    className="w-full h-10 bg-primary text-white rounded-app text-[9px] font-black uppercase tracking-widest border-none "
                                  >
                                    Switch to Host Mode
                                  </Button>
                                </div>
                              );
                            }
                            return (
                              <div className="bg-slate-50 p-6 rounded-app border border-slate-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Clock size={18} /></div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Handover Pending</p>
                                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Waiting for host to submit car condition documents.</p>
                                </div>
                              </div>
                            );
                          }
                        }

                        if (status === 'Active') {
                          if (isHost && (!b.returnConditionImage && (!b.checkOutPhotos || b.checkOutPhotos.length === 0))) {
                            return (
                              <div className="bg-indigo-50 p-8 rounded-app border border-indigo-100 space-y-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><ArrowRight size={18} /></div>
                                  <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Trip in Progress / Ready for Return</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document post-trip condition and mileage to conclude</p>
                                  </div>
                                </div>
                                <div className="flex gap-4">
                                  <Button
                                    onClick={() => {
                                      setLifecycleType('check-out');
                                      setLifecycleReadOnly(false);
                                      setIsLifecycleModalOpen(true);
                                    }}
                                    className="flex-1 h-14 bg-primary hover:bg-primary-hover text-white font-black text-[10px] uppercase tracking-[0.1em] rounded-app border-none shadow-xl shadow-primary/10 group"
                                  >
                                    Begin Return Check-Out <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                  </Button>
                                  <Button
                                    onClick={() => setShowExtendModal(true)}
                                    variant="outline"
                                    className="flex-1 h-14 bg-white hover:bg-indigo-50 text-indigo-600 border-indigo-200 font-black text-[10px] uppercase tracking-[0.1em] rounded-app"
                                  >
                                    <Calendar size={16} className="mr-2" /> Extend Trip
                                  </Button>
                                </div>
                              </div>
                            );
                          } else if (isHost && (b.tripStatus === 'host_submitted_check_out' || (b.returnConditionImage && !b.customerAcceptedReturn))) {
                            const photosList = b.checkOutPhotos?.length ? b.checkOutPhotos : (b.returnConditionImage ? [b.returnConditionImage] : []);
                            return (
                              <div className="bg-amber-50/50 p-6 rounded-app border border-amber-100 space-y-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0"><Clock size={18} /></div>
                                  <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Return Settlement Pending</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Reviewing return condition. Waiting for renter's final sign-off.</p>
                                  </div>
                                </div>
                                <div className="p-4 bg-white rounded-app border border-amber-100 space-y-4">
                                  <div className="flex items-center justify-between border-b border-amber-100/50 pb-3">
                                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Your Return Submission</p>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">First Viewable Preview</span>
                                  </div>

                                  {/* Odometer & Fuel Telemetry */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-app border border-slate-100 flex items-center justify-between">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Return Odometer</span>
                                      <span className="text-xs font-black text-slate-800">{(b.checkOutMileage || b.returnMileage)?.toLocaleString()} KM</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-app border border-slate-100 flex items-center justify-between">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fuel Level</span>
                                      <span className="text-xs font-black text-slate-800">{b.checkOutFuelLevel ?? 100}%</span>
                                    </div>
                                  </div>

                                  {/* Notes / Observations */}
                                  {b.checkOutNotes && (
                                    <div className="p-3 bg-amber-50/30 rounded-app border border-amber-100/50 space-y-1">
                                      <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                        <Quote size={10} /> Return Observations
                                      </span>
                                      <p className="text-xs font-medium text-slate-700 italic leading-relaxed">{b.checkOutNotes}</p>
                                    </div>
                                  )}

                                  {/* Uploaded Photos Grid */}
                                  <div className="space-y-2">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Uploaded Verification Evidence ({photosList.length})</span>
                                    <div className="grid grid-cols-3 gap-2">
                                      {photosList.map((photo: string, i: number) => (
                                        <div
                                          key={i}
                                          onClick={() => window.open(getImageUrl(photo), '_blank')}
                                          className="relative aspect-square rounded-app overflow-hidden border border-slate-100 cursor-pointer group bg-slate-50"
                                        >
                                          <img src={getImageUrl(photo)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE} />
                                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                            <ExternalLink size={14} />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <Button
                                    onClick={() => {
                                      setLifecycleType('check-out');
                                      setLifecycleReadOnly(true);
                                      setIsLifecycleModalOpen(true);
                                    }}
                                    variant="ghost"
                                    className="w-full h-10 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 border border-slate-100 mt-2"
                                  >
                                    Open Full Registry Modal
                                  </Button>
                                </div>
                              </div>
                            );
                          } else if (!isHost && (b.tripStatus === 'host_submitted_check_out' || (b.returnConditionImage && !b.customerAcceptedReturn))) {
                            const photosList = b.checkOutPhotos?.length ? b.checkOutPhotos : (b.returnConditionImage ? [b.returnConditionImage] : []);
                            const isExpanded = isSettlementDetailExpanded || !b.isSettled;
                            return (
                              <div className="bg-amber-50 p-6 rounded-app border border-amber-100 space-y-6">
                                <div
                                  className="flex items-center justify-between cursor-pointer group/settle"
                                  onClick={() => setIsSettlementDetailExpanded(!isSettlementDetailExpanded)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-app bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0"><CreditCard size={14} /></div>
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Return Protocol: Settlement & Completion</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isExpanded ? "Hide Details" : "View Details"}</span>
                                    <div className={`p-1 text-amber-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                      <ChevronRight size={14} />
                                    </div>
                                  </div>
                                </div>

                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4"
                                  >
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="bg-white p-4 rounded-app border border-amber-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Return Odometer</p>
                                        <p className="text-sm font-black text-slate-900">{(b.checkOutMileage || b.returnMileage)?.toLocaleString()} km</p>
                                      </div>
                                      <div className="bg-white p-4 rounded-app border border-amber-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement Fee</p>
                                        <p className="text-sm font-black text-amber-600">${b.settlementAmount?.toFixed(2)}</p>
                                      </div>
                                    </div>

                                    {/* Extra Payment Breakdown */}
                                    {b.settlementAmount > 0 && (
                                      <div className="p-4 bg-white/60 rounded-app border border-amber-100 space-y-3">
                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Settlement Breakdown</p>
                                        {(() => {
                                          const car = b.carId;
                                          const start = new Date(`${b.startDate}T${b.pickupTime}`);
                                          const end = new Date(`${b.endDate}T${b.returnTime}`);
                                          const paidDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
                                          const dailyLimit = car?.distanceIncluded || 200;
                                          const totalAllowedDist = dailyLimit * paidDays;
                                          const travelled = (b.checkOutMileage || b.returnMileage || 0) - (b.hostMileage || b.checkInMileage || 0);
                                          const extraMiles = Math.max(0, travelled - totalAllowedDist);

                                          return (
                                            <div className="space-y-2">
                                              <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                <span>Total Distance Driven</span>
                                                <span>{travelled} KM</span>
                                              </div>
                                              <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                <span>Included Allowance</span>
                                                <span>{totalAllowedDist} KM</span>
                                              </div>
                                              <div className="flex justify-between text-[9px] font-black text-amber-600 uppercase tracking-widest pt-1 border-t border-amber-100">
                                                <span>Overage ({extraMiles} KM x ${car?.extraDistanceFee || 0.5}/KM)</span>
                                                <span>${b.settlementAmount?.toFixed(2)}</span>
                                              </div>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    )}

                                    {/* FIRST VIEWABLE UPLOADED DOCUMENTS */}
                                    <div className="p-4 bg-white rounded-app border border-amber-100 space-y-4">
                                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest border-b border-amber-100/50 pb-2">First Viewable Evidence & Telemetry</p>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-50 rounded-app border border-slate-100 flex items-center justify-between">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fuel Level</span>
                                          <span className="text-xs font-black text-slate-800">{b.checkOutFuelLevel ?? 100}%</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-app border border-slate-100 flex items-center justify-between">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Observations</span>
                                          <span className="text-xs font-black text-slate-800">{b.checkOutNotes ? "Included" : "None"}</span>
                                        </div>
                                      </div>

                                      {b.checkOutNotes && (
                                        <div className="p-3 bg-amber-50/30 rounded-app border border-amber-100/50 space-y-1">
                                          <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                            <Quote size={10} /> Return Observations
                                          </span>
                                          <p className="text-xs font-medium text-slate-700 italic leading-relaxed">{b.checkOutNotes}</p>
                                        </div>
                                      )}

                                      <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Uploaded Verification Evidence ({photosList.length})</span>
                                        <div className="grid grid-cols-3 gap-2">
                                          {photosList.map((photo: string, i: number) => (
                                            <div
                                              key={`${photo}-${i}`}
                                              onClick={() => window.open(getImageUrl(photo), '_blank')}
                                              className="relative aspect-square rounded-app overflow-hidden border border-slate-100 cursor-pointer group bg-slate-50"
                                            >
                                              <img key={getImageUrl(photo)} src={getImageUrl(photo)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE} />
                                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                <ExternalLink size={14} />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    <Button
                                      onClick={() => {
                                        setLifecycleType('check-out');
                                        setLifecycleReadOnly(true);
                                        setIsLifecycleModalOpen(true);
                                      }}
                                      variant="ghost"
                                      className="w-full h-10 text-[9px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-900 border border-amber-200"
                                    >
                                      Open Full Registry Modal
                                    </Button>

                                    <div className="flex flex-col gap-3">
                                      <Button
                                        disabled={isSubmittingAction || b.isSettled}
                                        onClick={() => {
                                          if (b.settlementAmount > 0 && !b.isSettled) {
                                            window.location.href = `/checkout/extra-charges?id=${b._id}`;
                                          } else {
                                            setSignatureModal({ isOpen: true, type: 'check-out', bookingId: b._id });
                                          }
                                        }}
                                        className="w-full h-14 bg-amber-500 hover:bg-primary-hover text-white rounded-app text-[11px] font-black uppercase tracking-widest border-none transition-all flex items-center justify-center gap-2"
                                      >
                                        {isSubmittingAction ? "PROCESSING..." : (b.isSettled ? <><CheckCircle2 size={18} /> Settlement Completed</> : (b.settlementAmount > 0 ? <><CreditCard size={18} /> Accept & Pay Settlement</> : "Accept & Complete Journey"))}
                                      </Button>

                                      {!b.isSettled && (
                                        <Button
                                          disabled={isSubmittingAction}
                                          onClick={() => handleRejectReturn(b._id)}
                                          variant="ghost"
                                          className="w-full h-12 bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-app text-[10px] font-black uppercase tracking-widest"
                                        >
                                          Dispute Settlement / Condition
                                        </Button>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            );
                          } else if (!isHost && (!b.returnConditionImage && (!b.checkOutPhotos || b.checkOutPhotos.length === 0))) {
                            const scheduledEnd = new Date(`${b.endDate}T${b.returnTime || '00:00'}:00`).getTime();
                            const msUntilEnd = scheduledEnd - Date.now();
                            const isNearEnd = msUntilEnd <= 60 * 60 * 1000 && msUntilEnd > - (60 * 60 * 1000); // within 1 hr before or after
                            return (
                              <div className={`p-6 rounded-app border flex flex-col gap-4 ${isNearEnd ? 'bg-rose-50 border-rose-100' : 'bg-primary/5 border-primary/10'}`}>
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isNearEnd ? 'bg-rose-100 text-rose-600' : 'bg-primary/10 text-primary'}`}>
                                    {isNearEnd ? <AlertCircle size={18} /> : <Car size={18} />}
                                  </div>
                                  <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isNearEnd ? 'text-rose-600' : 'text-primary'}`}>
                                      {isNearEnd ? 'Return Approaching' : 'Journey Active'}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                      {isNearEnd 
                                        ? "Your trip ends soon! Return the vehicle on time to avoid extra day charges." 
                                        : "You are currently enjoying your premium drive. Return protocol will activate once the host receives the vehicle."}
                                    </p>
                                  </div>
                                </div>
                                {(isNearEnd || b.delayRequested) && (
                                  <div className="flex gap-4 mt-2">
                                    <Button
                                      disabled={b.delayRequested}
                                      onClick={() => setShowDelayModal(true)}
                                      className={`flex-1 h-12 text-[10px] font-black uppercase tracking-widest border-none ${b.delayRequested ? 'bg-amber-100 text-amber-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                      variant="outline"
                                    >
                                      {b.delayRequested ? "Delay Requested" : "Request Delay"}
                                    </Button>
                                    <Button
                                      onClick={() => setShowExtendModal(true)}
                                      variant="outline"
                                      className="flex-1 h-12 bg-white hover:bg-indigo-50 text-indigo-600 border-indigo-200 font-black text-[10px] uppercase tracking-widest rounded-app"
                                    >
                                      <Calendar size={16} className="mr-2" /> Extend Trip
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        }


                        return null;
                      })()}
                    </div>

                    {/* Cancellation Action Node */}
                    {selectedBooking.status !== 'Cancelled' && selectedBooking.status !== 'Completed' && selectedBooking.status !== 'Active' && userType !== 'host' && (
                      <div className="bg-rose-50/50 p-6 rounded-app border border-rose-100 flex flex-col items-center justify-center transition-all">
                        {!showCancelPolicy ? (
                          <div className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-app bg-rose-500/10 flex items-center justify-center text-rose-500"><X size={14} /></div>
                              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Need to cancel?</span>
                            </div>
                            <Button
                              onClick={() => setShowCancelPolicy(true)}
                              className="h-10 px-6 bg-rose-500 hover:bg-rose-600 text-white rounded-app text-[9px] font-black uppercase tracking-widest border-none -500/10"
                            >
                              Cancel Journey
                            </Button>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full space-y-6"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-app bg-white border border-rose-100 flex items-center justify-center text-rose-500 shrink-0"><AlertCircle size={20} /></div>
                              <div className="space-y-1">
                                <h4 className="text-[11px] font-black text-rose-600 uppercase tracking-[0.2em]">Cancellation Protocol</h4>
                                <p className="text-[10px] font-bold text-rose-500/70 leading-relaxed uppercase tracking-widest">
                                  {refundPreview
                                    ? `Eligibility: ${refundPreview.refundPercentage}% Liquidity Return (~$${refundPreview.refundAmount.toLocaleString()}).`
                                    : 'Assessing refund eligibility...'}
                                </p>
                              </div>
                            </div>

                            {refundPreview && (refundPreview.refundPercentage === 100 || cancellationSettings?.allowAnytimeCancel) ? (
                              <div className="flex items-center gap-3">
                                <Button
                                  disabled={isCancelling}
                                  onClick={() => handleCancelBooking(selectedBooking._id)}
                                  className="flex-1 h-10 bg-rose-500 hover:bg-rose-600 text-white rounded-app text-[9px] font-black uppercase tracking-[0.2em] -500/20 transition-all border-none"
                                >
                                  {isCancelling ? "EXECUTING..." : `Confirm Cancellation ($${refundPreview.refundAmount})`}
                                </Button>
                                <Button
                                  onClick={() => setShowCancelPolicy(false)}
                                  variant="ghost"
                                  className="h-10 px-4 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
                                >
                                  Back
                                </Button>
                              </div>
                            ) : refundPreview ? (
                              <div className="p-4 bg-white/70 rounded-app border border-rose-100 flex items-center gap-3">
                                <Info size={14} className="text-rose-400" />
                                <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Cancellation restricted by policy (Refund &lt; 100%).</p>
                              </div>
                            ) : null}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <AnimatePresence>
        {isFinalizing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <ShieldCheck className="absolute inset-0 m-auto text-primary animate-pulse" size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tighter">Securely Verifying Payment</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8 max-w-xs mx-auto leading-relaxed">Please do not close this window while we finalize your journey registry...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedBooking && showReviewModal && (
        <PostBookingReviewModal
          isOpen={showReviewModal}
          onClose={() => { setShowReviewModal(false); if (selectedBooking?._id) fetchExistingReview(selectedBooking._id); }}
          carId={selectedBooking.carId?._id || selectedBooking.carId}
          bookingId={selectedBooking._id}
          userId={user?._id || user?.id || ''}
          carName={selectedBooking.carId?.name || 'Your Vehicle'}
          hostName={selectedBooking.vendorId ? `${selectedBooking.vendorId.firstName || ''} ${selectedBooking.vendorId.lastName || ''}`.trim() || 'Your Host' : 'Your Host'}
        />
      )}
      {/* Final Polish Modal */}
      <Modal isOpen={isLifecycleModalOpen} onClose={() => setIsLifecycleModalOpen(false)} noHeader noPadding maxWidth="max-w-2xl">
        <TripLifecycleManager
          booking={selectedBooking}
          type={lifecycleType}
          isReadOnly={lifecycleReadOnly}
          onComplete={() => {
            setIsLifecycleModalOpen(false);
            setIsDetailModalOpen(false);
            fetchBookings();
          }}
          onCancel={() => setIsLifecycleModalOpen(false)}
        />
      </Modal>

      {/* Renter Signature Modal */}
      <Modal isOpen={signatureModal.isOpen} onClose={() => setSignatureModal({ isOpen: false, type: null, bookingId: null })} title="Sign to Authorize" maxWidth="max-w-md">
        <div className="p-6 space-y-6">
          <SignaturePad 
            initialSignature={user?.signature} 
            onSave={(sig) => setRenterSignature(sig)} 
            title={signatureModal.type === 'check-in' ? "Handover Authorization" : "Return Authorization"}
            subtitle="Your signature confirms you agree to the conditions"
          />
          <Button 
            disabled={!renterSignature || isSubmittingAction}
            onClick={() => handleAcceptTripAction(signatureModal.bookingId!, signatureModal.type!)}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-app text-[11px] font-black uppercase tracking-widest disabled:opacity-50 transition-all"
          >
            {isSubmittingAction ? "Processing..." : "Confirm & Sign"}
          </Button>
        </div>
      </Modal>

      {/* Delay Request Modal */}
      <Modal isOpen={showDelayModal} onClose={() => setShowDelayModal(false)} title="Request Delay" maxWidth="max-w-md">
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Please provide a valid reason for the delay. Your host will receive this message directly.</p>
            <textarea
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-app text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="E.g., Stuck in traffic, will be 30 mins late..."
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
            />
          </div>
          <Button
            disabled={isSubmittingAction || !delayReason.trim()}
            onClick={() => handleRequestDelay(selectedBooking?._id || "")}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-app text-[11px] font-black uppercase tracking-widest disabled:opacity-50 transition-all"
          >
            {isSubmittingAction ? "Processing..." : "Submit Delay Request"}
          </Button>
        </div>
      </Modal>

      {/* Extend Trip Modal */}
      <Modal isOpen={showExtendModal} onClose={() => setShowExtendModal(false)} title="Extend Trip" maxWidth="max-w-md">
        <div className="p-6 space-y-6">
          <div className="bg-indigo-50 p-4 border border-indigo-100 rounded-app space-y-1">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><Info size={14} /> Journey Extension</p>
            <p className="text-xs text-slate-600 leading-relaxed">Extending the trip will update the return time and automatically recalculate the final settlement based on the daily rate.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <CustomDatePicker 
                label="New End Date"
                value={extendEndDate}
                minDate={(() => {
                  if (!selectedBooking?.endDate) return undefined;
                  const todayStr = new Date().toISOString().split('T')[0];
                  const endDateStr = selectedBooking.endDate.split('T')[0];
                  return endDateStr < todayStr ? todayStr : endDateStr;
                })()} // Cannot decrease below original return date OR today (if overdue)
                onChange={(val) => setExtendEndDate(val)}
                align="center"
                inline={true}
                bookedSlots={bookedSlots}
                currentBookingDates={{
                  start: selectedBooking?.startDate?.split('T')[0] || "",
                  end: selectedBooking?.endDate?.split('T')[0] || ""
                }}
              />
            </div>
            <div className="space-y-2 relative">
              <CustomTimePicker
                label="New Return Time"
                value={extendReturnTime}
                onChange={(val) => setExtendReturnTime(val)}
              />
            </div>

            {/* Dynamic Breakdown Section */}
            {selectedBooking && (
              <div className="bg-muted/30 border border-border p-4 rounded-app space-y-4 mt-6">
                {(() => {
                  const originalEndStr = `${selectedBooking.endDate?.split('T')[0]}T${selectedBooking.returnTime || '00:00'}`;
                  const originalEnd = new Date(originalEndStr);
                  
                  let newEndStr = "";
                  let newEnd: Date | null = null;
                  let extraDays = 0;
                  let extraCharge = 0;
                  const carPrice = typeof selectedBooking.carId === 'object' ? selectedBooking.carId.pricePerDay || 0 : 0;

                  if (extendEndDate && extendReturnTime) {
                    newEndStr = `${extendEndDate}T${extendReturnTime}`;
                    newEnd = new Date(newEndStr);
                    const delayMs = newEnd.getTime() - originalEnd.getTime();
                    extraDays = delayMs > 0 ? Math.ceil(delayMs / (24 * 60 * 60 * 1000)) : 0;
                    extraCharge = extraDays * carPrice;
                  }

                  return (
                    <>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Original Return</span>
                        <span className="font-bold text-slate-700">{originalEnd.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                      </div>
                      
                      {newEnd && (
                        <>
                          <div className="h-px bg-border w-full" />
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-indigo-500 uppercase tracking-widest text-[9px]">New Return</span>
                            <span className="font-bold text-indigo-700">{newEnd.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Extra Days</span>
                            <span className="font-black text-slate-700">+{extraDays} Day{extraDays !== 1 ? 's' : ''}</span>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-border">
                            <span className="font-black text-slate-700 uppercase tracking-widest text-[10px]">Extension Charge</span>
                            <span className="font-black text-primary text-sm">{formatPrice ? formatPrice(extraCharge) : `$${extraCharge.toFixed(2)}`}</span>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            
          </div>
          <Button
            disabled={isSubmittingAction || !extendEndDate || !extendReturnTime}
            onClick={() => handleExtendTrip(selectedBooking?._id || "")}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-app text-[11px] font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-xl shadow-primary/20"
          >
            {isSubmittingAction ? "Processing..." : "Confirm Extension"}
          </Button>
        </div>
      </Modal>

    </div>
  );

}
