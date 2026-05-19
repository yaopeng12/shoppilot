"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import en from "./en";
import zh from "./zh";

export type Locale = "en" | "zh";
export type Messages = typeof en;

const messages: Record<Locale, any> = { en, zh };

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
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && messages[saved]) return saved;
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith("zh")) return "zh";
    return "en";
  });

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
