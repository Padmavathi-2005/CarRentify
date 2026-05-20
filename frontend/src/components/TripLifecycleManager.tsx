"use client";

import React, { useState } from "react";
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
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import { authService } from "@/services/authService";
import { motion, AnimatePresence } from "framer-motion";

interface TripLifecycleManagerProps {
  booking: any;
  type: 'check-in' | 'check-out';
  onComplete: () => void;
  onCancel: () => void;
  isReadOnly?: boolean;
}

export default function TripLifecycleManager({ booking, type, onComplete, onCancel, isReadOnly = false }: TripLifecycleManagerProps) {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>(
    type === 'check-in' 
      ? (booking.checkInPhotos?.length > 0 ? booking.checkInPhotos : (booking.hostConditionImage ? [booking.hostConditionImage] : []))
      : (booking.checkOutPhotos?.length > 0 ? booking.checkOutPhotos : (booking.returnConditionImage ? [booking.returnConditionImage] : []))
  );
  const [mileage, setMileage] = useState<number>(
    type === 'check-in' ? (booking.checkInMileage || booking.hostMileage || 0) : (booking.checkOutMileage || booking.returnMileage || booking.hostMileage || 0)
  );
  const [fuelLevel, setFuelLevel] = useState<number>(
    type === 'check-in' ? (booking.checkInFuelLevel || 100) : (booking.checkOutFuelLevel || 100)
  );
  const [notes, setNotes] = useState(
    type === 'check-in' ? (booking.checkInNotes || "") : (booking.checkOutNotes || "")
  );
  const [isCertified, setIsCertified] = useState(isReadOnly);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const photoLabels = ["Front View", "Back View", "Left Side", "Right Side", "Dashboard", "Fuel Gauge"];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
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
      setPhotos(prev => [...prev, ...validUrls]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Photo upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;
    setIsSubmitting(true);
    try {
      const endpoint = type === 'check-in' ? 'check-in' : 'check-out';
      const res = await fetch(`${API_BASE_URL}/bookings/${booking._id}/${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          photos,
          mileage,
          fuelLevel,
          notes
        }),
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
        {/* Phase 1: Visual Documentation */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-primary" />
            <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Phase 1: Photos</h3>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((url, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={i} 
                className="relative aspect-square rounded-app overflow-hidden group border border-slate-100"
              >
                <img src={getImageUrl(url)} className="w-full h-full object-cover" />
                {!isReadOnly && (
                  <button 
                    onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <X size={12} />
                  </button>
                )}
              </motion.div>
            ))}
            
            {!isReadOnly && photos.length < 10 && (
              <label className="aspect-square rounded-app border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all bg-slate-50/50 group">
                <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" multiple />
                {isUploading ? (
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
          {!isReadOnly && photos.length < 2 && (
            <p className="text-[7px] font-bold text-rose-500 uppercase tracking-widest mt-2 px-1">
              Minimum 2 verification photos required
            </p>
          )}
        </section>

        {/* Phase 2: Telemetry */}
        <section className="space-y-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-primary" />
            <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Phase 2: Odometer</h3>
          </div>

          <div className="relative">
            <input 
              type="number"
              disabled={isReadOnly}
              min="1"
              value={mileage || ""}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 0) setMileage(val);
              }}
              className="w-full h-12 bg-slate-50 border border-slate-100 rounded-app px-5 text-sm font-bold outline-none focus:border-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              placeholder="Current KM reading..."
            />
          </div>
        </section>

        {/* Phase 3: Notes */}
        <section className="space-y-4 pt-4 border-t border-slate-50">
          <textarea 
            disabled={isReadOnly}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-24 bg-slate-50 border border-slate-100 rounded-app p-4 text-xs font-medium outline-none resize-none disabled:opacity-70 disabled:cursor-not-allowed"
            placeholder="Additional observations (optional)..."
          />

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
                disabled={isSubmitting || photos.length < 2 || mileage <= 0 || !isCertified}
                onClick={handleSubmit}
                className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-black text-[10px] uppercase tracking-widest rounded-app border-none shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Finalize Registry"
                )}
              </Button>
              {(photos.length < 2 || mileage <= 0) && (
                <p className="text-[7px] font-bold text-rose-500 uppercase tracking-widest mt-3 text-center">
                  {photos.length < 2 ? "Requires 2+ photos" : "Valid Odometer required"}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
