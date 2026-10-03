"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionaries, Language, TranslationKey } from "@/lib/dictionaries";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "vi",
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedLang = localStorage.getItem("app-language") as Language;
    if (storedLang && dictionaries[storedLang]) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  };

  const t = (key: string) => {
    // If translations are loaded and key exists, return it, otherwise fallback to vi or key itself
    return (dictionaries[language] as any)?.[key] || (dictionaries["vi"] as any)?.[key] || key;
  };

  // Prevent hydration mismatch by rendering kids only after reading localStorage
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);
