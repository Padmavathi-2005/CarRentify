"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, MapPin, Calendar, ChevronRight, User, ShoppingBag, Menu, Car, Truck, Zap, Mountain, Clock, Heart, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { useSettings } from "@/components/ThemeProvider";
import { useLocale } from "@/components/LocaleContext";
import { API_BASE_URL } from "@/config/api";

import Link from "next/link";
import {
  CARS,
  DESTINATIONS,
  TESTIMONIALS,
} from "@/data/mockData";

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
  const { settings } = useSettings();
  const { language } = useLocale();
  const [differentReturn, setDifferentReturn] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);

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
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white">
      <Header />

      {/* Hero Section */}
      {settings.showHeroSection && (
        <section className="relative pt-20 min-h-screen flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10 z-10" />
            <img
              src={settings.heroImageUrl || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop"}
              alt="Luxury car on highway"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-6 w-full py-20 flex flex-col lg:flex-row items-center gap-12">
            {/* Booking Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-full lg:w-[340px] shrink-0"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-foreground mb-5">Online Booking</h3>

                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Pick Up Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input
                      placeholder="City, Airport, or Address"
                      className="pl-9 h-11 text-sm border-border focus-visible:ring-primary/30"
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
                  <label htmlFor="different-return" className="text-xs text-muted-foreground cursor-pointer select-none">
                    Different Return Location?
                  </label>
                </div>

                {differentReturn && (
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Return Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Return location"
                        className="pl-9 h-11 text-sm border-border focus-visible:ring-primary/30"
                        data-testid="input-return-location"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">From</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="date" className="pl-9 h-10 text-xs border-border focus-visible:ring-primary/30" data-testid="input-from-date" />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="time" className="pl-9 h-10 text-xs border-border focus-visible:ring-primary/30" data-testid="input-from-time" />
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">To</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="date" className="pl-9 h-10 text-xs border-border focus-visible:ring-primary/30" data-testid="input-to-date" />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="time" className="pl-9 h-10 text-xs border-border focus-visible:ring-primary/30" data-testid="input-to-time" />
                    </div>
                  </div>
                </div>

                <Button className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl" data-testid="button-search-cars">
                  Search Cars
                </Button>
              </div>
            </motion.div>

            {/* Hero Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex-1 text-white"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 drop-shadow-lg"
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
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-white/70 text-sm mt-1">Premium Cars</div>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-white/70 text-sm mt-1">Locations</div>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-3xl font-bold">10k+</div>
                  <div className="text-white/70 text-sm mt-1">Happy Clients</div>
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
              {settings.heroTranslations?.[language]?.brandsSubtitle || settings.heroTranslations?.['en']?.brandsSubtitle || "Explore Our Brands"}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto">
              {settings.heroTranslations?.[language]?.brandsDescription || settings.heroTranslations?.['en']?.brandsDescription || "Select your perfect ride from our diverse fleet of premium automotive partners."}
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
                    className="flex flex-col items-center gap-6 cursor-pointer group min-w-[140px] transition-all hover:-translate-y-2"
                  >
                    <div className="w-16 h-16 transition-all duration-500 transform group-hover:scale-110">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-bold tracking-[0.2em] uppercase text-[10px] text-slate-600 group-hover:text-primary transition-colors">{brand.name}</span>
                  </div>
                )) : (
                  <div className="py-10 text-center w-full text-muted-foreground opacity-50 font-medium tracking-widest uppercase text-xs">
                    Loading Elite Brands...
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Car Listings */}
      {settings.showFeaturedCars && (
        <section className="py-24 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-bold mb-4 text-foreground">
                  {settings.heroTranslations?.[language]?.featuredTitle || settings.heroTranslations?.['en']?.featuredTitle || "Featured Fleet"}
                </h2>
                <p className="text-muted-foreground">
                  {settings.heroTranslations?.[language]?.featuredSubtitle || settings.heroTranslations?.['en']?.featuredSubtitle || "Premium vehicles available for your next luxury experience."}
                </p>
              </div>
              <Button variant="ghost" className="text-primary hover:text-black hover:bg-transparent pr-0">
                View all vehicles <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CARS.slice(0, 8).map((car, i) => (
                <CarCard key={car.id} car={car} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Drive Destinations */}
      {settings.showDestinationsSection && (
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                {settings.heroTranslations?.[language]?.destinationsTitle || settings.heroTranslations?.['en']?.destinationsTitle || "Drive Destinations"}
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                {settings.heroTranslations?.[language]?.destinationsSubtitle || settings.heroTranslations?.['en']?.destinationsSubtitle || "Curated routes for the ultimate driving experience."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DESTINATIONS.map((route, i) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
                data-testid={`card-route-${route.id}`}
              >
                <img src={getSrc(route.image)} alt={route.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-bold mb-2">{route.name}</h3>
                  <div className="flex items-center gap-2 text-sm font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    Drive this route <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}


      {/* Testimonials */}
      {settings.showTestimonials && (
        <section className="py-24 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.p variants={fadeInUp} className="text-primary font-semibold tracking-wider uppercase text-sm mb-3">
                {settings.heroTranslations?.[language]?.testimonialsTitle || settings.heroTranslations?.['en']?.testimonialsTitle || "What Our Clients Say"}
              </motion.p>
              <motion.h2 variants={fadeInUp} className="text-4xl font-bold mb-4 text-foreground">
                {settings.heroTranslations?.[language]?.testimonialsSubtitle || settings.heroTranslations?.['en']?.testimonialsSubtitle || "Trusted by Thousands"}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto">
                {settings.heroTranslations?.[language]?.testimonialsDescription || settings.heroTranslations?.['en']?.testimonialsDescription || "Real stories from real CarRentify clients around the world."}
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  data-testid={`card-testimonial-${i}`}
                >
                  <Card className="h-full rounded-2xl border-border/40 bg-white hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 p-6 flex flex-col">
                    <Quote className="w-8 h-8 text-primary/20 mb-4 shrink-0" />
                    <p className="text-foreground/75 text-sm leading-relaxed flex-1 mb-6">"{t.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {t.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star key={si} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Two Promo Cards Section */}
      {settings.showCTASection && (
        <section className="py-16 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl overflow-hidden p-8 flex items-center justify-between gap-6 min-h-[220px] border border-primary/5"
              style={{ background: "var(--primary-brand-lite)" }}
            >
              <div className="flex-1 z-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-wider">
                  {settings.heroTranslations?.[language]?.ctaTitleRenter || settings.heroTranslations?.['en']?.ctaTitleRenter || "Finding Your Ideal Match?"}
                </h3>
                <p className="text-slate-600 text-sm mb-6 max-w-[220px]">
                  {settings.heroTranslations?.[language]?.ctaSubtitleRenter || settings.heroTranslations?.['en']?.ctaSubtitleRenter || "Explore options for your next vehicle. Compare, decide, and connect to find the perfect ride for your journey."}
                </p>
                <Link href="/vehicles">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 h-11 font-semibold flex items-center gap-2 shadow-lg shadow-primary/20">
                    {settings.heroTranslations?.[language]?.ctaButtonRenter || settings.heroTranslations?.['en']?.ctaButtonRenter || "Explore Options"} <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="w-[180px] shrink-0">
                <img src={settings.ctaImageRenter || "/car-5.png"} alt="Find your match car" className="w-full object-contain drop-shadow-xl" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative rounded-3xl overflow-hidden p-8 flex items-center justify-between gap-6 min-h-[220px] shadow-xl shadow-primary/20"
              style={{ background: "linear-gradient(135deg, var(--primary-brand-color) 0%, var(--secondary-brand-color) 100%)" }}
            >
              <div className="flex-1 z-10">
                <h3 className="text-2xl font-bold text-white mb-3 tracking-wider">
                  {settings.heroTranslations?.[language]?.ctaTitleHost || settings.heroTranslations?.['en']?.ctaTitleHost || "Managing Your Car Journey?"}
                </h3>
                <p className="text-white/60 text-sm mb-6 max-w-[220px]">
                  {settings.heroTranslations?.[language]?.ctaSubtitleHost || settings.heroTranslations?.['en']?.ctaSubtitleHost || "Unlock tools to track, manage, or find a new home for your vehicle with effortless ease and complete security."}
                </p>
                <Link href="/dashboard/fleet/new">
                  <Button className="bg-white hover:bg-white/90 text-primary rounded-full px-6 h-11 font-semibold flex items-center gap-2">
                    {settings.heroTranslations?.[language]?.ctaButtonHost || settings.heroTranslations?.['en']?.ctaButtonHost || "List Your Car"} <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="w-[180px] shrink-0">
                <img src={settings.ctaImageHost || "/car-2.png"} alt="Manage your car" className="w-full object-contain drop-shadow-xl brightness-110" />
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
                {[
                  { city: "New York", address: "JFK International Airport" },
                  { city: "London", address: "Heathrow Airport, Terminal 5" },
                  { city: "Dubai", address: "Dubai International Airport" },
                ].map((loc, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{loc.city}</h4>
                      <p className="text-primary-foreground/70">{loc.address}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/locations">
                <Button variant="outline" className="mt-10 border-white text-primary bg-white hover:bg-white/90 rounded-full px-8 h-12 font-bold">
                  {settings.heroTranslations?.[language]?.locationsButton || settings.heroTranslations?.['en']?.locationsButton || "View All Locations"}
                </Button>
              </Link>
            </div>
            <div className="lg:w-2/3 w-full h-[500px] rounded-3xl overflow-hidden relative shadow-2xl shadow-black/20 bg-white/5 border border-white/10 p-2">
              <div className="w-full h-full rounded-2xl bg-[#E8EAE6] relative overflow-hidden flex items-center justify-center">
                <div className="relative z-10 flex flex-col items-center">
                  <MapPin className="w-12 h-12 text-primary animate-bounce mb-4" />
                  <div className="bg-white text-primary font-bold px-6 py-3 rounded-xl shadow-lg">Interactive Map Coming Soon</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enhance Your Experience */}
      {settings.showEnhanceSection !== false && (
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                {settings.heroTranslations?.[language]?.enhanceTitle || settings.heroTranslations?.['en']?.enhanceTitle || "Enhance Your Experience"}
              </h2>
              <p className="text-muted-foreground mb-10 text-lg">
                {settings.heroTranslations?.[language]?.enhanceSubtitle || settings.heroTranslations?.['en']?.enhanceSubtitle || "Find premium accessories and book exclusive services to make your journey truly unforgettable."}
              </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accessories.map((acc, i) => (
                <div key={i} className="p-6 rounded-2xl border border-border/50 bg-muted/30 hover:border-primary/30 transition-colors">
                  <h4 className="font-bold text-foreground mb-2">{acc.title}</h4>
                  <p className="text-primary font-medium">{acc.price}</p>
                </div>
              ))}
            </div>
          </div>
            <div className="lg:w-1/2">
              <div className="w-full h-full min-h-[400px] rounded-3xl overflow-hidden">
                <img src={settings.enhanceImage || "/enhance.png"} alt="Luxury Accessories" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Get the App */}
      {settings.showAppSection !== false && (
        <section className="py-24 bg-muted/30 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-primary rounded-[3rem] overflow-hidden relative shadow-2xl flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 p-12 lg:p-20 relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  {settings.heroTranslations?.[language]?.appTitle || settings.heroTranslations?.['en']?.appTitle || "Get the Drive App"}
                </h2>
                <p className="text-white/80 mb-10 text-lg">
                  {settings.heroTranslations?.[language]?.appSubtitle || settings.heroTranslations?.['en']?.appSubtitle || "Download the app and find your perfect drive instantly. Manage bookings, unlock cars directly, and access 24/7 premium support."}
                </p>
              <div className="flex flex-wrap gap-4">
                <a href={settings.appStoreLink || "https://apple.com/app-store"} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-primary hover:bg-white/90 h-14 px-8 rounded-xl text-base font-bold flex gap-3" data-testid="button-app-store">
                    {settings.heroTranslations?.[language]?.appStoreLabel || settings.heroTranslations?.['en']?.appStoreLabel || "App Store"}
                  </Button>
                </a>
                <a href={settings.googlePlayLink || "https://play.google.com/store"} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-primary hover:bg-white/90 h-14 px-8 rounded-xl text-base font-bold flex gap-3" data-testid="button-google-play">
                    {settings.heroTranslations?.[language]?.googlePlayLabel || settings.heroTranslations?.['en']?.googlePlayLabel || "Google Play"}
                  </Button>
                </a>
              </div>
            </div>
              <div className="lg:w-1/2 relative w-full flex items-end justify-center lg:justify-end h-[320px] md:h-[450px] lg:h-[600px] overflow-hidden px-8 lg:px-0">
                <img src={settings.appImage || "/app-mockup.png"} alt="App Mockups" className="w-auto h-full max-w-none object-contain object-bottom transform lg:translate-y-16 lg:translate-x-12 lg:scale-110" />
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
