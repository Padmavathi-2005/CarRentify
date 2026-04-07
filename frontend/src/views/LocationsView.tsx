"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Globe, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { LOCATIONS } from "@/data/mockData";

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white">
      <Header />
      
      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 mb-6">
              World-Class Network
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight text-foreground mb-6">Global Presence</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              CarRentify operates in major travel hubs and elite destinations worldwide. Wherever you land, luxury awaits.
            </p>
          </motion.div>
        </section>

        {/* Map Placeholder Section */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <Card className="overflow-hidden h-[500px] border-none shadow-2xl rounded-[2.5rem] bg-muted/20 relative group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/20 max-w-md">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                  <Globe className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Interactive Network Map</h3>
                <p className="text-muted-foreground mb-8">Load our high-precision interactive map to find your nearest luxury pickup point.</p>
                <Button className="rounded-2xl h-14 px-8 bg-primary text-white hover:bg-black font-bold">
                  Enable High-Def Map
                </Button>
              </div>
            </div>
            
            {/* Ping Animations */}
            {LOCATIONS.map((loc, i) => (
              <div key={i} className="absolute hidden lg:block" style={{ top: `${20 + i * 15}%`, left: `${15 + i * 20}%` }}>
                <div className="relative">
                   <div className="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-75" />
                   <div className="relative w-4 h-4 bg-primary rounded-full shadow-lg border-2 border-white" />
                </div>
              </div>
            ))}
          </Card>
        </section>

        {/* Location Grid */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {LOCATIONS.map((loc, i) => (
              <motion.div
                key={loc.city}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full rounded-[2rem] border-border/50 bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden group">
                  <CardContent className="p-10 flex flex-col md:flex-row gap-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-bold text-foreground">{loc.city}</h3>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-4 text-muted-foreground">
                          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm font-medium">{loc.address}</span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <Phone className="w-5 h-5 text-primary shrink-0" />
                          <span className="text-sm font-medium">{loc.phone}</span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <Clock className="w-5 h-5 text-primary shrink-0" />
                          <span className="text-sm font-medium">{loc.hours}</span>
                        </div>
                      </div>

                      <Button className="rounded-xl h-11 px-6 bg-muted/30 text-foreground hover:bg-primary hover:text-white transition-all font-bold gap-2">
                        Get Directions <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="w-full md:w-32 bg-muted/30 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Coordinates</span>
                       <span className="text-[11px] font-mono font-bold text-primary break-all leading-relaxed">{loc.coordinates}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
