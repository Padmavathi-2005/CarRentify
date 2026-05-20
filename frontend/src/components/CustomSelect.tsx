"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search } from "lucide-react";
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
  inline?: boolean;
  searchPlaceholder?: string;
  id?: string;
  error?: boolean;
  side?: "bottom" | "top" | "left" | "right";
}

export default function CustomSelect({
  options,
  defaultValue,
  placeholder = "Select Option",
  onChange,
  className,
  icon,
  inline,
  searchPlaceholder = "Search...",
  id,
  error,
  side = "bottom",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(defaultValue || "");
  }, [defaultValue]);

  useEffect(() => {
    if (!isOpen) setSearchQuery("");
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || inline) return;
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const dropdownHeight = 360;

    const style: React.CSSProperties & { originX?: string } = {
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    };

    if (side === "left") {
      style.position = "absolute";
      style.left = -(rect.width || 280) - 12;
      style.top = -120;
      style.originX = "right";
    } else if (side === "right") {
      style.position = "absolute";
      style.left = (rect.width || 280) + 12;
      style.top = -120;
      style.originX = "left";
    } else {
      if (spaceBelow >= dropdownHeight || spaceBelow >= 200) {
        style.top = rect.bottom + 8;
      } else {
        style.bottom = viewportHeight - rect.top + 8;
      }
    }

    setDropdownStyle(style);
  }, [isOpen, inline]);

  useEffect(() => {
    if (!isOpen || inline) return;
    window.addEventListener("resize", () => setIsOpen(false));
    return () => {
      window.removeEventListener("resize", () => setIsOpen(false));
    };
  }, [isOpen, inline]);

  useEffect(() => {
    if (!isOpen || inline) return;
    
    const checkVisibility = () => {
      if (containerRef.current) {
        const style = window.getComputedStyle(containerRef.current);
        const parentStyle = window.getComputedStyle(containerRef.current.parentElement || containerRef.current);
        
        if (
          style.visibility === 'hidden' || 
          style.opacity === '0' || 
          style.display === 'none' ||
          parentStyle.visibility === 'hidden' ||
          parentStyle.opacity === '0'
        ) {
          setIsOpen(false);
        }
      }
    };

    const interval = setInterval(checkVisibility, 250);
    return () => clearInterval(interval);
  }, [isOpen, inline]);

  const handleSelect = (optionValue: string) => {
    setSelected(optionValue);
    setIsOpen(false);
    if (onChange) onChange(optionValue);
  };

  const getLabel = (val: string) => {
    const opt = options.find((o) =>
      typeof o === "string" ? o === val : o.value === val
    );
    if (!opt) return "";
    return typeof opt === "string" ? opt : opt.label;
  };

  const getIcon = (val: string) => {
    const opt = options.find((o) =>
      typeof o === "string" ? o === val : o.value === val
    );
    if (!opt || typeof opt === "string") return null;
    return opt.icon;
  };

  const hasIcons = useMemo(
    () => options.some((opt) => typeof opt !== "string" && opt.icon),
    [options]
  );

  const filteredOptions = options.filter((opt) => {
    const label = typeof opt === "string" ? opt : opt.label;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={inline ? undefined : dropdownStyle}
      className={cn(
        "bg-white border border-slate-100 dark:border-white/20 rounded-app overflow-hidden animate-in fade-in zoom-in duration-300 origin-top shadow-2xl",
        inline ? "relative w-full mt-2" : ""
      )}
    >
      <div className="w-full h-14 px-5 border-b border-slate-50 flex items-center gap-3 bg-slate-50/20">
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          <Search size={14} className="text-slate-400 opacity-60" />
        </div>
        <input
          ref={searchInputRef}
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 h-full bg-transparent border-none outline-none p-0 text-[13px] font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
        />
      </div>

      <div
        className={cn(
          "w-full overflow-y-auto py-2 px-1.5",
          inline ? "" : (side === "left" || side === "right" ? "h-[250px]" : "max-h-[300px]")
        )}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((opt) => {
            const value = typeof opt === "string" ? opt : opt.value;
            const label = typeof opt === "string" ? opt : opt.label;
            const optIcon = typeof opt === "string" ? null : opt.icon;

            return (
              <div
                key={value}
                onClick={() => handleSelect(value)}
                className={cn(
                  "w-full px-3.5 py-3 rounded-app mb-1 last:mb-0 cursor-pointer flex items-center justify-between group transition-all duration-300",
                  selected === value
                    ? "bg-primary/10 text-primary font-black"
                    : "text-slate-500 hover:bg-slate-50/80 hover:text-primary font-bold"
                )}
              >
                <div className="flex items-center gap-3">
                  {(hasIcons || optIcon) && (
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {optIcon}
                    </div>
                  )}
                  <span className="text-[13px] font-bold truncate flex-1">{label}</span>
                </div>
                {selected === value && (
                  <Check
                    size={16}
                    className="text-primary animate-in zoom-in duration-500"
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className="px-4 py-10 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              No Results Found
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div id={id} ref={containerRef} className={cn("relative w-full", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-14 px-5 rounded-app bg-white border flex items-center justify-between transition-all duration-300 hover:border-primary/20 hover:bg-slate-50 text-start focus:outline-none focus:border-primary focus:bg-white focus:ring-0",
          error ? "border-rose-500" : "border-slate-100 dark:border-white/20",
          isOpen && "border-primary bg-white ring-0 outline-none"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {icon || getIcon(selected)}
            <span
              className={cn(
                "text-[13px] font-bold truncate flex-1",
                selected ? "text-foreground" : "text-muted-foreground opacity-70"
              )}
            >
              {getLabel(selected) || placeholder}
            </span>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-slate-400 transition-transform duration-500 shrink-0",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>

      {isOpen &&
        (inline || side === "left" || side === "right"
          ? dropdownContent
          : typeof document !== "undefined"
          ? createPortal(dropdownContent, document.body)
          : null)}
    </div>
  );
}
