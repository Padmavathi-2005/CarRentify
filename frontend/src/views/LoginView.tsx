'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

import { authService } from '@/services/authService';
import { useAuth } from '@/components/AuthContext';

export default function LoginPage() {
  const { login, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Onboarding State
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [onboardingError, setOnboardingError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await login(email, password);
      
      if (data.onboarding) {
        setIsOnboarding(true);
        return;
      }

      if (data.access_token) {
        authService.setToken(data.access_token);
        window.location.href = '/'; // Redirect to Home instead of Admin
      } else {
        setIsOtpSent(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOnboardingError('');
    
    try {
      // Register (Upsert) on backend
      const data = await authService.register({
        email,
        password,
        firstName,
        lastName,
        displayName
      });

      if (data.access_token) {
        authService.setToken(data.access_token);
        window.location.href = '/'; 
      } else {
        setIsOtpSent(true);
        setIsOnboarding(false);
      }
    } catch (err: any) {
      setOnboardingError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await verifyOtp(email, otp);
      authService.setToken(data.access_token);
      window.location.href = '/'; 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    try {
      await authService.resendOtp(email);
      
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(c => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
      alert('A new verification code has been dispatched to your email.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[1000px] z-10"
        >
          <Card className="overflow-hidden border-none shadow-2xl rounded-3xl bg-white/80 backdrop-blur-xl">
            <CardContent className="p-0 flex flex-col lg:flex-row min-h-[600px]">
              
              {/* Branding Side */}
              <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 lg:p-16 text-white flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                
                <div className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                  >
                    <img src="/logo.png" alt="CarRentify" className="h-16 w-auto brightness-0 invert" />
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold tracking-tight mb-6 leading-tight"
                  >
                    Elevate Your <br />Journey with Us.
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/70 text-lg leading-relaxed max-w-sm"
                  >
                    Join our exclusive community of high-end car enthusiasts and experience luxury like never before.
                  </motion.p>
                </div>

                <div className="relative z-10 mt-12 flex gap-8 items-center text-sm font-medium text-white/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-white text-xl font-bold">500+</span>
                    <span>Elite Vehicles</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col gap-1">
                    <span className="text-white text-xl font-bold">24/7</span>
                    <span>VIP Support</span>
                  </div>
                </div>
              </div>

              {/* Form Side */}
              <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {!isOtpSent ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-10">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Sign In</h1>
                        <p className="text-muted-foreground">Welcome back to CarRentify</p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100"
                          >
                            {error}
                          </motion.div>
                        )}
                        
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              type="email" 
                              placeholder="name@company.com" 
                              className="pl-12 h-14 rounded-2xl border-border bg-muted/20 focus-visible:ring-primary/20"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="pl-12 pr-12 h-14 rounded-2xl border-border bg-muted/20 focus-visible:ring-primary/20"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required 
                            />
                            <button 
                              type="button" 
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                          <div className="text-right pr-1">
                            <Link href="#" className="text-xs font-bold text-primary hover:underline transition-all">Forgot password?</Link>
                          </div>
                        </div>

                        <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-black text-white font-bold text-lg shadow-lg shadow-primary/20 group" disabled={loading}>
                          {loading ? 'Authenticating...' : (
                            <span className="flex items-center justify-center gap-2">
                              Sign In <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <button 
                        onClick={() => setIsOtpSent(false)}
                        className="mb-8 text-sm font-bold text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                      </button>

                      <div className="mb-10">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Security</h1>
                        <p className="text-muted-foreground">Enter the 6-digit verification code sent to your email.</p>
                      </div>

                      <form onSubmit={handleVerifyOtp} className="space-y-8">
                        {error && (
                          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                            {error}
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Verification Code</label>
                          <div className="relative group">
                            <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              type="text" 
                              placeholder="000000" 
                              maxLength={6}
                              className="pl-12 h-16 text-center text-2xl tracking-[0.5em] font-bold rounded-2xl border-border bg-muted/20 focus-visible:ring-primary/20"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              required 
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-black text-white font-bold text-lg shadow-lg shadow-primary/20" disabled={loading}>
                          {loading ? 'Verifying...' : 'Access Account'}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                          Didn&apos;t receive code?{" "}
                          <button 
                            type="button" 
                            disabled={resendLoading || resendCooldown > 0}
                            onClick={handleResendOtp}
                            className={`font-bold transition-all ${resendCooldown > 0 ? "text-slate-300 cursor-not-allowed" : "text-primary hover:underline hover:scale-105"}`}
                          >
                            {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : resendLoading ? 'Sending...' : 'Resend code'}
                          </button>
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isOtpSent && (
                  <div className="mt-10">
                    <div className="relative mb-8 text-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/50"></div>
                      </div>
                      <span className="relative px-4 text-xs font-bold text-muted-foreground uppercase bg-white/0 backdrop-blur-none">Alternative Access</span>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {['google', 'facebook', 'apple', 'github'].map((provider) => (
                        <button key={provider} className="flex items-center justify-center h-14 rounded-2xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                          <img 
                            src={`https://cdn-icons-png.flaticon.com/512/${provider === 'google' ? '2991/2991148' : provider === 'facebook' ? '733/733547' : provider === 'apple' ? '0/747' : '25/25231'}.png`} 
                            alt={provider} 
                            className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100" 
                          />
                        </button>
                      ))}
                    </div>

                    <p className="mt-10 text-center text-muted-foreground">
                      New to CarRentify? <Link href="/register" className="font-bold text-primary hover:underline ml-1">Create an Account</Link>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      {/* Onboarding Modal */}
      <AnimatePresence>
        {isOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOnboarding(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-[500px] rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className="bg-primary p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-2">Welcome to the Club!</h2>
                  <p className="text-white/70 text-sm">We just need a few more details to set up your premium profile.</p>
                </div>
              </div>
              
              <form onSubmit={handleOnboarding} className="p-8 space-y-6">
                {onboardingError && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                    {onboardingError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">First Name</label>
                    <Input 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="h-12 rounded-xl bg-muted/20 border-none px-4"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Last Name</label>
                    <Input 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="h-12 rounded-xl bg-muted/20 border-none px-4"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Unique Display Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">@</span>
                    <Input 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value.toLowerCase().replace(/[^a-z0-0_]/g, ''))}
                      placeholder="username"
                      className="h-12 pl-10 rounded-xl bg-muted/20 border-none font-bold"
                      required
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground ml-1">Only lowercase letters, numbers, and underscores.</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsOnboarding(false)}
                    className="flex-1 h-12 rounded-xl font-bold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-3 h-12 px-8 rounded-xl bg-primary hover:bg-black text-white font-bold shadow-lg shadow-primary/20"
                  >
                    {loading ? 'Processing...' : 'Complete Profile'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
