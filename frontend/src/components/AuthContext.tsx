"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/authService";

interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string | null;
  wishlist?: string[];
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

  // Sync with LocalStorage on mount
  useEffect(() => {
    const savedType = localStorage.getItem("carrentify_user_type") as UserType;
    if (savedType === "host" || savedType === "renter") {
      setUserType(savedType);
    }
    
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        const userData = authService.getCurrentUser();
        setUser(userData);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleSetUserType = (type: UserType) => {
    setUserType(type);
    localStorage.setItem("carrentify_user_type", type);
  };

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    if (data.user) setUser(data.user);
    if (data.access_token) authService.setToken(data.access_token);
    return data;
  };

  const verifyOtp = async (email: string, code: string) => {
    const response = await authService.verifyOtp(email, code);
    if (response.user) {
      setUser(response.user);
    }
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userType, 
        setUserType: handleSetUserType, 
        loading, 
        login, 
        verifyOtp, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
