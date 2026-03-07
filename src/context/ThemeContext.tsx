import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, DEFAULT_THEME, applyThemeToDOM } from '../utils/theme';
import { settingsService } from '../services/settingsService';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  function setTheme(t: Theme) {
    applyThemeToDOM(t);
    setThemeState(t);
  }

  useEffect(() => {
    // Load saved theme from DB and apply it
    settingsService.getAll()
      .then((settings) => {
        if (settings.theme) {
          try {
            const saved = JSON.parse(settings.theme) as Partial<Theme>;
            const merged: Theme = { ...DEFAULT_THEME, ...saved };
            applyThemeToDOM(merged);
            setThemeState(merged);
          } catch {
            applyThemeToDOM(DEFAULT_THEME);
          }
        } else {
          applyThemeToDOM(DEFAULT_THEME);
        }
      })
      .catch(() => applyThemeToDOM(DEFAULT_THEME));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
