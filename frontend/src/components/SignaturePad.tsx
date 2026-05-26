"use client";

import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { PenTool, X, Trash2 } from "lucide-react";

interface SignaturePadProps {
  initialSignature?: string;
  onSave: (signatureBase64: string | null) => void;
  title?: string;
  subtitle?: string;
}

export default function SignaturePad({ initialSignature, onSave, title = "Digital Signature", subtitle = "Please sign below to authorize" }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(initialSignature || null);
  const [isEditing, setIsEditing] = useState(!initialSignature);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialSignature && !initialized.current) {
      setSavedSignature(initialSignature);
      setIsEditing(false);
      initialized.current = true;
    }
  }, [initialSignature]);

  const clear = () => {
    sigCanvas.current?.clear();
    setHasDrawn(false);
    onSave(null);
  };

  const handleEndDraw = () => {
    setHasDrawn(true);
    if (sigCanvas.current) {
      const base64 = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      onSave(base64);
    }
  };

  const drawNew = () => {
    setIsEditing(true);
    setHasDrawn(false);
    onSave(null);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
        </div>
      </div>

      {!isEditing && savedSignature ? (
        <div className="relative w-full h-40 bg-slate-50 border border-slate-200 rounded-app flex flex-col items-center justify-center p-4">
          <img src={savedSignature} alt="Saved Signature" className="max-h-full max-w-full object-contain mix-blend-multiply" />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button variant="outline" size="sm" onClick={drawNew} className="h-8 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600">
              Draw New
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-40 bg-white border-2 border-dashed border-slate-300 rounded-app overflow-hidden group">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="#0f172a"
            canvasProps={{ className: "w-full h-full cursor-crosshair" }}
            onEnd={handleEndDraw}
          />
          {!hasDrawn && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-50">
              <PenTool size={24} className="text-slate-400 mb-2" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sign Here</span>
            </div>
          )}
          {hasDrawn && (
            <button
              onClick={clear}
              className="absolute top-2 right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors shadow-sm"
              title="Clear Signature"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
