'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, CheckCircle2, ChevronRight, Car, UserCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

import { authService } from '@/services/authService';

export default function RegisterPage() {
  const [step, setStep] = useState(0); // 0: Details, 1: Success
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.register(email, password, firstName, lastName, displayName);
      setStep(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[1100px] z-10"
        >
          <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/80 backdrop-blur-xl">
            <CardContent className="p-0 flex flex-col lg:flex-row min-h-[650px]">
              
              {/* Branding Side */}
              <div className="hidden lg:flex lg:w-[40%] bg-primary p-12 lg:p-16 text-white flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                
                <div className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                  >
                    <img src="/logo.png" alt="CarRentify" className="h-14 w-auto brightness-0 invert" />
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-extrabold tracking-tight mb-6 leading-tight"
                  >
                    Start Your <br />Elite Experience.
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/70 text-lg leading-relaxed max-w-sm"
                  >
                    Create your profile to unlock unprecedented access to premium mobility and bespoke services.
                  </motion.p>
                </div>

                <div className="relative z-10 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white/80">Premium quality and security guaranteed with every ride.</p>
                  </div>
                </div>
              </div>

              {/* Form Side */}
              <div className="w-full lg:w-[60%] p-8 lg:p-16 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {step === 0 ? (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      <div className="mb-10">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Join the Community</h1>
                        <p className="text-muted-foreground">Create your account to start your journey</p>
                      </div>

                      <form onSubmit={handleRegister} className="space-y-5">
                        {error && (
                          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                            {error}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">First Name</label>
                            <Input 
                              type="text" 
                              placeholder="Jane" 
                              className="h-12 rounded-xl border-border bg-muted/20"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Last Name</label>
                            <Input 
                              type="text" 
                              placeholder="Smith" 
                              className="h-12 rounded-xl border-border bg-muted/20"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Display Name</label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              type="text" 
                              placeholder="jane_smith" 
                              className="pl-12 h-12 rounded-xl border-border bg-muted/20"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              required 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              type="email" 
                              placeholder="name@company.com" 
                              className="pl-12 h-12 rounded-xl border-border bg-muted/20"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Create Password</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="pl-12 pr-12 h-12 rounded-xl border-border bg-muted/20"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required 
                            />
                            <button 
                              type="button" 
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <Button type="submit" className="w-full h-14 rounded-xl bg-primary hover:bg-black text-white font-bold text-lg shadow-lg shadow-primary/20 mt-4" disabled={loading}>
                          {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full text-center py-10"
                    >
                      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 color="#10b981" size={48} strokeWidth={1.5} />
                      </div>
                      <h1 className="text-3xl font-extrabold text-foreground mb-4">You're All Set!</h1>
                      <p className="text-muted-foreground text-lg mb-10 max-w-sm mx-auto">Welcome to CarRentify, <span className="text-primary font-bold">{displayName}</span>. Your journey to luxury starts now.</p>
                      <Link href="/login" className="w-full max-w-xs mx-auto">
                        <Button className="w-full h-14 rounded-xl bg-primary hover:bg-black text-white font-bold text-lg shadow-xl shadow-primary/20">
                          Sign In to Dashboard
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {step === 0 && (
                  <div className="mt-8 text-center text-sm text-muted-foreground">
                    Already a member? <Link href="/login" className="font-bold text-primary hover:underline ml-1">Sign In</Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
