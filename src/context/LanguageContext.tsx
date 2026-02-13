import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fr, en, de, ru, uk, nl, type TranslationKeys, type Language, defaultLanguage } from '@/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const translations: Record<Language, TranslationKeys> = { fr, en, de, ru, uk, nl };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'bardahl-language';

// Map country codes to languages
const countryToLanguage: Record<string, Language> = {
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr', MC: 'fr',
  BJ: 'fr', SN: 'fr', CI: 'fr', ML: 'fr', BF: 'fr', TG: 'fr', NE: 'fr', CM: 'fr', GA: 'fr', CG: 'fr', CD: 'fr',
  GB: 'en', US: 'en', CA: 'en', AU: 'en', IE: 'en', NZ: 'en', GH: 'en', NG: 'en',
  DE: 'de', AT: 'de',
  RU: 'ru',
  UA: 'uk',
  NL: 'nl',
};

async function detectLanguage(): Promise<Language> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const code = data.country_code?.toUpperCase();
    if (code && countryToLanguage[code]) return countryToLanguage[code];
  } catch { /* fallback */ }
  
  // Browser language fallback
  const browserLang = navigator.language?.split('-')[0];
  if (browserLang && browserLang in translations) return browserLang as Language;
  
  return defaultLanguage;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in translations) return stored as Language;
    return defaultLanguage;
  });
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored && !detected) {
      setDetected(true);
      detectLanguage().then(lang => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
      });
    }
  }, [detected]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}

export function useTranslation() {
  return useLanguage().t;
}
