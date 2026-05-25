"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  maxWidth?: string;
  noPadding?: boolean;
  noHeader?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  icon,
  maxWidth = "max-w-lg",
  noPadding = false,
  noHeader = false
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4 md:p-8 lg:p-12 overflow-y-auto bg-slate-900/60 animate-in fade-in duration-300 custom-scrollbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop click area */}
      <div
        className="fixed inset-0 cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={cn(
        `relative my-auto bg-white w-[95vw] md:w-full ${maxWidth} rounded-app border border-slate-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 overflow-hidden shrink-0`,
        className
      )}>
        <div className={cn(
          "flex flex-col",
          noPadding ? "p-0" : "p-6 md:p-10"
        )}>
          {/* Header */}
          {!noHeader && (
            <div className={cn(
              "flex items-center justify-between mb-8",
              noPadding && "p-6 md:p-10 pb-0 mb-4"
            )}>
              <div className="flex items-center gap-4">
                {icon && (
                  <div className="w-12 h-12 rounded-app bg-primary/10 flex items-center justify-center text-primary">
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
                className="w-10 h-10 rounded-app bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Content */}
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
