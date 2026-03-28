"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "./en.json";
import zh from "./zh.json";

type Lang = "en" | "zh";
const translations: Record<Lang, Record<string, unknown>> = { en, zh };

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => any;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("atel_lang") as Lang;
    if (saved && translations[saved]) setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("atel_lang", l);
  }

  function t(key: string): any {
    const keys = key.split(".");
    let val: any = translations[lang];
    for (const k of keys) {
      val = val?.[k];
    }
    return val ?? key;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
