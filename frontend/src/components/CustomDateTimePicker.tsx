"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ChevronLeft, ChevronRight, Check, MapPin, ChevronDown } from "lucide-react";
import { useLocale } from "./LocaleContext";
import { useSettings } from "./ThemeProvider";

const getLocalISODate = (date: Date) => {
   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const formatTimeDisplay = (time: string) => {
   if (!time) return "";
   if (time.includes('AM') || time.includes('PM')) return time;

   const [hours, minutes] = time.split(':');
   const h = parseInt(hours);
   const ampm = h >= 12 ? 'PM' : 'AM';
   const h12 = h % 12 || 12;
   return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

export const formatDateDisplay = (dateStr: string, format: string = 'DD/MM/YYYY') => {
   if (!dateStr) return "";
   const d = new Date(dateStr);
   if (isNaN(d.getTime())) return dateStr;

   const day = String(d.getDate()).padStart(2, '0');
   const month = String(d.getMonth() + 1).padStart(2, '0');
   const year = d.getFullYear();

   if (format === 'MM/DD/YYYY') return `${month}/${day}/${year}`;
   if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
   return `${day}/${month}/${year}`;
};


type PopoverPosition = 'bottom' | 'side';
type PopoverAlign = 'left' | 'right' | 'center';
type SideDirection = 'left' | 'right';

interface PopoverPortalProps {
   children: React.ReactNode;
   anchorRef: React.RefObject<any>;
   isOpen: boolean;
   position: PopoverPosition;
   align: PopoverAlign;
   sideDirection: SideDirection;
   sideOffsetTop?: string;
   expectedWidth?: number;
   sideGap?: number;
   onClose?: () => void;
}

export const PopoverPortal = ({
   children,
   anchorRef,
   isOpen,
   position,
   align,
   sideDirection,
   sideOffsetTop,
   expectedWidth = 280,
   sideGap = 32,
   onClose // destructive but currently unused in scroll logic to support repositioning
}: PopoverPortalProps) => {
   const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
   const [mounted, setMounted] = useState(false);
   const [isLargeScreen, setIsLargeScreen] = useState(true);
   const [isDesktop, setIsDesktop] = useState(true);

   useEffect(() => {
      setMounted(true);
      const checkScreen = () => {
         const w = window.innerWidth;
         setIsLargeScreen(w >= 640);
         setIsDesktop(w >= 1200);
      };
      checkScreen();
      window.addEventListener('resize', checkScreen);
      return () => window.removeEventListener('resize', checkScreen);
   }, [isOpen]);

   useEffect(() => {
      if (!mounted || !anchorRef.current || !isOpen) return;

      const updatePosition = (forceScroll = false) => {
         if (!anchorRef.current) return;
         const rect = anchorRef.current.getBoundingClientRect();
         if (rect) {
            setCoords({
               top: rect.top + window.scrollY,
               left: rect.left + window.scrollX,
               width: rect.width,
               height: rect.height
            });

            if (forceScroll) {
               setTimeout(() => {
                  const portalEl = document.querySelector('.popover-portal-wrapper > .pointer-events-auto');
                  if (portalEl) {
                     const pRect = portalEl.getBoundingClientRect();
                     if (pRect.bottom > window.innerHeight) {
                        window.scrollBy({ top: pRect.bottom - window.innerHeight + 20, behavior: 'smooth' });
                     }
                  }
               }, 60);
            }
         }
      };

      updatePosition(true);
      const handleEvent = () => updatePosition(false);

      window.addEventListener('scroll', handleEvent, true);
      window.addEventListener('resize', handleEvent);
      return () => {
         window.removeEventListener('scroll', handleEvent, true);
         window.removeEventListener('resize', handleEvent);
      };
   }, [mounted, anchorRef, isOpen]);

   if (!mounted || !coords || !isOpen) return null;

   let style: React.CSSProperties = {};

   // Use 'side' only if on desktop and explicitly requested
   const effectivePosition = (isDesktop && position === 'side') ? 'side' : 'bottom';

   if (effectivePosition === 'side') {
      const topOffset = parseInt(sideOffsetTop || "-140px");
      style = {
         position: 'absolute',
         top: `${coords.top + topOffset}px`,
         zIndex: 99999,
         pointerEvents: 'none'
      };
      const isRtl = typeof document !== 'undefined' && document.dir === 'rtl';
      const actualSideDirection = isRtl ? (sideDirection === 'left' ? 'right' : 'left') : sideDirection;

      if (actualSideDirection === 'right') {
         style.left = `${coords.left + coords.width + sideGap}px`;
      } else {
         style.left = `${coords.left - expectedWidth - sideGap}px`;
      }
   } else {
      style = {
         position: 'absolute',
         zIndex: 99999,
         pointerEvents: 'none'
      };

      if (!isLargeScreen) {
         style.top = `${coords.top + coords.height + 8}px`;
         style.left = '50%';
         style.transform = 'translateX(-50%)';
      } else {
         style.top = `${coords.top + coords.height + 8}px`;

         if (align === 'center') {
            const midX = coords.left + (coords.width / 2);
            const leftBound = midX - (expectedWidth / 2);
            const rightBound = midX + (expectedWidth / 2);

            if (leftBound < 16) style.left = '16px';
            else if (rightBound > window.innerWidth - 16) style.left = `${window.innerWidth - expectedWidth - 16}px`;
            else style.left = `${leftBound}px`;
         } else {
            if (align === 'left') {
               style.left = `${coords.left}px`;
            } else {
               style.left = `${coords.left + coords.width - expectedWidth}px`;
            }
         }
      }
   }

   if (typeof document === 'undefined' || !document.body) return null;

   return createPortal(
      <div style={style} className="popover-portal-wrapper">
         <div className="pointer-events-auto">
            {children}
         </div>
      </div>,
      document.body
   );
};

interface CustomDatePickerProps {
   label: string;
   value: string;
   onChange: (date: string) => void;
   position?: PopoverPosition;
   align?: PopoverAlign;
   sideDirection?: SideDirection;
   sideOffsetTop?: string;
   minDate?: string;
   maxDate?: string;
   defaultViewDate?: string;
   inline?: boolean;
}

export const CustomDatePicker = ({
   label,
   value,
   onChange,
   position = 'bottom',
   align = 'left',
   sideDirection = 'right',
   sideOffsetTop,
   minDate,
   maxDate,
   defaultViewDate,
   inline = false
}: CustomDatePickerProps) => {
   const { t } = useLocale();
   const [isOpen, setIsOpen] = useState(false);
   const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
   const [viewDate, setViewDate] = useState(() => {
      if (value) {
         const d = new Date(value);
         return isNaN(d.getTime()) ? new Date() : d;
      }
      if (defaultViewDate) {
         const d = new Date(defaultViewDate);
         return isNaN(d.getTime()) ? new Date() : d;
      }
      return new Date();
   });
   const [inputValue, setInputValue] = useState("");
   const containerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (value) {
         const d = new Date(value);
         if (!isNaN(d.getTime())) {
            setInputValue(d.toLocaleDateString('en-US'));
         }
      } else {
         setInputValue("");
      }
   }, [value]);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            const target = event.target as HTMLElement;
            if (target && typeof target.closest === 'function' && !target.closest('.popover-portal-wrapper')) {
               setIsOpen(false);
            }
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, [isOpen]);

   const handleDateClick = (date: Date) => {
      const dateString = getLocalISODate(date);
      onChange(dateString);
      setIsOpen(false);
   };

   const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
   const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

   const handleManualInput = (val: string) => {
      setInputValue(val);
      const parsed = Date.parse(val);
      if (!isNaN(parsed)) {
         const d = getLocalISODate(new Date(parsed));
         onChange(d);
         setViewDate(new Date(parsed));
      } else if (!val) {
         onChange("");
      }
   };

   const calendarContent = (
      <AnimatePresence>
         {isOpen && (
            <motion.div
               initial={inline ? { opacity: 0, height: 0, overflow: 'hidden' } : { opacity: 0, scale: 0.95, y: -4 }}
               animate={inline ? { opacity: 1, height: 'auto', overflow: 'visible' } : { opacity: 1, scale: 1, y: 0 }}
               exit={inline ? { opacity: 0, height: 0, overflow: 'hidden' } : { opacity: 0, scale: 0.95, y: -4 }}
               className={inline ? "mt-3 w-full bg-muted/30 rounded-app border border-border p-5" : "z-[99999] w-[300px] bg-card rounded-app border border-border p-5"}
            >
               <div className="flex items-center justify-between mb-6">
                  <button
                     onClick={() => {
                        if (viewMode === 'days') setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
                        else if (viewMode === 'years') setViewDate(new Date(viewDate.getFullYear() - 10, viewDate.getMonth(), 1));
                     }}
                     className="p-1.5 hover:bg-muted rounded-app transition-colors"
                  >
                     <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full">
                     <button
                        onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
                        className={`text-[10px] font-black uppercase tracking-tight transition-all hover:text-primary ${viewMode === 'months' ? 'text-primary' : 'text-foreground'}`}
                     >
                        {t(`common.months.${viewDate.toLocaleString('default', { month: 'long' }).toLowerCase()}`)}
                     </button>
                     <span className="text-muted-foreground/30">/</span>
                     <button
                        onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
                        className={`text-[10px] font-black uppercase tracking-tight transition-all hover:text-primary ${viewMode === 'years' ? 'text-primary' : 'text-foreground'}`}
                     >
                        {viewDate.getFullYear()}
                     </button>
                  </div>

                  <button
                     onClick={() => {
                        if (viewMode === 'days') setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
                        else if (viewMode === 'years') setViewDate(new Date(viewDate.getFullYear() + 10, viewDate.getMonth(), 1));
                     }}
                     className="p-1.5 hover:bg-muted rounded-app transition-colors"
                  >
                     <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
               </div>

               {viewMode === 'days' && (
                  <>
                     <div className="grid grid-cols-7 gap-1">
                        {[t('common.days.sun'), t('common.days.mon'), t('common.days.tue'), t('common.days.wed'), t('common.days.thu'), t('common.days.fri'), t('common.days.sat')].map(d => (
                           <div key={d} className="text-[10px] font-black text-muted-foreground/40 text-center uppercase py-2">{d}</div>
                        ))}
                        {Array.from({ length: firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => (
                           <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                           const day = i + 1;
                           const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                           const isSelected = value && getLocalISODate(date) === value;
                           const localIso = getLocalISODate(date);
                           const isDisabled = !!((maxDate && localIso > maxDate) || (minDate && localIso < minDate));

                           return (
                              <button
                                 key={day}
                                 disabled={isDisabled}
                                 onClick={() => !isDisabled && handleDateClick(date)}
                                 className={`h-9 w-9 rounded-app text-xs font-bold transition-all flex items-center justify-center
 ${isSelected ? 'bg-primary text-white scale-[1.02]' : isDisabled ? 'opacity-20 cursor-not-allowed text-muted-foreground' : 'text-foreground/80 hover:bg-muted'}
 `}
                              >
                                 {day}
                              </button>
                           );
                        })}
                     </div>
                  </>
               )}

               {viewMode === 'months' && (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                     {Array.from({ length: 12 }).map((_, i) => {
                        const monthName = new Date(2000, i, 1).toLocaleString('default', { month: 'short' });
                        const isCurrent = viewDate.getMonth() === i;
                        const testDate = new Date(viewDate.getFullYear(), i, 1);
                        const testIso = getLocalISODate(testDate).substring(0, 7);
                        const isDisabled = !!((maxDate && testIso > maxDate.substring(0, 7)) || (minDate && testIso < minDate.substring(0, 7)));

                        return (
                           <button
                              key={i}
                              disabled={isDisabled}
                              onClick={() => {
                                 if (isDisabled) return;
                                 setViewDate(new Date(viewDate.getFullYear(), i, 1));
                                 setViewMode('days');
                              }}
                              className={`py-4 rounded-app text-[10px] font-black uppercase tracking-widest transition-all
 ${isCurrent ? 'bg-primary text-white ' : isDisabled ? 'opacity-20 cursor-not-allowed text-muted-foreground' : 'text-muted-foreground hover:bg-muted hover:text-primary'}
 `}
                           >
                              {t(`common.months.${new Date(2000, i, 1).toLocaleString('default', { month: 'long' }).toLowerCase()}`).substring(0, 3)}
                           </button>
                        );
                     })}
                  </div>
               )}

               {viewMode === 'years' && (
                  <div className="grid grid-cols-3 gap-3 pt-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                     {Array.from({ length: 100 }).map((_, i) => {
                        const yr = new Date().getFullYear() - 90 + i;
                        const isCurrent = viewDate.getFullYear() === yr;
                        const isDisabled = !!((maxDate && yr > new Date(maxDate).getFullYear()) || (minDate && yr < new Date(minDate).getFullYear()));

                        return (
                           <button
                              key={yr}
                              disabled={isDisabled}
                              onClick={() => {
                                 if (isDisabled) return;
                                 setViewDate(new Date(yr, viewDate.getMonth(), 1));
                                 setViewMode('days');
                              }}
                              className={`py-4 rounded-app text-[10px] font-black tracking-widest transition-all
 ${isCurrent ? 'bg-primary text-white ' : isDisabled ? 'opacity-20 cursor-not-allowed text-muted-foreground' : 'text-muted-foreground hover:bg-muted hover:text-primary'}
 `}
                           >
                              {yr}
                           </button>
                        );
                     })}
                  </div>
               )}
            </motion.div>
         )}
      </AnimatePresence>
   );

   return (
      <div className="relative w-full" ref={containerRef}>
         <label className="text-[10px] font-black text-[hsl(224,71.4%,4.1%)] dark:text-white uppercase tracking-widest mb-2 block px-1">{label}</label>
         <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary dark:text-white z-10 pointer-events-none" />
            <input
               type="text"
               onKeyDown={(e) => {
                 if (e.key === ' ') e.preventDefault();
               }}
               value={inputValue}
               onChange={(e) => handleManualInput(e.target.value.replace(/[^0-9\/\-]/g, ''))}
               onFocus={() => setIsOpen(true)}
               placeholder={t('home.date_placeholder')}
               className="w-full h-11 bg-muted/30 border border-border rounded-app pl-12 pr-4 text-sm font-bold text-foreground outline-none focus:border-primary/20 transition-all "
            />
         </div>

         {inline ? (
            calendarContent
         ) : (
            <PopoverPortal
               isOpen={isOpen}
               anchorRef={containerRef}
               onClose={() => setIsOpen(false)}
               position={position}
               align={align}
               sideDirection={sideDirection}
               sideOffsetTop={sideOffsetTop}
               expectedWidth={280}
            >
               {calendarContent}
            </PopoverPortal>
         )}
      </div>
   );
};

const PremiumDateBlock = React.forwardRef<HTMLDivElement, { label: string, date: string, onClick: () => void, onChange?: (val: string) => void, inputValue?: string }>(({ label, date, onClick, onChange, inputValue }, ref) => {
   const { t } = useLocale();
   return (
      <div className="flex-1 group" ref={ref}>
         <p className="text-[10px] font-black text-[hsl(224,71.4%,4.1%)] dark:text-white uppercase tracking-widest mb-2 px-1">{label}</p>
         <div
            className="bg-muted/40 border border-border rounded-app px-3 py-3 flex items-center gap-1 group-focus-within:bg-card group-focus-within:border-primary/20 transition-all cursor-pointer "
            onClick={onClick}
         >
            <Calendar className="w-4 h-4 text-primary dark:text-white shrink-0" />
            <input
               type="text"
               value={inputValue || ""}
               onChange={(e) => onChange && onChange(e.target.value)}
               placeholder={t('home.date_placeholder')}
               onClick={(e) => { e.stopPropagation(); onClick(); }}
               className="w-full bg-transparent outline-none text-sm font-bold text-foreground placeholder:text-muted-foreground/30"
            />
         </div>
      </div>
   );
});
PremiumDateBlock.displayName = "PremiumDateBlock";

const PremiumTimeBlock = React.forwardRef<HTMLDivElement, { label: string, time: string, onClick: () => void, onChange?: (val: string) => void, inputValue?: string }>(({ label, time, onClick, onChange, inputValue }, ref) => {
   const { t } = useLocale();
   return (
      <div className="flex-1 group" ref={ref}>
         <p className="text-[10px] font-black text-[hsl(224,71.4%,4.1%)] dark:text-white uppercase tracking-widest mb-2 px-1">{label}</p>
         <div
            className="bg-muted/40 border border-border rounded-app px-3 py-3 flex items-center gap-1 group-focus-within:bg-card group-focus-within:border-primary/20 transition-all cursor-pointer "
            onClick={onClick}
         >
            <Clock className="w-4 h-4 text-primary dark:text-white shrink-0" />
            <input
               type="text"
               value={inputValue || ""}
               onChange={(e) => onChange && onChange(e.target.value)}
               placeholder={t('home.time_placeholder')}
               onClick={(e) => { e.stopPropagation(); onClick(); }}
               className="w-full bg-transparent outline-none text-sm font-bold text-foreground placeholder:text-muted-foreground/30"
            />
         </div>
      </div>
   );
});
PremiumTimeBlock.displayName = "PremiumTimeBlock";

interface PremiumTimeRangePickerProps {
   startTime: string;
   endTime: string;
   onRangeTimeChange: (start: string, end: string) => void;
   startDate?: string;
   endDate?: string;
   bookedSlots?: any[];
   position?: PopoverPosition;
   align?: PopoverAlign;
   sideDirection?: SideDirection;
   sideOffsetTop?: string;
   customWidth?: number;
   sideGap?: number;
   trigger?: (onClick: (field: 'start' | 'end') => void) => React.ReactNode;
}

export const PremiumTimeRangePicker = ({
   startTime,
   endTime,
   onRangeTimeChange,
   startDate,
   endDate,
   bookedSlots = [],
   position = 'bottom',
   align = 'left',
   sideDirection = 'right',
   sideOffsetTop,
   customWidth,
   sideGap,
   trigger
}: PremiumTimeRangePickerProps) => {
   const [isOpen, setIsOpen] = useState(false);
   const [activeField, setActiveField] = useState<'start' | 'end'>('start');
   const [inputStart, setInputStart] = useState("");
   const [inputEnd, setInputEnd] = useState("");
   const { t } = useLocale();
   const { settings } = useSettings();

   const startRef = useRef<HTMLDivElement>(null);
   const endRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      setInputStart(startTime || "");
      setInputEnd(endTime || "");
   }, [startTime, endTime]);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         const target = event.target as HTMLElement;
         const isOutsideTrigger = trigger
            ? (containerRef.current && !containerRef.current.contains(target))
            : (startRef.current && !startRef.current.contains(target) && endRef.current && !endRef.current.contains(target));

         if (isOutsideTrigger && !target.closest('.popover-portal-wrapper')) {
            setIsOpen(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, [trigger, isOpen]);

   const times = Array.from({ length: 48 }).map((_, i) => {
      const h = Math.floor(i / 2).toString().padStart(2, '0');
      const m = (i % 2 === 0 ? "00" : "30");
      return `${h}:${m}`;
   });

   const handleManualInput = (val: string, type: 'start' | 'end') => {
      if (type === 'start') {
         setInputStart(val);
         if (times.includes(val)) onRangeTimeChange(val, endTime);
         else if (!val) onRangeTimeChange("", endTime);
      } else {
         setInputEnd(val);
         if (times.includes(val)) onRangeTimeChange(startTime, val);
         else if (!val) onRangeTimeChange(startTime, "");
      }
   };

   const containerRef = useRef<HTMLDivElement>(null);

   return (
      <div className="relative w-full" ref={containerRef}>
         <style>{`
 .premium-time-scrollbar::-webkit-scrollbar {
 width: 3px;
 }
 .premium-time-scrollbar::-webkit-scrollbar-track {
 background: transparent;
 }
 .premium-time-scrollbar::-webkit-scrollbar-thumb {
 background: #f1f5f9;
 border-radius: 10px;
 transition: all 0.3s ease;
 }
 .premium-time-scrollbar:hover::-webkit-scrollbar-thumb {
 background: #3f147b;
 }
 `}</style>
         {trigger ? trigger((field) => {
            if (isOpen && activeField === field) setIsOpen(false);
            else {
               setIsOpen(true);
               setActiveField(field);
            }
         }) : (
            <div className="flex gap-4">
               <PremiumTimeBlock
                  ref={startRef}
                  label={t('home.pickup_time')}
                  time={startTime}
                  inputValue={inputStart}
                  onChange={(val) => handleManualInput(val, 'start')}
                  onClick={() => { setIsOpen(true); setActiveField('start'); }}
               />
               <PremiumTimeBlock
                  ref={endRef}
                  label={t('home.return_time')}
                  time={endTime}
                  inputValue={inputEnd}
                  onChange={(val) => handleManualInput(val, 'end')}
                  onClick={() => { setIsOpen(true); setActiveField('end'); }}
               />
            </div>
         )}


         <PopoverPortal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            anchorRef={trigger ? containerRef : (activeField === 'start' ? startRef : endRef)}
            position={position}
            align={align}
            sideDirection={sideDirection}
            sideOffsetTop={sideOffsetTop}
            sideGap={sideGap}
            expectedWidth={customWidth || 320}
         >
            <AnimatePresence>
               {isOpen && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: -4 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -4 }}
                     className="z-[99999] w-[320px] bg-card rounded-app border border-border p-4 overflow-hidden"
                  >
                     <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4 px-2">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">
                                 {activeField === 'start' ? t('home.pickup_time') : t('home.return_time')}
                              </h4>
                           </div>
                           {settings?.defaultTimezone && (
                              <span className="text-[8px] font-black text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                                 {settings.defaultTimezone.split('/').pop()?.replace('_', ' ')}
                              </span>
                           )}
                        </div>

                        <div className="max-h-[280px] overflow-y-auto pr-2 pb-2 premium-time-scrollbar">
                           <div className="grid grid-cols-2 gap-3">
                              {times.map(t => {
                                 const currentVal = activeField === 'start' ? startTime : endTime;
                                 const inputVal = activeField === 'start' ? inputStart : inputEnd;
                                 const isSelected = currentVal === t;
                                 const isFiltering = inputVal && inputVal !== currentVal;

                                 if (isFiltering && !t.includes(inputVal)) return null;

                                 const checkDate = activeField === 'start' ? startDate : endDate;
                                 const now = new Date();
                                 let isPast = false;
                                 let isBooked = false;

                                 if (checkDate) {
                                    const dateTime = new Date(`${checkDate}T${t}`);
                                    isPast = dateTime < now;
                                    isBooked = bookedSlots.some(b => {
                                       const [sy, sm, sd] = b.startDate.split('-').map(Number);
                                       const [sh, smin] = (b.pickupTime || '00:00').split(':').map(Number);
                                       const bStart = new Date(sy, sm - 1, sd, sh, smin).getTime();

                                       const [ey, em, ed] = b.endDate.split('-').map(Number);
                                       const [eh, emin] = (b.returnTime || '23:59').split(':').map(Number);
                                       const bEnd = new Date(ey, em - 1, ed, eh, emin).getTime();

                                       const bufferMs = 60 * 60 * 1000;
                                       const currentTs = dateTime.getTime();

                                       if (activeField === 'start') {
                                          // Pickup time cannot be during a booking or in the 1-hour buffer after it
                                          return currentTs >= bStart && currentTs < bEnd + bufferMs;
                                       } else {
                                          // Return time cannot be during a booking or in the 1-hour safety lead-up to the next booking
                                          return (currentTs > bStart && currentTs <= bEnd) ||
                                             (currentTs + bufferMs > bStart && currentTs < bStart);
                                       }
                                    });
                                 }

                                 const isDisabled = isPast || isBooked;

                                 return (
                                    <button
                                       key={t}
                                       disabled={isDisabled}
                                       title={isBooked ? "Already Booked" : isPast ? "Past Time" : ""}
                                       onClick={() => {
                                          if (isDisabled) return;
                                          if (activeField === 'start') onRangeTimeChange(t, endTime);
                                          else onRangeTimeChange(startTime, t);
                                          setIsOpen(false);
                                       }}
                                       className={`w-full py-2.5 px-3 rounded-app text-xs font-bold transition-all text-start flex items-center justify-between
 ${isSelected ? 'bg-primary text-white scale-[1.02]' : isBooked ? 'bg-rose-50 text-rose-500 border border-rose-100 cursor-not-allowed' : isDisabled ? 'opacity-20 cursor-not-allowed bg-slate-50' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
                                    >
                                       <span>{formatTimeDisplay(t)}</span>
                                       {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </PopoverPortal>
      </div>
   );
};

interface PremiumRangePickerProps {
   startDate: string;
   endDate: string;
   onRangeChange: (start: string, end: string) => void;
   bookedSlots?: any[];
   position?: PopoverPosition;
   align?: PopoverAlign;
   sideDirection?: SideDirection;
   sideOffsetTop?: string;
   customWidth?: number;
   sideGap?: number;
   minDays?: number;
   trigger?: (onClick: () => void) => React.ReactNode;
}

export const PremiumRangePicker = ({
   startDate,
   endDate,
   onRangeChange,
   bookedSlots = [],
   position = 'bottom',
   align = 'left',
   sideDirection = 'right',
   sideOffsetTop,
   customWidth,
   sideGap,
   minDays = 1,
   trigger
}: PremiumRangePickerProps) => {
   const { settings } = useSettings();
   const [isOpen, setIsOpen] = useState(false);
   const [viewDate, setViewDate] = useState(() => {
      const d = new Date(startDate);
      return isNaN(d.getTime()) ? new Date() : d;
   });
   const [hoveredDate, setHoveredDate] = useState<string | null>(null);
   const [inputStart, setInputStart] = useState("");
   const [inputEnd, setInputEnd] = useState("");
   const containerRef = useRef<HTMLDivElement>(null);
   const startRef = useRef<HTMLDivElement>(null);
   const endRef = useRef<HTMLDivElement>(null);
   const { t } = useLocale();
   const [isLargeScreen, setIsLargeScreen] = useState(true);

   useEffect(() => {
      const checkScreen = () => setIsLargeScreen(window.innerWidth >= 640);
      checkScreen();
      window.addEventListener('resize', checkScreen);
      return () => window.removeEventListener('resize', checkScreen);
   }, [isOpen]);

   useEffect(() => {
      setInputStart(startDate ? formatDateDisplay(startDate, settings.defaultDateFormat) : "");
      setInputEnd(endDate ? formatDateDisplay(endDate, settings.defaultDateFormat) : "");
   }, [startDate, endDate, settings.defaultDateFormat]);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            const target = event.target as HTMLElement;
            if (target && typeof target.closest === 'function' && !target.closest('.popover-portal-wrapper')) {
               setIsOpen(false);
            }
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, [isOpen]);

   const leftMonth = viewDate;
   const rightMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

   const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
   const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

   const handleDateClick = (date: Date) => {
      const dStr = getLocalISODate(date);
      if (!startDate || (startDate && endDate)) {
         onRangeChange(dStr, "");

         if (date.getMonth() === rightMonth.getMonth() && date.getFullYear() === rightMonth.getFullYear()) {
            setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
         }
      } else {
         const sDate = new Date(startDate);
         const eDate = new Date(dStr);

         if (eDate < sDate) {
            onRangeChange(dStr, "");
            return;
         }

         // Check if ANY intermediate day is fully booked
         const hasOverlap = bookedSlots.some(b => {
            const bStart = new Date(b.startDate);
            const bEnd = new Date(b.endDate);
            // Overlap if: Start of new range is before end of existing AND end of new is after start of existing
            return sDate < bEnd && eDate > bStart;
         });

         if (hasOverlap) {
            // Optional: Trigger a notification here
            return;
         }

         onRangeChange(startDate, dStr);
         if (window.innerWidth < 640) setIsOpen(false);
      }
   };

   const isSelected = (date: Date) => {
      const dStr = getLocalISODate(date);
      return dStr === startDate || dStr === endDate;
   };

   const isInRange = (date: Date) => {
      const dStr = getLocalISODate(date);
      const [y, m, d] = dStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();

      if (startDate && endDate) {
         const [sy, sm, sd] = startDate.split('-').map(Number);
         const [ey, em, ed] = endDate.split('-').map(Number);
         const sTs = new Date(sy, sm - 1, sd, 0, 0, 0, 0).getTime();
         const eTs = new Date(ey, em - 1, ed, 0, 0, 0, 0).getTime();
         return dt > sTs && dt < eTs;
      }
      if (startDate && hoveredDate && !endDate) {
         const [sy, sm, sd] = startDate.split('-').map(Number);
         const [hy, hm, hd] = hoveredDate.split('-').map(Number);
         const sTs = new Date(sy, sm - 1, sd, 0, 0, 0, 0).getTime();
         const hTs = new Date(hy, hm - 1, hd, 0, 0, 0, 0).getTime();
         if (hTs < sTs) return false;
         return dt > sTs && dt < hTs;
      }
      return false;
   };

   const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
   const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

   const renderMonth = (mDate: Date) => {
      const year = mDate.getFullYear();
      const month = mDate.getMonth();
      return (
         <div className="w-[260px] lg:w-[280px] flex-shrink-0 transition-all">
            <h4 className="text-sm font-black text-slate-900 tracking-tight mb-4 text-center">
               {t(`common.months.${monthNames[month].toLowerCase()}`)} {year}
            </h4>
            <div className="grid grid-cols-7 gap-1 mb-2">
               {[t('common.days.sun'), t('common.days.mon'), t('common.days.tue'), t('common.days.wed'), t('common.days.thu'), t('common.days.fri'), t('common.days.sat')].map(day => (
                  <div key={day} className="text-[10px] font-black text-slate-300 text-center uppercase py-2">{day}</div>
               ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
               {Array.from({ length: firstDayOfMonth(year, month) }).map((_, i) => (
                  <div key={`empty-${i}`} />
               ))}
               {Array.from({ length: daysInMonth(year, month) }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(year, month, day);
                  const dStr = getLocalISODate(date);
                  const selected = isSelected(date);
                  const inRange = isInRange(date);
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);
                  const isFullyBooked = bookedSlots.some(b => {
                     // Day is fully occupied if it is strictly between start and end date
                     return dStr > b.startDate && dStr < b.endDate;
                  });
                  const isPartiallyBooked = !isFullyBooked && bookedSlots.some(b => {
                     // Day is partially occupied if it matches start or end date
                     return dStr === b.startDate || dStr === b.endDate;
                  });

                  const isPast = date < now;

                  // Min Days Restriction Logic
                  let isMinDaysRestricted = false;
                  if (startDate && !endDate && minDays > 1) {
                     const start = new Date(startDate);
                     const diffDays = Math.ceil((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                     if (diffDays >= 0 && diffDays < minDays) {
                        isMinDaysRestricted = true;
                     }
                  }

                  const isDisabled = isPast || isFullyBooked || isMinDaysRestricted || isPartiallyBooked;
                  const statusLabel = isFullyBooked ? "Fully Booked" : isPartiallyBooked ? "Partially Booked" : isPast ? "Past Date" : isMinDaysRestricted ? `Minimum ${minDays} Days Required` : "";

                  return (
                     <button
                        key={day}
                        disabled={isDisabled}
                        title={statusLabel}
                        onClick={() => !isDisabled && handleDateClick(date)}
                        onMouseEnter={() => !isDisabled && setHoveredDate(dStr)}
                        onMouseLeave={() => setHoveredDate(null)}
                        className={`h-8 w-8 lg:h-9 lg:w-9 rounded-app text-xs font-bold transition-all flex items-center justify-center relative
 ${selected ? 'bg-primary text-white z-10' : ''}
 ${inRange ? 'bg-primary/30 text-primary dark:text-white' :
                              isFullyBooked ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 cursor-not-allowed opacity-40' :
                                 isPartiallyBooked ? 'bg-rose-500/5 text-rose-400 border border-dashed border-rose-500/20 cursor-pointer' :
                                    isPast ? 'opacity-20 cursor-not-allowed text-muted-foreground' :
                                       'text-foreground/70 hover:bg-muted'}
 `}
                     >
                        {day}
                        {isPartiallyBooked && !selected && !inRange && (
                           <div className="absolute inset-0 bg-rose-500/5 rounded-app border border-dashed border-rose-500/20 -z-10" />
                        )}
                        {isPartiallyBooked && !selected && (
                           <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,113,133,0.6)]" />
                        )}
                        {selected && (
                           <motion.div layoutId="range-sel" className="absolute inset-0 bg-primary rounded-app -z-10" />
                        )}
                     </button>
                  );
               })}
            </div>
         </div>
      );
   };

   const handleInputDate = (val: string, type: 'start' | 'end') => {
      if (type === 'start') setInputStart(val);
      else setInputEnd(val);

      const parsed = Date.parse(val);
      if (!isNaN(parsed)) {
         const d = getLocalISODate(new Date(parsed));
         if (type === 'start') {
            onRangeChange(d, endDate);
            setViewDate(new Date(parsed));
         } else {
            onRangeChange(startDate, d);
         }
      } else if (!val) {
         if (type === 'start') onRangeChange("", endDate);
         else onRangeChange(startDate, "");
      }
   };

   const portalWidth = customWidth || (isLargeScreen ? 740 : 292);

   return (
      <div className="relative w-full" ref={containerRef}>
         {trigger ? trigger(() => setIsOpen(!isOpen)) : (
            <div className="flex gap-4">
               <PremiumDateBlock
                  ref={startRef}
                  label={t('home.from_date')}
                  date={startDate}
                  inputValue={inputStart}
                  onChange={(val) => {
                     setInputStart(val);
                     const d = Date.parse(val);
                     if (!isNaN(d)) onRangeChange(getLocalISODate(new Date(d)), endDate);
                  }}
                  onClick={() => { setIsOpen(true); }}
               />
               <PremiumDateBlock
                  ref={endRef}
                  label={t('home.to_date')}
                  date={endDate}
                  inputValue={inputEnd}
                  onChange={(val) => {
                     setInputEnd(val);
                     const d = Date.parse(val);
                     if (!isNaN(d)) onRangeChange(startDate, getLocalISODate(new Date(d)));
                  }}
                  onClick={() => { setIsOpen(true); }}
               />
            </div>
         )}


         <PopoverPortal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            anchorRef={containerRef}
            position={position}
            align={align}
            sideDirection={sideDirection}
            sideOffsetTop={sideOffsetTop}
            sideGap={sideGap}
            expectedWidth={portalWidth}
         >
            <AnimatePresence>
               {isOpen && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: -4 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -4 }}
                     className={`bg-card rounded-app border border-border p-6 lg:p-6 flex items-start overflow-hidden transition-all
 ${isLargeScreen ? 'w-auto gap-8' : 'w-[292px] flex-col gap-4'}
 `}
                  >
                     {!isLargeScreen && (
                        <div className="flex items-center justify-between w-full mb-2 px-2">
                           <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-2 hover:bg-slate-50 rounded-app">
                              <ChevronLeft className="w-5 h-5 text-slate-400" />
                           </button>
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Dates</span>
                           <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-2 hover:bg-slate-50 rounded-app">
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                           </button>
                        </div>
                     )}

                     {isLargeScreen && (
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="mt-1 p-2 hover:bg-muted rounded-app transition-colors">
                           <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                     )}

                     {renderMonth(leftMonth)}

                     {isLargeScreen && (
                        <>
                           <div className="w-px h-64 bg-slate-100 mt-8" />
                           {renderMonth(rightMonth)}
                        </>
                     )}

                     {isLargeScreen && (
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="mt-1 p-2 hover:bg-muted rounded-app transition-colors">
                           <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                     )}
                     {!isLargeScreen && (
                        <button
                           onClick={() => setIsOpen(false)}
                           className="w-full mt-4 py-3 bg-primary text-white rounded-app font-bold uppercase tracking-tight"
                        >
                           {t('close')}
                        </button>
                     )}
                  </motion.div>
               )}
            </AnimatePresence>
         </PopoverPortal>
      </div>
   );
};

export const PremiumLocationPicker = ({
   value,
   onChange,
   locations,
   label,
   position = 'bottom',
   align = 'left',
   sideDirection = 'right',
   sideOffsetTop,
   sideGap = 32,
   customWidth = 350,
   trigger
}: {
   value: string;
   onChange: (val: string) => void;
   locations: string[];
   label: string;
   position?: PopoverPosition;
   align?: PopoverAlign;
   sideDirection?: SideDirection;
   sideOffsetTop?: string;
   sideGap?: number;
   customWidth?: number;
   trigger?: (onClick: () => void) => React.ReactNode;
}) => {
   const [isOpen, setIsOpen] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);
   const { t } = useLocale();

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         const target = event.target as HTMLElement;
         if (containerRef.current && !containerRef.current.contains(target) && !target.closest('.popover-portal-wrapper')) {
            setIsOpen(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   return (
      <div className="relative w-full" ref={containerRef}>
         {trigger ? trigger(() => setIsOpen(!isOpen)) : (
            <div className="p-3.5 hover:bg-muted/40 transition-colors cursor-pointer space-y-1 relative group/loc" onClick={() => setIsOpen(!isOpen)}>
               <span className="text-[9px] font-black uppercase tracking-widest block text-[hsl(224,71.4%,4.1%)]">{label}</span>
               <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                     <MapPin size={14} className="text-primary" />
                     <span className="text-[11px] font-black uppercase tracking-tight text-foreground">{value || 'Select Location'}</span>
                  </div>
                  <ChevronDown size={12} className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
               </div>
            </div>
         )}

         <PopoverPortal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            anchorRef={containerRef}
            position={position}
            align={align}
            sideDirection={sideDirection}
            sideOffsetTop={sideOffsetTop}
            sideGap={sideGap}
            expectedWidth={customWidth}
         >
            <AnimatePresence>
               {isOpen && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: -4 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -4 }}
                     className="bg-card rounded-app border border-border p-2 overflow-hidden"
                     style={{ width: customWidth }}
                  >
                     <div className="space-y-1">
                        {locations.map((loc, i) => (
                           <button
                              key={i}
                              onClick={() => {
                                 onChange(loc);
                                 setIsOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-app text-[11px] font-bold uppercase tracking-tight transition-all flex items-center gap-3
 ${value === loc ? 'bg-primary text-white' : 'text-foreground hover:bg-muted'}
 `}
                           >
                              <MapPin size={12} className={value === loc ? 'text-white' : 'text-primary'} />
                              {loc}
                           </button>
                        ))}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </PopoverPortal>
      </div>
   );
};
