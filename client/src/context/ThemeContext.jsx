import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'dark',   name: 'Midnight', icon: '🌙', description: 'Deep navy dark mode',    preview: ['#0a0f1e', '#1a2236', '#3b82f6'] },
  { id: 'light',  name: 'Daylight', icon: '☀️', description: 'Clean bright mode',      preview: ['#f0f4f8', '#ffffff', '#3b82f6'] },
  { id: 'ocean',  name: 'Ocean',    icon: '🌊', description: 'Deep ocean cyan',         preview: ['#030d1a', '#0a2040', '#0ea5e9'] },
  { id: 'forest', name: 'Forest',   icon: '🌲', description: 'Deep emerald green',      preview: ['#020d06', '#082014', '#22c55e'] },
  { id: 'violet', name: 'Violet',   icon: '🔮', description: 'Rich purple hues',        preview: ['#0d0510', '#1e0d30', '#8b5cf6'] },
  { id: 'rose',   name: 'Rose',     icon: '🌹', description: 'Warm pink tones',         preview: ['#150308', '#2a0818', '#f43f5e'] },
  { id: 'amber',  name: 'Amber',    icon: '🔥', description: 'Warm golden amber',       preview: ['#150800', '#2a1200', '#f59e0b'] },
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem('taskflow-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskflow-theme', theme);
  }, [theme]);

  const setTheme = (t) => setThemeState(t);
  const toggleTheme = () => setThemeState(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
