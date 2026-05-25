"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Map as MapIcon,
  List,
  ChevronDown,
  SlidersHorizontal,
  Car,
  Fuel,
  Users,
  Calendar,
  Zap,
  MapPin,
  Filter as FilterIcon,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Settings2
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { useLocale } from "@/components/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL, BACKEND_URL, getImageUrl } from "@/config/api";
import dynamic from "next/dynamic";

// We'll load these dynamically inside the component to ensure they're only on the client
// and sharing the same React context.
let RL: any = null;

const MapBoundsTracker = ({
  onBoundsChange,
  onInteract,
  center,
  useMap,
  useMapEvents
}: {
  onBoundsChange: (bounds: any) => void;
  onInteract: () => void;
  center: [number, number];
  useMap: any;
  useMapEvents: any;
}) => {
  const map = useMap();

  useMapEvents({
    dragstart: () => onInteract(),
    zoomstart: () => onInteract(),
    dragend: () => {
      if (map) onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      if (map) onBoundsChange(map.getBounds());
    },
  });

  useEffect(() => {
    if (center && map) {
      try {
        const currentCenter = map.getCenter();
        if (Math.abs(currentCenter.lat - center[0]) > 0.001 || Math.abs(currentCenter.lng - center[1]) > 0.001) {
          map.setView(center, map.getZoom());
        }
      } catch (e) {
        // Safe skip during unmount
      }
    }
  }, [center, map]);

  return null;
};

import "leaflet/dist/leaflet.css";
import { PremiumRangePicker, PremiumTimeRangePicker } from "@/components/CustomDateTimePicker";

// Category definition moved inside component to use translations

export default function VehiclesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <VehiclesContent />
    </Suspense>
  );
}

function VehiclesContent() {
  const { language, t, formatPrice, currency: userCurrencyCode, currencies } = useLocale();

  const FILTER_CATEGORIES = useMemo(() => [
    { id: "price", label: t('vehicles.filters.price'), icon: null },
    { id: "type", label: t('vehicles.filters.type'), icon: null },
    { id: "make", label: t('vehicles.filters.make'), icon: null },
    { id: "years", label: t('vehicles.filters.years'), icon: null },
    { id: "seats", label: t('vehicles.filters.seats'), icon: null },
    { id: "fuel_eff", label: t('vehicles.filters.fuel_eff'), icon: null },
    { id: "fuel", label: t('vehicles.filters.fuel'), icon: null },
    { id: "delivery", label: t('vehicles.filters.delivery'), icon: null },
    { id: "all", label: t('vehicles.all_filters'), icon: <SlidersHorizontal size={14} /> },
  ], [t]);
  const userCurrency = currencies.find(c => c.code === userCurrencyCode);
  const searchParams = useSearchParams();
  const brandParam = searchParams.get("brand");
  const cityParam = searchParams.get("city");

  const [selectedType, setSelectedType] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState(brandParam || "All");
  const [selectedFuel, setSelectedFuel] = useState("All");
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(cityParam || "All");

  // Date & Time States (initialized from URL if present, otherwise empty)
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [seats, setSeats] = useState(t('vehicles.labels.all'));
  const [sortOption, setSortOption] = useState(t('vehicles.sort_options.relevance'));
  const [fuelEfficiency, setFuelEfficiency] = useState("None");
  const [startTime, setStartTime] = useState(searchParams.get("startTime") || "");
  const [endTime, setEndTime] = useState(searchParams.get("endTime") || "");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [priceRange, setPriceRange] = useState([0, 1000]);
  const currentYear = new Date().getFullYear();
  const [yearRange, setYearRange] = useState([1950, currentYear]);

  const [mapBounds, setMapBounds] = useState<any>(null);
  // Only apply map bounds filter AFTER user explicitly interacts (drag/zoom)
  const [mapFilterActive, setMapFilterActive] = useState(false);

  const [allCars, setAllCars] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [carTypes, setCarTypes] = useState<any[]>([]);
  const [allAmenities, setAllAmenities] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mapIcon, setMapIcon] = useState<any>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // Default, overridden by DB
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const filterDrawerRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const priceTrackRef = useRef<HTMLDivElement>(null);
  const yearTrackRef = useRef<HTMLDivElement>(null);
  const listingTopRef = useRef<HTMLDivElement>(null);

  // Close components on outside click or scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check for filter dropdowns
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        filterBarRef.current &&
        !filterBarRef.current.contains(event.target as Node)
      ) {
        // If we didn't click inside a dropdown or the bar, close the active one
        setActiveDropdown(null);
      } else if (!dropdownRef.current && !filterBarRef.current?.contains(event.target as Node)) {
        // Fallback for when dropdown isn't even rendered but we clicked away from triggers
        setActiveDropdown(null);
      }

      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (filterDrawerRef.current && !filterDrawerRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (target && typeof target.closest === 'function' && !target.closest('.popover-portal-wrapper')) {
          setIsFilterOpen(false);
        }
      }
    };

    const handleScroll = () => {
      if (activeDropdown) setActiveDropdown(null);
      if (showDatePicker) setShowDatePicker(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeDropdown, showDatePicker]);

  const [mapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== "undefined") {
        try {
          const [LeafletModule, ReactLeaflet] = await Promise.all([
            import('leaflet'),
            import('react-leaflet')
          ]);

            const L = LeafletModule.default || LeafletModule; const icon = new L.DivIcon({
            className: 'custom-marker-icon',
            html: `<div style="position:relative; display:flex; align-items:center; justify-content:center; width:36px; height:36px;">
  <div style="position:absolute; width:32px; height:32px; background-color:rgba(227,28,95,0.2); border-radius:50%; animation: pulse 2s infinite;"></div>
  <div style="position:relative; width:28px; height:28px; background-color:#e31c5f; border-radius:50%; border:2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:white;">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
  </div>
  </div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
          });
          setMapIcon(icon);
          setMapComponents(ReactLeaflet);
        } catch (err) {
          console.error("Leaflet Load Failure:", err);
        } finally {
          setIsMounted(true);
        }
      }
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    if (brandParam) setSelectedBrand(brandParam);
  }, [brandParam]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const fetchRegistry = async (url: string) => {
          try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) {
              console.warn(`Registry desync at ${url}: Status ${res.status}`);
              return null;
            }
            return await res.json();
          } catch (e) {
            console.error(`Link failure at ${url}:`, e);
            return null;
          }
        };

        const [carsData, brandsData, typesData, amData, settingsData] = await Promise.all([
          fetchRegistry(`${API_BASE_URL}/cars`),
          fetchRegistry(`${API_BASE_URL}/brands`),
          fetchRegistry(`${API_BASE_URL}/car-types`),
          fetchRegistry(`${API_BASE_URL}/amenities`),
          fetchRegistry(`${API_BASE_URL}/settings`),
        ]);

        if (!carsData) throw new Error("Core Car Data Unreachable");

        if (Array.isArray(carsData)) setAllCars(carsData);
        if (Array.isArray(brandsData)) setBrands(brandsData.map((b: any) => ({ id: b._id, name: b.name })));
        if (Array.isArray(typesData)) setCarTypes(typesData.map((t: any) => ({ id: t._id, name: t.name })));
        if (Array.isArray(amData)) setAllAmenities(amData);

        // Pull pagination limit from DB settings
        if (settingsData && settingsData.carsPerPage) {
          setPageSize(Number(settingsData.carsPerPage));
        } else if (settingsData && settingsData.maxImagesPerListing) {
          // Fallback: use maxImagesPerListing * 2 as a reasonable per-page count
          setPageSize(Math.max(8, Number(settingsData.maxImagesPerListing) * 2));
        }

      } catch (err) {
        console.error("Critical Discovery Interruption:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCars = allCars.filter(car => {
    if (!car) return false;
    const carName = car.name || `${car.brandName || ""} ${car.model || ""}`.trim();
    const carBrandName = (typeof car.brand === 'object' && car.brand?.name) || car.brandName || "";
    const carTypeId = (typeof car.vehicleType === 'object' && car.vehicleType?._id) || car.vehicleType || "";
    const carTypeName = (typeof car.vehicleType === 'object' && car.vehicleType?.name) || "";
    const fuel = car.fuelType || "None";
    const carAmenities = car.amenities || [];
    const basePrice = car.pricePerDay || 0;
    const carPrice = car.currency && userCurrency
      ? (basePrice / (car.currency.exchangeRate || 1)) * (userCurrency.exchangeRate || 1)
      : basePrice;
    const carYear = car.year || 0;
    const carSeats = car.seats || 0;
    const carEfficiency = car.fuelEfficiency || "None";

    const matchesPrice = carPrice >= priceRange[0] && (priceRange[1] >= 1000 ? true : carPrice <= priceRange[1]);

    // Make year filter inclusive of zero/missing values if the range is at default
    const isDefaultYearRange = yearRange[0] === 1950 && yearRange[1] === new Date().getFullYear();
    const matchesYear = (carYear === 0 && isDefaultYearRange) || (carYear >= yearRange[0] && carYear <= yearRange[1]);

    // Make seats filter inclusive if "All" is selected
    const isAllSeats = seats === t('vehicles.labels.all') || !seats || seats === "All";
    const matchesSeats = isAllSeats || (seats === "4" ? carSeats >= 4 : (parseInt(seats) ? carSeats >= parseInt(seats) : true));

    const matchesEfficiency = fuelEfficiency === "None" || carEfficiency.includes(fuelEfficiency.split(' ')[0]);

    const matchesType = selectedType === "All" || carTypeId === selectedType;
    const matchesBrand = selectedBrand === "All" || carBrandName.toLowerCase() === selectedBrand.toLowerCase();
    const matchesFuel = selectedFuel === "All" || fuel.toLowerCase() === selectedFuel.toLowerCase();
    const matchesAmenities = selectedAmenityIds.length === 0 || selectedAmenityIds.every(id => carAmenities.includes(id));
    const searchLower = searchQuery.toLowerCase();
    const searchNumber = parseFloat(searchQuery);
    const isNumericSearch = !isNaN(searchNumber) && searchQuery.trim() !== "";
    
    const matchesSearch = 
      carName.toLowerCase().includes(searchLower) ||
      carBrandName.toLowerCase().includes(searchLower) ||
      carTypeName.toLowerCase().includes(searchLower) ||
      (isNumericSearch && carPrice <= searchNumber);
      
    const matchesCity = selectedCity === "All" || (car.location?.city || "").toLowerCase() === selectedCity.toLowerCase();

    const matchesMapBounds = (mapFilterActive && mapBounds)
      ? (car.location?.latitude && car.location?.longitude
        ? mapBounds.contains([Number(car.location.latitude), Number(car.location.longitude)])
        : false)
      : true;

    return matchesPrice && matchesYear && matchesSeats && matchesEfficiency && matchesType && matchesBrand && matchesFuel && matchesAmenities && matchesSearch && matchesCity && matchesMapBounds;
  });

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedBrand, selectedFuel, selectedAmenityIds, searchQuery, priceRange, yearRange, seats, fuelEfficiency, selectedCity]);

  const allTypesLabel = t('vehicles.labels.all_vehicles');
  const allBrandsLabel = t('vehicles.labels.all_brands');
  const allFuelLabel = t('vehicles.labels.all');

  // Paginated slice — this is what shows on the left AND drives the map pins
  const totalPages = Math.max(1, Math.ceil(filteredCars.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const currentPageCars = filteredCars.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Map center from current page's first car with location, fallback to NYC
  const mapCenter: [number, number] = useMemo(() => {
    const carWithLocation = currentPageCars.find(c => c.location?.latitude);
    return carWithLocation
      ? [Number(carWithLocation.location.latitude), Number(carWithLocation.location.longitude)]
      : [40.7128, -74.0060];
  }, [currentPageCars]);

  const formatDateLabel = () => {
    if (!startDate) return t('vehicles.select_date');
    const s = new Date(startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: '2-digit', day: '2-digit' });
    const e = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : "";
    return e ? `${s} - ${e}` : s;
  };

  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clamped);
    // Scroll listing top into view smoothly
    listingTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Build page window: show up to 5 pages around current
  const buildPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push('...');
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-background font-sans selection:bg-primary selection:text-white pt-16 lg:pt-20 w-full">
      <Header />
      <div className="sticky top-16 lg:top-20 z-[60] bg-background/80 backdrop-blur-md border-b border-border dark:border-white/20">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 pt-2 pb-4 lg:py-4 overflow-visible">
          {/* Horizontal Filter Bar - Single Row */}
          <div className="flex-1 relative z-50 overflow-visible" ref={filterBarRef}>
            {/* Mobile Filter Track & Quick Actions */}  {/* Mobile Search - Only visible on very small screens */}
            <div className="md:hidden relative group mb-3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors" size={16} />
              <Input
                placeholder={t('vehicles.filters.search_placeholder') || "Search make or model..."}
                className="w-full pl-11 h-12 bg-white dark:bg-slate-900/50 border-2 border-slate-200/60 dark:border-white/10 rounded-app text-sm font-bold focus-visible:ring-primary/20 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pr-20 -mr-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="h-10 px-4 rounded-app bg-primary text-white flex items-center gap-2 text-[9px] font-black uppercase tracking-widest shrink-0"
              >
                <SlidersHorizontal size={12} />
                {t('vehicles.all_filters')}
              </button>

              <div className="w-px h-6 bg-border shrink-0 mx-1" />

              {/* Quick Type Pills */}
              {carTypes.slice(0, 6).map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(selectedType === type.id ? "All" : type.id)}
                  className={`h-10 px-5 rounded-app border text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedType === type.id ? 'bg-foreground text-background border-foreground ' : 'bg-card border-border text-muted-foreground hover:border-primary/40'}`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Filter Track */}
          <div
            ref={scrollRef}
            className="hidden md:flex flex-nowrap items-center gap-3 overflow-x-auto no-scrollbar py-1 pr-20"
          >
            {/* Search Input for Tablet/Desktop */}
            <div className="relative group min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={14} />
              <Input
                placeholder={t('vehicles.filters.search_placeholder') || "Search..."}
                className="h-9 pl-9 w-full bg-card border-border dark:border-white/10 rounded-app text-[11px] font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>


            {FILTER_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
              <div key={cat.id} className="relative flex-shrink-0">
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    if (activeDropdown === cat.id) {
                      setActiveDropdown(null);
                      setDropdownPos(null);
                    } else {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setDropdownPos({ top: rect.bottom + 8, left: rect.left });
                      setActiveDropdown(cat.id);
                    }
                  }}
                  className={`h-9 px-3 rounded-app border flex items-center gap-1.5 text-[10px] font-black tracking-tight transition-all whitespace-nowrap ${activeDropdown === cat.id
                    ? 'bg-primary text-white border-primary '
                    : 'border-border dark:border-white/20 bg-card text-muted-foreground hover:border-primary hover:bg-muted'
                    }`}
                >
                  {cat.icon}
                  <span className="uppercase tracking-widest">{cat.label}</span>
                  <ChevronDown size={14} className={activeDropdown === cat.id ? "rotate-180 transition-transform" : "transition-transform"} />
                </button>
              </div>
            ))}

            <div className="w-px h-6 bg-border dark:bg-white/10 shrink-0 mx-1" />

            <button
              onClick={() => setIsFilterOpen(true)}
              className="h-9 px-4 rounded-app bg-card border border-primary/20 dark:border-white/10 flex items-center gap-2 text-[10px] font-black text-primary dark:text-white/80 uppercase tracking-widest hover:bg-primary hover:text-white transition-all shrink-0 active:scale-95 "
            >
              <Settings2 size={12} />
              {t('vehicles.all_filters')}
            </button>

            <div className="w-px h-6 bg-border dark:bg-white/10 shrink-0 mx-1" />

            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("All");
                setSelectedBrand("All");
                setSelectedFuel("All");
                setSelectedAmenityIds([]);
                setPriceRange([0, 1000]);
                setYearRange([1950, currentYear]);
                setSeats("All");
                setFuelEfficiency("None");
                setSelectedCity("All");
                setStartDate("");
                setEndDate("");
                setMapBounds(null);
                setMapFilterActive(false);
              }}
              className="h-9 px-3 text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.15em] hover:text-destructive transition-all whitespace-nowrap"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Fixed-position dropdown portal — renders outside scroll container */}
      <AnimatePresence>
        {activeDropdown && dropdownPos && (
          <>
            <div className="fixed inset-0 z-[998]" onClick={() => { setActiveDropdown(null); setDropdownPos(null); }} />
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{ top: dropdownPos.top, left: dropdownPos.left }}
              className="fixed z-[999] bg-card rounded-app border border-border dark:border-white/10 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {activeDropdown === 'type' && (
                <div className="p-2 space-y-1 min-w-[220px]">
                  <div onClick={() => { setSelectedType("All"); setActiveDropdown(null); }} className="px-3 py-2.5 rounded-app hover:bg-muted cursor-pointer text-xs font-bold text-foreground">{t('vehicles.labels.all_vehicles')}</div>
                  {carTypes.map(t_obj => (
                    <div key={t_obj.id} onClick={() => { setSelectedType(t_obj.id); setActiveDropdown(null); }} className={`px-3 py-2.5 rounded-app hover:bg-muted cursor-pointer text-xs font-bold ${selectedType === t_obj.id ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}>{t_obj.name}</div>
                  ))}
                </div>
              )}
              {activeDropdown === 'price' && (
                <div className="w-[350px]">
                  <div className="p-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-6 flex items-center justify-between">
                      {t('vehicles.labels.price_range')}
                      <span className="text-primary text-xs tracking-tight">{formatPrice(priceRange[0])} - {priceRange[1] >= 1000 ? `${formatPrice(1000)}+` : formatPrice(priceRange[1])}</span>
                    </h4>
                    <div className="px-3">
                      <div className="relative h-12 flex items-center mb-4" ref={priceTrackRef}>
                        <div className="absolute left-0 right-0 h-1 bg-muted rounded-full" />
                        <motion.div className="absolute h-1 bg-primary rounded-full" style={{ left: `${(priceRange[0] / 1000) * 100}%`, right: `${100 - (Math.min(priceRange[1], 1000) / 1000) * 100}%` }} />
                        <motion.div drag="x" dragConstraints={priceTrackRef} dragElastic={0} dragMomentum={false}
                          onDrag={(e, info) => { const rect = priceTrackRef.current?.getBoundingClientRect(); if (!rect) return; const pct = Math.min(Math.max((info.point.x - rect.left) / rect.width, 0), 1); const price = Math.round(pct * 1000); if (price < priceRange[1]) setPriceRange([price, priceRange[1]]); }}
                          className="absolute left-0 w-7 h-7 -ml-3.5 bg-card border-2 border-border dark:border-white/40 rounded-full cursor-grab active:cursor-grabbing z-10 hover:border-primary flex items-center justify-center"
                          style={{ x: (priceRange[0] / 1000) * (priceTrackRef.current?.offsetWidth || 300) }}>
                          <div className="w-1.5 h-1.5 bg-muted rounded-full" />
                        </motion.div>
                        <motion.div drag="x" dragConstraints={priceTrackRef} dragElastic={0} dragMomentum={false}
                          onDrag={(e, info) => { const rect = priceTrackRef.current?.getBoundingClientRect(); if (!rect) return; const pct = Math.min(Math.max((info.point.x - rect.left) / rect.width, 0), 1); const price = Math.round(pct * 1000); if (price > priceRange[0]) setPriceRange([priceRange[0], price]); }}
                          className="absolute left-0 w-7 h-7 -ml-3.5 bg-card border-2 border-border dark:border-white/40 rounded-full cursor-grab active:cursor-grabbing z-10 hover:border-primary flex items-center justify-center"
                          style={{ x: (Math.min(priceRange[1], 1000) / 1000) * (priceTrackRef.current?.offsetWidth || 300) }}>
                          <div className="w-1.5 h-1.5 bg-muted rounded-full" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/20 border-t border-border flex items-center gap-4">
                    <button onClick={() => setPriceRange([0, 1000])} className="h-10 px-6 rounded-app border border-border bg-card text-xs font-black uppercase text-muted-foreground hover:bg-muted">{t('vehicles.labels.reset')}</button>
                    <Button onClick={() => setActiveDropdown(null)} className="flex-1 h-10 bg-primary text-white rounded-app font-black text-[10px] uppercase tracking-widest">{t('vehicles.labels.apply')}</Button>
                  </div>
                </div>
              )}
              {activeDropdown === 'make' && (
                <div className="p-4 space-y-3 w-[280px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('vehicles.labels.all_brands')}</span>
                    <button onClick={() => setSelectedBrand("All")} className="text-[9px] font-black text-primary uppercase">{t('vehicles.labels.reset')}</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {brands.slice(0, 10).map(b => (
                      <div key={b.id} onClick={() => { setSelectedBrand(b.name); setActiveDropdown(null); }}
                        className={`px-3 py-2 rounded-app border text-[10px] font-black uppercase cursor-pointer transition-all ${selectedBrand === b.name ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                        {b.name}
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => setIsFilterOpen(true)} variant="outline" className="w-full h-10 rounded-app text-[9px] font-black uppercase tracking-widest border-border">{t('vehicles.labels.view_more_brands')}</Button>
                </div>
              )}
              {activeDropdown === 'years' && (
                <div className="p-6 w-[320px]">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Model Year</h4>
                      <p className="text-sm font-black text-foreground">{yearRange[0]} – {yearRange[1]}</p>
                    </div>
                  </div>
                  <div className="px-5">
                    <div className="relative h-12 flex items-center" ref={yearTrackRef}>
                      <div className="absolute left-0 right-0 h-1 bg-muted rounded-full" />
                      <motion.div className="absolute h-1 bg-primary rounded-full" style={{ left: `${((yearRange[0]-1950)/(currentYear-1950))*100}%`, right: `${100-((yearRange[1]-1950)/(currentYear-1950))*100}%` }} />
                      <motion.div drag="x" dragConstraints={yearTrackRef} dragElastic={0} dragMomentum={false}
                        onDrag={(e, info) => { const rect = yearTrackRef.current?.getBoundingClientRect(); if (!rect) return; const pct = Math.min(Math.max((info.point.x-rect.left)/rect.width,0),1); const year = 1950+Math.round(pct*(currentYear-1950)); if(year<yearRange[1]) setYearRange([year,yearRange[1]]); }}
                        className="absolute left-0 w-7 h-7 -ml-3.5 bg-card border-2 border-border dark:border-white/40 rounded-full cursor-grab z-10 hover:border-primary flex items-center justify-center"
                        style={{ x: ((yearRange[0]-1950)/(currentYear-1950))*(yearTrackRef.current?.offsetWidth||280) }}>
                        <div className="w-1.5 h-1.5 bg-muted rounded-full" />
                      </motion.div>
                      <motion.div drag="x" dragConstraints={yearTrackRef} dragElastic={0} dragMomentum={false}
                        onDrag={(e, info) => { const rect = yearTrackRef.current?.getBoundingClientRect(); if (!rect) return; const pct = Math.min(Math.max((info.point.x-rect.left)/rect.width,0),1); const year = 1950+Math.round(pct*(currentYear-1950)); if(year>yearRange[0]) setYearRange([yearRange[0],year]); }}
                        className="absolute left-0 w-7 h-7 -ml-3.5 bg-card border-2 border-border dark:border-white/40 rounded-full cursor-grab z-10 hover:border-primary flex items-center justify-center"
                        style={{ x: ((yearRange[1]-1950)/(currentYear-1950))*(yearTrackRef.current?.offsetWidth||280) }}>
                        <div className="w-1.5 h-1.5 bg-muted rounded-full" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button onClick={() => setYearRange([1950, currentYear])} className="flex-1 h-10 rounded-app border border-border bg-card text-[9px] font-black uppercase text-muted-foreground hover:bg-muted">Reset</button>
                    <Button onClick={() => setActiveDropdown(null)} className="flex-[2] h-10 bg-primary text-white rounded-app text-[9px] font-black uppercase">Apply</Button>
                  </div>
                </div>
              )}
              {activeDropdown === 'seats' && (
                <div className="p-4 w-[260px] space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest border-b border-border pb-2">{t('vehicles.labels.min_seats')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["2", "4", "5", "7+"].map(s => (
                      <div key={s} onClick={() => { setSeats(s); setActiveDropdown(null); }}
                        className={`px-4 py-3 rounded-app border flex flex-col items-center gap-0.5 cursor-pointer transition-all ${seats === s ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                        <span className="text-xs font-black">{s}</span>
                        <span className="text-[8px] font-black uppercase opacity-70">Seats</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeDropdown === 'fuel_eff' && (
                <div className="p-4 w-[260px] space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest border-b border-border pb-2">{t('vehicles.labels.efficiency_rating')}</p>
                  <div className="space-y-2">
                    {[{ label: "Standard", val: "None", desc: "Show all results" }, { label: "High Efficiency", val: "Good", desc: "45+ MPG" }, { label: "Ultra Efficient", val: "Excellent", desc: "60+ MPG" }].map(f => (
                      <div key={f.val} onClick={() => { setFuelEfficiency(f.val); setActiveDropdown(null); }}
                        className={`p-3 rounded-app border cursor-pointer flex items-center justify-between ${fuelEfficiency === f.val ? 'bg-primary border-primary text-white' : 'border-border bg-card text-muted-foreground hover:bg-muted'}`}>
                        <div>
                          <p className="text-[10px] font-black uppercase">{f.label}</p>
                          <p className={`text-[8px] font-bold uppercase opacity-60`}>{f.desc}</p>
                        </div>
                        {fuelEfficiency === f.val && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeDropdown === 'fuel' && (
                <div className="p-4 w-[220px] space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest border-b border-border pb-2">{t('vehicles.labels.propulsion_source')}</p>
                  <div className="space-y-2">
                    {["All", "Gasoline", "Diesel", "Electric", "Hybrid"].map(f => (
                      <div key={f} onClick={() => { setSelectedFuel(f); setActiveDropdown(null); }}
                        className={`px-4 py-3 rounded-app border text-[10px] font-black uppercase cursor-pointer flex items-center justify-between ${selectedFuel === f ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                        {f}
                        {selectedFuel === f && <div className="w-1 h-1 rounded-full bg-background" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeDropdown === 'delivery' && (
                <div className="p-6 text-center space-y-4 w-[260px]">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2"><MapPin size={24} className="text-primary" /></div>
                  <div>
                    <h4 className="text-xs font-black text-foreground">Delivery Refinement</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Configure door-to-door handoff</p>
                  </div>
                  <Button onClick={() => { setIsFilterOpen(true); setActiveDropdown(null); }} className="w-full h-11 bg-primary text-white rounded-app text-[9px] font-black uppercase">Open Detailed Settings</Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Map / Grid Toggle FAB */}

      <div className="hidden lg:flex fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] items-center p-1.5 bg-card/80 backdrop-blur-xl border border-border/40 rounded-full dark:bg-slate-900/90 shadow-2xl">
        <button
          onClick={() => setShowMap(false)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${!showMap ? 'bg-primary text-white scale-105' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <List size={16} /> {t('vehicles.view_list') || 'Grid'}
        </button>
        <button
          onClick={() => setShowMap(true)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${showMap ? 'bg-primary text-white scale-105' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <MapIcon size={16} /> {t('vehicles.view_map') || 'Map'}
        </button>
      </div>

      <main className={`flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full relative z-0`}>

        {/* ── MOBILE MAP VIEW (Hidden by default, shown only when showMap is true) ── */}
        {showMap && !isDesktop && (
          <div className="block lg:hidden w-full bg-muted border-b border-border dark:border-white/10 relative z-10 overflow-hidden h-[40vh]">
            {isMounted && mapComponents && (
              <mapComponents.MapContainer key="mobile-map-v2" center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                <mapComponents.TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <MapBoundsTracker
                  onBoundsChange={setMapBounds}
                  onInteract={() => setMapFilterActive(true)}
                  center={mapCenter}
                  useMap={mapComponents.useMap}
                  useMapEvents={mapComponents.useMapEvents}
                />
                {mapIcon && filteredCars.map(car => car.location?.latitude && (
                  <mapComponents.Marker icon={mapIcon} key={car._id} position={[car.location.latitude, car.location.longitude]}>
                    <mapComponents.Popup className="premium-popup p-0 cursor-pointer overflow-hidden rounded-app">
                      <Link href={`/vehicles/${car.permalink || car._id || car.id}`}>
                        <div className="w-48 font-sans overflow-hidden">
                          <div className="relative w-full h-28">
                            <img
                              src={getImageUrl(car.images?.[0] || "")}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded shadow-lg border border-black/10">
                              <p className="text-[10px] font-black text-primary leading-none">{formatPrice(car.pricePerDay, car.currency)}/day</p>
                            </div>
                          </div>
                          <div className="p-2.5 bg-card border-t border-border">
                            <h4 className="font-black text-[11px] text-foreground line-clamp-1 leading-tight">{car.name}</h4>
                            <div className="flex items-center gap-2 mt-1.5 text-muted-foreground">
                              <span className="text-[9px] font-bold uppercase">{car.year}</span>
                              <span className="text-[8px] opacity-50">•</span>
                              <div className="flex items-center gap-1"><Users size={10} /><span className="text-[9px] font-bold">{car.seats || 4}</span></div>
                              <span className="text-[8px] opacity-50">•</span>
                              <div className="flex items-center gap-1"><Fuel size={10} /><span className="text-[9px] font-bold line-clamp-1">{car.fuelType || 'Auto'}</span></div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </mapComponents.Popup>
                  </mapComponents.Marker>
                ))}
              </mapComponents.MapContainer>
            )}
          </div>
        )}

        {/* ── LEFT: Listings Panel ── */}
        <div className={`flex-1 ${showMap ? 'w-full lg:w-[55%] lg:pl-8 lg:pr-0' : 'w-full lg:px-12'} bg-background px-4 pt-2 pb-32`}>

          {/* Listing header */}
          <div className="mb-6 flex items-center justify-between" ref={listingTopRef}>
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                {selectedCity !== "All" ? t('vehicles.vehicles_in', { city: selectedCity }) : t('vehicles.available_vehicles')}
              </h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <p className="text-[10px] font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest">
                  {t('vehicles.results', { count: filteredCars.length })}
                </p>
                {selectedCity !== "All" && (
                  <button
                    onClick={() => setSelectedCity("All")}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-colors"
                  >
                    <MapPin size={9} />
                    {selectedCity}
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>
                )}
              </div>
            </div>
            <div className="relative group">
              <div
                onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-300 cursor-pointer hover:text-primary transition-colors"
              >
                Sort: <span className="text-foreground flex items-center gap-1">{sortOption} <ChevronDown size={12} className={activeDropdown === 'sort' ? "rotate-180 transition-transform" : "transition-transform"} /></span>
              </div>

              <AnimatePresence>
                {activeDropdown === 'sort' && (
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 z-50 bg-card rounded-app border border-border p-2 min-w-[200px]"
                  >
                    {[
                      t('vehicles.sort_options.relevance'),
                      t('vehicles.sort_options.price_low'),
                      t('vehicles.sort_options.price_high'),
                      t('vehicles.sort_options.newest')
                    ].map(opt => (
                      <div
                        key={opt}
                        onClick={() => { setSortOption(opt); setActiveDropdown(null); }}
                        className={`px-4 py-3 rounded-app hover:bg-muted cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${sortOption === opt ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
                      >
                        {opt}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Cars grid */}
          {loading ? (
            <div className="py-32 text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
              <p className="text-muted-foreground/60 font-black uppercase tracking-widest text-[10px]">Synchronizing Car Registry...</p>
            </div>
          ) : error ? (
            <div className="pt-12 pb-24 text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-card border border-border dark:border-white/10 rounded-app flex items-center justify-center mx-auto mb-8 animate-in fade-in zoom-in duration-700">
                <div className="w-12 h-12 bg-rose-500/10 rounded-app flex items-center justify-center text-rose-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                </div>
              </div>
              <h3 className="text-4xl font-black text-foreground tracking-tight mb-4">System Interruption</h3>
              <p className="text-muted-foreground/80 font-bold text-sm leading-relaxed max-w-lg mx-auto mb-10">
                We've encountered a technical glitch while processing your request. Don't worry, your data is safe.
              </p>
              <Button onClick={() => window.location.reload()} className="h-14 px-8 bg-primary hover:bg-primary-hover text-white rounded-app font-black uppercase text-[10px] tracking-widest ">
                Restore Connection
              </Button>
            </div>
          ) : filteredCars.length > 0 ? (
            <>
              <div className={`grid gap-6 ${showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'}`}>
                <AnimatePresence mode="popLayout">
                  {currentPageCars.map((car, i) => (
                    <CarCard key={car._id || car.id} car={car} index={i} />
                  ))}
                </AnimatePresence>
              </div>

              {/* ── PAGINATION ── */}
              {totalPages > 1 && (
                <div className="mt-12 mb-4 flex flex-col items-center gap-4">
                  {/* Page info bar */}
                  <p className="text-[10px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest">
                    Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredCars.length)} of {filteredCars.length} vehicles
                  </p>

                  {/* Page controls */}
                  <div className="flex items-center gap-2">
                    {/* Prev */}
                    <button
                      onClick={() => goToPage(safePage - 1)}
                      disabled={safePage === 1}
                      className="w-10 h-10 rounded-app border border-border dark:border-white/20 bg-card flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page numbers */}
                    {buildPageNumbers().map((p, idx) =>
                      p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-muted-foreground/40 font-black text-xs">
                          ···
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goToPage(p as number)}
                          className={`w-10 h-10 rounded-app border text-xs font-black transition-all ${safePage === p
                            ? 'bg-primary border-primary text-white scale-110'
                            : 'border-border dark:border-white/20 bg-card text-muted-foreground hover:border-primary hover:text-primary'
                            }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      onClick={() => goToPage(safePage + 1)}
                      disabled={safePage === totalPages}
                      className="w-10 h-10 rounded-app border border-border dark:border-white/20 bg-card flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Quick jump */}
                  <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    <span>Jump to</span>
                    {[1, Math.ceil(totalPages / 2), totalPages].filter((v, i, a) => a.indexOf(v) === i && v > 0).map(p => (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`px-3 py-1.5 rounded-app border transition-all text-[9px] ${safePage === p ? 'border-primary text-primary bg-primary/5' : 'border-border dark:border-white/20 text-muted-foreground hover:border-primary/30'
                          }`}
                      >
                        {p === 1 ? 'First' : p === totalPages ? 'Last' : `Mid`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-40 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">No Matches Found</h3>
              <p className="text-muted-foreground/60 max-w-xs mx-auto text-sm font-medium">Try broadening your search or clearing your filters to see more luxury options.</p>
              <Button variant="outline" className="mt-10 rounded-app h-14 px-10 border-border dark:border-white/20 font-black text-[10px] uppercase tracking-widest" onClick={() => { setSelectedType("All"); setSearchQuery(""); }}>Reset Search Filters</Button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Map Panel (Desktop Only) ── */}
        {showMap && isDesktop && (
          <div className="hidden lg:block w-[45%] bg-background sticky top-[160px] h-[calc(100vh-160px)] p-4 overflow-hidden z-30 self-start">
            <div className="w-full h-full rounded-app overflow-hidden relative bg-card border border-border ">
              {/* Pin count badge */}
              <div className="absolute top-6 left-6 z-[400] bg-card/95 backdrop-blur-md px-5 py-2.5 rounded-app border border-border flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                  {filteredCars.length} Cars in Map
                </span>
              </div>
              {mapFilterActive && (
                <div className="absolute top-[70px] left-6 z-[400]">
                  <button onClick={() => setMapFilterActive(false)} className="bg-primary hover:bg-primary/90 text-white backdrop-blur-md px-4 py-2.5 rounded-app text-[9px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 w-max">
                    <List size={12} />
                    Show All Listings
                  </button>
                </div>
              )}
              {isMounted && mapComponents && (
                <mapComponents.MapContainer key="desktop-map-v2" center={mapCenter} zoom={13} className="w-full h-full z-0" style={{ background: '#ffffff' }}>
                  <mapComponents.TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                  <MapBoundsTracker
                    onBoundsChange={setMapBounds}
                    onInteract={() => setMapFilterActive(true)}
                    center={mapCenter}
                    useMap={mapComponents.useMap}
                    useMapEvents={mapComponents.useMapEvents}
                  />
                  {/* Show pins for ALL filtered cars, ignoring pagination */}
                  {mapIcon && filteredCars.map((car, i) => {
                    const lat = car.location?.latitude ? Number(car.location.latitude) : mapCenter[0] + (Math.sin(i * 2.4) * 0.03);
                    const lng = car.location?.longitude ? Number(car.location.longitude) : mapCenter[1] + (Math.cos(i * 2.4) * 0.03);
                    return (
                      <mapComponents.Marker icon={mapIcon} key={car._id || i} position={[lat, lng]}>
                        <mapComponents.Popup className="premium-popup p-0 cursor-pointer overflow-hidden rounded-app">
                          <Link href={`/vehicles/${car.permalink || car._id || car.id}`}>
                            <div className="w-56 font-sans overflow-hidden">
                              <div className="relative w-full h-36">
                                <img
                                  src={getImageUrl(car.images?.[0] || "")}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-md px-2 py-0.5 rounded border border-border/50">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground">{car.vehicleType?.name || car.type || 'Vehicle'}</span>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded shadow-lg border border-black/10">
                                  <p className="text-[12px] font-black text-primary leading-none">{formatPrice(car.pricePerDay, car.currency)}<span className="text-[9px] font-bold opacity-80"> /day</span></p>
                                </div>
                              </div>
                              <div className="p-3 bg-card border-t border-border flex flex-col gap-2.5">
                                <div>
                                  <h4 className="font-black text-[13px] text-foreground line-clamp-1 leading-tight">{car.name}</h4>
                                  <p className="text-[10px] text-muted-foreground font-bold line-clamp-1 mt-0.5 uppercase tracking-wide">{car.brandName || car.brand?.name || 'Brand'} • {car.year}</p>
                                </div>
                                <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Users size={12} />
                                    <span className="text-[9px] font-bold">{car.seats || 4} Seats</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Fuel size={12} />
                                    <span className="text-[9px] font-bold line-clamp-1 max-w-[80px]">{car.fuelType || 'Gas'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </mapComponents.Popup>
                      </mapComponents.Marker>
                    );
                  })}
                </mapComponents.MapContainer>
              )}
            </div>
          </div>
        )}


      </main>
      <Footer />

      {/* High-Fidelity Discovery Side Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            ref={filterDrawerRef}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-[450px] bg-background z-[9999] flex flex-col border-l border-border dark:border-white/10"
          >
            <div className="px-6 py-5 border-b border-border dark:border-white/10 flex items-center justify-between bg-background sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight">Discovery Engine</h2>
                <p className="text-[10px] font-bold text-foreground/70 dark:text-white/70 uppercase tracking-widest mt-1">Refine destination, schedule & cars</p>
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 no-scrollbar">
              {/* Destination & Schedule Selection */}
              <section className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground dark:text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Destination</h4>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Where to? (City, airport, state...)"
                      className="pl-12 h-14 bg-muted/40 border-border rounded-app focus-visible:ring-primary/10 transition-all font-black text-sm text-foreground"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground dark:text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Deployment Schedule</h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-foreground dark:text-white/80 uppercase tracking-widest px-1 flex items-center gap-2"><Calendar size={10} className="text-primary" /> Voyage Duration</p>
                      <PremiumRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onRangeChange={(s, e) => { setStartDate(s); setEndDate(e); }}
                        position="side"
                        sideDirection="left"
                        sideOffsetTop="-100px"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-foreground dark:text-white/80 uppercase tracking-widest px-1 flex items-center gap-2"><Clock size={10} className="text-primary" /> Precise Handoff</p>
                      <PremiumTimeRangePicker
                        startTime={startTime}
                        endTime={endTime}
                        onRangeTimeChange={(s, e) => { setStartTime(s); setEndTime(e); }}
                        position="side"
                        sideDirection="left"
                        sideOffsetTop="-250px"
                      />
                    </div>
                  </div>
                </div>
              </section>


              {/* Make & Model */}
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground dark:text-white mb-6 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Make & Model</h4>
                <div className="flex flex-wrap gap-2">
                  {[{ id: 'all', name: 'All' }, ...brands].map(b => (
                    <Badge
                      key={b.id}
                      onClick={() => setSelectedBrand(b.name)}
                      variant="outline"
                      className={`cursor-pointer h-9 px-4 rounded-app uppercase text-[9px] font-black tracking-widest transition-all ${selectedBrand === b.name ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
                    >{b.name}</Badge>
                  ))}
                </div>
              </section>

              {/* Vehicle Type */}
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground dark:text-white mb-6 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Vehicle Type</h4>
                <div className="flex flex-wrap gap-2">
                  {[{ id: 'All', name: 'All Vehicles' }, ...carTypes].map(t => (
                    <Badge
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      variant="outline"
                      className={`cursor-pointer h-9 px-4 rounded-app uppercase text-[9px] font-black tracking-widest transition-all ${selectedType === t.id ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
                    >{t.name}</Badge>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground dark:text-white mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Financial Boundaries
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground dark:text-white/80 uppercase tracking-widest px-1">Min / Day</label>
                    <div className="h-12 bg-card border border-border rounded-app flex items-center px-4 gap-2 focus-within:border-primary transition-all ">
                      <span className="text-muted-foreground font-bold text-xs">{userCurrency.symbol || '$'}</span>
                      <input
                        type="text"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="w-full bg-transparent border-none outline-none text-xs font-black text-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground dark:text-white/80 uppercase tracking-widest px-1">Max / Day</label>
                    <div className="h-12 bg-card border border-border rounded-app flex items-center px-4 gap-2 focus-within:border-primary transition-all ">
                      <span className="text-muted-foreground font-bold text-xs">{userCurrency.symbol || '$'}</span>
                      <input
                        type="text"
                        value={priceRange[1] >= 1000 ? '1000+' : priceRange[1]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace('+', '')) || 0;
                          setPriceRange([priceRange[0], val]);
                        }}
                        className="w-full bg-transparent border-none outline-none text-xs font-black text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground dark:text-white mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Propulsion Architecture
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["All", "Gasoline", "Diesel", "Electric", "Hybrid"].map(f => (
                    <Badge
                      key={f}
                      onClick={() => setSelectedFuel(f)}
                      variant="outline"
                      className={`h-10 px-6 rounded-app cursor-pointer border-border transition-all uppercase text-[8px] font-black tracking-widest ${selectedFuel === f ? 'bg-primary text-white border-primary scale-105' : 'text-muted-foreground hover:border-primary/30'}`}
                    >
                      {f}
                    </Badge>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground dark:text-white mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Seating Capacity
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {["2", "4", "5", "7+"].map(s => (
                    <button
                      key={s}
                      onClick={() => setSeats(s)}
                      className={`h-12 rounded-app border-2 transition-all flex flex-col items-center justify-center gap-1 ${seats === s ? 'bg-primary border-primary text-white scale-105' : 'border-border text-muted-foreground hover:border-primary/30'}`}
                    >
                      <span className="text-xs font-black">{s}</span>
                      <span className="text-[8px] font-black uppercase">Seats</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="pb-8">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground dark:text-white mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Bespoke Amenities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {allAmenities.map(am => (
                    <Badge
                      key={am._id}
                      onClick={() => setSelectedAmenityIds(prev => prev.includes(am._id) ? prev.filter(id => id !== am._id) : [...prev, am._id])}
                      variant="outline"
                      className={`h-9 px-4 rounded-app cursor-pointer border-border transition-all uppercase text-[8px] font-black tracking-widest ${selectedAmenityIds.includes(am._id) ? 'bg-primary text-white border-primary ' : 'text-muted-foreground hover:border-primary/30'}`}
                    >
                      {am.name}
                    </Badge>
                  ))}
                </div>
              </section>
            </div>

            <div className="px-6 py-4 border-t border-border bg-card flex items-center gap-4">
              <button
                onClick={() => { setSelectedType("All"); setSelectedBrand("All"); setSelectedFuel("All"); setPriceRange([0, 1000]); setSelectedAmenityIds([]); setMapBounds(null); setMapFilterActive(false); }}
                className="h-12 flex-1 rounded-app border border-border text-muted-foreground font-black uppercase text-[10px] tracking-widest hover:bg-muted transition-all"
              >
                Reset All
              </button>
              <Button
                onClick={() => setIsFilterOpen(false)}
                className="h-12 flex-[2] rounded-app bg-primary hover:bg-primary-dark text-white font-black uppercase text-[10px] tracking-widest"
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
