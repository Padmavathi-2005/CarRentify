"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Mail, ChevronRight, ArrowLeft, Terminal, Server, Eye, EyeOff } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { authService } from "../../services/authService";

import "../styles/AdminLoginView.css";

export default function AdminLoginView() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');
 
 try {
 const data = await (authService as any).adminLogin(email, password);
 
 // Secondary check for role consistency
 if (data.user?.role?.toLowerCase() !== 'admin') {
 authService.adminLogoutSilently();
 setError("Unauthorized access. User accounts are restricted from the administrative infrastructure.");
 return;
 }

 if (data.access_token) {
 window.location.href = '/admin';
 }
 } catch (err: any) {
 setError(err.message || 'System authentication failed. Access denied.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="admin-login-wrapper">
 {/* Background Decorative Elements */}
 <div className="admin-login-bg-node">
 <div className="admin-login-blob-1" />
 <div className="admin-login-blob-2" />
 </div>

 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 className="w-full max-w-[500px] z-10"
 >
 <Card className="admin-login-card border-none dark:">
 <CardContent className="p-12">
 <div className="flex flex-col items-center mb-10">
 <img src="/logo.png" alt="CarRental" className="h-16 mb-2" />
 </div>

 <AnimatePresence mode="wait">
 <motion.form
 key="login"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 onSubmit={handleLogin}
 className="space-y-6"
 >
 {error && (
 <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm rounded-app font-bold text-center">
 {error}
 </div>
 )}

 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Admin Email</label>
 <div className="relative">
 <Input 
 type="email" 
 placeholder="" 
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="admin-login-input px-6 font-bold text-slate-900 outline-none"
 required
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Admin Password</label>
 <div className="relative">
 <Input 
 type={showPassword ? "text" : "password"} 
 placeholder="" 
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="admin-login-input px-6 pr-14 font-bold text-slate-900 outline-none"
 required
 />
 <button 
 type="button" 
 className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500/50 hover:text-primary transition-colors"
 onClick={() => setShowPassword(!showPassword)}
 >
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 </div>

 <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-[0.2em] rounded-app transition-all border-none mt-4">
 {loading ? 'Authenticating...' : 'Sign In to Admin'}
 </Button>
 </motion.form>
 </AnimatePresence>
 </CardContent>
 </Card>
 </motion.div>
 </div>
 );
}
