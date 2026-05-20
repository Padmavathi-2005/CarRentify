"use client";

import React from "react";
import en from "./locales/en.json";
interface AdminTranslationContextType {
 t: any;
 selectedLang: string;
}

export const AdminTranslationContext = React.createContext<AdminTranslationContextType | null>(null);

export const useAdminTranslation = () => {
 const context = React.useContext(AdminTranslationContext);
 if (!context) {
 // Fallback to English if used outside provider (should not happen in admin)
 return { t: en, selectedLang: 'English' };
 }
 return context;
};
