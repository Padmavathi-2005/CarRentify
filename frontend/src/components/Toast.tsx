"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, CheckCircle2, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-24 right-8 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto min-w-[320px] max-w-[450px] bg-white dark:bg-slate-900 rounded-app shadow-2xl border border-slate-100 dark:border-white/10 p-4 flex items-center gap-4 group relative overflow-hidden"
            >
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                toast.type === 'error' ? 'bg-rose-500/20 text-rose-500' : 
                toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 
                'bg-primary/20 text-primary'
              }`}>
                {toast.type === 'error' ? <XCircle size={22} /> : 
                 toast.type === 'success' ? <CheckCircle2 size={22} /> : 
                 <CheckCircle2 size={22} />}
              </div>
              
              <p className="flex-1 text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-tight">
                {toast.message}
              </p>

              <button 
                onClick={() => removeToast(toast.id)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border-none bg-transparent p-0"
              >
                <X size={14} />
              </button>

              {/* Progress Bar Timer */}
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 ${
                  toast.type === 'error' ? 'bg-rose-500' : 
                  toast.type === 'success' ? 'bg-emerald-500' : 
                  'bg-primary'
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
