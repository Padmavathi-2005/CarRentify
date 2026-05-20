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
import { useLocale } from '@/components/LocaleContext';

import { authService } from '@/services/authService';
import { useAuth } from '@/components/AuthContext';
import { useSettings } from '@/components/ThemeProvider';
import { API_BASE_URL, getImageUrl } from '@/config/api';

export default function LoginPage() {
   const { t } = useLocale();
  const { settings } = useSettings();

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

 // Forgot Password State
 const [isForgotMode, setIsForgotMode] = useState(false);
 const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Code & New Pass
 const [forgotEmail, setForgotEmail] = useState('');
 const [resetCode, setResetCode] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [confirmNewPassword, setConfirmNewPassword] = useState('');
 const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

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

 // Security Check: Block admins from user-facing login form
 if (data.user?.role?.toLowerCase() === 'admin') {
 authService.logoutSilently(); // Clear any partial session
 setError("Administrative accounts are restricted from standard login. Please use the secure admin portal.");
 return;
 }

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

 const handleForgotRequest = async (e: React.FormEvent) => {
   e.preventDefault();
   setLoading(true);
   setForgotStatus(null);
   try {
     await authService.forgotPassword(forgotEmail);
     setForgotStep(2);
     setForgotStatus({ type: 'success', msg: 'Security code sent to your email.' });
     
     // Start Resend Timer
     setResendCooldown(60);
     const timer = setInterval(() => {
       setResendCooldown(c => {
         if (c <= 1) { clearInterval(timer); return 0; }
         return c - 1;
       });
     }, 1000);
   } catch (err: any) {
     setForgotStatus({ type: 'error', msg: err.message });
   } finally {
     setLoading(false);
   }
 };

 const handleResetPassword = async (e: React.FormEvent) => {
   e.preventDefault();
   if (newPassword !== confirmNewPassword) {
     setForgotStatus({ type: 'error', msg: 'Passwords do not match.' });
     return;
   }
   setLoading(true);
   try {
     await authService.resetPassword({
       email: forgotEmail,
       code: resetCode,
       newPassword
     });
     setIsForgotMode(false);
     setForgotStep(1);
     setError('Password reset successfully. Please sign in.');
   } catch (err: any) {
     setForgotStatus({ type: 'error', msg: err.message });
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

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="w-full max-w-[1000px] z-10"
 >
 <Card className="overflow-hidden border border-border rounded-app bg-card">
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
   <img 
    src={settings.logoLight ? getImageUrl(settings.logoLight) : "/logo.png"} 
    alt={settings.siteName || "CarRental"} 
    className="h-[75px] w-auto min-w-[240px] brightness-0 invert object-contain" 
  />

 </motion.div>

 <motion.h2
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.3 }}
 className="text-4xl font-bold tracking-tight mb-6 leading-tight"
 >
 {t('auth.login.elevate').split(' ').slice(0, 2).join(' ')} <br />{t('auth.login.elevate').split(' ').slice(2).join(' ')}
 </motion.h2>

 <motion.p
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.4 }}
 className="text-white/70 text-lg leading-relaxed max-w-sm"
 >
 {t('auth.login.join_community')}
 </motion.p>
 </div>

 <div className="relative z-10 mt-12 flex gap-8 items-center text-sm font-medium text-white/50">
 <div className="flex flex-col gap-1">
 <span className="text-white text-xl font-bold">500+</span>
 <span>{t('auth.login.elite_vehicles')}</span>
 </div>
 <div className="w-px h-8 bg-white/10" />
 <div className="flex flex-col gap-1">
 <span className="text-white text-xl font-bold">24/7</span>
 <span>{t('auth.login.vip_support')}</span>
 </div>
 </div>
 </div>

 {/* Form Side */}
 <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
 <AnimatePresence mode="wait">
 {isForgotMode ? (
   <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
     <button 
       onClick={() => setIsForgotMode(false)}
       className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-8 uppercase tracking-widest"
     >
       <ArrowLeft size={16} /> {t('auth.login.back_to_login')}
     </button>
     
     <div className="mb-10">
       <h1 className="text-3xl font-bold text-foreground mb-2">
         {forgotStep === 1 ? "Reset Password" : "New Credentials"}
       </h1>
       <p className="text-muted-foreground">
         {forgotStep === 1 
           ? "We'll send a security code to your email." 
           : "Verify the code and set your new password."}
       </p>
     </div>

     {forgotStatus && (
       <div className={`p-4 rounded-app text-sm font-medium border mb-6 ${
         forgotStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
       }`}>
         {forgotStatus.msg}
       </div>
     )}

     {forgotStep === 1 ? (
       <form onSubmit={handleForgotRequest} className="space-y-6">
         <div className="space-y-2">
           <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Account Email</label>
           <Input 
             type="email" 
             placeholder="name@company.com" 
             value={forgotEmail}
             onChange={(e) => setForgotEmail(e.target.value)}
             className="h-14 rounded-app border-border bg-muted/20" 
             required 
           />
         </div>
         <Button type="submit" disabled={loading} className="w-full h-14 rounded-app bg-primary text-white font-bold text-lg">
           {loading ? "Requesting..." : "Send Reset Code"}
         </Button>
       </form>
     ) : (
       <form onSubmit={handleResetPassword} className="space-y-4">
         <div className="space-y-2">
           <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Security Code</label>
           <Input 
             type="text" 
             placeholder="000000" 
             maxLength={6}
             value={resetCode}
             onChange={(e) => setResetCode(e.target.value)}
             className="h-16 text-center text-2xl tracking-[0.5em] font-black rounded-app border-border bg-muted/20" 
             required 
           />
         </div>
         <div className="space-y-2">
           <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">New Password</label>
           <Input 
             type="password" 
             placeholder="••••••••" 
             value={newPassword}
             onChange={(e) => setNewPassword(e.target.value)}
             className="h-14 rounded-app border-border bg-muted/20" 
             required 
           />
         </div>
         <div className="space-y-2">
           <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirm Password</label>
           <Input 
             type="password" 
             placeholder="••••••••" 
             value={confirmNewPassword}
             onChange={(e) => setConfirmNewPassword(e.target.value)}
             className="h-14 rounded-app border-border bg-muted/20" 
             required 
           />
         </div>
         <Button type="submit" disabled={loading} className="w-full h-14 rounded-app bg-primary text-white font-bold text-lg">
            {loading ? "Resetting..." : "Update Password"}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Didn't receive the code?{" "}
            <button
              type="button"
              disabled={loading || resendCooldown > 0}
              onClick={handleForgotRequest}
              className={`font-bold transition-all ${resendCooldown > 0 ? "text-slate-300 cursor-not-allowed" : "text-primary hover:underline"}`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
            </button>
          </p>
        </form>
     )}
   </motion.div>
 ) : !isOtpSent ? (
 <motion.div
 key="login"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.3 }}
 >
 <div className="mb-10">
 <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.login.title')}</h1>
 <p className="text-muted-foreground">{t('auth.login.subtitle')}</p>
 </div>

 <form onSubmit={handleLogin} className="space-y-6">
 {error && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 className="p-4 bg-destructive/10 text-destructive rounded-app text-sm font-medium border border-destructive/20"
 >
 {error}
 </motion.div>
 )}

 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('auth.login.email_label')}</label>
 <div className="relative group">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
 <Input
 type="email"
 placeholder={t('auth.login.email_placeholder')}
 className="pl-12 h-14 rounded-app border-border bg-muted/20 focus-visible:ring-primary/20"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('auth.login.password_label')}</label>
 <div className="relative group">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
 <Input
 type={showPassword ? "text" : "password"}
 placeholder="••••••••"
 className="pl-12 pr-12 h-14 rounded-app border-border bg-muted/20 focus-visible:ring-primary/20"
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
 <button 
 type="button"
 onClick={() => {
 setIsForgotMode(true);
 setForgotEmail(email);
 }}
 className="text-xs font-bold text-primary hover:underline transition-all"
 >
 {t('auth.login.forgot_password')}
 </button>
 </div>
 </div>

 <Button type="submit" className="w-full h-14 rounded-app bg-primary hover:bg-primary-hover text-white font-bold text-lg group" disabled={loading}>
 {loading ? t('auth.login.authenticating') : (
 <span className="flex items-center justify-center gap-2">
 {t('auth.login.sign_in_btn')} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
 <ArrowLeft className="w-4 h-4" /> {t('auth.login.back_to_login')}
 </button>

 <div className="mb-10">
 <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.login.security_title')}</h1>
 <p className="text-muted-foreground">{t('auth.login.otp_desc')}</p>
 </div>

 <form onSubmit={handleVerifyOtp} className="space-y-8">
 {error && (
 <div className="p-4 bg-destructive/10 text-destructive rounded-app text-sm font-medium border border-destructive/20">
 {error}
 </div>
 )}

 <div className="space-y-4">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('auth.login.otp_label')}</label>
 <div className="relative group">
 <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
 <Input
 type="text"
 placeholder="000000"
 maxLength={6}
 className="pl-12 h-16 text-center text-2xl tracking-[0.5em] font-bold rounded-app border-border bg-muted/20 focus-visible:ring-primary/20"
 value={otp}
 onChange={(e) => setOtp(e.target.value)}
 required
 />
 </div>
 </div>

 <Button type="submit" className="w-full h-14 rounded-app bg-primary hover:bg-primary-hover text-white font-bold text-lg " disabled={loading}>
 {loading ? t('auth.login.verifying') : t('auth.login.access_account')}
 </Button>

 <p className="text-center text-sm text-muted-foreground">
 {t('auth.login.no_code')}{" "}
 <button
 type="button"
 disabled={resendLoading || resendCooldown > 0}
 onClick={handleResendOtp}
 className={`font-bold transition-all ${resendCooldown > 0 ? "text-slate-300 cursor-not-allowed" : "text-primary hover:underline hover:scale-105"}`}
 >
 {resendCooldown > 0 ? t('auth.login.resend_cooldown', { s: resendCooldown }) : resendLoading ? t('auth.login.sending') : t('auth.login.resend_code')}
 </button>
 </p>
 </form>
 </motion.div>
 )}
 </AnimatePresence>

  <div className="mt-10 pt-10 border-t border-border/50">
    <p className="text-center text-muted-foreground">
      {t('auth.login.new_here')} <Link href="/register" className="font-bold text-primary hover:underline ml-1">{t('auth.login.create_account')}</Link>
    </p>
  </div>
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
 className="absolute inset-0 bg-black/50"
 />
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, y: 20 }}
 className="relative bg-background w-full max-w-[500px] rounded-app overflow-hidden z-10 border border-border"
 >
 <div className="bg-primary p-8 text-white relative overflow-hidden">
 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
 <div className="relative z-10">
 <h2 className="text-2xl font-bold mb-2">{t('auth.onboarding.title')}</h2>
 <p className="text-white/70 text-sm">{t('auth.onboarding.subtitle')}</p>
 </div>
 </div>

 <form onSubmit={handleOnboarding} className="p-8 space-y-6">
 {onboardingError && (
 <div className="p-4 bg-destructive/10 text-destructive rounded-app text-sm font-medium border border-destructive/20">
 {onboardingError}
 </div>
 )}

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('auth.onboarding.first_name')}</label>
 <Input
 value={firstName}
 onChange={(e) => setFirstName(e.target.value)}
 placeholder="John"
 className="h-12 rounded-app bg-muted/20 border-none px-4"
 required
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('auth.onboarding.last_name')}</label>
 <Input
 value={lastName}
 onChange={(e) => setLastName(e.target.value)}
 placeholder="Doe"
 className="h-12 rounded-app bg-muted/20 border-none px-4"
 required
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('auth.onboarding.display_name')}</label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">@</span>
 <Input
 value={displayName}
 onChange={(e) => setDisplayName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
 placeholder={t('auth.onboarding.display_placeholder')}
 className="h-12 pl-10 rounded-app bg-muted/20 border-none font-bold"
 required
 />
 </div>
 <p className="text-[9px] text-muted-foreground ml-1">{t('auth.onboarding.display_hint')}</p>
 </div>

 <div className="flex gap-4 pt-4">
 <Button
 type="button"
 variant="ghost"
 onClick={() => setIsOnboarding(false)}
 className="flex-1 h-12 rounded-app font-bold"
 >
 {t('auth.onboarding.cancel')}
 </Button>
 <Button
 type="submit"
 disabled={loading}
 className="flex-3 h-12 px-8 rounded-app bg-primary hover:bg-primary-hover text-white font-bold "
 >
 {loading ? t('auth.onboarding.processing') : t('auth.onboarding.complete_btn')}
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
