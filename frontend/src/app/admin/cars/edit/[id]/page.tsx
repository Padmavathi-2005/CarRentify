'use client';

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
 Save, 
 Image as ImageIcon, 
 MapPin, 
 Info, 
 ArrowLeft, 
 ArrowRight, 
 Settings, 
 Navigation, 
 ShieldCheck, 
 Zap, 
 LayoutDashboard, 
 Plus, 
 Trash2, 
 X, 
 ChevronDown, 
 Gauge, 
 Fuel, 
 Activity, 
 FileText, 
 XCircle, 
 AlertCircle, 
 Calculator, 
 TrendingDown, 
 CloudUpload, 
 UploadCloud,
 Globe, 
 Milestone, 
 RefreshCw, 
 Check, 
 Eye, 
 CheckCircle2, 
 Rocket, 
 Search, 
 ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/Toast";
import { useSettings } from "@/components/ThemeProvider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import HtmlEditor from "@/components/HtmlEditor";
import { Badge } from "@/components/ui/badge";
import Switch from "@/components/ui/switch";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/dashboard-forms.css";
import CustomSelect from "@/components/CustomSelect";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import Modal from "@/components/ui/modal";
import { useAuth } from "@/components/AuthContext";
import { authService } from "@/services/authService";
import { useLocale } from "@/components/LocaleContext";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
 ssr: false,
 loading: () => <div className="w-full h-[300px] bg-slate-50 animate-pulse rounded-app mt-4 border border-slate-100 flex items-center justify-center text-slate-300 font-bold text-[8px] uppercase tracking-widest">Loading Telemetry...</div>,
});

interface PriceTier {
 days: number;
 pricePerDay: number;
 discountPercentage: number;
}

export default function EditCarPage() {
 const { t } = useLocale();
 const { showToast } = useToast();
 const { settings } = useSettings();
 const router = useRouter();
 const params = useParams();
 const id = params?.id;
 const { user } = useAuth();
 const [loading, setLoading] = useState(false);
 const [fetchLoading, setFetchLoading] = useState(true);

 // Data State
 const [name, setName] = useState("");
 const [permalink, setPermalink] = useState("");
 const [isPermalinkEdited, setIsPermalinkEdited] = useState(true);
 const [content, setContent] = useState("");
 const [shortDescription, setShortDescription] = useState("");
 const [pricePerDay, setPricePerDay] = useState("");
 const [securityDeposit, setSecurityDeposit] = useState("0");
 const [currencyId, setCurrencyId] = useState("");
 const [distanceIncluded, setDistanceIncluded] = useState("200");
 const [extraDistanceFee, setExtraDistanceFee] = useState("0.50");
 const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
 const [extras, setExtras] = useState<{ name: string; description?: string; price: number; priceType: 'per_day' | 'per_trip'; category?: string }[]>([]);
 const [minBookingDays, setMinBookingDays] = useState("1");
 
 const [brandId, setBrandId] = useState("");
 const [model, setModel] = useState("");
 const [vehicleType, setVehicleType] = useState("");
 const [transmission, setTransmission] = useState("");
 const [fuelType, setFuelType] = useState("");
 const [year, setYear] = useState(new Date().getFullYear().toString());
 const [mileage, setMileage] = useState("");
 const [fuelEfficiency, setFuelEfficiency] = useState("");
 const [horsepower, setHorsepower] = useState("");
 const [driveType, setDriveType] = useState("");
 const [vin, setVin] = useState("");
 const [seats, setSeats] = useState("");
 const [doors, setDoors] = useState("");
 const [isUsed, setIsUsed] = useState(false);
 const [condition, setCondition] = useState("Brand New");
 const [color, setColor] = useState("");
 const [acceleration, setAcceleration] = useState("");
 const [chargingType, setChargingType] = useState("");
 const [batteryCapacity, setBatteryCapacity] = useState("");
 const [range, setRange] = useState("");
 const [customSpecs, setCustomSpecs] = useState<Record<string, any>>({});
 const [customFiles, setCustomFiles] = useState<Record<string, any>>({});
 
 const [brands, setBrands] = useState<any[]>([]);
 const [carTypes, setCarTypes] = useState<any[]>([]);
 const [currencies, setCurrencies] = useState<any[]>([]);
 const [allAmenities, setAllAmenities] = useState<any[]>([]);
 const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
 const [existingImages, setExistingImages] = useState<string[]>([]);
 const [mainImage, setMainImage] = useState<File | null>(null);
 const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
 const [existingMainImage, setExistingMainImage] = useState<string | null>(null);
 const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
 const [imagePreviews, setImagePreviews] = useState<string[]>([]);
 const [fileMetas, setFileMetas] = useState<{isWide: boolean}[]>([]);
 const [docFiles, setDocFiles] = useState<{ [key: string]: File | null }>({ rc: null, insurance: null, other: null });
 const [docPreviews, setDocPreviews] = useState<{ [key: string]: string | null }>({ rc: null, insurance: null, other: null });
 const [existingDocs, setExistingDocs] = useState<any[]>([]);
 const fileInputRef = React.useRef<HTMLInputElement>(null);

  // SEO State
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoImage, setSeoImage] = useState<File | null>(null);
  const [seoImagePreview, setSeoImagePreview] = useState<string | null>(null);
  const [existingSeoImage, setExistingSeoImage] = useState<string | null>(null);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 50 }, (_, i) => ({ 
      value: (currentYear - i).toString(), 
      label: (currentYear - i).toString() 
    }));
  }, []);

  // UX State
  const [currentStep, setCurrentStep] = useState(1);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [amenitySearch, setAmenitySearch] = useState("");
  const [showMoreAmenities, setShowMoreAmenities] = useState(false);
  const pickupListRef = useRef<HTMLDivElement>(null);
  
  const baseSteps = useMemo(() => [
    { id: 1, title: 'Information', icon: LayoutDashboard },
    { id: 2, title: 'Photos', icon: ImageIcon },
    { id: 3, title: 'Specs', icon: Settings },
    { id: 4, title: 'Address', icon: Navigation },
    { id: 5, title: 'Pricing', icon: Zap },
    { id: 6, title: 'SEO', icon: Globe },
  ], []);

  const customSteps = useMemo(() => {
    return (settings as any)?.listings?.customSteps || (settings as any)?.customSteps || [];
  }, [settings]);

  const steps = useMemo(() => {
    const combined = [...baseSteps];
    customSteps.forEach((cs: any) => {
      if (!combined.some(b => b.id === cs.id)) {
        combined.push({ id: cs.id, title: cs.title || `Step ${cs.id}`, icon: Settings });
      }
    });
    return combined.sort((a,b) => a.id - b.id);
  }, [baseSteps, customSteps]);

 // Location State
 const [latitude, setLatitude] = useState(12.9249);
 const [longitude, setLongitude] = useState(78.1306);
 const [address, setAddress] = useState("");
 const [country, setCountry] = useState("India");
 const [state, setState] = useState("Tamil Nadu");
 const [city, setCity] = useState("Madurai");
 const [pickupLocations, setPickupLocations] = useState<any[]>([]);

 useEffect(() => {
  const fetchData = async () => {
   if (!id) return;
   setFetchLoading(true);
   try {
    const [brandsRes, amRes, ctRes, curRes, carRes] = await Promise.all([
     fetch(`${API_BASE_URL}/brands`),
     fetch(`${API_BASE_URL}/amenities`),
     fetch(`${API_BASE_URL}/car-types`),
     fetch(`${API_BASE_URL}/currencies`),
     fetch(`${API_BASE_URL}/cars/${id}`)
    ]);

    if (brandsRes.ok) setBrands((await brandsRes.json()).map((b: any) => ({ value: String(b._id), label: String(b.name) })));
    if (amRes.ok) setAllAmenities((await amRes.json()).map((a: any) => ({ ...a, _id: String(a._id), name: String(a.name) })));
    if (ctRes.ok) setCarTypes((await ctRes.json()).map((ct: any) => ({ value: String(ct._id || ct.id), label: String(ct.name) })));
    if (curRes.ok) setCurrencies((await curRes.json()).map((c: any) => ({ value: String(c._id || c.id), label: `${c.name} (${c.symbol})`, symbol: c.symbol })));

    if (carRes.ok) {
     const car = await carRes.json();
     setName(car.name || "");
     setPermalink(car.permalink || "");
     setContent(car.content || "");
     setShortDescription(car.shortDescription || "");
     setPricePerDay(String(car.pricePerDay || ""));
     setSecurityDeposit(String(car.securityDeposit || "0"));
     setCurrencyId(car.currency?._id || car.currency || "");
     setDistanceIncluded(String(car.distanceIncluded || "200"));
     setExtraDistanceFee(String(car.extraDistanceFee || "0.50"));
     setPriceTiers(car.priceTiers || []);
     setExtras(car.extras || []);
     setMinBookingDays(String(car.minBookingDays || "1"));
     setBrandId(car.brandId?._id || car.brandId || "");
     setModel(car.model || "");
     setVehicleType(car.vehicleType?._id || car.vehicleType || "");
     setTransmission(car.transmission || "");
     setFuelType(car.fuelType || "");
     setYear(String(car.year || ""));
     setMileage(String(car.mileage || ""));
     setFuelEfficiency(car.fuelEfficiency || "");
     setHorsepower(String(car.horsepower || ""));
     setDriveType(car.driveType || "");
     setVin(car.vin || "");
     setSeats(String(car.seats || ""));
     setDoors(String(car.doors || ""));
     setIsUsed(car.isUsed || false);
     setCondition(car.condition || "Brand New");
     setColor(car.color || "");
     setAcceleration(String(car.acceleration || ""));
     setChargingType(car.chargingType || "");
     setBatteryCapacity(String(car.batteryCapacity || ""));
     setRange(String(car.range || ""));
     setCustomSpecs(car.customSpecs || {});
     if (car.images && car.images.length > 0) {
      setExistingMainImage(car.images[0]);
      setExistingImages(car.images.slice(1));
     } else {
      setExistingMainImage(null);
      setExistingImages([]);
     }
     setSelectedAmenities(car.amenities || []);
     setPickupLocations(car.pickupLocations || []);
     if (car.location) {
      setLatitude(car.location.latitude || 12.9249);
      setLongitude(car.location.longitude || 78.1306);
      setAddress(car.location.address || "");
      setCity(car.location.city || "");
      setState(car.location.state || "");
      setCountry(car.location.country || "");
     }
      setSeoTitle(car.seoTitle || "");
      setSeoDescription(car.seoDescription || "");
      setSeoKeywords(car.seoKeywords || "");
      setExistingSeoImage(car.seoImage || null);
      setExistingDocs(car.documents || []);
    }
   } catch (err) { console.error("Fetch Error:", err); }
   finally { setFetchLoading(false); }
  };
  fetchData();
 }, [id]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= 70) {
      setName(val);
      setFormErrors(prev => ({ ...prev, name: "" }));
    }
  };

 const getCurrencySymbol = () => {
  const curr = currencies.find(c => c.value === currencyId);
  return curr ? curr.symbol : "$";
 };

 const addPriceTier = () => setPriceTiers([...priceTiers, { days: priceTiers.length + 2, pricePerDay: 0, discountPercentage: 10 }]);
 const removePriceTier = (index: number) => setPriceTiers(priceTiers.filter((_, i) => i !== index));
 const updatePriceTier = (index: number, field: string, value: any) => {
  const updated = [...priceTiers];
  const daily = parseFloat(pricePerDay) || 0;
  let tier = { ...updated[index], [field]: value };
  if (field === 'discountPercentage' || field === 'days') tier.pricePerDay = Math.floor(daily * (1 - (parseFloat(tier.discountPercentage as any) || 0) / 100));
  updated[index] = tier;
  setPriceTiers(updated);
 };

 const getTierMetrics = (index: number) => {
  const daily = parseFloat(pricePerDay) || 0;
  const tier = priceTiers[index];
  const currentDiscountedPrice = Math.floor(daily * (1 - (tier.discountPercentage || 0) / 100));
  const isValid = tier.days >= 1 && (tier.discountPercentage || 0) >= 0 && (tier.discountPercentage || 0) < 100;
  return { isValid, currentDiscountedPrice };
 };

 const addExtra = () => setExtras([...extras, { name: "", price: 0, priceType: 'per_trip', category: 'Convenience' }]);
 const removeExtra = (index: number) => setExtras(extras.filter((_, i) => i !== index));
 const updateExtra = (index: number, field: string, value: any) => {
  const updated = [...extras];
  updated[index] = { ...updated[index], [field]: value };
  setExtras(updated);
 };

  const addPickupLocation = (data: any, prc?: number) => {
    setPickupLocations([...pickupLocations, { 
      name: "", 
      address: data.address || "", 
      latitude: data.lat || latitude, 
      longitude: data.lng || longitude, 
      city: data.city || "",
      country: data.country || "",
      postcode: data.postcode || "",
      price: prc || 0 
    }]);

    setTimeout(() => {
      pickupListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };
 const removePickupLocation = (index: number) => setPickupLocations(pickupLocations.filter((_, i) => i !== index));
 const updatePickupLocation = (index: number, field: string, value: any) => {
  const updated = [...pickupLocations];
  updated[index] = { ...updated[index], [field]: value };
  setPickupLocations(updated);
 };

  const validateAndResizeImage = (file: File, maxWidth = 1200, maxHeight = 1200, minW = 800, minH = 600): Promise<{ base64: string, file: File }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width < minW || img.height < minH) {
            reject(`Premium Quality Alert: Vehicle photos require at least ${minW}x${minH}px for high-fidelity listings. Detected: ${img.width}x${img.height}px.`);
            return;
          }

          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          resolve({ 
            base64: canvas.toDataURL('image/jpeg', 0.85),
            file: file 
          });
        };
        img.onerror = () => reject('Invalid media payload');
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMainImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { base64 } = await validateAndResizeImage(file);
        setMainImage(file);
        setMainImagePreview(base64);
        setExistingMainImage(null);
      } catch (err: any) {
        showToast(err, "error");
      }
    }
  };

  const handleSeoImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { base64 } = await validateAndResizeImage(file, 1200, 630);
        setSeoImage(file);
        setSeoImagePreview(base64);
      } catch (err: any) {
        showToast(err, "error");
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const existingCount = (existingImages?.length || 0) + (existingMainImage ? 1 : 0);
    const newCount = selectedFiles.length + (mainImage ? 1 : 0);
    const totalCurrent = existingCount + newCount;
    const maxLimit = settings.maxImagesPerListing || 5;
    
    if (totalCurrent + files.length > maxLimit) {
      showToast(`Media Capacity Reached: Maximum of ${maxLimit} images per vehicle allowed.`, "error");
      return;
    }

    for (const file of files) {
      try {
        const { base64 } = await validateAndResizeImage(file);
        const img = new window.Image();
        img.onload = () => {
          setFileMetas(prev => [...prev, { isWide: img.width > (img.height * 1.4) }]);
          setImagePreviews(prev => [...prev, base64]);
          setSelectedFiles(prev => [...prev, file]);
        };
        img.src = base64;
      } catch (err: any) {
        showToast(`Image "${file.name}" rejected: ${err}`, "error");
      }
    }
  };

 const removeImage = (index: number) => {
  URL.revokeObjectURL(imagePreviews[index]);
  setImagePreviews(prev => prev.filter((_, i) => i !== index));
  setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  setFileMetas(prev => prev.filter((_, i) => i !== index));
 };

 const handleDocSelect = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
   setDocFiles(prev => ({ ...prev, [key]: file }));
   setDocPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
  }
 };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!name.trim()) errors.name = "Title is required.";
      if (!brandId) errors.brand = "Manufacturer (Brand) is required.";
      if (!model.trim()) errors.model = "Model designation is required.";
      if (!year) errors.year = "Production Year is required.";
      if (!vehicleType) errors.type = "Category is required.";
    }
    if (step === 2) {
      const hasRC = docFiles.rc || existingDocs.some(d => d.type === 'RC');
      const hasInsurance = docFiles.insurance || existingDocs.some(d => d.type === 'INSURANCE');
      
      if (!mainImage && !existingMainImage && selectedFiles.length === 0 && existingImages.length === 0) {
        errors.images = "Visual Evidence Missing: Please upload at least one image.";
      }
      if (!hasRC) errors.rc = "Mandatory: Registration Certificate (RC) is required.";
      if (!hasInsurance) errors.insurance = "Mandatory: Insurance Policy document is required.";
    }
    if (step === 4) {
      if (!address) errors.address = "Vehicle address is required.";
      if (!city) errors.city = "Vehicle city is required.";
    }
    
    setFormErrors(errors);
    const firstErrorId = Object.keys(errors)[0];
    if (firstErrorId) {
      const idMap: Record<string, string> = {
        name: "name-input", brand: "brand-select", model: "model-input", year: "year-select", type: "type-select", address: "location-module", city: "location-module"
      };
      document.getElementById(idMap[firstErrorId])?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowAllSteps(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancel = () => setShowDiscardModal(true);

  const handleSubmit = async () => {
    // Final Global Validation
    if (!validateStep(1)) { setCurrentStep(1); setShowAllSteps(false); return; }
    if (!validateStep(4)) { setCurrentStep(4); setShowAllSteps(false); return; }
    
    if (!pricePerDay || parseFloat(pricePerDay) <= 0) { 
      setFormErrors(prev => ({ ...prev, price: "Daily rate must be more than 0." }));
      document.getElementById("price-input")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setCurrentStep(5); setShowAllSteps(false);
      return; 
    }
    setLoading(true);
  try {
   const finalImages = [];
   
   // 1. Handle Main Image
   if (mainImage) {
     const { base64 } = await validateAndResizeImage(mainImage);
     const res = await fetch(`${API_BASE_URL}/media/upload`, {
       method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: mainImage.name, base64 })
     });
     if (res.ok) finalImages.push((await res.json()).url);
   } else if (existingMainImage) {
     finalImages.push(existingMainImage);
   }

   // 2. Handle Gallery (Existing)
   finalImages.push(...existingImages);

   // 3. Handle Gallery (New)
    for (const file of selectedFiles) {
      try {
        const { base64 } = await validateAndResizeImage(file);
        const res = await fetch(`${API_BASE_URL}/media/upload`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, base64 })
        });
        if (res.ok) {
          finalImages.push((await res.json()).url);
        } else {
          throw new Error(`Upload Failed for ${file.name}`);
        }
      } catch (err) {
        console.error("Image Upload Error:", err);
        showToast(`Network Error: Failed to upload ${file.name}.`, "error");
      }
    }

   const docs = [];
    let finalSeoImage = existingSeoImage;
    if (seoImage) {
     const { base64 } = await validateAndResizeImage(seoImage, 1200, 630);
     const res = await fetch(`${API_BASE_URL}/media/upload`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: seoImage.name, base64 })
     });
     if (res.ok) finalSeoImage = (await res.json()).url;
    }
   for (const [key, file] of Object.entries(docFiles)) {
    if (file) {
     const base64 = await new Promise((r) => { const rd = new FileReader(); rd.readAsDataURL(file); rd.onload = () => r(rd.result); });
     const res = await fetch(`${API_BASE_URL}/media/upload`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, base64 })
     });
     if (res.ok) docs.push({ name: file.name, url: (await res.json()).url, type: key.toUpperCase(), expiryDate: new Date() });
    }
   }

   // Upload Custom Spec Files/Images
   const finalCustomSpecs = { ...customSpecs };
   for (const [key, fileOrFiles] of Object.entries(customFiles)) {
     if (Array.isArray(fileOrFiles)) {
       const urls = [];
       for (const f of fileOrFiles) {
         try {
           const base64 = await new Promise((resolve) => {
             const reader = new FileReader();
             reader.readAsDataURL(f);
             reader.onload = () => resolve(reader.result);
           });
           const res = await fetch(`${API_BASE_URL}/media/upload`, {
             method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: f.name, base64 })
           });
           if (res.ok) urls.push((await res.json()).url);
         } catch (err) { console.error(err); }
       }
       if (urls.length > 0) {
         finalCustomSpecs[key] = Array.isArray(finalCustomSpecs[key]) ? [...finalCustomSpecs[key], ...urls] : urls;
       }
     } else if (fileOrFiles) {
       try {
         const base64 = await new Promise((resolve) => {
           const reader = new FileReader();
           reader.readAsDataURL(fileOrFiles);
           reader.onload = () => resolve(reader.result);
         });
         const res = await fetch(`${API_BASE_URL}/media/upload`, {
           method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: fileOrFiles.name, base64 })
         });
         if (res.ok) {
           const url = (await res.json()).url;
           finalCustomSpecs[key] = { name: fileOrFiles.name, url };
         }
       } catch (err) { console.error(err); }
     }
   }

   const res = await fetch(`${API_BASE_URL}/cars/${id}`, {
    method: "PATCH", 
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${authService.getAdminToken()}` 
    },
    body: JSON.stringify({
     name, permalink, content, shortDescription, vehicleType, transmission, fuelType, year, brandId, model, 
     pricePerDay: parseFloat(pricePerDay), 
     images: finalImages,
     minBookingDays: parseInt(minBookingDays) || 1,
     securityDeposit: parseFloat(securityDeposit) || 0,
     currency: currencyId,
     distanceIncluded: parseFloat(distanceIncluded),
     extraDistanceFee: parseFloat(extraDistanceFee),
     priceTiers,
     extras,
     horsepower: parseFloat(horsepower) || 0,
     mileage: parseFloat(mileage) || 0,
     vin,
     seats: parseInt(seats) || 0,
     doors: parseInt(doors) || 0,
     driveType,
     fuelEfficiency,
     isUsed,
     condition,
     color,
     acceleration: parseFloat(acceleration) || undefined,
     chargingType,
     batteryCapacity: parseFloat(batteryCapacity) || undefined,
     range: parseFloat(range) || undefined,
     location: { country, state, city, address, latitude, longitude }, 
     pickupLocations,
     amenities: selectedAmenities, 
     seoTitle, 
     seoDescription, 
     seoKeywords, 
     seoImage: finalSeoImage,
     documents: docs,
     customSpecs: finalCustomSpecs
    }),
   });

    if (res.ok) {
      showToast("Car updated successfully by Administrator.", "success");
      router.push("/admin/cars");
    } else {
      const data = await res.json();
      showToast(data.message || "Failed to update vehicle data.", "error");
    }
   } catch (err: any) { 
     console.error(err);
     showToast(err.message || "Network Error: Listing update failed.", "error");
   } finally { setLoading(false); }
 };

  const visibleAmenities = useMemo(() => {
   const filtered = allAmenities.filter(a => a.name.toLowerCase().includes(amenitySearch.toLowerCase()));
   if (amenitySearch) return filtered;
   return showMoreAmenities ? filtered : filtered.slice(0, 6);
  }, [allAmenities, amenitySearch, showMoreAmenities]);

  if (fetchLoading) return <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-950"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
   <div className="bg-white dark:bg-slate-950 font-sans h-auto min-h-0 flex flex-col transition-all duration-700 text-slate-900 dark:text-white rounded-app border border-slate-100 dark:border-white/10">
     <header className="sticky top-0 z-[100] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-white/10 px-4 lg:px-10 py-4 lg:py-5 flex items-center justify-between rounded-t-app">
      <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
       <Link href="/admin/cars">
        <div className="w-8 h-8 rounded-app bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer active:scale-95"><ArrowLeft size={14} /></div>
       </Link>
       <div className="hidden md:block">
        <h1 className="text-xs lg:text-base font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Admin Vehicle Editor</h1>
       </div>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 sm:gap-1 md:gap-2 bg-slate-100/50 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10 scale-75 xs:scale-90 sm:scale-100">
       {steps.map((s, idx) => (
        <React.Fragment key={s.id}>
         <button onClick={() => { setCurrentStep(s.id); setShowAllSteps(false); }} className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all font-black text-[8px] md:text-[10px] ${currentStep === s.id && !showAllSteps ? 'bg-primary text-white scale-110' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-white/10 hover:text-primary '}`}>{s.id}</button>
         {idx < steps.length - 1 && <div className="w-1.5 sm:w-2 md:w-4 h-px bg-slate-300 dark:bg-slate-700" />}
        </React.Fragment>
       ))}
      </div>
      <div className="flex items-center gap-2 lg:gap-3">
        <Button variant="ghost" onClick={handleCancel} className="h-9 px-2 sm:px-3 lg:px-4 rounded-app font-black text-slate-400 dark:text-slate-500 uppercase text-[8px] tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-2 border border-transparent active:scale-95"><XCircle size={16} /> <span className="hidden md:inline">Discard</span></Button>
       <Button onClick={handleSubmit} disabled={loading} className="h-9 sm:h-10 px-3 sm:px-4 lg:px-6 bg-primary hover:bg-secondary text-white hover:text-white rounded-app font-black uppercase text-[9px] tracking-widest flex items-center gap-2 sm:gap-3 border-none transition-all active:scale-95">{loading ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={16} />}<span className="hidden sm:inline">Save Assets</span></Button>
      </div>
     </header>

    <main className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10 w-full flex-grow">
    <Modal isOpen={showDiscardModal} onClose={() => setShowDiscardModal(false)} title="Discard Changes?" description="Unsaved modifications will be lost" icon={<Trash2 size={24} className="text-rose-500" />} className="border-slate-100 dark:border-white/10">
     <div className="space-y-8">
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed capitalize">Are you sure you want to discard your changes? All unsaved modifications to this car listing will be lost.</p>
      <div className="flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-white/10">
       <Button onClick={() => setShowDiscardModal(false)} variant="ghost" className="flex-1 h-14 rounded-app font-black uppercase text-[10px] tracking-widest text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5">Keep Editing</Button>
       <Button onClick={() => router.push("/admin/cars")} className="flex-1 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-app font-black uppercase text-[10px] tracking-widest ">Yes, Discard</Button>
      </div>
     </div>
    </Modal>

    <div className="space-y-10">
      {(currentStep === 1 || showAllSteps) && (
       <section id="identity-hub" className="bg-white dark:bg-slate-900 rounded-app p-10 border border-slate-100 dark:border-white/10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ">
        <div className="flex items-center gap-5 text-slate-400"><div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-app flex items-center justify-center"><LayoutDashboard size={24} /></div><h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Information</h3></div>
        <div className="space-y-8">
         <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
           <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Vehicle Title</label>
           <span className={cn("text-[9px] font-black tracking-widest uppercase", name.length >= 60 ? "text-amber-500" : "text-slate-300 dark:text-slate-700")}>{name.length}/70</span>
          </div>
          <Input id="name-input" maxLength={70} placeholder="e.g. 2024 Lamborghini Revuelto" value={name} onChange={handleNameChange} className={cn("h-14 border-2 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-slate-900 dark:text-white focus:border-primary transition-all text-sm", formErrors.name ? "border-rose-500" : "border-slate-100 dark:border-white/10")} />
          {formErrors.name && <p className="text-[10px] font-bold text-rose-500 mt-2 px-1 uppercase tracking-wider">{formErrors.name}</p>}
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Permalink Slug</label><div className="flex items-center h-14 bg-white dark:bg-slate-950 rounded-app overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all border-2 border-slate-100 dark:border-white/10"><span className="px-5 text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase border-r border-slate-100 dark:border-white/10 bg-slate-50/30 dark:bg-white/5">/vehicles/</span><input value={permalink} onChange={(e) => setPermalink(e.target.value)} className="flex-1 px-5 bg-transparent outline-none font-bold text-slate-600 dark:text-slate-300 text-sm border-none focus:ring-0" /></div></div>
          <div className="lg:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Vehicle Category</label><CustomSelect id="type-select" options={carTypes} defaultValue={vehicleType} onChange={(v) => { setVehicleType(String(v)); setFormErrors(prev => ({ ...prev, type: "" })); }} placeholder="Select Category" error={!!formErrors.type} /></div>
         </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Brand</label><CustomSelect id="brand-select" options={brands} defaultValue={brandId} onChange={(val) => { setBrandId(String(val)); setFormErrors(prev => ({ ...prev, brand: "" })); }} error={!!formErrors.brand} /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Model</label><Input id="model-input" placeholder="e.g. Aventador" value={model} onChange={(e) => setModel(e.target.value)} className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-sm text-slate-900 dark:text-white" /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Year</label><CustomSelect id="year-select" options={years} defaultValue={year} onChange={(v) => { setYear(String(v)); setFormErrors(prev => ({ ...prev, year: "" })); }} placeholder="Select Year" error={!!formErrors.year} /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Condition</label><CustomSelect options={["Brand New", "Pre-Owned", "Classic"]} defaultValue={condition} onChange={(v) => setCondition(String(v))} /></div>
        </div>
        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Short Description</label><Textarea placeholder="Brief summary for catalog previews..." value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={1} className="min-h-0 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-primary transition-all text-sm" /></div>
        <HtmlEditor label="Detailed Description" value={content} onChange={setContent} placeholder="Describe your vehicle in detail..." minHeight="120px" />
       </section>
      )}

      {(currentStep === 2 || showAllSteps) && (
       <section id="visual-repository" className="bg-white dark:bg-slate-900 rounded-app p-10 border border-slate-100 dark:border-white/10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ">
         <div className="flex items-center gap-5 text-slate-400"><div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-app flex items-center justify-center"><ImageIcon size={24} /></div><h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Photos</h3></div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Primary Thumbnail */}
           <div className="md:col-span-1 space-y-4">
             <div className="text-left"><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Listing Cover</p><p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Main display image</p></div>
              <div className="relative aspect-video rounded-app border-2 border-dashed border-slate-100 dark:border-white/10 bg-slate-50/30 dark:bg-white/5 hover:border-primary/30 transition-all overflow-hidden flex flex-col items-center justify-center group shadow-inner">
                {(mainImagePreview || existingMainImage) ? (
                  <>
                    <img src={mainImagePreview || getImageUrl(existingMainImage || "")} alt="Main" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                      <Button variant="ghost" className="text-white border-white hover:bg-white/20 h-9 px-6 text-[9px] font-black uppercase tracking-widest">Change Cover Image</Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white dark:bg-slate-950 rounded-app flex items-center justify-center text-slate-200 shadow-sm border border-slate-50 dark:border-white/5"><ImageIcon size={28} /></div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Hero Image</p>
                      <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">Recommended: 1200x800px</p>
                    </div>
                  </div>
                )}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleMainImageSelect} accept="image/*" />
              </div>
           </div>

           {/* Gallery Photos */}
           <div className="md:col-span-2 space-y-4">
             <div className="text-left"><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Gallery Repository</p><p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Manage secondary catalog photos</p></div>
             <div className="relative h-24 rounded-app border-2 border-dashed border-slate-100 dark:border-white/10 bg-slate-50/30 dark:bg-white/5 hover:border-primary/30 transition-all flex flex-col items-center justify-center group cursor-pointer">
               <CloudUpload className="text-slate-200 dark:text-slate-700 group-hover:text-primary transition-colors" size={24} />
               <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase mt-2">Add gallery files</p>
               <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileSelect} accept="image/*" />
             </div>
             
             <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {existingImages.map((url, i) => (
                  <div key={`exist-${i}`} className="group relative aspect-video rounded-app overflow-hidden border border-slate-100 dark:border-white/10 transition-all shadow-sm">
                    <img src={getImageUrl(url)} alt="Registry" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <button onClick={(e) => { e.stopPropagation(); setExistingImages(existingImages.filter((_, idx) => idx !== i)); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 shadow-lg">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {imagePreviews.map((url, i) => (
                  <div key={`new-${i}`} className="group relative aspect-video rounded-app overflow-hidden border border-primary/20 transition-all shadow-sm">
                    <img src={url} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 bg-primary text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg">New Image</div>
                    <button onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 shadow-lg">
                      <X size={12} />
                    </button>
                  </div>
                ))}
             </div>
           </div>
         </div>

        <div className="pt-10 border-t border-slate-100 dark:border-white/10 space-y-8">
         <div className="flex items-center gap-4 text-slate-400"><FileText size={20} /><h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Compliance Documents</h4></div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['rc', 'insurance', 'other'].map((docKey) => (
           <div key={docKey} className="relative group overflow-hidden bg-slate-50 dark:bg-white/5 rounded-app p-6 border border-slate-100 dark:border-white/10 hover:border-primary/30 transition-all">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleDocSelect(docKey, e)} />
            <div className="flex flex-col items-center text-center gap-4">
             <div className="w-24 h-24 bg-white dark:bg-slate-950 rounded-app flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors overflow-hidden border border-slate-100 dark:border-white/10 group-hover:border-primary/20 shadow-sm">
              {docPreviews[docKey] ? (
                <img src={docPreviews[docKey]!} alt={docKey} className="w-full h-full object-cover" />
              ) : (
                <CloudUpload size={24} />
              )}
             </div>
             <div><p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{docKey.toUpperCase()}</p><p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">{docPreviews[docKey] ? 'File Attached' : 'Select Document'}</p></div>
            </div>
           </div>
          ))}
         </div>
         {(formErrors.rc || formErrors.insurance) && (
           <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 rounded-app flex items-center gap-3 animate-in fade-in duration-300">
             <Info size={16} className="text-rose-500 shrink-0" />
             <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">{formErrors.rc || formErrors.insurance}</p>
           </div>
         )}
        </div>
       </section>
      )}

      {(currentStep === 3 || showAllSteps) && (
       <section id="specifications-module" className="bg-white dark:bg-slate-900 rounded-app p-10 border border-slate-100 dark:border-white/10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ">
        <div className="flex items-center gap-5 text-slate-400"><div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-app flex items-center justify-center"><Settings size={24} /></div><h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Specs</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-100 dark:border-white/10 pt-8">
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><Gauge size={12} /> Drivetrain</label><CustomSelect options={["FWD", "RWD", "AWD", "4WD"]} defaultValue={driveType} onChange={(v) => setDriveType(String(v))} /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><Activity size={12} /> Transmission</label><CustomSelect options={["Automatic", "Manual", "Semi-Auto"]} defaultValue={transmission} onChange={(v) => setTransmission(String(v))} /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><Fuel size={12} /> Fuel Type</label><CustomSelect options={["Petrol", "Diesel", "EV", "Hybrid"]} defaultValue={fuelType} onChange={(v) => setFuelType(String(v))} /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><FileText size={12} /> VIN Protocol</label><Input placeholder="17-Digit VIN" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-sm focus:border-primary transition-all text-slate-900 dark:text-white" /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Mileage</label><Input type="number" min="0" placeholder="e.g. 25000" value={mileage} onChange={(e) => setMileage(Math.max(0, parseFloat(e.target.value) || 0).toString())} className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-sm focus:border-primary transition-all text-slate-900 dark:text-white" /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">HP</label><Input type="number" min="0" placeholder="e.g. 450" value={horsepower} onChange={(e) => setHorsepower(Math.max(0, parseFloat(e.target.value) || 0).toString())} className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-sm focus:border-primary transition-all text-slate-900 dark:text-white" /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Seats</label><Input type="number" min="1" placeholder="e.g. 5" value={seats} onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1).toString())} className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-sm focus:border-primary transition-all text-slate-900 dark:text-white" /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Doors</label><Input type="number" min="1" placeholder="e.g. 4" value={doors} onChange={(e) => setDoors(Math.max(1, parseInt(e.target.value) || 1).toString())} className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-sm focus:border-primary transition-all text-slate-900 dark:text-white" /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Efficiency</label><Input placeholder="e.g. 15 km/l" value={fuelEfficiency} onChange={(e) => setFuelEfficiency(e.target.value)} className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-sm focus:border-primary transition-all text-slate-900 dark:text-white" /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Color</label><Input placeholder="e.g. Midnight Black" value={color} onChange={(e) => setColor(e.target.value)} className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-sm focus:border-primary transition-all text-slate-900 dark:text-white" /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Acceleration (0–100)</label><div className="relative flex items-center h-14 bg-white dark:bg-slate-950 rounded-app border-2 border-slate-100 dark:border-white/10 px-6 focus-within:border-primary transition-all"><Input type="number" placeholder="e.g. 3.5" value={acceleration} onChange={(e) => setAcceleration(e.target.value)} className="flex-1 h-full bg-transparent border-none shadow-none outline-none p-0 font-bold text-sm focus-visible:ring-0 text-slate-900 dark:text-white" /><span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase shrink-0">sec</span></div></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2"><Zap size={12} /> Charging Type</label><CustomSelect options={["AC Level 1", "AC Level 2", "DC Fast Charge", "CHAdeMO", "CCS", "Tesla Supercharger"]} defaultValue={chargingType} onChange={(v) => setChargingType(String(v))} placeholder="Select Type" /></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Battery Capacity</label><div className="relative flex items-center h-14 bg-white dark:bg-slate-950 rounded-app border-2 border-slate-100 dark:border-white/10 px-6 focus-within:border-primary transition-all"><Input type="number" placeholder="e.g. 100" value={batteryCapacity} onChange={(e) => setBatteryCapacity(e.target.value)} className="flex-1 h-full bg-transparent border-none shadow-none outline-none p-0 font-bold text-sm focus-visible:ring-0 text-slate-900 dark:text-white" /><span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase shrink-0">kWh</span></div></div>
         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Range</label><div className="relative flex items-center h-14 bg-white dark:bg-slate-950 rounded-app border-2 border-slate-100 dark:border-white/10 px-6 focus-within:border-primary transition-all"><Input type="number" placeholder="e.g. 500" value={range} onChange={(e) => setRange(e.target.value)} className="flex-1 h-full bg-transparent border-none shadow-none outline-none p-0 font-bold text-sm focus-visible:ring-0 text-slate-900 dark:text-white" /><span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase shrink-0">km</span></div></div>
                  {(settings?.listings?.customFields || settings?.customFields || [])?.filter((field: any) => !field.isCore && (!field.stepId || field.stepId === 3) && !['name', 'permalink', 'content', 'shortdescription', 'vehicletype', 'transmission', 'fueltype', 'year', 'brandid', 'model', 'priceperday', 'minbookingdays', 'securitydeposit', 'distanceincluded', 'extradistancefee', 'horsepower', 'mileage', 'vin', 'seats', 'doors', 'drivetype', 'fuelefficiency', 'color', 'acceleration', 'chargingtype', 'batterycapacity', 'range'].includes((field.key || '').toLowerCase()))?.map((field: any) => {
           const [trueLabel, falseLabel] = (field.options || "Yes, No").split(",").map((s: string) => s.trim());
           return (
             <div key={field.id} className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                 {field.label} {field.required && <span className="text-rose-500">*</span>}
               </label>
               {field.type === 'select' ? (
                 <CustomSelect 
                   options={(field.options || "").split(",").map((o: string) => o.trim()).filter(Boolean)} 
                   defaultValue={customSpecs[field.key] || ""} 
                   onChange={(val) => setCustomSpecs(prev => ({ ...prev, [field.key]: String(val) }))} 
                   placeholder={field.placeholder || `Select ${field.label}`}
                 />
               ) : field.type === 'boolean' ? (
                 <div className="h-14 flex items-center px-4 border-2 border-slate-100 dark:border-white/10 rounded-app bg-white dark:bg-slate-950">
                   <input 
                     type="checkbox" 
                     checked={!!customSpecs[field.key]} 
                     onChange={(e) => setCustomSpecs(prev => ({ ...prev, [field.key]: e.target.checked }))} 
                     className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                   />
                   <span className="ml-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                     {field.label}: <span className="text-primary font-black">{!!customSpecs[field.key] ? trueLabel : falseLabel || "No"}</span>
                   </span>
                 </div>
               ) : field.type === 'image' || field.type === 'file' ? (
                 <div className="space-y-2">
                   <input 
                     type="file" 
                     accept={field.type === 'image' ? "image/*" : ".pdf,.doc,.docx,.xls,.xlsx,.txt"}
                     onChange={(e) => {
                       if (e.target.files?.[0]) {
                         const file = e.target.files[0];
                         setCustomFiles(prev => ({ ...prev, [field.key]: file }));
                       }
                     }}
                     className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-sm focus:border-primary transition-all text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 pt-2 w-full"
                   />
                   {customFiles[field.key] ? (
                     <div className="flex items-center gap-2 mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                       <span className="text-xs font-bold truncate flex-1">{customFiles[field.key].name}</span>
                       <button type="button" onClick={() => setCustomFiles(prev => ({ ...prev, [field.key]: null }))} className="text-rose-500 hover:text-rose-700 text-xs font-bold">Remove</button>
                     </div>
                   ) : customSpecs[field.key] ? (
                     <div className="flex items-center gap-2 mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                       {field.type === 'image' ? (
                         <img src={typeof customSpecs[field.key] === 'object' ? customSpecs[field.key].url : customSpecs[field.key]} alt="" className="w-10 h-10 object-cover rounded" />
                       ) : (
                         <span className="text-xs font-bold truncate flex-1">{typeof customSpecs[field.key] === 'object' ? customSpecs[field.key].name : customSpecs[field.key]}</span>
                       )}
                       <button type="button" onClick={() => setCustomSpecs(prev => ({ ...prev, [field.key]: null }))} className="text-rose-500 hover:text-rose-700 text-xs font-bold">Remove Existing</button>
                     </div>
                   ) : null}
                 </div>
               ) : field.type === 'images' ? (
                 <div className="space-y-2">
                   <input 
                     type="file" 
                     multiple
                     accept="image/*"
                     onChange={(e) => {
                       if (e.target.files?.length) {
                         const files = Array.from(e.target.files);
                         setCustomFiles(prev => ({ ...prev, [field.key]: [...(prev[field.key] || []), ...files] }));
                       }
                     }}
                     className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-sm focus:border-primary transition-all text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 pt-2 w-full"
                   />
                   <div className="flex flex-wrap gap-2 mt-2">
                     {Array.isArray(customSpecs[field.key]) && customSpecs[field.key].map((url: string, i: number) => (
                       <div key={`existing_${i}`} className="relative group w-16 h-16 rounded overflow-hidden border border-slate-200 dark:border-slate-800">
                         <img src={url} alt="" className="w-full h-full object-cover" />
                         <button type="button" onClick={() => setCustomSpecs(prev => ({ ...prev, [field.key]: prev[field.key].filter((_: any, index: number) => index !== i) }))} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">Remove</button>
                       </div>
                     ))}
                     {Array.isArray(customFiles[field.key]) && customFiles[field.key].map((file: File, i: number) => (
                       <div key={`pending_${i}`} className="relative group w-16 h-16 rounded overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                         <span className="text-[9px] font-bold truncate p-1">{file.name}</span>
                         <button type="button" onClick={() => setCustomFiles(prev => ({ ...prev, [field.key]: prev[field.key].filter((_: any, index: number) => index !== i) }))} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">Remove</button>
                       </div>
                     ))}
                   </div>
                 </div>
               ) : (
                 <Input 
                   type={field.type === 'number' ? 'number' : 'text'}
                   placeholder={field.placeholder || `Enter ${field.label}...`}
                   value={customSpecs[field.key] || ""}
                   onChange={(e) => setCustomSpecs(prev => ({ ...prev, [field.key]: e.target.value }))}
                   className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-sm focus:border-primary transition-all text-slate-900 dark:text-white"
                 />
               )}
             </div>
           );
         })}
        </div>
        
        <div className="pt-10 border-t border-slate-100 dark:border-white/10 space-y-10">
         <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-400"><div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-app flex items-center justify-center"><Rocket size={20} /></div><h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Registry Features</h4></div>
          <div className="relative w-full md:w-64 group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-primary transition-colors" size={16} />
           <Input placeholder="Search features..." value={amenitySearch} onChange={(e) => setAmenitySearch(e.target.value)} className="h-11 pl-11 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-app font-bold focus:border-primary transition-all text-[10px]" />
          </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {visibleAmenities.map((amenity) => (
            <button key={amenity._id} onClick={() => setSelectedAmenities(prev => prev.includes(amenity._id) ? prev.filter(id => id !== amenity._id) : [...prev, amenity._id])} className={`py-2.5 px-6 rounded-app border-2 transition-all flex items-center gap-4 group relative overflow-hidden ${selectedAmenities.includes(amenity._id) ? 'bg-primary/5 border-primary text-primary' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 text-slate-400 dark:text-slate-500'}`}>
             <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${selectedAmenities.includes(amenity._id) ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-slate-50 dark:bg-white/5 group-hover:bg-slate-100 dark:group-hover:bg-white/10'}`}>{selectedAmenities.includes(amenity._id) ? <Check size={12} /> : <Plus size={12} />}</div>
             <span className="text-[10px] font-black uppercase tracking-widest text-left leading-tight">{amenity.name}</span>
            </button>
           ))}
         </div>
         {allAmenities.length > 6 && (
          <div className="flex justify-center"><Button variant="ghost" onClick={() => setShowMoreAmenities(!showMoreAmenities)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">{showMoreAmenities ? 'Collapse Database' : `View All ${allAmenities.length} Features`}</Button></div>
         )}
        </div>
       </section>
      )}

      {(currentStep === 4 || showAllSteps) && (
       <section id="location-module" className="bg-white dark:bg-slate-900 rounded-app p-10 border border-slate-100 dark:border-white/10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ">
        <div className="flex items-center gap-5 text-slate-400"><div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-app flex items-center justify-center"><Navigation size={24} /></div><h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Address</h3></div>
        <div className="space-y-6">
         <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Location</label>
         <LocationPicker 
          lat={latitude} 
          lng={longitude} 
          addressValue={address} 
          onChange={(data) => {
           setLatitude(data.lat);
           setLongitude(data.lng);
           if (data.address) setAddress(data.address);
           if (data.city) setCity(data.city);
           if (data.state) setState(data.state);
           if (data.country) setCountry(data.country);
          }}
          onAddLocation={(data) => {
            addPickupLocation(data, 0);
          }}
         />
         </div>
         
         <div ref={pickupListRef} className="pt-10 border-t border-slate-100 dark:border-white/10 space-y-8 empty:hidden">
           {pickupLocations.length > 0 && (
            <>
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-slate-400">
               <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-app flex items-center justify-center">
                <MapPin size={20} />
               </div>
               <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Additional Delivery Points</h4>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Manage delivery endpoints</p>
               </div>
              </div>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
              {pickupLocations.map((loc, idx) => (
               <div key={idx} className="bg-slate-50/50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-app p-6 space-y-4 animate-in slide-in-from-bottom-2 duration-300 relative group">
                <button 
                 type="button"
                 onClick={() => removePickupLocation(idx)} 
                 className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-all"
                >
                 <X size={18} />
                </button>
                <div className="flex items-center gap-6 pr-10">
                 <div className="w-10 h-10 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center shrink-0 border-2 border-slate-50 dark:border-white/10">
                  <MapPin size={16} className="text-primary" />
                 </div>
                 <div className="flex-1 min-w-0">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 block mb-2">Address</label>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{loc.address}</p>
                 </div>
                </div>
               </div>
              ))}
             </div>
            </>
            )}
           </div>
         </section>
      )}

      {(currentStep === 5 || showAllSteps) && (
       <section id="pricing-module" className="bg-white dark:bg-slate-900 rounded-app p-10 border border-slate-100 dark:border-white/10 space-y-12 animate-in fade-in duration-500 ">
        <div className="flex items-center gap-5 text-slate-400 mb-10"><div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-app flex items-center justify-center"><Zap size={24} /></div><h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Pricing</h3></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 flex items-center gap-2 px-1">Daily rate <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase px-3 py-1">Required</Badge></label>
          <div className="relative group">
           <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300 dark:text-slate-700 transition-colors group-focus-within:text-primary">{getCurrencySymbol()}</span>
           <Input id="price-input" type="number" placeholder="0.00" value={pricePerDay} onChange={(e) => { setPricePerDay(e.target.value); setFormErrors(prev => ({ ...prev, price: "" })); }} className={cn("h-14 pl-12 border-2 bg-white dark:bg-slate-950 rounded-app font-bold focus:border-primary transition-all text-sm text-slate-900 dark:text-white", formErrors.price ? "border-rose-500" : "border-slate-100 dark:border-white/10")} />
          </div>
          {formErrors.price && <p className="text-[10px] font-bold text-rose-500 mt-2 px-1 uppercase tracking-wider">{formErrors.price}</p>}
         </div>

         <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 flex items-center gap-2 px-1">Protocol Currency</label>
          <CustomSelect options={currencies} defaultValue={currencyId} onChange={(v) => setCurrencyId(String(v))} placeholder="Select Currency" />
         </div>

         <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 flex items-center gap-2 px-1">Security Deposit <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-3 py-1">Refundable</Badge></label>
          <div className="relative group">
           <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300 dark:text-slate-700 transition-colors group-focus-within:text-primary">{getCurrencySymbol()}</span>
           <Input type="number" min="0" placeholder="0.00" value={securityDeposit} onChange={(e) => setSecurityDeposit(Math.max(0, parseFloat(e.target.value) || 0).toString())} className="h-14 pl-12 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app font-bold focus:border-primary transition-all text-sm text-slate-900 dark:text-white" />
          </div>
         </div>

         <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 flex items-center gap-2 px-1">Min Booking Days <Badge className="bg-amber-500/10 text-amber-600 border-none text-[8px] font-black uppercase px-3 py-1">Enforced</Badge></label>
          <div className="relative group">
           <Input type="number" min="1" placeholder="1" value={minBookingDays} onChange={(e) => setMinBookingDays(Math.max(1, parseInt(e.target.value) || 1).toString())} className="h-14 pr-16 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 rounded-app font-bold focus:border-primary transition-all text-sm text-slate-900 dark:text-white" />
           <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase italic">Days</span>
          </div>
         </div>
        </div>

        <div className="bg-slate-50/50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 p-10 rounded-app space-y-8">
         <div className="flex items-center justify-between">
          <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-app bg-white dark:bg-slate-950 shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-center text-primary"><Milestone size={24} /></div><div><h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Operational Mileage limits</h4><p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Define operational distance limits</p></div></div>
          <div className="flex items-center gap-6">
           <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Included / Day</label><div className="relative flex items-center h-12 bg-white dark:bg-slate-950 rounded-app border-2 border-slate-100 dark:border-white/10 px-5 w-40 focus-within:border-primary transition-all"><input type="number" value={distanceIncluded} onChange={(e) => setDistanceIncluded(e.target.value)} className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none border-none focus:ring-0 p-0" /><span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase ml-2">mi</span></div></div>
           <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Extra Fee / mi</label><div className="relative flex items-center h-12 bg-white dark:bg-slate-950 rounded-app border-2 border-slate-100 dark:border-white/10 px-5 w-40 focus-within:border-primary transition-all"><span className="text-[10px] font-black text-slate-300 dark:text-slate-700 mr-2">{getCurrencySymbol()}</span><input type="number" step="0.01" value={extraDistanceFee} onChange={(e) => setExtraDistanceFee(e.target.value)} className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none border-none focus:ring-0 p-0" /></div></div>
          </div>
         </div>
        </div>

        <div className="pt-6 space-y-8 border-t border-slate-100 dark:border-white/10">
         <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/5 pb-4">
           <div className="flex items-center gap-4 text-slate-400"><Settings size={20} /><h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Tiered Discounts</h4></div>
           <Button onClick={addPriceTier} className="h-12 px-8 bg-primary hover:bg-secondary text-white hover:text-white rounded-app font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all active:scale-95 border-none"><Plus size={18} /> Add Discount Protocol</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {priceTiers.map((tier, index) => {
            const metrics = getTierMetrics(index);
            return (
             <div key={index} className="group bg-slate-50/30 dark:bg-white/5 rounded-app p-8 border-2 border-transparent hover:border-primary/20 transition-all animate-in slide-in-from-bottom-4 duration-500 relative shadow-sm">
              <button onClick={() => removePriceTier(index)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-all"><X size={18} /></button>
              <div className="space-y-6">
               <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Min Days</label><Input type="number" value={tier.days} onChange={(e) => updatePriceTier(index, 'days', parseInt(e.target.value) || 0)} className="h-12 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-white/10 rounded-app font-bold text-slate-900 dark:text-white" /></div>
                <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Discount %</label><div className="relative flex items-center h-12 bg-white dark:bg-slate-950 rounded-app border-2 border-slate-100 dark:border-white/10 px-5"><input type="number" value={tier.discountPercentage} onChange={(e) => updatePriceTier(index, 'discountPercentage', parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none border-none focus:ring-0 p-0" /><span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase">%</span></div></div>
               </div>
               <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between"><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Discounted Rate</p><p className="text-xl font-black text-primary tracking-tighter">{getCurrencySymbol()}{metrics.currentDiscountedPrice}<span className="text-[10px] text-slate-300 dark:text-slate-700 ml-2">/DAY</span></p></div>
              </div>
             </div>
            );
           })}
          </div>
         </div>

         <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/5 pb-4">
           <div className="flex items-center gap-4 text-slate-400"><Plus size={20} /><h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Extra Services</h4></div>
           <Button onClick={addExtra} className="h-12 px-8 bg-primary hover:bg-secondary text-white hover:text-white rounded-app font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all active:scale-95 border-none"><Plus size={18} /> Add Service Protocol</Button>
          </div>
          <div className="space-y-4">
           {extras.map((extra, index) => (
            <div key={index} className="group bg-white dark:bg-slate-900 rounded-app p-8 border-2 border-slate-50 dark:border-white/5 hover:border-primary/20 transition-all animate-in slide-in-from-bottom-4 duration-500 relative shadow-sm">
             <button onClick={() => removeExtra(index)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Service Label</label><Input value={extra.name} onChange={(e) => updateExtra(index, 'name', e.target.value)} placeholder="e.g. Wi-Fi Hotspot" className="h-12 border-2 border-slate-100 dark:border-white/10 rounded-app px-6 font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-950" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Valuation</label><div className="relative flex items-center h-12 bg-white dark:bg-slate-950 rounded-app border-2 border-slate-100 dark:border-white/10 px-6"><span className="text-xs font-black text-slate-300 dark:text-slate-700 mr-2">{getCurrencySymbol()}</span><input type="number" value={extra.price} onChange={(e) => updateExtra(index, 'price', parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none border-none focus:ring-0 p-0" /></div></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Frequency</label><CustomSelect options={[{ value: "per_trip", label: "Per Trip" }, { value: "per_day", label: "Per Day" }]} defaultValue={extra.priceType} onChange={(v) => updateExtra(index, 'priceType', v)} /></div>
             </div>
            </div>
           ))}
          </div>
         </div>
        </div>
       </section>
      )}

      {(currentStep === 6 || showAllSteps) && (
       <section id="seo-config" className="bg-white dark:bg-slate-900 rounded-app p-10 border border-slate-100 dark:border-white/10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex items-center gap-5 text-slate-400">
           <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-app flex items-center justify-center">
             <Globe size={24} />
           </div>
           <div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">SEO Configuration</h3>
             <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Optimize your listing for search engines</p>
           </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="space-y-8">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Meta Title</label>
               <Input 
                 placeholder="e.g. Rent 2024 Lamborghini Revuelto in Dubai" 
                 value={seoTitle} 
                 onChange={(e) => setSeoTitle(e.target.value)} 
                 className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-app px-6 font-bold text-sm"
               />
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Meta Description</label>
               <Textarea 
                 placeholder="Professional summary for search engine results..." 
                 value={seoDescription} 
                 onChange={(e) => setSeoDescription(e.target.value)} 
                 rows={4}
                 className="border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-app px-6 py-4 font-bold text-sm"
               />
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Keywords</label>
               <Input 
                 placeholder="luxury car, rental, dubai, lamborghini (comma separated)" 
                 value={seoKeywords} 
                 onChange={(e) => setSeoKeywords(e.target.value)} 
                 className="h-14 border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-app px-6 font-bold text-sm"
               />
             </div>
           </div>

           <div className="space-y-8">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Meta Image (OG Image)</label>
               <div className="relative aspect-video rounded-app border-2 border-dashed border-slate-100 dark:border-white/10 bg-slate-50/30 dark:bg-white/5 hover:border-primary/30 transition-all overflow-hidden flex flex-col items-center justify-center group">
                 {(seoImagePreview || existingSeoImage) ? (
                   <>
                     <img src={seoImagePreview || getImageUrl(existingSeoImage || "")} alt="SEO Preview" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={() => {setSeoImage(null); setSeoImagePreview(null); setExistingSeoImage(null);}} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-rose-500 transition-colors"><Trash2 size={20} /></button>
                     </div>
                   </>
                 ) : (
                   <div className="text-center p-6">
                     <CloudUpload size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                     <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Upload SEO Cover</p>
                     <p className="text-[8px] font-bold text-slate-300 dark:text-slate-700 uppercase mt-1">Recommended: 1200x630 px</p>
                     <input type="file" onChange={handleSeoImageSelect} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                   </div>
                 )}
               </div>
             </div>

             <div className="p-6 bg-slate-50/50 dark:bg-white/5 rounded-app border border-slate-100 dark:border-white/10">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">SERP Preview Simulation</p>
               </div>
               <div className="space-y-1">
                 <p className="text-blue-600 dark:text-blue-400 text-lg font-medium hover:underline cursor-pointer truncate">{seoTitle || name || "Vehicle Title Preview"}</p>
                 <p className="text-emerald-700 dark:text-emerald-500 text-sm truncate">https://carrental.com/vehicles/{permalink || "slug"}</p>
                 <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{seoDescription || "Provide a meta description to see how your listing appears in Google search results."}</p>
               </div>
             </div>
           </div>
         </div>
       </section>
      )}

      {customSteps.map((cs: any) => (
        (currentStep === cs.id || showAllSteps) ? (
          <section key={cs.id} className="bg-white dark:bg-slate-900 rounded-app p-10 border border-slate-100 dark:border-white/10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-5 text-slate-400">
              <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-app flex items-center justify-center">
                <Settings size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{cs.title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(settings?.listings?.customFields || settings?.customFields || [])
                ?.filter((field: any) => field.stepId === cs.id)
                ?.map((field: any) => {
                  const [trueLabel, falseLabel] = (field.options || "Yes, No").split(",").map((s: string) => s.trim());
                  return (
                    <div key={field.id} className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <CustomSelect 
                          options={(field.options || "").split(",").map((o: string) => o.trim()).filter(Boolean)} 
                          defaultValue={customSpecs[field.key] || ""} 
                          onChange={(val) => setCustomSpecs(prev => ({ ...prev, [field.key]: String(val) }))} 
                          placeholder={field.placeholder || `Select ${field.label}`} 
                        />
                      ) : field.type === 'boolean' ? (
                        <div className="flex items-center gap-4 h-14 bg-white dark:bg-slate-950 px-6 rounded-app border-2 border-slate-100 dark:border-white/10">
                          <Switch checked={!!customSpecs[field.key]} onCheckedChange={(val: boolean) => setCustomSpecs(prev => ({ ...prev, [field.key]: val }))} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{customSpecs[field.key] ? trueLabel : falseLabel || "No"}</span>
                        </div>
                      ) : field.type === 'image' || field.type === 'images' || field.type === 'file' ? (
                        <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-app p-4 text-center hover:border-primary transition-all bg-white dark:bg-slate-950">
                          <Input type="file" multiple={field.type === 'images'} onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              if (field.type === 'images') {
                                setCustomSpecs(prev => ({ ...prev, [field.key]: Array.from(files).map(f => f.name).join(", ") }));
                              } else {
                                setCustomSpecs(prev => ({ ...prev, [field.key]: files[0].name }));
                              }
                            }
                          }} className="hidden" id={`file_${field.key}`} />
                          <label htmlFor={`file_${field.key}`} className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                            <UploadCloud size={24} className="text-primary" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{customSpecs[field.key] || `Upload ${field.label}`}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{field.placeholder || "Click to browse files"}</span>
                          </label>
                        </div>
                      ) : (
                        <Input 
                          type={field.type === 'number' ? 'number' : 'text'} 
                          placeholder={field.placeholder || `Enter ${field.label}`} 
                          value={customSpecs[field.key] || ""} 
                          onChange={(e) => setCustomSpecs(prev => ({ ...prev, [field.key]: e.target.value }))} 
                          className="h-14 border-2 bg-white dark:bg-slate-950 rounded-app px-6 font-bold text-slate-900 dark:text-white focus:border-primary transition-all text-sm border-slate-100 dark:border-white/10" 
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
        ) : null
      ))}
     </div>
    </main>

    <div className="max-w-4xl mx-auto px-4 md:px-8 pb-10 md:pb-20 flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-6 md:pt-10">
      <Button variant="ghost" onClick={() => { 
        if(showAllSteps) setShowAllSteps(false); 
        else {
          const currentIndex = steps.findIndex(s => s.id === currentStep);
          if (currentIndex > 0) setCurrentStep(steps[currentIndex - 1].id);
        }
      }} disabled={currentStep === 1 && !showAllSteps} className="h-14 px-8 rounded-app font-black uppercase text-[10px] tracking-widest text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-0 transition-all flex items-center gap-3"><ArrowLeft size={18} /> Protocol Revise</Button>
      {!showAllSteps ? (
        <Button onClick={handleNext} className="h-14 px-10 bg-primary hover:bg-secondary text-white hover:text-white rounded-app font-black uppercase text-[10px] tracking-widest flex items-center gap-4 transition-all active:scale-95 border-none">{currentStep === steps[steps.length - 1].id ? 'Complete' : 'Next'} <ArrowRight size={18} /></Button>
       ) : (
        <Button onClick={handleSubmit} disabled={loading} className="h-14 px-10 bg-primary hover:bg-secondary text-white hover:text-white rounded-app font-black uppercase text-[10px] tracking-widest flex items-center gap-4 border-none transition-all active:scale-95">{loading ? <RefreshCw className="animate-spin" /> : <CheckCircle2 size={16} />} Save Changes</Button>
       )}
     </div>
   </div>
  );
}
