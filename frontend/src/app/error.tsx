'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Error({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 useEffect(() => {
 // Log the error to an error reporting service
 console.error('Application Error:', error);
 }, [error]);

 return (
 <div className="min-h-screen bg-background flex flex-col font-sans pt-16 lg:pt-20">
 <Header />
 
 <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
 <div className="relative mb-12 animate-in fade-in zoom-in duration-1000">
 <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-3xl scale-150" />
 <div className="relative w-32 h-32 bg-card rounded-app border border-border dark:border-white/20 flex items-center justify-center text-rose-500">
 <AlertTriangle size={64} className="animate-pulse" />
 </div>
 </div>

 <div className="max-w-md space-y-4 animate-in slide-in-from-bottom-5 duration-700">
 <h1 className="text-4xl font-black text-foreground tracking-tight">System Interruption</h1>
 <p className="text-muted-foreground font-bold leading-relaxed">
 We've encountered a technical glitch while processing your request. Don't worry, your data is safe. Let's try to restore the connection.
 </p>
 
 <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
 <Button 
 onClick={() => reset()}
 className="h-14 px-8 bg-primary hover:bg-primary-hover text-white rounded-app font-black uppercase tracking-widest transition-all "
 >
 <RefreshCcw className="mr-2" size={18} /> Restore Connection
 </Button>
 <Link href="/">
 <Button variant="outline" className="h-14 px-8 border-border text-muted-foreground hover:bg-muted rounded-app font-black uppercase tracking-widest transition-all dark:border-white/10 dark:text-white/60">
 <Home className="mr-2" size={18} /> Return Home
 </Button>
 </Link>
 </div>
 
 <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest pt-10">
 Error Signature: {error.digest || 'Internal Exception'}
 </p>
 </div>
 </main>

 <Footer />
 </div>
 );
}
