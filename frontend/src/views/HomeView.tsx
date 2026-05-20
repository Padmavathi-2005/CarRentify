"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, MapPin, Calendar, ChevronLeft, ChevronRight, ChevronDown, User, ShoppingBag, Menu, Car, Truck, Zap, Mountain, Clock, Heart, Users, Mail, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { useSettings } from "@/components/ThemeProvider";
import { useLocale } from "@/components/LocaleContext";
import { useAuth } from "@/components/AuthContext";
import { API_BASE_URL, BACKEND_URL, getImageUrl } from "@/config/api";
import { CustomDatePicker, PremiumRangePicker, PremiumTimeRangePicker } from "@/components/CustomDateTimePicker";
import LocationAutocomplete from "@/components/LocationAutocomplete";

import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const OfficeMap = dynamic(() => import("@/components/OfficeMap"), {
 ssr: false,
 loading: () => (
 <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center rounded-app">
 <div className="flex flex-col items-center gap-4">
 <MapPin className="w-10 h-10 text-primary/20 animate-bounce" />
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Initializing Geographic Grid...</span>
 </div>
 </div>
 )
});
import {
 CARS,
 DESTINATIONS,
 TESTIMONIALS,
} from "@/data/mockData";

// Fallback destination images (Unsplash — royalty-free)
const FALLBACK_DESTINATION_IMAGES = [
 "https://images.unsplash.com/photo-1565799877535-7c63e7eda70e?w=600&auto=format&fit=crop",
 "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&auto=format&fit=crop",
 "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&auto=format&fit=crop",
 "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&auto=format&fit=crop",
];

const accessories = [
 { title: "Roof Box Rental", price: "$20/day" },
 { title: "Bike Rack", price: "$15/day" },
 { title: "Insurance Pack", price: "from $30/day" },
 { title: "Chauffeur Service", price: "$50/hr" },
];

const fadeInUp: any = {
 hidden: { opacity: 0, y: 40 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.1 }
 }
};

const getSrc = (img: any) => img?.src || img;

export default function Home() {
 const router = useRouter();
 const { settings, loading } = useSettings();
 const { language, t } = useLocale();
 const { user, setUserType, setShowLoginModal } = useAuth();
 const [differentReturn, setDifferentReturn] = useState(false);
 const [pickupLocation, setPickupLocation] = useState("");
 const [returnLocation, setReturnLocation] = useState("");
 const [brands, setBrands] = useState<any[]>([]);
 const [featuredCars, setFeaturedCars] = useState<any[]>([]);
 const [loadingCars, setLoadingCars] = useState(true);
 const [destinations, setDestinations] = useState<any[]>([]);
 const [isCarouselReady, setIsCarouselReady] = useState(false);

 const [fromDate, setFromDate] = useState("");
 const [fromTime, setFromTime] = useState("");
 const [toDate, setToDate] = useState("");
 const [toTime, setToTime] = useState("");

 const carouselRef = useRef<HTMLDivElement>(null);
 const isPaused = useRef(false);

 useEffect(() => {
 if (destinations.length <= 4 || !carouselRef.current) return;

 const carousel = carouselRef.current;
 const updateDimensions = () => {
 const first = carousel.firstElementChild as HTMLElement;
 if (!first) return { itemWidth: 0, gap: 0, setWidth: 0 };
 const itemWidth = first.clientWidth;
 if (itemWidth === 0) return { itemWidth: 0, gap: 0, setWidth: 0 }; // Not ready yet
 const gap = 24;
 const setWidth = (itemWidth + gap) * destinations.length;

 // Start in the middle set, exactly aligned
 carousel.style.scrollBehavior = 'auto';
 carousel.scrollLeft = setWidth;

 // Use double RAF to ensure the scroll is applied before showing
 requestAnimationFrame(() => {
 requestAnimationFrame(() => {
 setIsCarouselReady(true);
 carousel.style.scrollBehavior = 'smooth';
 });
 });

 return { itemWidth, gap, setWidth };
 };

 let { itemWidth, gap, setWidth } = updateDimensions();

 const handleScroll = () => {
 // Small buffer to prevent stutter
 if (carousel.scrollLeft >= setWidth * 2) {
 carousel.scrollLeft = carousel.scrollLeft - setWidth;
 } else if (carousel.scrollLeft <= setWidth / 2) {
 carousel.scrollLeft = carousel.scrollLeft + setWidth;
 }
 };

 carousel.addEventListener('scroll', handleScroll);

 const interval = setInterval(() => {
 if (isPaused.current) return;
 carousel.scrollBy({
 left: itemWidth + gap,
 behavior: "smooth"
 });
 }, 4500);

 return () => {
 carousel.removeEventListener('scroll', handleScroll);
 clearInterval(interval);
 };
 }, [destinations.length]);

 const FALLBACK_BRANDS = [
 { name: 'Rolls-Royce', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-rolls-royce-8-202758.png' },
 { name: 'Ferrari', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-ferrari-4-202756.png' },
 { name: 'Lamborghini', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-lamborghini-3-202754.png' },
 { name: 'Porsche', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-porsche-12-202755.png' },
 { name: 'Mercedes-Benz', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-mercedes-benz-4-202753.png' }
 ];

 useEffect(() => {
 fetch(`${API_BASE_URL}/brands`)
 .then(res => res.json())
 .then(data => {
 if (Array.isArray(data) && data.length > 0) {
 setBrands(data);
 } else {
 setBrands(FALLBACK_BRANDS);
 }
 })
 .catch(err => {
 console.error("Error fetching brands:", err);
 setBrands(FALLBACK_BRANDS);
 });

 // Fetch dynamic cars from DB
 fetch(`${API_BASE_URL}/cars`)
 .then(res => res.json())
 .then(data => {
 if (Array.isArray(data)) {
 setFeaturedCars(data);
 }
 })
 .catch(err => console.error("Error fetching featured cars:", err))
 .finally(() => setLoadingCars(false));

 // Fetch real top destinations from DB (admin-curated list with images)
 Promise.all([
 fetch(`${API_BASE_URL}/destinations`).then(r => r.json()).catch(() => []),
 fetch(`${API_BASE_URL}/cars/destinations`).then(r => r.json()).catch(() => []),
 ]).then(([adminDests, carDests]) => {
 const countMap: Record<string, number> = {};
 if (Array.isArray(carDests)) {
 carDests.forEach((d: any) => {
 countMap[d.city?.toLowerCase() || ''] = d.count || 0;
 });
 }

 if (Array.isArray(adminDests) && adminDests.length > 0) {
 // Merge admin destinations with live listing counts
 setDestinations(adminDests.map((d: any) => ({
 ...d,
 count: countMap[d.city?.toLowerCase() || ''] || 0,
 })));
 } else {
 // No admin destinations yet — fall back to auto-aggregated car locations
 if (Array.isArray(carDests) && carDests.length > 0) {
 setDestinations(carDests);
 } else {
 setDestinations(DESTINATIONS.map((d) => ({
 city: d.name,
 country: d.country,
 count: 0,
 image: null,
 _fallbackImage: d.image,
 })));
 }
 }
 });
 }, []);

 return (
 <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white">
 <Header />

 {/* Hero Section */}
 {settings.showHeroSection && (
 <section className="relative pt-16 lg:pt-20 min-h-screen flex items-center overflow-hidden">
 <div className="absolute inset-0 z-0 bg-slate-800">
 <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-black/5 to-transparent z-10" />
 <img
 src={(() => {
   if (loading) return `/images/site/car-bg.png`;
   const url = settings.heroImageUrl;
   if (!url) return `/images/site/car-bg.png`;
   if (url.startsWith('/')) return `${BACKEND_URL}${url}`;
   if (url === 'site-1777369870612-erik-mclean-QYRdVxPeFqc-unsplash.jpg') return `/images/site/car-bg.png`;
   return `${BACKEND_URL}/images/site/${url}`;
  })()}
  onError={(e) => {
   const target = e.target as HTMLImageElement;
   target.src = `/images/site/car-bg.png`;
  }}
 alt="Luxury car on highway"
 className="w-full h-full object-cover object-center"
 loading="eager"
 fetchPriority="high"
 />
 </div>

 <div className="relative z-20 max-w-7xl mx-auto px-6 w-full py-20 flex flex-col lg:flex-row items-center gap-12">
 {/* Booking Card */}
 <motion.div
 initial={{ opacity: 0, x: -50 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.7, ease: "easeOut" }}
 className="w-full lg:w-[340px] shrink-0 order-2 lg:order-1"
 >
 <div className="bg-card rounded-app p-6 border border-border/50 backdrop-blur-md">
 <h3 className="text-lg font-bold text-[hsl(224,71.4%,4.1%)] dark:text-white mb-5">
 {settings.heroTranslations?.[language]?.onlineBooking || settings.heroTranslations?.['en']?.onlineBooking || t('home.online_booking')}
 </h3>

 <div className="mb-4">
 <label className="text-[10px] font-black text-[hsl(224,71.4%,4.1%)] dark:text-white uppercase tracking-widest mb-2 block px-1">{t('home.pickup_location')}</label>
 <div className="relative">
 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary dark:text-white z-10" />
 <LocationAutocomplete
 placeholder={t('home.pickup_placeholder')}
 className="flex h-11 w-full rounded-app border bg-muted/50 px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-border focus-visible:ring-primary/30 text-foreground font-medium"
 value={pickupLocation}
 onChange={setPickupLocation}
 data-testid="input-pickup-location"
 />
 </div>
 </div>

 <div className="flex items-center gap-2 mb-4">
 <input
 type="checkbox"
 id="different-return"
 checked={differentReturn}
 onChange={e => setDifferentReturn(e.target.checked)}
 className="w-4 h-4 accent-primary cursor-pointer"
 data-testid="checkbox-different-return"
 />
 <label htmlFor="different-return" className="text-[10px] font-black text-[hsl(224,71.4%,4.1%)] dark:text-white uppercase tracking-widest cursor-pointer select-none px-1">
 {t('home.different_return')}
 </label>
 </div>

 {differentReturn && (
 <div className="mb-4">
 <label className="text-[10px] font-black text-[hsl(224,71.4%,4.1%)] dark:text-white uppercase tracking-widest mb-2 block px-1">{t('home.return_location')}</label>
 <div className="relative">
 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-white z-10" />
 <LocationAutocomplete
 placeholder={t('home.return_placeholder')}
 className="flex h-11 w-full rounded-app border bg-muted/50 px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-border focus-visible:ring-primary/30 text-foreground font-medium"
 value={returnLocation}
 onChange={setReturnLocation}
 data-testid="input-return-location"
 />
 </div>
 </div>
 )}

 <div className="mb-6">
 <PremiumRangePicker
 startDate={fromDate}
 endDate={toDate}
 position="side"
 align="center"
 sideOffsetTop="-140px"
 onRangeChange={(start, end) => {
 setFromDate(start);
 setToDate(end);
 }}
 />
 </div>

 <div className="mb-8">
 <PremiumTimeRangePicker
 startTime={fromTime}
 endTime={toTime}
 position="side"
 align="left"
 sideOffsetTop="-236px"
 onRangeTimeChange={(start, end) => {
 setFromTime(start);
 setToTime(end);
 }}
 />
 </div>

 <Button
 className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-app flex items-center justify-center gap-2"
 onClick={() => {
 const params = new URLSearchParams();
 // Just pass the text directly so the VehiclesView handles "Madurai", "London", etc.
 if (pickupLocation) params.set("city", pickupLocation.split(',')[0].trim());
 if (fromDate) params.set("startDate", fromDate);
 if (toDate) params.set("endDate", toDate);
 if (fromTime) params.set("startTime", fromTime);
 if (toTime) params.set("endTime", toTime);
 router.push(`/vehicles?${params.toString()}`);
 }}
 data-testid="button-search-cars"
 >
 <Search className="w-4 h-4 shrink-0" />
 {t('home.search_cars')}
 </Button>
 </div>
 </motion.div>

 {/* Hero Text */}
 <motion.div
 initial={{ opacity: 0, x: 50 }}
 animate={{ opacity: 1, x: 0 }}
 variants={staggerContainer}
 className="flex-1 text-white order-1 lg:order-2"
 >
 <motion.h1
 variants={fadeInUp}
 className="text-5xl md:text-6xl lg:text-7xl font-[900] tracking-tight leading-[1.1] mb-6 drop-shadow"
 >
 {settings.heroTranslations?.[language]?.title || settings.heroTranslations?.['en']?.title || "Your Ride Should Match the Road!"}
 </motion.h1>
 <motion.p
 variants={fadeInUp}
 className="text-lg md:text-xl text-white/80 max-w-lg drop-shadow"
 >
 {settings.heroTranslations?.[language]?.subtitle || settings.heroTranslations?.['en']?.subtitle || "Book your luxury drive in just a few clicks. Experience the ultimate comfort and performance on your next journey."}
 </motion.p>

 <motion.div variants={fadeInUp} className="mt-10 flex gap-6">
 <div className="text-center">
 <div className="text-3xl font-bold">{settings.stats?.premiumCars || "500+"}</div>
 <div className="text-white/70 text-sm mt-1">
 {settings.heroTranslations?.[language]?.premiumCarsLabel || settings.heroTranslations?.['en']?.premiumCarsLabel || t('home.premium_cars')}
 </div>
 </div>
 <div className="w-px bg-white/20" />
 <div className="text-center">
 <div className="text-3xl font-bold">{settings.stats?.locations || "50+"}</div>
 <div className="text-white/70 text-sm mt-1">
 {settings.heroTranslations?.[language]?.locationsLabel || settings.heroTranslations?.['en']?.locationsLabel || t('home.locations')}
 </div>
 </div>
 <div className="w-px bg-white/20" />
 <div className="text-center">
 <div className="text-3xl font-bold">{settings.stats?.happyClients || "10k+"}</div>
 <div className="text-white/70 text-sm mt-1">
 {settings.heroTranslations?.[language]?.happyClientsLabel || settings.heroTranslations?.['en']?.happyClientsLabel || t('home.happy_clients')}
 </div>
 </div>
 </motion.div>
 </motion.div>
 </div>
 </section>
 )}

 {/* Vehicle Categories */}
 {settings.showBrandsSection && (
 <section className="py-20 max-w-7xl mx-auto px-6">
 <motion.div
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, margin: "-100px" }}
 variants={staggerContainer}
 className="text-center mb-16"
 >
 <motion.p variants={fadeInUp} className="text-primary font-semibold tracking-wider uppercase text-sm mb-3">
 {settings.heroTranslations?.[language]?.brandsTitle || settings.heroTranslations?.['en']?.brandsTitle || "Plan your trip"}
 </motion.p>
 <motion.h2 variants={fadeInUp} className="text-4xl font-bold mb-4 text-foreground">
 {settings.heroTranslations?.[language]?.brandsSubtitle || settings.heroTranslations?.['en']?.brandsSubtitle || "Explore Our Elite Brands"}
 </motion.h2>
 <motion.p variants={fadeInUp} className="text-slate-900 dark:text-slate-300 max-w-2xl mx-auto">
 {settings.heroTranslations?.[language]?.brandsDescription || settings.heroTranslations?.['en']?.brandsDescription || "Select your perfect ride from our diverse collection of premium automotive partners."}
 </motion.p>
 </motion.div>

 <div className="relative overflow-hidden py-4 w-full">
 <style>
 {`
 @keyframes marquee {
 0% { transform: translateX(0); }
 100% { transform: translateX(-50%); }
 }
 .marquee-inner {
 display: flex;
 gap: 5rem;
 width: max-content;
 animation: marquee 40s linear infinite;
 }
 .marquee-container:hover .marquee-inner {
 animation-play-state: paused;
 }
 `}
 </style>
 <div className="marquee-container w-full">
 <div className="marquee-inner pb-6">
 {brands.length > 0 ? [...brands, ...brands, ...brands].map((brand, i) => (
 <div
 key={`${brand._id}-${i}`}
 onClick={() => {
 router.push(`/vehicles?brand=${encodeURIComponent(brand.name)}`);
 }}
 className="flex flex-col items-center gap-6 cursor-pointer group min-w-[140px] transition-all hover:-translate-y-2"
 >
 <div
 className="w-24 h-24 bg-white dark:bg-white rounded-app p-4 transition-all duration-500 transform group-hover:scale-110 flex items-center justify-center dark:border-none dark:border dark:border-white/10"
              style={{ boxShadow: '0px 0px 0px 1px #ccc' }}
 >
 <img
 src={brand.logo}
 alt={brand.name}
 className="w-full h-full object-contain"
 />
 </div>
 <span className="font-bold tracking-[0.2em] uppercase text-[10px] text-slate-900 dark:text-slate-300 group-hover:text-primary transition-colors">{brand.name}</span>
 </div>
 )) : (
 <div className="py-10 text-center w-full text-muted-foreground opacity-50 font-medium tracking-widest uppercase text-xs">
 {settings.heroTranslations?.[language]?.loadingBrands || settings.heroTranslations?.['en']?.loadingBrands || "Loading Elite Brands..."}
 </div>
 )}
 </div>
 </div>
 </div>
 </section>
 )}

 {/* Car Listings */}
 {settings.showFeaturedCars && featuredCars.length > 0 && (
 <section className="py-24 bg-muted/30 border-y border-border/50">
 <div className="max-w-7xl mx-auto px-6">
 <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
 <div>
 <h2 className="text-4xl font-bold mb-4 text-foreground">
 {settings.heroTranslations?.[language]?.featuredTitle || settings.heroTranslations?.['en']?.featuredTitle || "Featured Cars"}
 </h2>
 <p className="text-slate-900 dark:text-slate-300">
 {settings.heroTranslations?.[language]?.featuredSubtitle || settings.heroTranslations?.['en']?.featuredSubtitle || "Premium vehicles available for your next luxury experience."}
 </p>
 </div>
 <Button variant="ghost" onClick={() => router.push('/vehicles')} className="text-primary hover:text-foreground hover:bg-transparent pr-0">
 {settings.heroTranslations?.[language]?.viewAllVehicles || settings.heroTranslations?.['en']?.viewAllVehicles || "View all vehicles"} <ChevronRight className="w-4 h-4 ml-1" />
 </Button>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
 {featuredCars.slice(0, 8).map((car, i) => (
 <CarCard key={car._id || car.id} car={car} index={i} />
 ))}
 </div>
 </div>
 </section>
 )}

 {/* Drive Destinations */}
 {settings.showDestinationsSection && (
 <section className="pt-24 pb-8 max-w-7xl mx-auto px-6">
 <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
 <div>
 <h2 className="text-4xl font-bold mb-4 text-foreground">
 {settings.heroTranslations?.[language]?.destinationsTitle || settings.heroTranslations?.['en']?.destinationsTitle || "Drive Destinations"}
 </h2>
 <p className="text-slate-900 dark:text-slate-300 max-w-2xl">
 {settings.heroTranslations?.[language]?.destinationsSubtitle || settings.heroTranslations?.['en']?.destinationsSubtitle || "Curated routes for the ultimate driving experience."}
 </p>
 </div>
 {destinations.length > 4 && (
 <div className="flex gap-3">
 <button
 onMouseEnter={() => isPaused.current = true}
 onMouseLeave={() => isPaused.current = false}
 onClick={() => {
 if (carouselRef.current) {
 const itemWidth = carouselRef.current.firstElementChild?.clientWidth || 0;
 const gap = 24;
 carouselRef.current.scrollBy({ left: -(itemWidth + gap), behavior: 'smooth' });
 }
 }}
 className="w-12 h-12 rounded-app border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all group"
 >
 <ChevronLeft className="w-5 h-5 text-muted-foreground/60 group-hover:text-white" />
 </button>
 <button
 onMouseEnter={() => isPaused.current = true}
 onMouseLeave={() => isPaused.current = false}
 onClick={() => {
 if (carouselRef.current) {
 const itemWidth = carouselRef.current.firstElementChild?.clientWidth || 0;
 const gap = 24;
 carouselRef.current.scrollBy({ left: (itemWidth + gap), behavior: 'smooth' });
 }
 }}
 className="w-12 h-12 rounded-app bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-all "
 >
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>
 )}
 </div>

 <div
 ref={carouselRef}
 className={`flex overflow-x-auto gap-6 snap-x snap-mandatory pb-16 pt-10 -mt-10 custom-scrollbar-hide transition-opacity duration-700 ${isCarouselReady ? 'opacity-100' : 'opacity-0'}`}
 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
 >
 <style jsx>{`
 div::-webkit-scrollbar {
 display: none;
 }
 `}</style>
 {([...destinations, ...destinations, ...destinations]).map((dest, i) => {
 // Resolve card image: real listing image → fallback cityscape → mock route image
 const bgImage: any =
 dest.image
 ? getImageUrl(dest.image)
 : dest._fallbackImage
 ? (typeof dest._fallbackImage === 'object' ? (dest._fallbackImage?.src || '') : dest._fallbackImage)
 : FALLBACK_DESTINATION_IMAGES[i % FALLBACK_DESTINATION_IMAGES.length];

 return (
 <motion.div
 key={`${dest.city}-${i}`}
 initial={{ opacity: 0 }}
 animate={isCarouselReady ? { opacity: 1 } : { opacity: 0 }}
 transition={{ duration: 0.5, delay: isCarouselReady ? (i % destinations.length) * 0.03 : 0 }}
  onClick={() => window.location.href = `/vehicles?city=${encodeURIComponent(dest.city)}`}
  className="group relative rounded-app overflow-hidden aspect-[4/5] cursor-pointer shrink-0 w-full md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start transition-shadow"
 >
 <img src={bgImage} alt={dest.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
 {/* Listing count badge */}
 {dest.count > 0 && (
 <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-app">
 <span className="text-white text-[10px] font-black uppercase tracking-widest">
 {dest.count} {dest.count === 1
 ? (settings.heroTranslations?.[language]?.listingLabel || settings.heroTranslations?.['en']?.listingLabel || 'listing')
 : (settings.heroTranslations?.[language]?.listingsLabel || settings.heroTranslations?.['en']?.listingsLabel || 'listings')}
 </span>
 </div>
 )}
 <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
 <div className="flex items-center gap-1.5 text-white/70 text-[11px] font-black uppercase tracking-widest mb-2">
 <MapPin className="w-3.5 h-3.5" /> {dest.country}
 </div>
 <h3 className="text-2xl font-black mb-2 tracking-tight">{dest.city}</h3>
 <div className="flex items-center gap-2 text-sm font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
 {settings.heroTranslations?.[language]?.browseVehicles || settings.heroTranslations?.['en']?.browseVehicles || "Browse vehicles"} <ChevronRight className="w-4 h-4" />
 </div>
 </div>
 </motion.div>
 );
 })}
 </div>
 </section>
 )}

 {/* Two Promo Cards Section */}
 {settings.showCTASection && (
  <section className="py-2 max-w-7xl mx-auto px-6 mb-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 lg:gap-8 min-h-[280px] bg-card dark:bg-slate-900 shadow-sm border border-border dark:border-white/10"
      >
        <div className="flex-1 z-10">
          <h3 className="text-2xl font-black text-primary mb-3 tracking-wider">
            {settings.heroTranslations?.[language]?.ctaTitleRenter || "Finding Your Ideal Match?"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-6 leading-relaxed max-w-[240px]">
            Explore options for your next vehicle. Compare, decide, and connect.
          </p>
          <Link href="/vehicles">
            <Button className="bg-primary hover:bg-primary-hover text-white rounded-app px-6 h-11 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border-none shadow-lg shadow-primary/20">
              {settings.heroTranslations?.[language]?.ctaButtonRenter || "Explore Options"} <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="w-full md:w-2/5 h-[240px] shrink-0 rounded-2xl overflow-hidden ">
          <img
            src={settings.ctaImageRenter ? (settings.ctaImageRenter.startsWith('http') || settings.ctaImageRenter.startsWith('/') ? settings.ctaImageRenter : `${BACKEND_URL}/images/site/${settings.ctaImageRenter}`) : "/cta-renter.jpg"}
            onError={(e) => { (e.target as HTMLImageElement).src = "/cta-renter.jpg"; }}
            alt="Find your match car"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 min-h-[280px] bg-card dark:bg-slate-900 shadow-sm border border-border dark:border-white/10"
      >
        <div className="flex-1 z-10">
          <h3 className="text-2xl font-black text-primary mb-3 tracking-wider">
            {settings.heroTranslations?.[language]?.ctaTitleHost || "Managing Your Car Journey?"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-6 leading-relaxed max-w-[240px]">
            Unlock tools to track, manage, or find a new home for your vehicle.
          </p>
          <div
            onClick={() => {
              if (!user) {
                setShowLoginModal(true);
              } else {
                setUserType("host");
                router.push("/dashboard/cars/new");
              }
            }}
            className="cursor-pointer"
          >
            <Button className="bg-primary hover:bg-primary-hover text-white rounded-app px-6 h-11 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border-none shadow-lg shadow-primary/20">
              {settings.heroTranslations?.[language]?.ctaButtonHost || "List Your Car"} <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="w-full md:w-2/5 h-[240px] shrink-0 rounded-2xl overflow-hidden ">
          <img
            src={settings.ctaImageHost ? (settings.ctaImageHost.startsWith('http') || settings.ctaImageHost.startsWith('/') ? settings.ctaImageHost : `${BACKEND_URL}/images/site/${settings.ctaImageHost}`) : "/cta-host.jpg"}
            onError={(e) => { (e.target as HTMLImageElement).src = "/cta-host.jpg"; }}
            alt="Manage your car"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </motion.div>
    </div>
  </section>
  )}

 {/* Map & Locations */}
 {settings.showLocationsSection && (
 <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
 <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-12 items-center">
 <div className="lg:w-1/3">
 <h2 className="text-4xl font-bold mb-6">
 {settings.heroTranslations?.[language]?.locationsTitle || settings.heroTranslations?.['en']?.locationsTitle || "Find us globally"}
 </h2>
 <p className="text-primary-foreground/80 mb-8 text-lg">
 {settings.heroTranslations?.[language]?.locationsSubtitle || settings.heroTranslations?.['en']?.locationsSubtitle || "We have premium locations in all major cities and airports across the globe, ensuring you are never far from your next luxury drive."}
 </p>
 <div className="space-y-6">
 {((settings?.officeLocations?.length || 0) > 0
 ? settings.officeLocations!
 : [
 { city: "New York", address: "JFK International Airport" },
 { city: "London", address: "Heathrow Airport, Terminal 5" },
 { city: "Dubai", address: "Dubai International Airport" },
 ]
 ).map((loc: any, i: number) => (
 <div key={i} className="flex gap-4 items-start">
 <div className="w-10 h-10 rounded-app bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
 <MapPin className="w-5 h-5" />
 </div>
 <div>
 <h4 className="font-bold text-lg">{loc.city}</h4>
 <p className="text-primary-foreground/70">{loc.address}</p>
 </div>
 </div>
 ))}
 </div>

 </div>
 <div className="lg:w-2/3 w-full h-[500px] rounded-app overflow-hidden relative bg-white/5 border border-white/10 p-2">
 <div className="w-full h-full rounded-app bg-muted relative overflow-hidden">
 <OfficeMap
 locations={((settings?.officeLocations?.length || 0) > 0
 ? settings.officeLocations!
 : [
 { city: "New York", address: "JFK International Airport" },
 { city: "London", address: "Heathrow Airport, Terminal 5" },
 { city: "Dubai", address: "Dubai International Airport" },
 ]
 )}
 />
 </div>
 </div>
 </div>
 </section>
 )}


 <Footer />
 </div>
 );
}
