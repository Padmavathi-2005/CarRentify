"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: (string | CustomSelectOption)[];
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  icon?: React.ReactNode;
}

export default function CustomSelect({ 
  options, 
  defaultValue, 
  placeholder = "Select Option", 
  onChange,
  className,
  icon
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(defaultValue || "");
  }, [defaultValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelected(optionValue);
    setIsOpen(false);
    if (onChange) onChange(optionValue);
  };

  const getLabel = (val: string) => {
    const opt = options.find(o => typeof o === 'string' ? o === val : o.value === val);
    if (!opt) return val;
    return typeof opt === 'string' ? opt : opt.label;
  };

  const getIcon = (val: string) => {
    const opt = options.find(o => typeof o === 'string' ? o === val : o.value === val);
    if (!opt || typeof opt === 'string') return null;
    return opt.icon;
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-14 px-6 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-between transition-all duration-300 hover:border-primary/50 hover:bg-white text-left shadow-sm focus:ring-4 focus:ring-primary/10",
          isOpen && "border-primary shadow-lg shadow-primary/5 ring-4 ring-primary/10"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
           {icon || getIcon(selected)}
           <span className={cn(
             "text-sm font-bold truncate",
             selected ? "text-slate-900" : "text-slate-500 opacity-70"
           )}>
             {getLabel(selected) || placeholder}
           </span>
        </div>
        <ChevronDown 
          size={18} 
          className={cn("text-primary transition-transform duration-500", isOpen && "rotate-180")} 
        />
      </button>

      {/* Options List */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-3 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(63,20,123,0.15)] z-[999] overflow-hidden animate-in fade-in zoom-in duration-300 origin-top p-2 border-2 border-primary/20 bg-white/95">
          <div className="max-h-[300px] overflow-y-auto scrollbar-hide py-1">
            {options.map((opt) => {
              const value = typeof opt === 'string' ? opt : opt.value;
              const label = typeof opt === 'string' ? opt : opt.label;
              const optIcon = typeof opt === 'string' ? null : opt.icon;
              
              return (
                <div
                  key={value}
                  onClick={() => handleSelect(value)}
                  className={cn(
                    "px-5 py-4 rounded-2xl cursor-pointer flex items-center justify-between group transition-all duration-300 mb-1 last:mb-0",
                    selected === value 
                      ? "bg-primary/10 text-primary font-black shadow-sm" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary font-bold"
                  )}
                >
                  <div className="flex items-center gap-3">
                     <div className="text-primary transition-colors duration-300">
                        {optIcon}
                     </div>
                     <span className="text-sm font-bold">{label}</span>
                  </div>
                  {selected === value && (
                    <Check size={16} className="text-primary animate-in zoom-in duration-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
