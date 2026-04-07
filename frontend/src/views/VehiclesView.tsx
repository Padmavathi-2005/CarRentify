"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Star, Heart, SlidersHorizontal, ChevronDown, Check, Car, Zap, Mountain, Truck, Gauge } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CARS, VEHICLE_TYPES } from "@/data/mockData";

const getSrc = (img: any) => img?.src || img;

export default function VehiclesPage() {
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredCars = CARS.filter(car => {
    const matchesType = selectedType === "All" || car.type === selectedType;
    const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white">
      <Header />
      
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 mb-4">
              Our Premium Collection
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight text-foreground">Find Your Perfect Ride</h1>
            <p className="text-muted-foreground mt-4 text-lg">Explore our curated selection of high-end vehicles for every occasion.</p>
          </motion.div>
          
          <div className="w-full lg:w-auto flex flex-col md:flex-row gap-4">
            <div className="relative group w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search vehicles..." 
                className="pl-12 h-14 bg-muted/30 border-border/50 rounded-2xl focus-visible:ring-primary/20 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="h-14 px-6 rounded-2xl border-border bg-white hover:bg-muted/50 flex gap-2 font-bold"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-5 h-5" /> 
              Filters 
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="p-8 bg-muted/20 border border-border/50 rounded-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Price Range</h4>
                  {/* Slider simulation */}
                  <div className="h-2 bg-muted rounded-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-2/3 bg-primary" />
                  </div>
                  <div className="flex justify-between mt-4 text-sm font-medium">
                    <span>$0</span>
                    <span>$500+</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Transmission</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Automatic", "Manual"].map(t => (
                      <Badge key={t} variant="outline" className="h-10 px-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors uppercase text-[10px] font-bold tracking-widest">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                   <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Fuel Type</h4>
                   <div className="flex flex-wrap gap-2">
                    {["Electric", "Hybrid", "Gasoline"].map(t => (
                      <Badge key={t} variant="outline" className="h-10 px-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors uppercase text-[10px] font-bold tracking-widest">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Tab */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3">
            {VEHICLE_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.name}
                  onClick={() => setSelectedType(type.name)}
                  className={`flex items-center gap-3 h-12 px-6 rounded-full font-bold text-sm transition-all shadow-sm ${selectedType === type.name ? 'bg-primary text-white scale-105 shadow-primary/20' : 'bg-white text-muted-foreground hover:bg-muted/50 border border-border/50'}`}
                >
                  <Icon className="w-4 h-4" />
                  {type.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-8 flex justify-between items-center">
          <p className="text-muted-foreground font-medium">Showing <span className="text-foreground font-bold">{filteredCars.length}</span> luxury vehicles</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Sort by: <span className="text-primary font-bold inline-flex items-center cursor-pointer">Default <ChevronDown className="w-4 h-4 ml-1" /></span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCars.map((car, i) => (
              <motion.div
                key={car.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="group overflow-hidden rounded-3xl border-border/50 bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer h-full flex flex-col"
                  data-testid={`card-car-${car.id}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted/20">
                    <img
                      src={getSrc(car.image)}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-5 left-5 flex flex-col gap-2">
                      {car.badge && (
                        <Badge className="bg-primary/90 hover:bg-primary text-white border-none px-4 py-1.5 shadow-lg rounded-xl text-[10px] font-bold tracking-widest uppercase">
                          {car.badge}
                        </Badge>
                      )}
                    </div>
                    <button className="absolute top-5 right-5 w-10 h-10 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-muted-foreground hover:text-red-500 transition-all hover:scale-110 shadow-lg z-10">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <CardContent className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs font-bold text-primary uppercase tracking-[0.1em]">{car.type}</div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {car.rating}
                      </div>
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-6 line-clamp-2 leading-tight h-14">{car.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="flex items-center gap-3 text-muted-foreground border border-border/40 p-3 rounded-2xl bg-muted/10">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold whitespace-nowrap text-foreground">{car.fuel}</span>
                       </div>
                       <div className="flex items-center gap-3 text-muted-foreground border border-border/40 p-3 rounded-2xl bg-muted/10">
                          <Gauge className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold whitespace-nowrap text-foreground">{car.speed}</span>
                       </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-extrabold text-primary">${car.price}</span>
                        <span className="text-sm font-bold text-muted-foreground ml-1">/day</span>
                      </div>
                      <Button className="rounded-2xl bg-primary text-white hover:bg-black transition-all h-12 px-6 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-none hover:translate-y-px">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredCars.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="py-32 text-center"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No vehicles found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters to find what you're looking for.</p>
            <Button 
              variant="outline" 
              className="mt-8 rounded-full h-12 px-8 font-bold border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => { setSelectedType("All"); setSearchQuery(""); }}
            >
              Clear all filters
            </Button>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
