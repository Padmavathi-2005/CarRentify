"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useSettings } from "@/components/ThemeProvider";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import { authService } from "@/services/authService";
import { ChevronLeft, FileText, CheckCircle, Download, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import SignatureModal from "@/components/SignatureModal";

export default function AgreementPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { settings } = useSettings();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  useEffect(() => {
    if (!loading && order) {
      const isCustomer = user?._id === order.customerId?._id;
      const alreadyAccepted = isCustomer ? !!order.renterAgreementSignature : !!order.hostAgreementSignature;
      
      if (!alreadyAccepted) {
        setIsSignatureModalOpen(true);
      }
    }
  }, [loading, order, user]);



  const finalizePayment = async (params: URLSearchParams) => {
    const gateway = params.get('gateway');
    const tokenParam = params.get('token');
    const sessionId = params.get('session_id');
    const typeParam = params.get('type');
    const token = authService.getToken();
    
    try {
      if (gateway === 'paypal' && tokenParam) {
        await fetch(`${API_BASE_URL}/payments/capture-paypal/${tokenParam}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: id, type: typeParam })
        });
      } else if (sessionId) {
        await fetch(`${API_BASE_URL}/payments/finalize-stripe/${sessionId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: id, type: typeParam })
        });
      }
    } catch (err) {
      console.error("Finalize error:", err);
    }
  };

  const fetchOrderDetails = async (forceFinalize = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams(window.location.search);
      if (params.get('success') === 'true' || forceFinalize) {
        await finalizePayment(params);
        // Clear success params from URL so it doesn't run again on refresh
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('success');
        newUrl.searchParams.delete('session_id');
        newUrl.searchParams.delete('gateway');
        newUrl.searchParams.delete('token');
        window.history.replaceState({}, '', newUrl.toString());
      }
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    if (order && user) {
      const isCustomer = user._id === order.customerId?._id;
      const hasAccepted = isCustomer ? order.renterAgreementSignature : order.hostAgreementSignature;
      if (!hasAccepted) {
        setIsSignatureModalOpen(true);
      }
    }
  }, [order, user]);

  const handleDownloadPDF = async () => {
    setIsPdfGenerating(true);
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/agreement/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to download PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rental-Agreement-${order.bookingHash || order._id.slice(-8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert("Failed to download PDF. Please try again or sign the agreement first.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleSignatureSubmit = async (signatureBase64: string) => {
    setIsAccepting(true);
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/bookings/sign-agreement/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ signatureBase64 })
      });
      if (res.ok) {
        setIsSignatureModalOpen(false);
        fetchOrderDetails();
      } else {
        alert("Failed to submit signature.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting signature");
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-900/10 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Retrieving Document...</p>
      </div>
    );
  }

  if (!order) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 font-bold text-slate-500">Document not found</div>;
  }

  const isCustomer = user?._id === order.customerId?._id;
  const isVendor = user?._id === order.vendorId?._id;
  
  const hasAccepted = isCustomer ? order.renterAgreementSignature : order.hostAgreementSignature;
  
  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans selection:bg-primary selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
          <Link href="/dashboard/bookings" className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-900 transition-all">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-4">
            {hasAccepted ? (
              <span className="text-emerald-600 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"><CheckCircle size={16} /> Digitally Signed</span>
            ) : (
              <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">Pending Signature</span>
            )}
            <div className="w-px h-6 bg-slate-200" />
            {!hasAccepted && (
              <button
                onClick={() => setIsSignatureModalOpen(true)}
                disabled={isAccepting}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest text-[10px] rounded-app flex items-center gap-2 transition-all shadow-md"
              >
                {isAccepting ? "Processing..." : "Sign Agreement"}
              </button>
            )}
            <button
              onClick={handleDownloadPDF}
              disabled={isPdfGenerating}
              className={`px-6 py-2.5 ${isPdfGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-white'} font-black uppercase tracking-widest text-[10px] rounded-app flex items-center gap-2 transition-all shadow-md`}
            >
              <Download size={14} /> {isPdfGenerating ? 'Processing...' : 'Export as PDF'}
            </button>
          </div>
        </div>

        {/* The Document Area */}
        <div id="agreement-print-area" className="bg-white p-8 md:p-16 rounded-xl shadow-2xl border border-slate-200 space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-900 pb-8 gap-6">
            <div className="flex items-center gap-4">
              {settings?.logoDark || settings?.logoLight ? (
                <img src={getImageUrl(settings.logoDark || settings.logoLight)} alt="Logo" className="h-14 w-auto object-contain" onError={(e) => { e.currentTarget.src = "/logo.png" }} />
              ) : (
                <div className="w-14 h-14 bg-slate-900 text-white flex items-center justify-center font-black text-2xl rounded-md">
                  {settings?.siteName?.charAt(0) || "C"}
                </div>
              )}
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{settings?.siteName || "CarRental"}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Agreement</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Rental Agreement</h1>
              <p className="text-xs font-bold text-slate-500 mt-1">
                REF: {order.bookingHash || order._id.toUpperCase().slice(-8)}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Issued: {new Date(order.agreementGeneratedAt || order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Renter (Lessee)</h2>
              </div>
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-app space-y-1 text-sm font-bold text-slate-700">
                <p className="text-lg text-slate-900 font-black">{order.renterLegalName || `${order.customerId?.firstName} ${order.customerId?.lastName}`}</p>
                <p>{order.customerId?.email}</p>
                {order.customerId?.phone && <p>{order.customerId?.phone}</p>}
                {(() => {
                  const docs = order.customerId?.verificationSubmission?.documents || [];
                  const dlNum = docs.find((d: any) => d.fieldId === 'driverLicense')?.value || order.customerId?.driverLicense;
                  const dlExp = docs.find((d: any) => d.fieldId === 'licenseExpiryDate')?.value || order.customerId?.licenseExpiryDate;
                  const dob = docs.find((d: any) => d.fieldId === 'dob')?.value || order.customerId?.dob;

                  if (!dlNum && !dlExp && !dob) return null;
                  
                  return (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                      {dlNum && <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">DL Number: <span className="text-slate-900">{dlNum}</span></p>}
                      {dlExp && <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">DL Expiry: <span className="text-slate-900">{new Date(dlExp).toLocaleDateString()}</span></p>}
                      {dob && <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">DOB: <span className="text-slate-900">{new Date(dob).toLocaleDateString()}</span></p>}
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Host (Lessor)</h2>
              </div>
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-app space-y-1 text-sm font-bold text-slate-700">
                <p className="text-lg text-slate-900 font-black">{order.hostLegalName || `${order.vendorId?.firstName} ${order.vendorId?.lastName}`}</p>
                <p>{order.vendorId?.email}</p>
                {order.vendorId?.phone && <p>{order.vendorId?.phone}</p>}
              </div>
            </div>
          </div>

          {/* Vehicle & Schedule */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-slate-400 rounded-full" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Vehicle & Schedule</h2>
            </div>
            <table className="w-full text-left text-sm border-collapse">
              <tbody>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px] w-1/3">Vehicle</th>
                  <td className="py-3 px-4 font-bold text-slate-900">{order.carId?.name || "Premium Vehicle"}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px]">Make & Model</th>
                  <td className="py-3 px-4 font-bold text-slate-900">{order.carId?.brand?.name || ''} {order.carId?.model || 'N/A'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px]">Category</th>
                  <td className="py-3 px-4 font-bold text-slate-900">{order.carId?.vehicleType?.name || 'Standard Car'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px]">Details</th>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {[
                      order.carId?.color ? `Color: ${order.carId.color}` : '',
                      order.carId?.seats ? `Seats: ${order.carId.seats}` : '',
                      order.carId?.doors ? `Doors: ${order.carId.doors}` : ''
                    ].filter(Boolean).join(' | ') || 'Standard specs'}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px]">Mechanics</th>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {[
                      order.carId?.transmission ? `Trans: ${order.carId.transmission}` : '',
                      order.carId?.fuelType ? `Fuel: ${order.carId.fuelType}` : '',
                      order.carId?.mileage ? `Mileage: ${order.carId.mileage.toLocaleString()} mi` : ''
                    ].filter(Boolean).join(' | ') || 'Standard specs'}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px]">VIN / Plate</th>
                  <td className="py-3 px-4 font-bold text-slate-900">{order.carId?.vin || order.carId?.licensePlate || "On Record"}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px]">Check-In</th>
                  <td className="py-3 px-4 font-bold text-slate-900">Date: {order.startDate} | Time: {order.pickupTime || '10:00'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px]">Check-Out</th>
                  <td className="py-3 px-4 font-bold text-slate-900">Date: {order.endDate} | Time: {order.returnTime || '10:00'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Financial Details</h2>
            </div>
            <table className="w-full text-left text-sm border-collapse">
              <tbody>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px] w-1/3">Base Rate</th>
                  <td className="py-3 px-4 font-bold text-slate-900">{order.carId?.pricePerDay ? `$${order.carId.pricePerDay.toFixed(2)} / Day` : 'N/A'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px] w-1/3">Total Paid</th>
                  <td className="py-3 px-4 font-bold text-slate-900">${order.totalPrice.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px]">Payment Method</th>
                  <td className="py-3 px-4 font-bold text-slate-900">{(order.paymentMethod || 'Credit Card').toUpperCase()}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px]">Security Deposit</th>
                  <td className="py-3 px-4 font-bold text-slate-900">{order.breakdown?.securityDeposit ? `$${order.breakdown.securityDeposit.toFixed(2)}` : 'None'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-[10px]">Extras</th>
                  <td className="py-3 px-4 font-bold text-slate-900">{order.extras && order.extras.length > 0 ? order.extras.join(", ") : "None"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terms */}
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
               <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Terms of Agreement</h2>
             </div>
             <div className="p-6 bg-slate-50 border border-slate-200 rounded-app text-xs font-bold text-slate-600 leading-relaxed whitespace-pre-wrap font-mono">
               {order.agreementText || `This Rental Agreement (the "Agreement") governs the rental of the vehicle specified above. By executing this document, both the Renter and the Host acknowledge and agree to the following conditions:

1. ACCEPTANCE OF CONDITION
The Renter accepts the vehicle in its current state. Any pre-existing damage must be documented in the Check-In process prior to departure.

2. USAGE LIMITATIONS
The vehicle shall not be used for racing, towing, illegal activities, or driven by unauthorized persons. Smoking and pets are strictly prohibited unless explicitly allowed by the Host.

3. FINANCIAL RESPONSIBILITY
The Renter is fully responsible for all tolls, parking citations, and traffic violations incurred during the rental period. The security deposit (if applicable) may be withheld for damages, late returns, or cleaning fees.

4. FUEL AND MILEAGE
The vehicle must be returned with the same fuel level as provided at Check-In. Exceeding the allotted mileage will incur additional per-mile charges as specified in the booking details.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement electronically.`}
             </div>
          </div>

          {/* Signatures */}
          <div className="pt-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Renter Signature */}
              <div className="space-y-4 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Renter (Lessee)</p>
                
                <div className="flex justify-center items-center min-h-[60px]">
                  {order.renterAgreementSignature?.signatureBase64 ? (
                    <img src={order.renterAgreementSignature.signatureBase64} alt="Renter Signature" className="h-16 w-auto object-contain filter contrast-125 mix-blend-multiply" />
                  ) : order.renterAgreementSignature ? (
                    <div className="text-emerald-500 flex items-center gap-2">
                      <CheckCircle size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Signed</span>
                    </div>
                  ) : (
                    <span className="font-bold text-lg text-slate-900">{order.customerId?.firstName} {order.customerId?.lastName}</span>
                  )}
                </div>
                
                {order.renterAgreementSignature && (
                  <div className="text-center font-mono text-[8px] text-slate-400 leading-tight space-y-0.5 pt-2">
                    <p>Time: {new Date(order.renterAgreementSignature.acceptedAt).toISOString()}</p>
                    <p>IP: {order.renterAgreementSignature.ipAddress}</p>
                    <p className="truncate px-4" title={order.renterAgreementSignature.userAgent}>UA: {order.renterAgreementSignature.userAgent}</p>
                  </div>
                )}
              </div>

              {/* Host Signature */}
              <div className="space-y-4 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Host (Lessor)</p>
                
                <div className="flex justify-center items-center min-h-[60px]">
                  {order.hostAgreementSignature?.signatureBase64 ? (
                    <img src={order.hostAgreementSignature.signatureBase64} alt="Host Signature" className="h-16 w-auto object-contain filter contrast-125 mix-blend-multiply" />
                  ) : order.hostAgreementSignature ? (
                    <div className="text-emerald-500 flex items-center gap-2">
                      <CheckCircle size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Signed</span>
                    </div>
                  ) : (
                    <span className="font-bold text-lg text-slate-900">{order.vendorId?.firstName} {order.vendorId?.lastName}</span>
                  )}
                </div>

                {order.hostAgreementSignature && (
                  <div className="text-center font-mono text-[8px] text-slate-400 leading-tight space-y-0.5 pt-2">
                    <p>Time: {new Date(order.hostAgreementSignature.acceptedAt).toISOString()}</p>
                    <p>IP: {order.hostAgreementSignature.ipAddress}</p>
                    <p className="truncate px-4" title={order.hostAgreementSignature.userAgent}>UA: {order.hostAgreementSignature.userAgent}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {order.agreementHash && (
            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Cryptographically Secured</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 break-all bg-slate-50 px-4 py-2 rounded-md border border-slate-200">
                SHA-256: {order.agreementHash}
              </p>
            </div>
          )}

          <div className="text-center pt-8 text-[8px] font-bold text-slate-300 uppercase tracking-widest border-t border-slate-100 mt-8">
            Document visually generated by {settings?.siteName || "CarRental"} • Valid under prevailing local laws
          </div>
        </div>

        <SignatureModal 
          isOpen={isSignatureModalOpen} 
          onClose={() => setIsSignatureModalOpen(false)} 
          onSubmit={handleSignatureSubmit} 
          agreementText={order.agreementText}
          isMandatory={!hasAccepted}
        />
      </div>
    </div>
  );
}
