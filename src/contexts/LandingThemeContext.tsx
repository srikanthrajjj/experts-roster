import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type LandingThemeId = 'daylight' | 'midnight';

const STORAGE_KEY = 'landingTheme';

type LandingThemeContextValue = {
  theme: LandingThemeId;
  isMidnight: boolean;
  toggleTheme: () => void;
  setTheme: (theme: LandingThemeId) => void;
};

const LandingThemeContext = createContext<LandingThemeContextValue | null>(null);

function readStoredTheme(): LandingThemeId {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'midnight' ? 'midnight' : 'daylight';
}

export function LandingThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<LandingThemeId>(() => readStoredTheme());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-landing-theme', theme);
  }, [theme]);

  const setTheme = useCallback((next: LandingThemeId) => setThemeState(next), []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'daylight' ? 'midnight' : 'daylight'));
  }, []);

  return (
    <LandingThemeContext.Provider
      value={{ theme, isMidnight: theme === 'midnight', toggleTheme, setTheme }}
    >
      {children}
    </LandingThemeContext.Provider>
  );
}

export function useLandingTheme() {
  const ctx = useContext(LandingThemeContext);
  if (!ctx) {
    throw new Error('useLandingTheme must be used within LandingThemeProvider');
  }
  return ctx;
}
