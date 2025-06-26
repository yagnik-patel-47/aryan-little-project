"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import NavBar from './NavBar';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('lang') || 'en';
    setLanguageState(storedLang);
  }, []);

  const setLanguage = (lang: string) => {
    localStorage.setItem('lang', lang);
    setLanguageState(lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <NavBar language={language} setLanguage={setLanguage} />
      {children}
    </LanguageContext.Provider>
  );
} 