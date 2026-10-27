"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, Translations } from "./translations";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [language, setLanguageState] = useState<Language>("es");

  useEffect(() => {
    const saved = localStorage.getItem("cospace_lang") as Language | null;
    if (saved === "es" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language): void => {
    setLanguageState(lang);
    localStorage.setItem("cospace_lang", lang);
  };

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

