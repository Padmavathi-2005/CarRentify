"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
   MapPin,
   Star,
   Fuel,
   Gauge,
   User as UserIcon,
   ChevronRight,
   ChevronLeft,
   Clock,
   Zap,
   Settings,
   Edit,
   Share2,
   Armchair,
   Calendar,
   Activity,
   Globe,
   Mail,
   MessageCircle,
   Link as LinkIcon,
   FileText,
   X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Modal from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useLocale } from "@/components/LocaleContext";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import CarCard from "@/components/CarCard";
import dynamic from "next/dynamic";
import type { LocationOption } from "@/components/DynamicMap";
import { HostSection, ThingsToKnow } from "@/components/VehicleDetailSections";
import { ImageGallery } from "@/components/VehicleDetail/ImageGallery";
import { BookingWidget } from "@/components/VehicleDetail/BookingWidget";
import { ReviewSection } from "@/components/VehicleDetail/ReviewSection";
import PostBookingReviewModal from "@/components/VehicleDetail/PostBookingReviewModal";

const DynamicMap = dynamic(() => import("@/components/DynamicMap"), {
   ssr: false,
   loading: () => <div className="h-[600px] bg-muted/20 flex items-center justify-center rounded-app border border-border italic text-muted-foreground/40">Loading Geospatial Interface...</div>
});

export default function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
   const resolvedParams = use(params);
   const carId = resolvedParams.slug;
   const router = useRouter();

   const [car, setCar] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const { user, setShowLoginModal, userType, setUserType } = useAuth();
   const { formatPrice, t } = useLocale();
   const { settings } = useSettings();

   const [reviews, setReviews] = useState<any[]>([]);
   const [submitting, setSubmitting] = useState(false);
   const [bookingError, setBookingError] = useState("");
   const [fetchError, setFetchError] = useState(false);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    const [returnTime, setReturnTime] = useState("");
    const [bookedSlots, setBookedSlots] = useState<any[]>([]);

   const [pickupLocation, setPickupLocation] = useState('');
   const [returnLocation, setReturnLocation] = useState('');
   const [pickupCoords, setPickupCoords] = useState<LocationOption | null>(null);
   const [returnCoords, setReturnCoords] = useState<LocationOption | null>(null);
   const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);

   const [showShareModal, setShowShareModal] = useState(false);
   const [similarCars, setSimilarCars] = useState<any[]>([]);
    const [showOverview, setShowOverview] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [lastBookingId, setLastBookingId] = useState("");

   const isAdmin = user?.role?.toLowerCase() === 'admin';
   const vendorId = String(car?.vendor?._id || car?.vendor?.id || car?.vendor || '');
   const userId = String(user?._id || user?.id || '');
   const isOwner = !!(user && car && vendorId && userId && vendorId.toLowerCase() === userId.toLowerCase());
   
   useEffect(() => {
     if (car && user) {
       console.log("[DEBUG OWNER] vendorId:", vendorId, "userId:", userId, "isOwner:", isOwner);
       console.log("[DEBUG OWNER DETAILS] car.vendor:", car.vendor, "user:", user);
     }
   }, [car, user, vendorId, userId, isOwner]);

   useEffect(() => {
      const fetchCar = async () => {
         try {
            const res = await fetch(`${API_BASE_URL}/cars/${carId}`);
            if (res.ok) {
               const data = await res.json();
               setCar(data);
               const loc = `${data.location?.city || "Unknown"}, ${data.location?.state || ""}`.trim();
               setPickupLocation(loc);
               setReturnLocation(loc);

               // Geocode Main Location
               let mainOpt: any = null;
               const opts: any[] = [];
               if (data.location?.latitude && data.location?.longitude) {
                   mainOpt = { name: "Host Location: " + loc, lat: data.location.latitude, lng: data.location.longitude, type: 'host', price: 0 };
                   opts.push(mainOpt);
                   setLocationOptions(opts);
                   setPickupCoords(mainOpt);
                   setReturnCoords(mainOpt);
               } else {
                   fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.location?.address || data.location?.city || "London")}`)
                      .then(r => r.json())
                      .then(geo => {
                         if (geo && geo[0]) {
                            mainOpt = { name: "Host Location: " + loc, lat: parseFloat(geo[0].lat), lng: parseFloat(geo[0].lon), type: 'host', price: 0 };
                            opts.push(mainOpt);
                            setLocationOptions(opts);
                            setPickupCoords(mainOpt);
                            setReturnCoords(mainOpt);
                         }
                      });
               }
               
               // Load Predefined Pickup Locations
               if (data.pickupLocations && data.pickupLocations.length > 0) {
                   data.pickupLocations.forEach((pl: any) => {
                       if (pl.latitude && pl.longitude) {
                           opts.push({ name: pl.name || pl.address, lat: pl.latitude, lng: pl.longitude, type: 'predefined', price: pl.price || 0 });
                       }
                   });
                   setLocationOptions([...opts]);
               }

               // Recommendations
               const allRes = await fetch(`${API_BASE_URL}/cars`);
               if (allRes.ok) {
                  const all = await allRes.json();
                  setSimilarCars(all.filter((c: any) => c._id !== data._id).slice(0, 4));
               }
            } else {
               setFetchError(true);
            }
         } catch (err) {
            setFetchError(true);
         } finally {
            setLoading(false);
         }
      };
      if (carId) fetchCar();
   }, [carId]);

   useEffect(() => {
      if (car?._id) {
         fetch(`${API_BASE_URL}/reviews/car/${car._id}`).then(r => r.json()).then(setReviews).catch(() => { });
         fetch(`${API_BASE_URL}/bookings/availability/${car._id}`).then(r => r.json()).then(data => {
            setBookedSlots(data);
            
            // Robust DateTime Parsing to avoid Timezone/ISO inconsistencies
            const getTs = (dStr: string, tStr: string) => {
               if (!dStr || !tStr) return 0;
               // Handle both YYYY-MM-DD and potentially DD/MM/YYYY if it leaks from UI
               let y, m, d;
               if (dStr.includes('-')) {
                  [y, m, d] = dStr.split('-').map(Number);
               } else if (dStr.includes('/')) {
                  [d, m, y] = dStr.split('/').map(Number);
               } else return 0;

               const [hh, mm] = tStr.split(':').map(Number);
               return new Date(y, m - 1, d, hh, mm, 0, 0).getTime();
            };

            // Smart Default Selection Logic: Find the first 100% free window
            const findSmartDefault = (slots: any[]) => {
               const now = new Date();
               // Start looking 2 hours from now, rounded to the next hour
               let start = new Date(now.getTime() + (2 * 60 * 60 * 1000));
               start.setMinutes(0, 0, 0);

               const minDays = car.minBookingDays || 1;
               let found = false;
               let attempts = 0;

               while (!found && attempts < 1000) { 
                  attempts++;
                  const currStart = new Date(start);
                  const startStr = currStart.getFullYear() + '-' + String(currStart.getMonth() + 1).padStart(2, '0') + '-' + String(currStart.getDate()).padStart(2, '0');
                  const startTimeStr = String(currStart.getHours()).padStart(2, '0') + ':' + String(currStart.getMinutes()).padStart(2, '0');
                  
                  const end = new Date(currStart.getTime() + (minDays * 24 * 60 * 60 * 1000));
                  const endStr = end.getFullYear() + '-' + String(end.getMonth() + 1).padStart(2, '0') + '-' + String(end.getDate()).padStart(2, '0');
                  const endTimeStr = String(end.getHours()).padStart(2, '0') + ':' + String(end.getMinutes()).padStart(2, '0');

                  const reqStart = currStart.getTime();
                  const reqEnd = end.getTime();
                  const bufferMs = 60 * 60 * 1000;
                  // Check for any overlap with existing bookings + buffer
                  const hasConflict = slots.some(slot => {
                     const sTs = getTs(slot.startDate, slot.pickupTime || '00:00');
                     const eTs = getTs(slot.endDate, slot.returnTime || '23:59');
                     
                     // Even if only a portion of the day is booked, we treat it as a conflict for the default selection
                     // This matches the "Disabled" calendar logic
                     const startOfDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
                     const endOfDay = startOfDay + (24 * 60 * 60 * 1000) - 1;

                     const slotStartTs = new Date(sTs).setHours(0,0,0,0);
                     const slotEndTs = new Date(eTs).setHours(23,59,59,999);

                     return (startOfDay <= slotEndTs && endOfDay >= slotStartTs);
                  });

                  if (!hasConflict) {
                     setStartDate(startStr);
                     setEndDate(endStr);
                     setPickupTime(startTimeStr);
                     setReturnTime(endTimeStr);
                     found = true;
                  } else {
                     // Move forward by 1 hour and try again
                     start.setTime(start.getTime() + (60 * 60 * 1000));
                  }
               }
            };
            findSmartDefault(data);
         }).catch(() => { });
      }
   }, [car?._id]);

   useEffect(() => {
      const handleScroll = () => {
         const gallery = document.getElementById('gallery-section');
         if (gallery) {
            const galleryBottom = gallery.offsetTop + gallery.offsetHeight;
            setShowOverview(window.scrollY > galleryBottom);
         }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   const calculateRentalDays = () => {
      if (!startDate || !endDate) return 1;
      const start = new Date(`${startDate}T${pickupTime || '00:00'}`);
      const end = new Date(`${endDate}T${returnTime || '00:00'}`);
      const diffMs = end.getTime() - start.getTime();
      if (diffMs <= 0) return 1;
      
      const durationHours = diffMs / (1000 * 60 * 60);
      let days = Math.floor(durationHours / 24);
      const remainderHours = durationHours % 24;
      
      if (remainderHours > 1) {
         days += 1;
      }
      return Math.max(1, days);
   };

   const calculateTotal = () => {
      if (!startDate || !endDate || !car) return 0;
      const days = calculateRentalDays();
      let total = days * (car.pricePerDay || 0);
      const deliveryFee = Number(pickupCoords?.price || 0);
      if (!isNaN(deliveryFee) && deliveryFee > 0) {
         total += deliveryFee;
      }
      return total;
   };

   const handleBooking = async () => {
      if (!user) return setShowLoginModal(true);
      setBookingError("");

      if (!user.licenseExpiryDate || new Date(user.licenseExpiryDate).getTime() < new Date(endDate).getTime()) {
         setBookingError("Your driver's license is missing or will expire before this trip ends. Please update it in your profile.");
         return;
      }

      // Final redundancy check for conflicts before redirecting to checkout
      const reqStart = new Date(`${startDate}T${pickupTime || '00:00'}`);
      const reqEnd = new Date(`${endDate}T${returnTime || '00:00'}`);
      
      const hasConflict = bookedSlots.some(slot => {
         const sDate = new Date(`${slot.startDate}T${slot.pickupTime || '00:00'}`);
         const eDateText = slot.returnTime || "23:59";
         const eDate = new Date(`${slot.endDate}T${eDateText}`);
         const bufferMs = 60 * 60 * 1000;
         
         return (reqStart < new Date(eDate.getTime() + bufferMs) && reqEnd > sDate);
      });

      if (hasConflict) {
         setBookingError("This vehicle is already reserved for the selected period (including mandatory buffers). Please select another slot.");
         return;
      }
      
      const params = new URLSearchParams({
         carId: car._id,
         start: startDate,
         end: endDate,
         pickup: pickupTime,
         return: returnTime
      });
      
      router.push(`/checkout?${params.toString()}`);
   };

   const handleManageClick = () => {
      if (userType === 'renter') {
         setUserType('host');
      }
      router.push(`/dashboard/cars/edit/${car._id}`);
   };

   if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-black uppercase tracking-widest animate-pulse">Loading...</div>;
   if (fetchError || !car) return <div className="min-h-screen flex items-center justify-center">Vehicle Data Stream Terminated.</div>;

   const carName = car.name || `${car.brandName} ${car.model}`.trim();
   const galleryImages = (car.images && car.images.length > 0) ? car.images : [car.image];

   return (
      <div className="bg-background min-h-screen font-sans selection:bg-primary selection:text-white">
         <Header 
            isProductPage={true} 
            showOverview={showOverview}
            productTitle={carName} 
            totalPrice={formatPrice(calculateTotal())} 
            onBookNow={isOwner ? handleManageClick : handleBooking}
            isOwner={isOwner}
         />

         <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
            <div className="flex items-center gap-2 mb-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
               <Link href="/" className="hover:text-primary transition-colors">Home</Link>
               <ChevronRight size={10} />
               <Link href="/vehicles" className="hover:text-primary transition-colors">Cars</Link>
               <ChevronRight size={10} />
               <span className="text-primary truncate max-w-[200px]">{carName}</span>
            </div>

            <div id="gallery-section">
               <ImageGallery images={galleryImages} car={car} onShare={() => setShowShareModal(true)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
               <div className="lg:col-span-8 space-y-8">
                  <div id="overview-section" className="bg-card p-8 rounded-app border border-border dark:border-white/20">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h1 className="text-4xl font-black text-foreground tracking-tight leading-none mb-4">{carName}</h1>
                           <div className="flex items-center gap-6 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {car.location?.city}</span>
                              {reviews.length > 0 && (
                                 <span className="flex items-center gap-1.5">
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    {(reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)} ({reviews.length})
                                 </span>
                              )}
                           </div>
                        </div>
                        {(isOwner || isAdmin) && (
                           <Link href={`/dashboard/cars/edit/${car._id}`}>
                              <Button variant="outline" className="h-10 px-6 rounded-app font-black uppercase text-[10px] tracking-widest gap-2">
                                 <Edit size={14} /> Edit
                              </Button>
                           </Link>
                        )}
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                           { icon: Fuel, label: car.fuelType, title: 'Fuel' },
                           { icon: Activity, label: car.transmission, title: 'Transmission' },
                           { icon: Armchair, label: car.seats, title: 'Seats' },
                           { icon: Calendar, label: car.year, title: 'Year' }
                        ].map((spec, i) => (
                           <div key={i} className="bg-muted/30 border border-border p-5 rounded-app group hover:border-primary/20 transition-all">
                              <spec.icon size={20} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{spec.title}</p>
                              <p className="text-xs font-black text-foreground uppercase">{spec.label}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-card p-8 rounded-app border border-border dark:border-white/20">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Description</h2>
                     </div>
                     <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                        {car.description || "No detailed description provided."}
                     </p>
                  </div>

                  {car?.customSpecs && Object.keys(car.customSpecs).length > 0 && (settings?.listings?.customFields || settings?.customFields || [])?.some((f: any) => car.customSpecs[f.key] !== undefined && car.customSpecs[f.key] !== "") && (
                     <div className="bg-card p-8 rounded-app border border-border dark:border-white/20">
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-1.5 h-6 bg-primary rounded-full" />
                           <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Custom Specifications</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                           {(settings?.listings?.customFields || settings?.customFields || []).filter((field: any) => !field.isCore && !['name', 'permalink', 'content', 'shortdescription', 'vehicletype', 'transmission', 'fueltype', 'year', 'brandid', 'model', 'priceperday', 'minbookingdays', 'securitydeposit', 'distanceincluded', 'extradistancefee', 'horsepower', 'mileage', 'vin', 'seats', 'doors', 'drivetype', 'fuelefficiency', 'color', 'acceleration', 'chargingtype', 'batterycapacity', 'range'].includes((field.key || '').toLowerCase())).map((field: any) => {
                              const val = car.customSpecs[field.key];
                              if (val === undefined || val === "" || val === null) return null;
                              const [trueLabel, falseLabel] = (field.options || "Yes, No").split(",").map((s: string) => s.trim());
                              return (
                                 <div key={field.id} className="bg-muted/20 border border-border p-5 rounded-app flex flex-col justify-between">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{field.label}</p>
                                    <div className="text-sm font-black text-foreground mt-1">
                                       {field.type === 'boolean' ? (
                                          <span>{val ? trueLabel : falseLabel || "No"}</span>
                                       ) : field.type === 'image' ? (
                                          <div className="mt-2 overflow-hidden rounded-app border border-border">
                                             <img src={typeof val === 'object' ? val.url : val} alt={field.label} className="w-full max-h-48 object-cover hover:scale-105 transition-transform duration-500" />
                                          </div>
                                       ) : field.type === 'images' ? (
                                          <div className="flex flex-wrap gap-2 mt-2">
                                             {Array.isArray(val) && val.map((url: string, i: number) => (
                                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-app overflow-hidden border border-border hover:opacity-80 transition-opacity">
                                                   <img src={url} alt="" className="w-full h-full object-cover" />
                                                </a>
                                             ))}
                                          </div>
                                       ) : field.type === 'file' ? (
                                          <div className="mt-2">
                                             <a href={typeof val === 'object' ? val.url : val} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-app text-xs font-bold">
                                                <FileText size={16} /> {typeof val === 'object' ? val.name || "Download Document" : "Download Document"}
                                             </a>
                                          </div>
                                       ) : (
                                          <span>{String(val)}</span>
                                       )}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )}

                  <ReviewSection reviews={reviews} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <HostSection car={car} reviews={reviews} />
                     <ThingsToKnow car={car} t={t} />
                  </div>

                  <div id="location-section" className="rounded-app overflow-hidden h-[300px] md:h-[600px] border border-border dark:border-white/20">
                     <DynamicMap 
                         pickup={pickupCoords} 
                         returnLoc={returnCoords} 
                         options={locationOptions} 
                         customDelivery={car.customDelivery}
                         onPickupChange={(loc: any) => {
                            setPickupCoords(loc);
                            setPickupLocation(loc.name);
                         }} 
                         onReturnChange={(loc: any) => {
                            setReturnCoords(loc);
                            setReturnLocation(loc.name);
                         }} 
                         onAddCustomLocation={(loc: any) => {
                            setLocationOptions(prev => {
                               const filtered = prev.filter(o => o.type !== 'custom');
                               return [...filtered, loc];
                            });
                         }}
                     />
                  </div>
               </div>

               <BookingWidget
                  car={car} startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate}
                  pickupTime={pickupTime} setPickupTime={setPickupTime} returnTime={returnTime} setReturnTime={setReturnTime}
                  pickupLocation={pickupLocation} setPickupLocation={setPickupLocation} returnLocation={returnLocation} setReturnLocation={setReturnLocation}
                  locationOptions={locationOptions} bookedSlots={bookedSlots} formatPrice={formatPrice} calculateTotal={calculateTotal}
                  getPricingDetails={() => ({ pricePerDay: car.pricePerDay, totalDays: calculateRentalDays(), officialTotal: calculateTotal(), deliveryFee: Number(pickupCoords?.price || 0) })}
                  handleBooking={handleBooking} submitting={submitting} bookingError={bookingError} isAdmin={isAdmin} isOwner={isOwner} t={t}
               />
            </div>

            <div className="mt-32 space-y-12">
               <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Similar Vehicles</h2>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {similarCars.map((c, i) => <CarCard key={c._id} car={c} index={i} />)}
               </div>
            </div>
         </main>

         <Footer />

         <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} noPadding={true} noHeader={true}>
            <div className="relative p-6 sm:p-10 flex flex-col items-center text-center">
               <button 
                  onClick={() => setShowShareModal(false)} 
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-app bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100 z-10"
               >
                  <X size={18} />
               </button>
               
               <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 mt-2">
                  <Share2 size={28} />
               </div>
               <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">Share this vehicle</h3>
               <p className="text-sm font-bold text-muted-foreground mb-8">Share with friends or social media</p>
               
               <div className="w-full border border-border rounded-xl p-4 flex gap-4 mb-8 text-left bg-muted/30">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                     <img src={car?.seoImage ? getImageUrl(car.seoImage) : getImageUrl(galleryImages[0])} alt="Car" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                     <h4 className="text-sm font-black text-foreground truncate mb-1">{car?.seoTitle || carName}</h4>
                     <p className="text-sm font-bold text-primary mb-2">
                        {formatPrice(car?.pricePerDay)}
                     </p>
                     <p className="text-[10px] font-bold text-muted-foreground line-clamp-2">
                        {car?.seoDescription || car?.shortDescription || (car?.description || "").substring(0, 100)}
                     </p>
                  </div>
               </div>

               <div className="flex justify-center gap-4 sm:gap-8 w-full mb-10">
                  <button 
                     onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey, experience this vehicle on ${settings?.siteName || "CarRental"}\n${window.location.href}`)}`, '_blank')} 
                     className="flex flex-col items-center gap-3 group"
                  >
                     <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#25D366] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-[#25D366]/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                        </svg>
                     </div>
                     <span className="text-[10px] font-bold text-foreground">WhatsApp</span>
                  </button>
                  <button 
                     onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} 
                     className="flex flex-col items-center gap-3 group"
                  >
                     <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#1877F2] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-[#1877F2]/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                     </div>
                     <span className="text-[10px] font-bold text-foreground">Facebook</span>
                  </button>
                  <button 
                     onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Hey, experience this vehicle on ${settings?.siteName || "CarRental"}`)}`, '_blank')} 
                     className="flex flex-col items-center gap-3 group"
                  >
                     <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                     </div>
                     <span className="text-[10px] font-bold text-foreground">X / Twitter</span>
                  </button>
                  <a 
                     href="#"
                     onClick={(e) => {
                        e.preventDefault();
                        const subject = encodeURIComponent(`${car?.seoTitle || carName} | ${settings?.siteName || "CarRental"}`);
                        const body = encodeURIComponent(`Hey, experience this vehicle on ${settings?.siteName || "CarRental"}\n${window.location.href}`);
                        window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
                     }}
                     className="flex flex-col items-center gap-3 group"
                  >
                     <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-slate-600/20">
                        <Mail size={24} />
                     </div>
                     <span className="text-[10px] font-bold text-foreground">Email</span>
                  </a>
               </div>

               <div className="w-full text-left">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Or copy the link below</p>
                  <div className="flex bg-muted/50 rounded-lg p-1 border border-border">
                     <input type="text" readOnly value={typeof window !== 'undefined' ? window.location.href : ''} className="flex-1 bg-transparent px-4 text-xs font-bold text-foreground outline-none" />
                     <Button onClick={() => { navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : ''); alert("Link copied!"); }} className="h-10 px-4 sm:px-6 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-md shrink-0">
                        <LinkIcon size={14} className="mr-2 hidden sm:block" /> Copy
                     </Button>
                  </div>
               </div>
            </div>
         </Modal>

         <PostBookingReviewModal 
            isOpen={showReviewModal}
            onClose={() => {
               setShowReviewModal(false);
               router.push('/dashboard/bookings');
            }}
            carId={carId}
            bookingId={lastBookingId}
            userId={user?._id || ""}
         />
      </div>
   );
}
