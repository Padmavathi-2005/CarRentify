'use client';
// Auth system updated

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ChevronRight, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginModal() {
 const { isLoginModalOpen, setShowLoginModal, login, verifyOtp } = useAuth();
 
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [otp, setOtp] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [isOtpSent, setIsOtpSent] = useState(false);
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);

 // Onboarding State
 const [isOnboarding, setIsOnboarding] = useState(false);
 const [firstName, setFirstName] = useState('');
 const [lastName, setLastName] = useState('');
 const [displayName, setDisplayName] = useState('');
 const [onboardingError, setOnboardingError] = useState('');

 // Grace Period State
 const [isGracePeriod, setIsGracePeriod] = useState(false);
 const [graceMessage, setGraceMessage] = useState('');

 // Forgot Password State
 const [isForgotMode, setIsForgotMode] = useState(false);
 const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Code & New Pass
 const [forgotEmail, setForgotEmail] = useState('');
 const [resetCode, setResetCode] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [confirmNewPassword, setConfirmNewPassword] = useState('');
 const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

 if (!isLoginModalOpen) return null;

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if (!emailRegex.test(email)) {
 setError('Please enter a valid email address');
 return;
 }

 if (password.length < 6) {
 setError('Password must be at least 6 characters long');
 return;
 }

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
 setShowLoginModal(false);
 } else {
 setIsOtpSent(true);
 }
 } catch (err: any) {
 if (err.message.startsWith('ACCOUNT_DEACTIVATED_GRACE_PERIOD')) {
 const [_, msg] = err.message.split('|');
 setGraceMessage(msg);
 setIsGracePeriod(true);
 return;
 }
 setError(err.message);
 } finally {
 setLoading(false);
 }
 };

 const handleRecover = async () => {
 setLoading(true);
 try {
 await authService.recoverAccount(email);
 // After recovery, try logging in again automatically or show success
 await handleLogin({ preventDefault: () => {} } as any);
 setIsGracePeriod(false);
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
 const data = await authService.register({
 email,
 password,
 firstName,
 lastName,
 displayName
 });

 if (data.access_token) {
 authService.setToken(data.access_token);
 setShowLoginModal(false);
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
 setShowLoginModal(false);
 } catch (err: any) {
 setError(err.message);
 } finally {
 setLoading(false);
 }
 };

 const handleForgotRequest = async (e: React.FormEvent) => {
 e.preventDefault();
 
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if (!emailRegex.test(forgotEmail)) {
 setForgotStatus({ type: 'error', msg: 'Please enter a valid email address' });
 return;
 }

 setLoading(true);
 setForgotStatus(null);
 try {
 await authService.forgotPassword(forgotEmail);
 setForgotStep(2);
 setForgotStatus({ type: 'success', msg: 'Security code sent to your email.' });
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

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 {/* Dim Background - No Blur */}
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setShowLoginModal(false)}
 className="absolute inset-0 bg-black/50"
 />

 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative bg-card w-full max-w-[450px] rounded-app overflow-hidden z-10 flex flex-col border border-border/50"
 >
 {/* Close Button */}
 <button 
 onClick={() => setShowLoginModal(false)}
 className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-200 transition-colors text-slate-500"
 >
 <X size={18} />
 </button>

 <div className="p-8 lg:p-10">
 <AnimatePresence mode="wait">
 {isOnboarding ? (
 <motion.div key="onboarding" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
 <div className="mb-8">
 <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
 <p className="text-sm text-muted-foreground">We need a few more details to set up your profile.</p>
 </div>
 <form onSubmit={handleOnboarding} className="space-y-5">
 {onboardingError && <div className="p-3 bg-red-50 text-red-600 rounded-app text-xs font-medium border border-red-100">{onboardingError}</div>}
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">First Name</label>
 <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className="h-11 rounded-app bg-muted/20 border-none" required />
 </div>
 <div className="space-y-1">
 <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Last Name</label>
 <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className="h-11 rounded-app bg-muted/20 border-none" required />
 </div>
 </div>
 <div className="space-y-1">
 <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Display Name</label>
 <Input value={displayName} onChange={(e) => setDisplayName(e.target.value.toLowerCase().replace(/[^a-z0-0_]/g, ''))} placeholder="username" className="h-11 rounded-app bg-muted/20 border-none font-bold" required />
 </div>
 <Button type="submit" disabled={loading} className="w-full h-12 rounded-app bg-primary hover:bg-primary-hover text-white font-bold ">
 {loading ? 'Setting up...' : 'Complete Profile'}
 </Button>
 </form>
 </motion.div>
 ) : isGracePeriod ? (
 <motion.div key="grace" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
 <div className="mb-8 text-center">
 <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
 <Lock size={32} />
 </div>
 <h2 className="text-2xl font-bold mb-2">Account Frozen</h2>
 <p className="text-sm text-muted-foreground px-4 mb-4">{graceMessage}</p>
 <Link href="/policy/deletion" target="_blank" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline underline-offset-4">
 View Deactivation Rules & Regs
 </Link>
 </div>
 <div className="space-y-4">
 <Button 
 onClick={handleRecover} 
 disabled={loading} 
 className="w-full h-14 rounded-app bg-primary hover:bg-primary-hover text-white font-bold text-base "
 >
 {loading ? 'Recovering...' : 'Recover My Account'}
 </Button>
 <button 
 onClick={() => setIsGracePeriod(false)}
 className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest mt-2"
 >
 Go Back to Login
 </button>
 </div>
 </motion.div>
 ) : isForgotMode ? (
 <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
 <button 
 onClick={() => setIsForgotMode(false)}
 className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors mb-6 uppercase tracking-widest"
 >
 <ArrowLeft size={14} /> Back to Sign In
 </button>
 
 <div className="mb-8">
 <h1 className="text-2xl font-bold text-foreground mb-1">
 {forgotStep === 1 ? "Reset Password" : "New Credentials"}
 </h1>
 <p className="text-sm text-muted-foreground">
 {forgotStep === 1 
 ? "We'll send a security code to your email." 
 : "Verify the code and set your new password."}
 </p>
 </div>

 {forgotStatus && (
 <div className={`p-3 rounded-app text-xs font-medium border mb-5 ${
 forgotStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
 }`}>
 {forgotStatus.msg}
 </div>
 )}

 {forgotStep === 1 ? (
 <form onSubmit={handleForgotRequest} className="space-y-6">
 <div className="space-y-1">
 <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Account Email</label>
 <Input 
 type="email" 
 placeholder="name@company.com" 
 value={forgotEmail}
 onChange={(e) => setForgotEmail(e.target.value)}
 className="h-12 rounded-app border-border bg-muted/10" 
 required 
 />
 </div>
 <Button type="submit" disabled={loading} className="w-full h-12 rounded-app bg-primary text-white font-bold">
 {loading ? "Requesting..." : "Send Reset Code"}
 </Button>
 </form>
 ) : (
 <form onSubmit={handleResetPassword} className="space-y-4">
 <div className="space-y-1">
 <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Security Code</label>
 <Input 
 type="text" 
 placeholder="000000" 
 maxLength={6}
 value={resetCode}
 onChange={(e) => setResetCode(e.target.value)}
 className="h-12 text-center text-lg tracking-[0.5em] font-black rounded-app border-border bg-muted/10" 
 required 
 />
 </div>
 <div className="space-y-1">
 <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">New Password</label>
 <Input 
 type="password" 
 placeholder="••••••••" 
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="h-12 rounded-app border-border bg-muted/10" 
 required 
 />
 </div>
 <div className="space-y-1">
 <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirm Password</label>
 <Input 
 type="password" 
 placeholder="••••••••" 
 value={confirmNewPassword}
 onChange={(e) => setConfirmNewPassword(e.target.value)}
 className="h-12 rounded-app border-border bg-muted/10" 
 required 
 />
 </div>
 <Button type="submit" disabled={loading} className="w-full h-12 rounded-app bg-primary text-white font-bold">
 {loading ? "Resetting..." : "Update Password"}
 </Button>
 </form>
 )}
 </motion.div>
 ) : !isOtpSent ? (
 <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
 <div className="mb-8">
 <h1 className="text-2xl font-bold text-foreground mb-1">Sign In</h1>
 <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
 </div>

 <form onSubmit={handleLogin} className="space-y-5">
 {error && <div className="p-3 bg-red-50 text-red-600 rounded-app text-xs font-medium border border-red-100">{error}</div>}
 
 <div className="space-y-1">
 <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
 <div className="relative group">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
 <Input 
 type="email" 
 placeholder="name@company.com" 
 className="pl-12 h-12 rounded-app border-border bg-muted/10 focus-visible:ring-primary/20"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required 
 />
 </div>
 </div>

 <div className="space-y-1">
 <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
 <div className="relative group">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
 <Input 
 type={showPassword ? "text" : "password"} 
 placeholder="••••••••" 
 className="pl-12 pr-12 h-12 rounded-app border-border bg-muted/10 focus-visible:ring-primary/20"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required 
 />
 <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary" onClick={() => setShowPassword(!showPassword)}>
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 </div>

 <div className="pt-2 flex justify-end">
 <button 
 type="button" 
 onClick={() => {
 setIsForgotMode(true);
 setForgotEmail(email);
 }}
 className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline underline-offset-4"
 >
 RECOVER PASSWORD
 </button>
 </div>

 <Button type="submit" className="w-full h-12 rounded-app bg-primary hover:bg-primary-hover text-white font-bold text-base group" disabled={loading}>
 {loading ? 'Authenticating...' : 'Sign In'}
 </Button>

 <div className="pt-4 text-center">
 <p className="text-xs text-muted-foreground font-medium">
 Don't have an account?{' '}
 <button 
 type="button"
 onClick={() => {
 setShowLoginModal(false);
 window.location.href = '/register';
 }}
 className="text-primary font-bold hover:underline"
 >
 Create one now
 </button>
 </p>
 </div>
 </form>
 </motion.div>
 ) : (
 <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
 <div className="mb-8">
 <h1 className="text-2xl font-bold text-foreground mb-1">Security</h1>
 <p className="text-sm text-muted-foreground">Enter the code sent to your email</p>
 </div>
 <form onSubmit={handleVerifyOtp} className="space-y-6">
 <Input type="text" placeholder="000000" maxLength={6} className="h-14 text-center text-xl tracking-[0.5em] font-bold rounded-app border-border bg-muted/10" value={otp} onChange={(e) => setOtp(e.target.value)} required />
 <Button type="submit" className="w-full h-12 rounded-app bg-primary hover:bg-primary-hover text-white font-bold" disabled={loading}>
 {loading ? 'Verifying...' : 'Access Account'}
 </Button>
 </form>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </motion.div>
 </div>
 );
}
