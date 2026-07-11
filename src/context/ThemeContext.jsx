import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'mm_theme';

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // No explicit preference yet: mobile defaults light (outdoor event use),
  // desktop defaults dark.
  return window.innerWidth < 600 ? 'light' : 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Tells the browser which scheme is actually active right now, on top
    // of the static "light dark" meta tag — without this, some mobile
    // browsers (notably Android Chrome's force-dark) auto-darken pages that
    // don't explicitly report their current theme, making light mode look
    // dark-tinted when the OS is set to dark.
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f1117' : '#f4f5f7');
  }, [theme]);

  const setAndPersist = (next) => {
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  };

  const toggleTheme = () => setAndPersist(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setAndPersist }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
