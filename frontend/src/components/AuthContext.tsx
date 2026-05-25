"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/authService";
import LoginModal from "./LoginModal";

interface User {
 _id: string;
 id?: string;
 email: string;
 role?: string;
 name?: string;
 displayName?: string;
 firstName?: string;
 lastName?: string;
 profileImage?: string | null;
 wishlist?: string[];
 isVerified?: boolean;
 isGoogleVerified?: boolean;
 isFacebookVerified?: boolean;
 isTwitterVerified?: boolean;
 verificationStatus?: string;
 phone?: string;
 dob?: string;
 address?: string;
 slug?: string;
 createdAt?: string;
 walletBalance?: number;
 signature?: string;
}

export type UserType = "host" | "renter";

interface AuthContextType {
 user: User | null;
 userType: UserType;
 setUserType: (type: UserType) => void;
 loading: boolean;
 login: (email: string, password: string) => Promise<any>;
 verifyOtp: (email: string, code: string) => Promise<any>;
 logout: () => void;
 setUser: (user: User | null) => void;
 isLoginModalOpen: boolean;
 setShowLoginModal: (show: boolean) => void;
 showVerifModal: boolean;
 setShowVerifModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) throw new Error("useAuth must be used within AuthProvider");
 return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
 const [user, setUser] = useState<User | null>(null);
 const [userType, setUserType] = useState<UserType>("renter");
 const [loading, setLoading] = useState(true);
 const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
 const [showVerifModal, setShowVerifModal] = useState(false);

 // Sync with LocalStorage on mount
 useEffect(() => {
 const savedType = localStorage.getItem("carrental_user_type") as UserType;
 if (savedType === "host" || savedType === "renter") {
 setUserType(savedType);
 }

 const initAuth = async () => {
 const token = authService.getToken();
 if (token) {
 try {
 const userData = await authService.getProfile();
 if (userData) {
 // Force verified status for admins
 if (userData.role?.toLowerCase() === 'admin') {
 userData.isVerified = true;
 }
 setUser(userData);
 // Auto-show verification modal if user is not verified and not admin
 if (userData.role?.toLowerCase() !== 'admin' && !userData.isVerified) {
 setTimeout(() => setShowVerifModal(true), 1500);
 }
 } else {
 setUser(null);
 }
 } catch (err) {
 console.error("Auth init error:", err);
 setUser(null);
 }
 }
 setLoading(false);
 };
 initAuth();
 }, []);

 const handleSetUserType = (type: UserType) => {
 setUserType(type);
 localStorage.setItem("carrental_user_type", type);
 };

 const login = async (email: string, password: string) => {
 const data = await authService.login(email, password);

 if (data.user) {
 // Force verified status for admins
 if (data.user.role?.toLowerCase() === 'admin') {
 data.user.isVerified = true;
 }
 setUser(data.user);
 // Auto-show verification modal if freshly logged-in user is not verified
 if (data.user.role?.toLowerCase() !== 'admin' && !data.user.isVerified) {
 setTimeout(() => setShowVerifModal(true), 1500);
 }
 }
 if (data.access_token) authService.setToken(data.access_token);
 return data;
 };

 const verifyOtp = async (email: string, code: string) => {
 const response = await authService.verifyOtp(email, code);
 if (response.user) {
 setUser(response.user);
 // Also check after OTP verification
 if (response.user.role?.toLowerCase() !== 'admin' && !response.user.isVerified) {
 setTimeout(() => setShowVerifModal(true), 1500);
 }
 }
 if (response.access_token) {
 authService.setToken(response.access_token);
 }
 return response;
 };

 const logout = () => {
 authService.logout();
 setUser(null);
 setShowVerifModal(false);
 };

 // Dynamically import VerificationModal to avoid SSR issues
 const VerificationModal = React.lazy(() => import('./VerificationModal'));

 const contextValue = React.useMemo(() => ({
   user,
   userType,
   setUserType: handleSetUserType,
   loading,
   login,
   verifyOtp,
   logout,
   setUser,
   isLoginModalOpen,
   setShowLoginModal: setIsLoginModalOpen,
   showVerifModal,
   setShowVerifModal,
 }), [user, userType, loading, isLoginModalOpen, showVerifModal]);

 return (
 <AuthContext.Provider value={contextValue}>
 {children}
 <LoginModal />
 {/* Global Verification Modal — auto-shows for unverified non-admin users */}
 {user && 
 user.role?.toLowerCase() !== 'admin' && 
 !user.email?.toLowerCase().includes('admin') &&
 (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) &&
 showVerifModal && (
 <React.Suspense fallback={null}>
 <VerificationModal
 isOpen={showVerifModal}
 onClose={() => setShowVerifModal(false)}
 userId={user._id || user.id || ''}
 />
 </React.Suspense>
 )}
 </AuthContext.Provider>
 );
};
