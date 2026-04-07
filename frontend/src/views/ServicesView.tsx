"use client";

import React from "react";
import { motion } from "framer-motion";
import { Car, Shield, Luggage, Wallet, Users, Clock, Zap, MapPin, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SERVICES } from "@/data/mockData";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white">
      <Header />
      
      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 mb-6">
              Tailored Excellence
            </Badge>
            <h1 className="text-6xl font-extrabold tracking-tight text-foreground mb-10 leading-tight">Elite Services, <br />Bespoke Solutions.</h1>
            <p className="text-muted-foreground text-xl leading-relaxed mb-10 max-w-2xl mx-auto">From professional chauffeurs to global airport logistics, we provide more than just cars. We provide peace of mind.</p>
          </motion.div>
        </section>

        {/* Feature Focus */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full rounded-[3rem] border border-border/50 bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 p-12 flex flex-col group">
                    <div className="w-16 h-16 bg-muted/30 rounded-3xl flex items-center justify-center text-primary mb-10 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 group-hover:-rotate-3">
                      <Icon size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-6 leading-tight">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium mb-10">{item.desc}</p>
                    <div className="mt-auto flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase hover:gap-4 transition-all cursor-pointer">
                      Learn More <CheckCircle2 size={16} />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Special Promo Section */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
           <div className="bg-primary rounded-[4rem] p-12 lg:p-24 overflow-hidden relative shadow-3xl shadow-primary/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-20" />
              <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-white opacity-5 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-16">
                 <div className="lg:w-3/5">
                   <h2 className="text-5xl font-extrabold tracking-tight text-white mb-8 leading-tight">Corporate & Event <br />Fleet Management.</h2>
                   <p className="text-white/70 text-xl leading-relaxed font-medium mb-12">Handling logistics for high-stakes events requires precision. Our dedicated event team ensures every arrival is coordinated with pinpoint accuracy and style.</p>
                   <div className="flex flex-wrap gap-8">
                     <div className="flex flex-col gap-2">
                        <span className="text-4xl font-extrabold text-white tracking-widest">100+</span>
                        <span className="text-xs font-bold text-white/50 uppercase tracking-[0.2em]">Events/MTD</span>
                     </div>
                     <div className="w-px h-16 bg-white/20 hidden md:block" />
                     <div className="flex flex-col gap-2">
                        <span className="text-4xl font-extrabold text-white tracking-widest">24/7</span>
                        <span className="text-xs font-bold text-white/50 uppercase tracking-[0.2em]">Dedicated Team</span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="lg:w-2/5 w-full flex justify-center">
                    <Card className="w-full max-w-[400px] rounded-[3rem] border-none bg-white p-12 shadow-3xl">
                       <h4 className="text-2xl font-bold text-slate-900 mb-6">Request Callback</h4>
                       <div className="space-y-4 mb-10">
                          <Input placeholder="Organization Name" className="h-14 rounded-2xl bg-slate-50 border-slate-100" />
                          <Input placeholder="Point of Contact" className="h-14 rounded-2xl bg-slate-50 border-slate-100" />
                          <Input placeholder="Service Interest" className="h-14 rounded-2xl bg-slate-50 border-slate-100" />
                       </div>
                       <Button className="w-full h-16 rounded-[2rem] bg-primary text-white hover:bg-black font-bold text-lg shadow-xl shadow-primary/20">
                          Connect with Team
                       </Button>
                    </Card>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
