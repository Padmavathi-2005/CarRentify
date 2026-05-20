'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Navigation, MapPin, Search, MoveRight, Gauge, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-300 pt-16">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-10 relative overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-border/40 rounded-full opacity-20 dark:opacity-10 scale-150" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-border/40 rounded-full opacity-20 dark:opacity-10 scale-125" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-border/40 rounded-full opacity-20 dark:opacity-10" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          
          <div className="space-y-12 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full mb-8">
                <AlertCircle size={14} className="text-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">System Error: 404</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.85] uppercase">
                Path Not <br/>
                Found.
              </h1>
              
              <div className="mt-8 space-y-6">
                <p className="text-xl md:text-2xl text-foreground font-black uppercase tracking-tight">
                  The destination you requested is unreachable.
                </p>
                <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  This happens because the page has been moved, deleted, or the URL is incorrect. If you were looking for a specific vehicle, it may have been temporarily removed from our active fleet.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start items-center"
            >
              <Link href="/">
                <Button className="h-16 px-10 bg-primary hover:bg-primary-hover text-white rounded-app font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-4 group">
                  <Home size={20} /> 
                  Return to Base
                  <MoveRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </Button>
              </Link>
              
              <Button 
                variant="outline"
                onClick={() => window.history.back()}
                className="h-16 px-10 border-border bg-background text-foreground hover:bg-muted rounded-app font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-4"
              >
                <ArrowLeft size={20} /> Go Back
              </Button>
            </motion.div>


          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden lg:block relative"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/5 rounded-app blur-[100px] animate-pulse" />
            
            {/* Main Image Card */}
            <div className="relative z-10 rounded-app overflow-hidden border border-border bg-muted/20 group aspect-[3/2]">
              <img 
                src="/luxury_car_404.png" 
                alt="404 Error - Destination Not Found" 
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-40" />
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
