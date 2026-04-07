"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, MoreVertical, Edit, Trash, ChevronRight, Star, Car, Zap, Settings2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

import "../styles/AdminFleetView.css";

import car1 from "@/assets/images/car-1.png";
import car2 from "@/assets/images/car-2.png";
import car3 from "@/assets/images/car-3.png";
import car4 from "@/assets/images/car-4.png";
import car5 from "@/assets/images/car-5.png";

const fleet = [
  { id: 1, name: "Mercedes Maybach S-Class", type: "Sedan", plate: "NYC-7788", status: "Available", price: 150, image: car1, fuel: "Hybrid" },
  { id: 2, name: "Audi e-tron GT", type: "Electric", plate: "LON-4422", status: "Booked", price: 120, image: car2, fuel: "Electric" },
  { id: 3, name: "Porsche 911 Carrera", type: "Sports", plate: "DXB-9900", status: "Maintenance", price: 200, image: car3, fuel: "Gasoline" },
  { id: 4, name: "BMW X7 M50i", type: "SUV", plate: "PAR-1122", status: "Available", price: 180, image: car4, fuel: "Gasoline" },
  { id: 5, name: "Mercedes-Benz S-Class", type: "Sedan", plate: "NYC-2233", status: "Available", price: 140, image: car5, fuel: "Gasoline" },
];

const getSrc = (img: any) => img?.src || img;

export default function FleetPage() {
  const [search, setSearch] = useState("");

  const filteredFleet = fleet.filter(car => 
    car.name.toLowerCase().includes(search.toLowerCase()) || 
    car.plate.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="admin-fleet-container"
    >
      <div className="admin-fleet-header">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Fleet Management</h1>
          <p className="text-slate-500 font-medium tracking-wide">Monitor, manage, and scale your luxury vehicle portfolio.</p>
        </div>
        <Button className="h-12 px-8 rounded-2xl bg-primary text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-none hover:translate-y-px transition-all">
          <Plus size={18} /> Register New Vehicle
        </Button>
      </div>

      <div className="admin-fleet-filter-bar">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
             placeholder="Search by name or plate..." 
             className="w-full pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl focus-visible:ring-primary/20 text-sm font-medium"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-100 text-xs font-bold tracking-wide">
              <Filter size={18} className="mr-2" /> All Filters
           </Button>
           <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-100 text-xs font-bold tracking-wide">
              <Car size={18} className="mr-2" /> Sort By Type
           </Button>
        </div>
      </div>

      <div className="admin-fleet-grid">
        <AnimatePresence mode="popLayout">
          {filteredFleet.map((car, i) => (
            <motion.div
              key={car.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="admin-fleet-card group">
                <div className="admin-fleet-image-node">
                   <img src={getSrc(car.image)} alt={car.name} />
                   <Badge className={`admin-fleet-status ${car.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : car.status === 'Booked' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                      {car.status}
                   </Badge>
                </div>
                <CardContent className="p-8">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-primary transition-colors leading-tight">{car.name}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 tracking-widest uppercase">{car.type} • {car.plate}</p>
                      </div>
                      <button className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-300">
                         <MoreVertical size={20} />
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                         <Zap size={16} className="text-primary" />
                         <span className="text-xs font-extrabold text-slate-600">{car.fuel}</span>
                      </div>
                      <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                         <Settings2 size={16} className="text-primary" />
                         <span className="text-xs font-extrabold text-slate-600">Automatic</span>
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div>
                         <span className="text-2xl font-extrabold text-primary">${car.price}</span>
                         <span className="text-xs font-bold text-slate-400 ml-1">/day</span>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="ghost" className="h-10 w-10 p-0 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50">
                            <Edit size={18} />
                         </Button>
                         <Button variant="ghost" className="h-10 w-10 p-0 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                            <Trash size={18} />
                         </Button>
                      </div>
                   </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Suggestion Placeholder */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.3 }}
           className="admin-fleet-add-placeholder group"
        >
           <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6 group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all">
              <Plus size={32} />
           </div>
           <h3 className="text-xl font-extrabold text-slate-900">Add New Vehicle</h3>
           <p className="text-sm font-medium text-slate-400 mt-2">Expand your reach and list a new premium segment.</p>
        </motion.div>
      </div>

      {filteredFleet.length === 0 && (
        <div className="py-20 text-center">
           <h3 className="text-2xl font-bold text-slate-900">No vehicles match your search.</h3>
           <p className="text-slate-500 mt-2">Try a different name or license plate.</p>
        </div>
      )}
    </motion.div>
  );
}
