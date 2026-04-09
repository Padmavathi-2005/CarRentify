"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthContext";
import { API_BASE_URL } from "@/config/api";

interface CarCardProps {
  car: {
    id: string | number;
    _id?: string;
    name?: string;
    brandName?: string;
    model?: string;
    year?: number;
    price: number;
    pricePerDay?: number;
    image: any;
    images?: any[];
    type: string;
    rating: number;
    reviews: number;
    badge?: string | null;
  };
  index?: number;
  isOwner?: boolean;
  onEdit?: (car: any) => void;
  onDelete?: (id: string | number) => void;
}

export default function CarCard({ car, index = 0, isOwner = false, onEdit, onDelete }: CarCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Safe field access for both mock data and DB model
  const carId = car._id || car.id;
  const carName = car.name || `${car.brandName} ${car.model}`.trim();
  const carPrice = car.price || car.pricePerDay;
  const rawImage = (car.images && car.images[0]) || car.image;
  
  // Handle Next.js static image objects
  const carImage = typeof rawImage === 'object' && rawImage?.src ? rawImage.src : rawImage;

  useEffect(() => {
    // Check if user has this car in wishlist
    if (user?.wishlist?.includes(String(carId))) {
      setIsWishlisted(true);
    }
  }, [user, carId]);

  const handleNavigate = () => {
    router.push(`/vehicles/${carId}`);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) {
       router.push('/login');
       return;
    }

    setLoadingWishlist(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/wishlist/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, carId: String(carId) })
      });

      if (res.ok) {
        setIsWishlisted(!isWishlisted);
        // We could also update the global user object here via a refetch
      }
    } catch (err) {
      console.error("Wishlist toggle failure:", err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: index * 0.1 }
  };

  return (
    <motion.div {...fadeInUp}>
      <Card
        onClick={handleNavigate}
        className="group overflow-hidden rounded-3xl border-border/50 bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer h-full flex flex-col relative"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/20">
          <img
            src={carImage}
            alt={carName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {car.badge && (
              <Badge className="bg-primary/90 hover:bg-primary text-white border-none px-4 py-1.5 rounded-xl shadow-lg text-[9px] font-black uppercase tracking-widest">
                {car.badge}
              </Badge>
            )}
          </div>
          
          <button 
            onClick={toggleWishlist}
            disabled={loadingWishlist}
            className={`absolute top-4 right-4 w-11 h-11 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all shadow-xl z-20 group/heart ${isWishlisted ? 'text-rose-500 bg-rose-50 scale-110' : 'text-slate-400 hover:text-rose-500'}`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current animate-pulse' : 'group-hover:scale-125 transition-transform'}`} />
          </button>
        </div>

        <CardContent className="p-8 flex-1 flex flex-col">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">{car.type || 'Luxury Suite'}</div>
          <h3 className="font-black text-xl text-slate-900 mb-2 line-clamp-1 tracking-tight">{carName}</h3>
          
          <div className="flex items-center gap-1.5 mb-6 text-xs font-bold text-slate-500">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-black text-slate-900">{car.rating || 5.0}</span>
            <span className="opacity-60">({car.reviews || 0} reviews)</span>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-primary leading-none uppercase tracking-tighter">${carPrice}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">/ synchronization</span>
            </div>

            {isOwner ? (
                <div className="flex gap-2">
                   <button 
                     className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                     onClick={(e) => { e.stopPropagation(); onEdit && onEdit(car); }}
                   >
                     <Edit size={16} />
                   </button>
                   <button 
                     className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                     onClick={(e) => { e.stopPropagation(); onDelete && onDelete(carId); }}
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
            ) : (
                <Button className="rounded-2xl bg-primary text-white hover:bg-black transition-all h-12 px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 border-none">
                    Book Journey
                </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
