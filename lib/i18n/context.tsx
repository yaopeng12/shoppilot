"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import en from "./en";
import zh from "./zh";

export type Locale = "en" | "zh";
export type Messages = typeof en;

const messages: Record<Locale, Messages> = { en, zh };

interface I18nContextValue {
  locale: Locale;
  t: Messages;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  t: en,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    const lang = navigator.language.toLowerCase();
    const nextLocale = saved && messages[saved] ? saved : lang.startsWith("zh") ? "zh" : "en";

    document.documentElement.lang = nextLocale;
    queueMicrotask(() => setLocaleState(nextLocale));
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
    document.documentElement.lang = l;
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t: messages[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
