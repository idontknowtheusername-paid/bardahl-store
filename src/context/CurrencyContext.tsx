import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'EUR' | 'FCFA';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceInFCFA: number) => string;
  convertPrice: (priceInFCFA: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'bardahl-currency';
const FCFA_TO_EUR = 1 / 655.957; // 1 EUR = 655.957 FCFA

// West African CFA franc countries
const FCFA_COUNTRIES = ['BJ','SN','CI','ML','BF','TG','NE','CM','GA','CG','CD','GN','TD','CF','GQ'];
const EUR_COUNTRIES = ['FR','DE','AT','BE','NL','LU','IT','ES','PT','IE','FI','GR','MT','CY','SK','SI','EE','LV','LT','MC','AD','SM','VA'];

async function detectCurrency(): Promise<Currency> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const code = data.country_code?.toUpperCase();
    if (code && EUR_COUNTRIES.includes(code)) return 'EUR';
    if (code && FCFA_COUNTRIES.includes(code)) return 'FCFA';
    // Default to EUR for other countries
    return 'EUR';
  } catch {
    return 'EUR';
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'EUR' || stored === 'FCFA') return stored;
    return 'FCFA'; // Default until detection
  });
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored && !detected) {
      setDetected(true);
      detectCurrency().then(c => {
        setCurrencyState(c);
        localStorage.setItem(STORAGE_KEY, c);
      });
    }
  }, [detected]);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  };

  const convertPrice = (priceInFCFA: number): number => {
    if (currency === 'EUR') return Math.round(priceInFCFA * FCFA_TO_EUR * 100) / 100;
    return priceInFCFA;
  };

  const formatPrice = (priceInFCFA: number): string => {
    if (currency === 'EUR') {
      const eurPrice = priceInFCFA * FCFA_TO_EUR;
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(eurPrice);
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceInFCFA) + ' FCFA';
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
}
