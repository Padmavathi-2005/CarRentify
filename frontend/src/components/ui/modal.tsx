"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  icon
}: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className={cn(
        "relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-6 md:p-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[90vh]",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              {icon && (
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                   {icon}
                </div>
              )}
              <div>
                 {title && <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h2>}
                 {description && <p className="text-slate-400 font-medium text-[11px] mt-1.5">{description}</p>}
              </div>
           </div>
           <button 
             onClick={onClose} 
             className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
           >
              <X size={18} />
           </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
