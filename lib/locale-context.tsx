"use client";

import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import enMessages from '@/messages/en.json';
import koMessages from '@/messages/ko.json';
import zhMessages from '@/messages/zh.json';

type Locale = 'en' | 'ko' | 'zh';
type Messages = typeof enMessages;

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  mounted: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const messages: Record<Locale, Messages> = {
  en: enMessages,
  ko: koMessages,
  zh: zhMessages,
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [locale, setLocaleState] = useState<Locale>('en');

  // useLayoutEffect runs after React commits DOM but before the browser paints,
  // so the locale switch from 'en' to 'ko' is never visible to the user
  useLayoutEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved === 'en' || saved === 'ko' || saved === 'zh') {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = messages[locale];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, mounted }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
