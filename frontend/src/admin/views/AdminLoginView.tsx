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
  const [step, setStep] = useState(0); // 0: Login, 1: Verification
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await authService.login(email, password);
      
      if (data.access_token) {
        authService.setToken(data.access_token);
        window.location.href = '/admin';
      } else {
        setStep(1);
      }
    } catch (err: any) {
      setError('System authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.verifyOtp(email, otp);
      authService.setToken(data.access_token);
      window.location.href = '/admin';
    } catch (err) {
      setError('Invalid master key. Verification failed.');
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
        <Card className="admin-login-card">
          <CardContent className="p-12">
            <div className="flex flex-col items-center mb-12">
               <div className="admin-login-icon-box">
                 <ShieldCheck size={40} className="text-primary" />
               </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Systems Access</h1>
              <p className="text-slate-500 font-medium text-sm">Secure administrative entry protocol.</p>
            </div>

            <AnimatePresence mode="wait">
              {step === 0 ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLogin}
                  className="space-y-6"
                >
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl font-bold">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Admin Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                       <Input 
                        type="email" 
                        placeholder="admin@gmail.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="admin-login-input pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Admin Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                       <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="admin-login-input pl-12 pr-12"
                        required
                      />
                      <button 
                        type="button" 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-15 bg-primary hover:bg-primary-hover text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all">
                    {loading ? 'Initializing...' : (
                      <span className="flex items-center justify-center gap-2">
                        Initiate Access <ChevronRight size={20} />
                      </span>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerify}
                  className="space-y-8"
                >
                  <button 
                    onClick={() => setStep(0)}
                    className="text-xs font-bold text-slate-400 hover:text-primary flex items-center gap-2 mb-6 transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to Authorization
                  </button>

                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-slate-900 mb-2">Master Key Required</div>
                      <div className="text-xs text-slate-400">Code: 123456</div>
                    </div>
                     <Input 
                      type="text" 
                      placeholder="000000" 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="admin-otp-input"
                    />
                  </div>

                  <Button type="submit" className="w-full h-16 bg-primary hover:bg-primary-hover text-white font-extrabold text-lg rounded-3xl shadow-xl shadow-primary/20">
                    {loading ? 'Validating...' : 'Verify System Identity'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
          <div className="bg-slate-50/50 border-t border-slate-100 p-6 text-center">
            <div className="flex items-center justify-center gap-6">
               <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  <Terminal size={12} className="text-primary" /> Sec-7
               </div>
               <div className="w-px h-3 bg-slate-200" />
               <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  <Server size={12} className="text-primary" /> Node-Central
               </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
