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
 <MapPin className=




































































































































































































































































































































































































































































































































































































































































































































































          <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
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
          {featuredReviews.map((t, i) => (
            <motion.div
              key={t.name + i}
              initial={{ opacity: 0, y: 24 }}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-foreground truncate">{t.name}</div>
                    {(t.carSlug || t.carId) ? (
                      <Link href={`/vehicles/${t.carSlug || t.carId}`}>
                        <div className="text-[10px] text-primary hover:underline truncate cursor-pointer">{t.role}</div>
                      </Link>
                    ) : (
                      <div className="text-[10px] text-muted-foreground truncate">{t.role}</div>
                    )}
                  </div>
                  <div className="ml-auto flex gap-0.5 shrink-0">
                    {Array.from({ length: Math.min(5, Math.max(1, t.rating || 5)) }).map((_, si) => (
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