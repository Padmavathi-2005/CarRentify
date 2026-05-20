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
   FileText
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
import { API_BASE_URL } from "@/config/api";
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
   const { user, setShowLoginModal } = useAuth();
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
   const isOwner = user && car && (user._id === (car.vendor?._id || car.vendor));

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

               // Geocode
               fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.location?.city || "London")}`)
                  .then(r => r.json())
                  .then(geo => {
                     if (geo && geo[0]) {
                        const opt = { name: loc, lat: parseFloat(geo[0].lat), lng: parseFloat(geo[0].lon) };
                        setLocationOptions([opt]);
                        setPickupCoords(opt);
                        setReturnCoords(opt);
                     }
                  });

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

   const calculateTotal = () => {
      if (!startDate || !endDate || !car) return 0;
      const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
      return days * (car.pricePerDay || 0);
   };

   const handleBooking = async () => {
      if (!user) return setShowLoginModal(true);
      setBookingError("");

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

   if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-black uppercase tracking-widest animate-pulse">Initializing Vehicle Intelligence...</div>;
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
            onBookNow={handleBooking} 
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
                     <DynamicMap pickup={pickupCoords} returnLoc={returnCoords} options={locationOptions} onPickupChange={setPickupCoords} onReturnChange={setReturnCoords} />
                  </div>
               </div>

               <BookingWidget
                  car={car} startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate}
                  pickupTime={pickupTime} setPickupTime={setPickupTime} returnTime={returnTime} setReturnTime={setReturnTime}
                  pickupLocation={pickupLocation} setPickupLocation={setPickupLocation} returnLocation={returnLocation} setReturnLocation={setReturnLocation}
                  locationOptions={locationOptions} bookedSlots={bookedSlots} formatPrice={formatPrice} calculateTotal={calculateTotal}
                  getPricingDetails={() => ({ pricePerDay: car.pricePerDay, totalDays: Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))), officialTotal: calculateTotal() })}
                  handleBooking={handleBooking} submitting={submitting} bookingError={bookingError} isAdmin={isAdmin} t={t}
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

         <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share vehicle">
            <div className="p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
               <button 
                  onClick={() => {
                     navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
                     alert("Link copied!");
                  }}
                  className="flex flex-col items-center gap-3 group"
               >
                  <div className="w-14 h-14 rounded-app bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                     <LinkIcon size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Copy Link</span>
               </button>

               <a 
                  href={`mailto:?subject=Check out this ${car?.brandName} ${car?.model} on CarRental&body=Check it out here: ${typeof window !== 'undefined' ? window.location.href : ''}`}
                  className="flex flex-col items-center gap-3 group"
               >
                  <div className="w-14 h-14 rounded-app bg-muted flex items-center justify-center group-hover:bg-[#EA4335] group-hover:text-white transition-all">
                     <Mail size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Email</span>
               </a>

               <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 group"
               >
                  <div className="w-14 h-14 rounded-app bg-muted flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-all">
                     <Globe size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
               </a>

               <a 
                  href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}&text=Check out this ${car?.brandName} ${car?.model} on CarRental`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 group"
               >
                  <div className="w-14 h-14 rounded-app bg-muted flex items-center justify-center group-hover:bg-[#1DA1F2] group-hover:text-white transition-all">
                     <MessageCircle size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Twitter</span>
               </a>
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
