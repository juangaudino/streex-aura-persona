import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "@/i18n/dictionary";

type Theme = "light" | "dark";

type AppContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const storedLang = localStorage.getItem("lang") as Lang | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = storedTheme ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    if (storedLang) setLang(storedLang);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
        lang,
        setLang,
        toggleLang: () => setLang((l) => (l === "es" ? "en" : "es")),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
