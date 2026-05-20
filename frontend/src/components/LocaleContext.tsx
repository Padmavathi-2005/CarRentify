'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '@/config/api';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import zh from '@/locales/zh.json';

const dictionaries: Record<string, any> = { en, ar, zh };

type LocaleContextType = {
 language: string;
 direction: string;
 currency: string;
 currencies: any[];
 languages: any[];
 setLanguage: (lang: string) => void;
 setCurrency: (curr: string) => void;
 formatPrice: (amount: number, listingCurrency?: any) => string;
 convertPrice: (amount: number, listingCurrency?: any) => number;
 formatCurrency: (amount: number, currencyData: any) => string;
 t: (key: string, params?: Record<string, any>) => string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [language, setLanguage] = useState('en');
 const [direction, setDirection] = useState('ltr');
 const [currency, setCurrency] = useState('USD');
 const [currencies, setCurrencies] = useState<any[]>([]);
 const [languages, setLanguages] = useState<any[]>([]);

 useEffect(() => {
 const savedLang = localStorage.getItem('site_lang');
 const savedCurr = localStorage.getItem('site_curr');
 if (savedLang) setLanguage(savedLang);
 if (savedCurr) setCurrency(savedCurr);

 const fetchMeta = async () => {
 try {
 const [curRes, langRes] = await Promise.all([
 fetch(`${API_BASE_URL}/currencies`),
 fetch(`${API_BASE_URL}/languages`)
 ]);
 if (curRes.ok) setCurrencies(await curRes.json());
 if (langRes.ok) {
 const langs = await langRes.json();
 setLanguages(langs);
 
 // Set initial direction based on saved language
 const currentLang = langs.find((l: any) => l.code === (savedLang || 'en'));
 if (currentLang) {
 setDirection(currentLang.direction || 'ltr');
 }
 }
 } catch (err) {
 console.error('Failed to fetch meta data:', err);
 }
 };
 fetchMeta();
 }, []);

 useEffect(() => {
 // Apply direction to html tag
 document.documentElement.dir = direction;
 document.documentElement.lang = language;
 }, [direction, language]);

 const handleSetLanguage = (lang: string) => {
 setLanguage(lang);
 localStorage.setItem('site_lang', lang);
 
 // Update direction
 const selectedLang = languages.find(l => l.code === lang);
 if (selectedLang) {
 setDirection(selectedLang.direction || 'ltr');
 }
 };

 const handleSetCurrency = (curr: string) => {
 setCurrency(curr);
 localStorage.setItem('site_curr', curr);
 };

 const formatPrice = (amount: number, listingCurrency?: any) => {
 const targetCurr = currencies.find(c => c.code === currency) || { symbol: '$', exchangeRate: 1, symbolPosition: 'left' };
 
 // Convert to base (USD) first if listingCurrency is provided
 let baseAmount = amount;
 let lCurr = listingCurrency;
 
 // Resolve currency if passed as ID
 if (typeof lCurr === 'string') {
 lCurr = currencies.find(c => c._id === lCurr || c.code === lCurr);
 }

 if (lCurr && lCurr.exchangeRate) {
 baseAmount = amount / lCurr.exchangeRate;
 }

 const converted = baseAmount * (targetCurr.exchangeRate || 1);
 const formatted = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2,
 }).format(converted);

 return targetCurr.symbolPosition === 'right' 
 ? `${formatted}${targetCurr.symbol}` 
 : `${targetCurr.symbol}${formatted}`;
 };

 const convertPrice = (amount: number, listingCurrency?: any) => {
 const targetCurr = currencies.find(c => c.code === currency) || { exchangeRate: 1 };
 let baseAmount = amount;
 let lCurr = listingCurrency;
 
 // Resolve currency if passed as ID
 if (typeof lCurr === 'string') {
 lCurr = currencies.find(c => c._id === lCurr || c.code === lCurr);
 }

 if (lCurr && lCurr.exchangeRate) {
 baseAmount = amount / lCurr.exchangeRate;
 }
 return baseAmount * (targetCurr.exchangeRate || 1);
 };

  const formatCurrency = (amount: number, currencyData: any) => {
    let curr = currencyData;
    
    // Fallback if currencyData is missing or just an ID string
    if (!curr || typeof curr === 'string') {
      curr = currencies.find(c => c._id === curr || c.code === curr) || { symbol: '$', symbolPosition: 'left' };
    }

    const formatted = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

    const symbol = curr.symbol || '$';
    const position = curr.symbolPosition || 'left';

    return position === 'right' 
      ? `${formatted}${symbol}` 
      : `${symbol}${formatted}`;
  };

 const t = (key: string, params?: Record<string, any>) => {
 const dict = dictionaries[language] || dictionaries.en;
 const keys = key.split('.');
 let value = dict;
 
 for (const k of keys) {
 if (value && value[k] !== undefined) {
 value = value[k];
 } else {
 return key; // Fallback to key itself
 }
 }
 
 if (typeof value !== 'string') return key;

 let result = value;
 if (params) {
 Object.entries(params).forEach(([k, v]) => {
 // Support both {key} and {{key}} formats found in JSON files
 result = result.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
 result = result.replace(new RegExp(`{${k}}`, 'g'), String(v));
 });
 }
 
 return result;
 };

 const contextValue = React.useMemo(() => ({ 
    language, 
    direction,
    currency, 
    setLanguage: handleSetLanguage, 
    setCurrency: handleSetCurrency,
    formatPrice,
    convertPrice,
    formatCurrency,
    currencies,
    languages,
    t
  }), [language, direction, currency, currencies, languages]);

  return (
    <LocaleContext.Provider value={contextValue}>
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
