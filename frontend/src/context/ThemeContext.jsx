import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const THEMES = ['light', 'dark', 'pookie', 'old-times', 'space'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('linkvault_theme');
    return THEMES.includes(stored) ? stored : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-pookie', 'theme-old-times', 'theme-space', 'dark');

    if (theme === 'dark') {
      root.classList.add('theme-dark', 'dark');
    } else if (theme === 'pookie') {
      root.classList.add('theme-pookie');
    } else if (theme === 'old-times') {
      root.classList.add('theme-old-times');
    } else if (theme === 'space') {
      root.classList.add('theme-space', 'dark');
    } else {
      root.classList.add('theme-light');
    }

    localStorage.setItem('linkvault_theme', theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: THEMES
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
