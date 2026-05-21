"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, ArrowRightLeft, Navigation2, Zap, Target, ChevronDown, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";
import { useToast } from "@/components/Toast";

export type LocationOption = {
  name: string;
  lat: number;
  lng: number;
  type?: string;
  price?: number;
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8; // Radius of the earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;  
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in miles
}

function MapEventsHandler({ customDelivery, mainLocation, onAddCustomLocation, onPickupChange, showToast }: any) {
  useMapEvents({
    click: async (e) => {
      if (!customDelivery?.enabled || !mainLocation || !onAddCustomLocation) return;
      const { lat, lng } = e.latlng;
      const dist = calculateDistance(mainLocation.lat, mainLocation.lng, lat, lng);
      
      if (dist > customDelivery.maxDistance) {
        showToast(`Delivery Unavailable: This location is too far. The host can only deliver vehicles within a ${customDelivery.maxDistance} mile radius from their main location.`, 'error', 'center');
        return;
      }
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const address = data.display_name || "Custom Location";
        const loc = { name: "Custom: " + address.substring(0, 50) + "...", lat, lng, type: 'custom', price: customDelivery.price };
        onAddCustomLocation(loc);
        onPickupChange(loc);
      } catch (err) {
        showToast("Failed to retrieve address details.", 'error', 'center');
      }
    }
  });
  return null;
}

// Internal map controller
function SetViewOnClick({ animateTo }: { animateTo: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (animateTo) {
      map.setView(animateTo, map.getZoom(), { animate: true });
    }
  }, [animateTo, map]);
  return null;
}

const CIRCLE_OPTIONS = { color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 2, dashArray: '5, 10' };

export default function DynamicMap({ 
  pickup, 
  returnLoc, 
  options = [],
  customDelivery,
  onPickupChange, 
  onReturnChange,
  onAddCustomLocation
}: { 
  pickup: LocationOption | null, 
  returnLoc: LocationOption | null, 
  options: LocationOption[],
  customDelivery?: any,
  onPickupChange: (loc: LocationOption) => void,
  onReturnChange: (loc: LocationOption) => void,
  onAddCustomLocation?: (loc: LocationOption) => void,
}) {
  const [targetPos, setTargetPos] = useState<[number, number] | null>(null);
  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOverlayVisible(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Memoize icons to avoid re-creation and potential SSR/init issues
  const icons = useMemo(() => {
    if (typeof window === 'undefined') return { pickup: null, return: null };
    return {
      pickup: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }),
      return: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    };
  }, []);

  const isSame = useMemo(() => {
    if (!pickup || !returnLoc) return true;
    return pickup.lat === returnLoc.lat && pickup.lng === returnLoc.lng;
  }, [pickup, returnLoc]);

  // Synchronize target position when pickup location changes from props
  useEffect(() => {
    if (pickup) {
      setTargetPos([pickup.lat, pickup.lng]);
    }
  }, [pickup?.lat, pickup?.lng]);

  const focusOn = useCallback((loc: LocationOption | null) => {
    if (loc) setTargetPos([loc.lat, loc.lng]);
  }, []);

  const handleSwap = useCallback(() => {
    if (pickup && returnLoc) {
      onPickupChange(returnLoc);
      onReturnChange(pickup);
    }
  }, [pickup, returnLoc, onPickupChange, onReturnChange]);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return (
    <div className="h-[300px] md:h-[600px] bg-card flex items-center justify-center italic text-muted-foreground animate-pulse rounded-app border border-border">
      <div className="flex flex-col items-center gap-4">
        <Navigation2 size={32} className="animate-spin text-primary/20" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Initializing Client Engine...</span>
      </div>
    </div>
  );

  const isLoading = !pickup || options.length === 0;

  return (
    <div className="relative h-[300px] md:h-[600px] w-full rounded-app overflow-hidden border border-border dark:border-white/10 z-0 group">
      {isLoading ? (
        <div className="h-full bg-card flex items-center justify-center italic text-muted-foreground animate-pulse">
          <div className="flex flex-col items-center gap-4">
            <Navigation2 size={32} className="animate-spin text-primary/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Calibrating Logistics Topology...</span>
          </div>
        </div>
      ) : (
        <MapContainer 
          key="main-dynamic-map"
          center={[pickup.lat, pickup.lng]} 
          zoom={14} 
          scrollWheelZoom={true} 
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {customDelivery?.enabled && options.find(o => o.type === 'host') && (() => {
            const hostLoc = options.find(o => o.type === 'host')!;
            return (
              <Circle 
                key={`delivery-zone-${hostLoc.lat}-${hostLoc.lng}`}
                center={[hostLoc.lat, hostLoc.lng]} 
                radius={(customDelivery.maxDistance || 5) * 1609.34} 
                pathOptions={CIRCLE_OPTIONS} 
              />
            );
          })()}

          <MapEventsHandler 
             customDelivery={customDelivery} 
             mainLocation={options.find(o => o.type === 'host')} 
             onAddCustomLocation={onAddCustomLocation} 
             onPickupChange={onPickupChange} 
             showToast={showToast}
          />

          {options.map((opt, i) => {
            const isSelected = pickup?.name === opt.name || returnLoc?.name === opt.name;
            const icon = opt.type === 'predefined' ? icons.return : icons.pickup; // Use different colored icons
            
            // Only render marker if it is a predefined or host location, OR if it's currently selected
            if (opt.type !== 'host' && opt.type !== 'predefined' && !isSelected) return null;

            return (
              <Marker key={i} position={[opt.lat, opt.lng]} icon={icon as L.Icon} draggable={false}>
                <Popup minWidth={120}>
                  <div className="space-y-1">
                     <span className="font-black text-[10px] uppercase tracking-widest text-primary">{opt.type === 'host' ? 'Host Location' : opt.type === 'predefined' ? 'Delivery Point' : 'Custom Location'}</span>
                     <p className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{opt.name}</p>
                     {opt.price ? <p className="text-[10px] font-black text-emerald-600">+${opt.price} Delivery Fee</p> : null}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <SetViewOnClick animateTo={targetPos} />
        </MapContainer>
      )}

      {/* Master Control Overlay Toggle Button (Mobile Only) */}
      {!isLoading && isMobile && (
        <button
          onClick={() => setIsOverlayVisible(!isOverlayVisible)}
          className="absolute top-4 right-4 z-[1001] w-10 h-10 rounded-app bg-card/90 backdrop-blur-md border border-border shadow-xl flex items-center justify-center text-primary transition-all active:scale-95"
        >
          {isOverlayVisible ? <X size={20} /> : <Navigation2 size={20} fill="currentColor" />}
        </button>
      )}

      {/* Master Control Overlay */}
      {!isLoading && (
        <AnimatePresence>
          {(isOverlayVisible || !isMobile) && (
            <motion.div 
              initial={isMobile ? { opacity: 0, x: 20, scale: 0.95 } : { opacity: 1 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="absolute top-2 left-2 right-2 md:top-8 md:right-8 md:left-auto z-[1000] w-auto md:w-[350px] space-y-2 md:space-y-4"
            >
              <div className="bg-card/95 backdrop-blur-xl p-4 md:p-8 rounded-app border border-border dark:border-white/30 space-y-4 md:space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/50 pb-3 md:pb-4">
                  <div className="space-y-0.5 md:space-y-1">
                    <h4 className="text-[9px] md:text-[10px] font-black text-foreground uppercase tracking-widest">Routing Logistics</h4>
                    <p className="text-[7px] md:text-[8px] font-black text-muted-foreground uppercase tracking-widest">Exclusive Access Points Only</p>
                  </div>
                  <div className="hidden md:flex w-7 h-7 md:w-8 md:h-8 rounded-app bg-primary/10 items-center justify-center text-primary border border-primary/20">
                    <Navigation2 size={12} className="md:w-[14px] md:h-[14px]" fill="currentColor" />
                  </div>
                  {/* Close Button inside overlay for mobile */}
                  <button 
                    onClick={() => setIsOverlayVisible(false)}
                    className="md:hidden w-7 h-7 rounded-app bg-muted/40 flex items-center justify-center text-muted-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
              
                <div className="space-y-3 md:space-y-5">
                  {/* Pickup Select */}
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                      <span className="text-muted-foreground/40">Primary Hub</span>
                      <button 
                        onClick={() => focusOn(pickup)}
                        className="px-2 py-0.5 bg-primary/10 text-primary rounded-app italic hover:bg-primary hover:text-white transition-all flex items-center gap-1 md:gap-1.5 active:scale-95"
                      >
                        <Target size={10} />
                        <span>PICKUP</span>
                      </button>
                    </div>
                    <div className="relative">
                      <div 
                        onClick={() => setIsPickupOpen(!isPickupOpen)}
                        className={`relative flex items-center justify-between h-10 md:h-12 bg-muted/40 border rounded-app px-3 md:px-4 cursor-pointer transition-all duration-300 z-20 ${isPickupOpen ? 'bg-card border-primary ring-4 ring-primary/10 ' : 'border-border hover:border-primary/30 hover:bg-card'}`}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <MapPin size={14} className={isPickupOpen ? "text-primary" : "text-muted-foreground"} />
                          <span className="text-xs md:text-sm font-black text-foreground">{pickup.name}</span>
                        </div>
                        <ChevronDown size={12} className={`text-muted-foreground/40 transition-transform duration-500 ${isPickupOpen ? 'rotate-180 text-primary' : ''}`} />
                      </div>
                      
                      <AnimatePresence>
                        {isPickupOpen && (
                          <>
                            <div className="fixed inset-0 z-[1001]" onClick={() => setIsPickupOpen(false)} />
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-app p-1.5 md:p-2 z-[1002] overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar shadow-xl"
                            >
                              {options.map((opt) => (
                                <div 
                                  key={opt.name} 
                                  onClick={() => {
                                    onPickupChange(opt);
                                    setIsPickupOpen(false);
                                  }}
                                  className={`p-2.5 md:p-3 rounded-app cursor-pointer flex items-center justify-between group/opt transition-all ${pickup.name === opt.name ? 'bg-primary text-white ' : 'hover:bg-muted text-muted-foreground'}`}
                                >
                                  <div className="flex items-center gap-2 md:gap-3">
                                    <MapPin size={12} className={pickup.name === opt.name ? 'text-white' : 'text-muted-foreground/30 group-hover/opt:text-primary transition-colors'} />
                                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-tight">{opt.name}</span>
                                  </div>
                                  {pickup.name === opt.name && <CheckCircle2 size={10} className="text-white" />}
                                </div>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
              
                  {/* Connection Bridge - Now a functional Swap button */}
                  <div className="flex justify-center -my-2.5 md:-my-3 relative z-20">
                    <button 
                      onClick={handleSwap}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-foreground border-border dark:border-white/20 flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all active:scale-90 group/swap"
                      title="Swap Pickup & Return"
                    >
                      <ArrowRightLeft size={12} className="group-hover/swap:rotate-180 transition-transform duration-500" />
                    </button>
                  </div>
              
                  {/* Return Select */}
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                      <span className="text-muted-foreground/40">Return Hub</span>
                      <button 
                        onClick={() => focusOn(returnLoc)}
                        className="px-2 py-0.5 bg-destructive/10 text-destructive rounded-app italic hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1 md:gap-1.5 active:scale-95"
                      >
                        <Target size={10} />
                        <span>DROP-OFF</span>
                      </button>
                    </div>
                    <div className="relative">
                      <div 
                        onClick={() => setIsReturnOpen(!isReturnOpen)}
                        className={`relative flex items-center justify-between h-10 md:h-12 bg-muted/40 border rounded-app px-3 md:px-4 cursor-pointer transition-all duration-300 z-20 ${isReturnOpen ? 'bg-card border-destructive/40 ring-4 ring-destructive/10 ' : 'border-border hover:border-destructive/40 hover:bg-card'}`}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <MapPin size={14} className={isReturnOpen ? "text-destructive" : "text-muted-foreground"} />
                          <span className="text-xs md:text-sm font-black text-foreground">{returnLoc?.name || pickup.name}</span>
                        </div>
                        <ChevronDown size={12} className={`text-muted-foreground/40 transition-transform duration-500 ${isReturnOpen ? 'rotate-180 text-destructive' : ''}`} />
                      </div>
                      
                      <AnimatePresence>
                        {isReturnOpen && (
                          <>
                            <div className="fixed inset-0 z-[1001]" onClick={() => setIsReturnOpen(false)} />
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-app p-1.5 md:p-2 z-[1002] overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar shadow-xl"
                            >
                              {options.map((opt) => (
                                <div 
                                  key={opt.name} 
                                  onClick={() => {
                                    onReturnChange(opt);
                                    setIsReturnOpen(false);
                                  }}
                                  className={`p-2.5 md:p-3 rounded-app cursor-pointer flex items-center justify-between group/opt transition-all ${returnLoc?.name === opt.name ? 'bg-destructive text-white ' : 'hover:bg-muted text-muted-foreground'}`}
                                >
                                  <div className="flex items-center gap-2 md:gap-3">
                                    <MapPin size={12} className={returnLoc?.name === opt.name ? 'text-white' : 'text-muted-foreground/30 group-hover/opt:text-destructive transition-colors'} />
                                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-tight">{opt.name}</span>
                                  </div>
                                  {returnLoc?.name === opt.name && <CheckCircle2 size={10} className="text-white" />}
                                </div>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
