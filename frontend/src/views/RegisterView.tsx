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
import { useLocale } from '@/components/LocaleContext';

import { authService } from '@/services/authService';

export default function RegisterPage() {
 const { t } = useLocale();
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
 const data = await authService.register({
 email,
 password,
 firstName,
 lastName,
 displayName
 });

 if (data.access_token) {
 authService.setToken(data.access_token);
 // Wait 2 seconds to show success message then redirect
 setStep(1);
 setTimeout(() => {
 window.location.href = '/';
 }, 2500);
 } else {
 setStep(1);
 }
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
 <Card className="overflow-hidden border-none rounded-app bg-card">
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
 <img src="/logo.png" alt="CarRental" className="h-[75px] w-auto min-w-[240px] brightness-0 invert object-contain" />
 </motion.div>

 <motion.h2
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.3 }}
 className="text-4xl font-extrabold tracking-tight mb-6 leading-tight"
 >
 {t('auth.register.start_elite').split(' ').slice(0, 2).join(' ')} <br />{t('auth.register.start_elite').split(' ').slice(2).join(' ')}
 </motion.h2>

 <motion.p
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.4 }}
 className="text-white/70 text-lg leading-relaxed max-w-sm"
 >
 {t('auth.register.unlock_access')}
 </motion.p>
 </div>

 <div className="relative z-10 p-6 rounded-app bg-white/5 border border-white/10 backdrop-blur-sm">
 <div className="flex items-center gap-4 text-sm font-medium">
 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
 <CheckCircle2 className="w-5 h-5 text-white" />
 </div>
 <p className="text-white/80">{t('auth.register.quality_guarantee')}</p>
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
 <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.register.title')}</h1>
 <p className="text-muted-foreground">{t('auth.register.subtitle')}</p>
 </div>

 <form onSubmit={handleRegister} className="space-y-5">
 {error && (
 <div className="p-4 bg-destructive/10 text-destructive rounded-app text-sm font-medium border border-destructive/20">
 {error}
 </div>
 )}

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('auth.register.first_name')}</label>
 <Input
 type="text"
 placeholder="Jane"
 className="h-12 rounded-app border-border bg-muted/20"
 value={firstName}
 onChange={(e) => setFirstName(e.target.value)}
 required
 />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('auth.register.last_name')}</label>
 <Input
 type="text"
 placeholder="Smith"
 className="h-12 rounded-app border-border bg-muted/20"
 value={lastName}
 onChange={(e) => setLastName(e.target.value)}
 required
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('auth.register.display_name')}</label>
 <div className="relative group">
 <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 type="text"
 placeholder="jane_smith"
 className="pl-12 h-12 rounded-app border-border bg-muted/20"
 value={displayName}
 onChange={(e) => setDisplayName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
 required
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('auth.login.email_label')} *</label>
 <div className="relative group">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 type="email"
 placeholder={t('auth.login.email_placeholder')}
 className="pl-12 h-12 rounded-app border-border bg-muted/20"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('dashboard.profile.new_password')} *</label>
 <div className="relative group">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 type={showPassword ? "text" : "password"}
 placeholder="••••••••"
 className="pl-12 pr-12 h-12 rounded-app border-border bg-muted/20"
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

 <Button type="submit" className="w-full h-14 rounded-app bg-primary hover:bg-primary-hover text-white font-bold text-lg mt-4" disabled={loading}>
 {loading ? t('auth.register.creating') : t('auth.register.create_btn')}
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
 <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
 <CheckCircle2 className="text-emerald-500" size={48} strokeWidth={1.5} />
 </div>
 <h1 className="text-3xl font-extrabold text-foreground mb-4">{t('auth.register.success_title')}</h1>
 <p className="text-muted-foreground text-lg mb-10 max-w-sm mx-auto">{t('auth.register.success_desc', { name: displayName })}</p>
 <Link href="/" className="w-full max-w-xs mx-auto">
 <Button className="w-full h-14 rounded-app bg-primary hover:bg-primary-hover text-white font-bold text-lg ">
 {t('auth.register.explore_fleet')}
 </Button>
 </Link>
 </motion.div>
 )}
 </AnimatePresence>

 {step === 0 && (
 <div className="mt-8 text-center text-sm text-muted-foreground">
 {t('auth.register.already_member')} <Link href="/login" className="font-bold text-primary hover:underline ml-1">{t('auth.register.sign_in')}</Link>
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
