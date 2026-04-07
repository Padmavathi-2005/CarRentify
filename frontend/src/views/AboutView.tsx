"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Users, Award, Heart, Star, Sparkles, Plus, Clock, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ABOUT_VALUES, ABOUT_STATS } from "@/data/mockData";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white">
      <Header />
      
      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-20">
             <motion.div
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="lg:w-1/2"
             >
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 mb-8">
                  Redefining Luxury Mobility
                </Badge>
                <h1 className="text-6xl font-extrabold tracking-tight text-foreground mb-10 leading-tight">Beyond Transportation, <br />It's a Lifestyle.</h1>
                <p className="text-muted-foreground text-xl leading-relaxed mb-10 font-medium">Launched in 2026, CarRentify was born from a simple mission: to bridge the gap between global high-net-worth travelers and the world's most elite vehicles.</p>
                <div className="flex items-center gap-6">
                  <Button className="h-14 px-10 rounded-2xl bg-primary text-white hover:bg-black font-bold shadow-xl shadow-primary/20">
                    Join the Elite
                  </Button>
                  <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-muted overflow-hidden">
                         <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                       </div>
                     ))}
                  </div>
                </div>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="lg:w-1/2 relative"
             >
               <div className="relative aspect-square max-w-[500px] mx-auto rounded-[3.5rem] bg-muted/20 overflow-hidden shadow-2xl">
                 <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80" alt="Luxury Car" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110" />
                 <div className="absolute top-10 left-10 p-6 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                      <Award size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Ranked #1</div>
                      <div className="text-xl font-bold text-foreground">Global Luxury Rental</div>
                    </div>
                 </div>
               </div>
               
               <div className="absolute -bottom-10 -right-5 p-8 bg-black/90 backdrop-blur-xl rounded-[2.5rem] text-white shadow-3xl max-w-[280px]">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-xs font-bold uppercase tracking-widest text-white/50">Founder's Note</span>
                 </div>
                 <p className="text-sm font-medium leading-relaxed italic mb-4 opacity-90">"Excellence is not an option; it's the foundation of everything we build for our clients."</p>
                 <div className="text-sm font-bold">— Liam S., CEO</div>
               </div>
             </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-primary pt-32 pb-40 relative overflow-hidden mb-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-20" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-wrap justify-between gap-12">
            {ABOUT_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-7xl font-extrabold text-white mb-4 tracking-tighter">{stat.value}</div>
                <div className="text-xl font-bold text-white/50 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-7xl mx-auto px-6 mb-32 -mt-40 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {ABOUT_VALUES.map((val, i) => {
               const Icon = val.icon;
               return (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full rounded-[2.5rem] border-none bg-white shadow-xl hover:shadow-2xl transition-all duration-500 p-10 flex flex-col group">
                    <div className="w-16 h-16 bg-muted/30 rounded-3xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 group-hover:-rotate-3">
                      <Icon size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">{val.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">{val.desc}</p>
                  </Card>
                </motion.div>
               );
             })}
          </div>
        </section>

        {/* Global Support Callout */}
        <section className="max-w-7xl mx-auto px-6">
           <div className="bg-muted/20 border border-border/50 rounded-[3.5rem] p-12 lg:p-24 overflow-hidden relative">
              <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
                 <div className="max-w-xl">
                   <h2 className="text-5xl font-bold tracking-tight text-foreground mb-6">Concierge Support in Every Timezone.</h2>
                   <p className="text-muted-foreground text-lg leading-relaxed font-medium mb-10">Our elite consultants are available 24/7 to manage your request. Regardless of where you land, we ensure your arrival is met with unparalleled service.</p>
                   <div className="flex flex-wrap gap-4">
                     <div className="flex items-center gap-3 px-6 h-14 bg-white rounded-2xl border border-border/50 shadow-sm">
                       <Clock className="w-5 h-5 text-primary" />
                       <span className="font-bold text-sm">Response under 5 min</span>
                     </div>
                     <div className="flex items-center gap-3 px-6 h-14 bg-white rounded-2xl border border-border/50 shadow-sm">
                       <Globe className="w-5 h-5 text-primary" />
                       <span className="font-bold text-sm">Multilingual support</span>
                     </div>
                   </div>
                 </div>
                 
                 <Button className="h-20 px-16 rounded-[2rem] bg-primary text-white hover:bg-black font-bold text-2xl shadow-2xl shadow-primary/20">
                    Talk to Concierge
                 </Button>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
