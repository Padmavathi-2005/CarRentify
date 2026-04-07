"use client";

import React from "react";
import { Heart, Star, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
  // Safe field access for both mock data and DB model
  const carName = car.name || `${car.brandName} ${car.model}`.trim();
  const carPrice = car.price || car.pricePerDay;
  const rawImage = (car.images && car.images[0]) || car.image;
  
  // Handle Next.js static image objects
  const carImage = typeof rawImage === 'object' && rawImage?.src ? rawImage.src : rawImage;

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: index * 0.1 }
  };

  return (
    <motion.div {...fadeInUp}>
      <Card
        className="group overflow-hidden rounded-2xl border-border/50 bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer h-full flex flex-col relative"
        data-testid={`card-car-${String(car.id || car._id)}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/20">
          <img
            src={carImage}
            alt={carName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {car.badge && (
              <Badge className="bg-primary/90 hover:bg-primary text-white border-none px-3 py-1 shadow-sm">
                {car.badge}
              </Badge>
            )}
          </div>
          
          <button className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors shadow-sm z-10">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{car.type || 'Luxury'}</div>
          <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1">{carName}</h3>
          
          <div className="flex items-center gap-1 mb-4 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{car.rating || 5.0}</span>
            <span>({car.reviews || 0} reviews)</span>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">${carPrice}</span>
              <span className="text-sm text-muted-foreground">/day</span>
            </div>

            {isOwner ? (
                <div className="flex gap-2">
                   <Button 
                     size="icon" 
                     variant="outline" 
                     className="rounded-full w-9 h-9 text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                     onClick={(e) => { e.stopPropagation(); onEdit && onEdit(car); }}
                   >
                     <Edit size={14} />
                   </Button>
                   <Button 
                     size="icon" 
                     variant="outline" 
                     className="rounded-full w-9 h-9 text-slate-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                     onClick={(e) => { e.stopPropagation(); onDelete && onDelete(car.id || car._id!); }}
                   >
                     <Trash2 size={14} />
                   </Button>
                </div>
            ) : (
                <Button className="rounded-full bg-primary text-white hover:bg-primary-hover transition-colors h-10 px-5 text-sm font-semibold">
                    Book
                </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
