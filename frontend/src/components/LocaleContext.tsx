'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type LocaleContextType = {
  language: string;
  currency: string;
  setLanguage: (lang: string) => void;
  setCurrency: (curr: string) => void;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const savedLang = localStorage.getItem('site_lang');
    const savedCurr = localStorage.getItem('site_curr');
    if (savedLang) setLanguage(savedLang);
    if (savedCurr) setCurrency(savedCurr);
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('site_lang', lang);
  };

  const handleSetCurrency = (curr: string) => {
    setCurrency(curr);
    localStorage.setItem('site_curr', curr);
  };

  return (
    <LocaleContext.Provider value={{ language, currency, setLanguage: handleSetLanguage, setCurrency: handleSetCurrency }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
