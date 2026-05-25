"use client";

import React, { useState, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  Zap, 
  Gauge, 
  Fuel,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Check,
  ImageIcon,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Switch from "@/components/ui/switch";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import { authService } from "@/services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "./ThemeProvider";
import { useAuth } from "./AuthContext";
import SignaturePad from "./SignaturePad";

interface TripLifecycleManagerProps {
  booking: any;
  type: 'check-in' | 'check-out';
  onComplete: () => void;
  onCancel: () => void;
  isReadOnly?: boolean;
}

export default function TripLifecycleManager({ booking, type, onComplete, onCancel, isReadOnly = false }: TripLifecycleManagerProps) {
  const { settings, loading } = useSettings();
  const { user, login } = useAuth();
  
  const coreFields = [
    { id: 'photos', name: 'Car Condition Photos', type: 'images', required: true, description: 'Upload exterior and interior photos (Minimum 2)' },
    { id: 'damagePhotos', name: 'Damage Photos', type: 'images', required: false, description: 'Upload photos of any existing damage (optional)' },
    { id: 'mileage', name: 'Odometer Reading (KM)', type: 'number', required: true, description: 'Current mileage on the car' },
    { id: 'fuelLevel', name: 'Fuel Level (%)', type: 'number', required: true, description: 'Fuel level from 0 to 100' },
    { id: 'notes', name: 'General Notes', type: 'text', required: false, description: 'Any visible damages or issues?' }
  ];

  // Default to core fields if settings are not loaded yet or missing
  const fields = (type === 'check-in' ? settings?.verification?.checkInFields : settings?.verification?.checkOutFields) || coreFields;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isCertified, setIsCertified] = useState(isReadOnly);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initialize form data
    const initialData: Record<string, any> = {};
    const sourceData = type === 'check-in' ? booking.checkInDetails : booking.checkOutDetails;
    
    // Core mapped defaults
    if (type === 'check-in') {
      initialData.photos = booking.checkInPhotos?.length > 0 ? booking.checkInPhotos : (booking.hostConditionImage ? [booking.hostConditionImage] : []);
      initialData.mileage = booking.checkInMileage || booking.hostMileage || 0;
      initialData.fuelLevel = booking.checkInFuelLevel || 100;
      initialData.notes = booking.checkInNotes || "";
    } else {
      initialData.photos = booking.checkOutPhotos?.length > 0 ? booking.checkOutPhotos : (booking.returnConditionImage ? [booking.returnConditionImage] : []);
      initialData.mileage = booking.checkOutMileage || booking.returnMileage || booking.hostMileage || 0;
      initialData.fuelLevel = booking.checkOutFuelLevel || 100;
      initialData.notes = booking.checkOutNotes || "";
    }

    initialData.signature = type === 'check-in' ? booking.checkInHostSignature : booking.checkOutHostSignature;
    initialData.renterSignature = type === 'check-in' ? booking.checkInRenterSignature : booking.checkOutRenterSignature;

    // Merge dynamic fields
    if (sourceData) {
      Object.assign(initialData, sourceData);
    }
    
    // Ensure all boolean fields are at least false
    fields.forEach((f: any) => {
      if (f.type === 'boolean' && initialData[f.id] === undefined) {
        initialData[f.id] = false;
      }
      if (f.type === 'images' && !initialData[f.id]) {
        initialData[f.id] = [];
      }
    });

    if (type === 'check-out' && booking.extraCharges?.hasIssue) {
      initialData['extraCharges_hasIssue'] = true;
      initialData['extraCharges_issueDetails'] = booking.extraCharges.issueDetails;
      initialData['extraCharges_chargeAmount'] = booking.extraCharges.chargeAmount;
      initialData['extraCharges_proofImages'] = booking.extraCharges.proofImages;
      initialData['extraCharges_billImage'] = booking.extraCharges.billImage;
    }

    setFormData(initialData);
  }, [booking, type, settings]);

  const handleFieldChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string, multiple: boolean) => {
    if (isReadOnly) return;
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(fieldId);
    try {
      const uploadPromises = files.map(async (file) => {
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
          return data.url || data.path;
        }
        return null;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null);
      
      if (multiple) {
        const current = formData[fieldId] || [];
        handleFieldChange(fieldId, [...current, ...validUrls]);
      } else {
        handleFieldChange(fieldId, validUrls[0]);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Photo upload failed. Please try again.");
    } finally {
      setIsUploading(null);
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;
    setIsSubmitting(true);
    try {
      let payload = { ...formData };
      if (type === 'check-out' && payload.extraCharges_hasIssue) {
        payload.extraCharges = {
          hasIssue: true,
          issueDetails: payload.extraCharges_issueDetails,
          chargeAmount: payload.extraCharges_chargeAmount,
          proofImages: payload.extraCharges_proofImages || [],
          billImage: payload.extraCharges_billImage || null
        };
      }

      const endpoint = type === 'check-in' ? 'check-in' : 'check-out';
      const res = await fetch(`${API_BASE_URL}/bookings/${booking._id}/${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onComplete();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to submit. Please check all fields.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation
  const isValid = () => {
    if (!isCertified) return false;
    for (const field of fields) {
      if (field.required) {
        const val = formData[field.id];
        if (field.type === 'images' && (!val || val.length === 0)) return false;
        if (field.type === 'images' && field.id === 'photos' && val.length < 2) return false;
        if (field.type === 'image' && !val) return false;
        if (field.type === 'document' && !val) return false;
        if (field.type === 'number' && (val === undefined || val === '' || val <= 0)) return false; // Basic number val
        if (field.type === 'text' && !val) return false;
      }
    }
    if (!formData.signature) return false;
    return true;
  };

  if (loading && !settings) {
    return (
      <div className="bg-white rounded-app p-10 flex justify-center items-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-app overflow-hidden shadow-2xl">
      <div className={`relative p-6 ${isReadOnly ? 'bg-slate-900' : 'bg-primary'} text-white overflow-hidden`}>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase leading-none">
              {type === 'check-in' ? 'Trip Check-In Registry' : 'Trip Check-Out Registry'}
            </h2>
            {isReadOnly && (
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Reviewing Finalized Documentation</p>
            )}
          </div>
          <button 
            onClick={onCancel} 
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all backdrop-blur-md"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
        
        {fields.map((field: any, idx: number) => {
          return (
            <section key={field.id} className={`space-y-4 ${idx > 0 ? 'pt-4 border-t border-slate-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-app bg-primary/10 text-primary flex items-center justify-center">
                    {field.type === 'images' || field.type === 'image' ? <Camera size={12} /> : 
                     field.type === 'document' ? <FileText size={12} /> :
                     field.type === 'number' && field.id === 'mileage' ? <Gauge size={12} /> :
                     field.type === 'number' && field.id === 'fuelLevel' ? <Fuel size={12} /> :
                     <Info size={12} />}
                  </div>
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{field.name} {field.required && <span className="text-rose-500">*</span>}</h3>
                </div>
              </div>
              
              {field.description && (
                <p className="text-[10px] text-slate-500 font-bold tracking-tight">{field.description}</p>
              )}

              {/* RENDER DYNAMIC FIELD */}
              {field.type === 'images' && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {(formData[field.id] || []).map((url: string, i: number) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={i} 
                      className="relative aspect-square rounded-app overflow-hidden group border border-slate-100"
                    >
                      <img src={getImageUrl(url)} className="w-full h-full object-cover" />
                      {!isReadOnly && (
                        <button 
                          onClick={() => handleFieldChange(field.id, formData[field.id].filter((_: any, idx: number) => idx !== i))}
                          className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                  
                  {!isReadOnly && (formData[field.id] || []).length < 10 && (
                    <label className="aspect-square rounded-app border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all bg-slate-50/50 group">
                      <input type="file" className="hidden" onChange={(e) => handlePhotoUpload(e, field.id, true)} accept="image/*" multiple />
                      {isUploading === field.id ? (
                        <Loader2 size={18} className="text-primary animate-spin" />
                      ) : (
                        <>
                          <Upload size={18} className="text-slate-300 group-hover:text-primary transition-all" />
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Add</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              )}

              {field.type === 'image' && (
                <div className="w-32 h-32 relative">
                  {formData[field.id] ? (
                    <div className="relative w-full h-full rounded-app overflow-hidden border border-slate-100">
                      <img src={getImageUrl(formData[field.id])} className="w-full h-full object-cover" />
                      {!isReadOnly && (
                        <button 
                          onClick={() => handleFieldChange(field.id, null)}
                          className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ) : (
                    !isReadOnly && (
                      <label className="w-full h-full rounded-app border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all bg-slate-50/50 group">
                        <input type="file" className="hidden" onChange={(e) => handlePhotoUpload(e, field.id, false)} accept="image/*" />
                        {isUploading === field.id ? (
                          <Loader2 size={18} className="text-primary animate-spin" />
                        ) : (
                          <>
                            <Camera size={18} className="text-slate-300 group-hover:text-primary transition-all" />
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Upload</span>
                          </>
                        )}
                      </label>
                    )
                  )}
                </div>
              )}

              {field.type === 'document' && (
                <div className="relative">
                  {formData[field.id] ? (
                    <div className="w-full h-16 bg-slate-50 border border-slate-100 rounded-app flex items-center justify-between px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <FileText size={14} />
                        </div>
                        <a href={getImageUrl(formData[field.id])} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-700 hover:text-primary underline">
                          View Document
                        </a>
                      </div>
                      {!isReadOnly && (
                        <button 
                          onClick={() => handleFieldChange(field.id, null)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    !isReadOnly && (
                      <label className="w-full h-16 rounded-app border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all bg-slate-50/50 group">
                        <input type="file" className="hidden" onChange={(e) => handlePhotoUpload(e, field.id, false)} accept=".pdf,.doc,.docx,image/*" />
                        {isUploading === field.id ? (
                          <Loader2 size={18} className="text-primary animate-spin" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Upload size={16} className="text-slate-300 group-hover:text-primary transition-all" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Upload Document</span>
                          </div>
                        )}
                      </label>
                    )
                  )}
                </div>
              )}

              {field.type === 'number' && (
                <div className="relative">
                  <input 
                    type="number"
                    disabled={isReadOnly}
                    min="0"
                    value={formData[field.id] || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 0) handleFieldChange(field.id, val);
                    }}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-app px-5 text-sm font-bold outline-none focus:border-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    placeholder={`Enter ${field.name}...`}
                  />
                </div>
              )}

              {field.type === 'text' && (
                <textarea 
                  disabled={isReadOnly}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-full h-24 bg-slate-50 border border-slate-100 rounded-app p-4 text-xs font-medium outline-none resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder={`Enter ${field.name}...`}
                />
              )}

              {field.type === 'boolean' && (
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-app border border-slate-100">
                  <Switch 
                    checked={formData[field.id] || false} 
                    disabled={isReadOnly}
                    onCheckedChange={(val) => handleFieldChange(field.id, val)} 
                  />
                  <span className="text-xs font-bold">{formData[field.id] ? "Yes" : "No"}</span>
                </div>
              )}

            </section>
          );
        })}

        {type === 'check-out' && (
          <section className="space-y-4 pt-4 border-t border-slate-50">
            <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-app">
              <div>
                <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest">Report Issue / Extra Charge</h3>
                <p className="text-[10px] text-rose-500/80 font-bold tracking-tight">Log damages, missing items, or extra fees</p>
              </div>
              <Switch 
                checked={formData['extraCharges_hasIssue'] || false}
                disabled={isReadOnly}
                onCheckedChange={(val) => handleFieldChange('extraCharges_hasIssue', val)}
              />
            </div>
            
            {formData['extraCharges_hasIssue'] && (
              <div className="p-4 bg-slate-50 rounded-app border border-slate-100 space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Issue Details</label>
                  <textarea 
                    disabled={isReadOnly}
                    value={formData['extraCharges_issueDetails'] || ""}
                    onChange={(e) => handleFieldChange('extraCharges_issueDetails', e.target.value)}
                    className="w-full h-20 bg-white border border-slate-100 rounded-app p-3 text-xs outline-none focus:border-primary/20"
                    placeholder="Describe the damage, missing item, or reason for extra charge..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Charge Amount ($)</label>
                  <input 
                    type="number"
                    disabled={isReadOnly}
                    min="0"
                    value={formData['extraCharges_chargeAmount'] || ""}
                    onChange={(e) => handleFieldChange('extraCharges_chargeAmount', Number(e.target.value))}
                    className="w-full h-10 bg-white border border-slate-100 rounded-app px-3 text-xs font-bold outline-none focus:border-primary/20"
                    placeholder="Enter estimated or exact repair amount..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Damage Proof Photos</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {(formData['extraCharges_proofImages'] || []).map((url: string, i: number) => (
                      <div key={i} className="relative aspect-square rounded-app overflow-hidden border border-slate-100">
                        <img src={getImageUrl(url)} className="w-full h-full object-cover" />
                        {!isReadOnly && (
                          <button 
                            onClick={() => handleFieldChange('extraCharges_proofImages', formData['extraCharges_proofImages'].filter((_: any, idx: number) => idx !== i))}
                            className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {!isReadOnly && (
                      <label className="aspect-square rounded-app border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all bg-white">
                        <input type="file" className="hidden" onChange={(e) => handlePhotoUpload(e, 'extraCharges_proofImages', true)} accept="image/*" multiple />
                        {isUploading === 'extraCharges_proofImages' ? <Loader2 size={18} className="text-primary animate-spin" /> : <Upload size={18} className="text-slate-300" />}
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Repair Bill / Invoice (Optional)</label>
                  <div className="w-32 h-32 relative">
                    {formData['extraCharges_billImage'] ? (
                      <div className="relative w-full h-full rounded-app overflow-hidden border border-slate-100">
                        <img src={getImageUrl(formData['extraCharges_billImage'])} className="w-full h-full object-cover" />
                        {!isReadOnly && (
                          <button 
                            onClick={() => handleFieldChange('extraCharges_billImage', null)}
                            className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <label className="w-full h-full rounded-app border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all bg-white">
                        <input type="file" className="hidden" onChange={(e) => handlePhotoUpload(e, 'extraCharges_billImage', false)} accept="image/*" />
                        {isUploading === 'extraCharges_billImage' ? <Loader2 size={18} className="text-primary animate-spin" /> : <Upload size={18} className="text-slate-300" />}
                      </label>
                    )}
                  </div>
                </div>

              </div>
            )}
          </section>
        )}

        <section className="space-y-4 pt-4 border-t border-slate-50">
          {!isReadOnly && (
            <div 
              onClick={() => setIsCertified(!isCertified)}
              className={`p-4 rounded-app border flex items-start gap-3 cursor-pointer transition-all ${
                isCertified ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                isCertified ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200'
              }`}>
                {isCertified && <Check size={12} />}
              </div>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                I certify that all information provided accurately reflects the vehicle's current state.
              </p>
            </div>
          )}
        </section>

        <div className="pt-8 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <SignaturePad 
                initialSignature={formData.signature || (!isReadOnly ? user?.signature : undefined)} 
                onSave={(sig) => handleFieldChange('signature', sig)} 
                title={type === 'check-in' ? "Host Handover Signature" : "Host Return Signature"}
                subtitle={isReadOnly ? "Signature attached to this registry" : "Please sign to authorize this protocol"}
              />
              {isReadOnly && !formData.signature && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-app text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Signature Provided</p>
                </div>
              )}
              {!isReadOnly && !formData.signature && (
                <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 px-2 flex items-center gap-1">
                  <AlertCircle size={10} /> Signature is required
                </p>
              )}
            </div>

            {isReadOnly && formData.renterSignature && (
              <div className="space-y-2">
                <SignaturePad 
                  initialSignature={formData.renterSignature} 
                  onSave={() => {}} 
                  title={type === 'check-in' ? "Renter Handover Signature" : "Renter Return Signature"}
                  subtitle="Authorized by the renter"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100">
          {isReadOnly ? (
            <Button 
              onClick={onCancel}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-app border-none"
            >
              Close Registry Review
            </Button>
          ) : (
            <>
              <Button 
                disabled={isSubmitting || !isValid()}
                onClick={handleSubmit}
                className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-black text-[10px] uppercase tracking-widest rounded-app border-none shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Finalize Registry"
                )}
              </Button>
              {!isValid() && (
                <p className="text-[7px] font-bold text-rose-500 uppercase tracking-widest mt-3 text-center">
                  Please complete all required fields and verify condition
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
