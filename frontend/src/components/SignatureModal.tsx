import React, { useRef, useState, useEffect } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { X, Eraser, Check } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (signatureBase64: string) => void;
  title?: string;
  subtitle?: string;
  agreementText?: string;
  isMandatory?: boolean;
}

export default function SignatureModal({ isOpen, onClose, onSubmit, title = "Sign Agreement", subtitle = "Please draw your signature below to accept the rental agreement.", agreementText, isMandatory = false }: SignatureModalProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const defaultTerms = `This Rental Agreement (the "Agreement") governs the rental of the vehicle specified above. By executing this document, both the Renter and the Host acknowledge and agree to the following conditions:

1. ACCEPTANCE OF CONDITION
The Renter accepts the vehicle in its current state. Any pre-existing damage must be documented in the Check-In process prior to departure.

2. USAGE LIMITATIONS
The vehicle shall not be used for racing, towing, illegal activities, or driven by unauthorized persons. Smoking and pets are strictly prohibited unless explicitly allowed by the Host.

3. FINANCIAL RESPONSIBILITY
The Renter is fully responsible for all tolls, parking citations, and traffic violations incurred during the rental period. The security deposit (if applicable) may be withheld for damages, late returns, or cleaning fees.

4. FUEL AND MILEAGE
The vehicle must be returned with the same fuel level as provided at Check-In. Exceeding the allotted mileage will incur additional per-mile charges as specified in the booking details.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement electronically.`;

  useEffect(() => {
    if (isOpen) {
      setHasDrawn(false);
      setAgreed(false);
      setShowTermsModal(false);
      setTimeout(() => {
        if (sigCanvas.current) {
          sigCanvas.current.clear();
        }
      }, 50);
    }
  }, [isOpen]);

  const clearCanvas = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setHasDrawn(false);
    }
  };

  const handleEnd = () => {
    setHasDrawn(true);
  };

  const handleSubmit = () => {
    if (!hasDrawn || !agreed) {
      return;
    }
    
    if (sigCanvas.current) {
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      onSubmit(dataUrl);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen && !showTermsModal} onClose={isMandatory ? () => {} : onClose} noHeader={true} noPadding={true}>
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
              <p className="text-sm font-bold text-slate-500 mt-1">{subtitle}</p>
            </div>
            {!isMandatory && (
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            )}
          </div>

          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden relative h-48 md:h-64 w-full">
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-slate-300 font-bold text-sm tracking-widest uppercase">Sign Here</span>
              </div>
            )}
            
            <SignatureCanvas 
              ref={sigCanvas}
              onEnd={handleEnd}
              penColor="#0f172a"
              canvasProps={{className: 'w-full h-full cursor-crosshair relative z-10'}} 
            />
            
            <div className="absolute bottom-4 right-4 z-20">
               <button 
                 onClick={clearCanvas}
                 className="p-2 bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 rounded-md shadow-sm border border-slate-200 text-xs font-bold flex items-center gap-2 backdrop-blur-sm transition-all"
               >
                 <Eraser size={14} /> Clear
               </button>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <input 
              type="checkbox" 
              id="agree-terms" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer shrink-0"
            />
            <label htmlFor="agree-terms" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
              I agree to the <span className="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }}>rental terms and conditions</span>
            </label>
          </div>

          <div className="flex gap-4 pt-2">
            {!isMandatory && (
              <Button 
                onClick={onClose} 
                variant="outline" 
                className="flex-1 h-14 rounded-app font-bold uppercase tracking-widest text-[10px]"
              >
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleSubmit} 
              disabled={!hasDrawn || !agreed}
              className="flex-1 h-14 bg-primary hover:bg-primary-hover text-white rounded-app font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={16} /> Submit Signature
            </Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)}
        title="Rental Terms and Conditions"
        description="Please review the agreement text."
        maxWidth="max-w-3xl"
      >
        <div className="bg-slate-50 border border-slate-200 rounded-app p-6 max-h-[60vh] overflow-y-auto custom-scrollbar font-mono text-xs text-slate-600 whitespace-pre-wrap leading-relaxed shadow-inner">
          {agreementText || defaultTerms}
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={() => setShowTermsModal(false)} className="bg-slate-900 hover:bg-black text-white rounded-app px-8 h-12 font-bold uppercase tracking-widest text-[10px] transition-all">
            Close Terms
          </Button>
        </div>
      </Modal>
    </>
  );
}
