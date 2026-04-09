"use client";

import React from "react";
import en from "./locales/en.json";

interface AdminTranslationContextType {
  t: any;
  selectedLang: string;
}

export const AdminTranslationContext = React.createContext<AdminTranslationContextType>({ t: en, selectedLang: 'English' });
