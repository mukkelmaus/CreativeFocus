import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode, ThemeSettings } from '@/lib/types';

interface ThemeContextProps {
  theme: ThemeSettings;
  setThemeMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>({
    mode: 'light' as ThemeMode,
    primaryColor: '#3f51b5', // Default primary color from theme.json
  });

  // Function to update the theme mode
  const setThemeMode = (mode: ThemeMode) => {
    setTheme((prevTheme) => ({ ...prevTheme, mode }));
    localStorage.setItem('themeMode', mode);
  };

  // Function to update the primary color
  const setPrimaryColor = (color: string) => {
    setTheme((prevTheme) => ({ ...prevTheme, primaryColor: color }));
    localStorage.setItem('primaryColor', color);
    document.documentElement.style.setProperty('--primary', color);
  };

  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    const savedColor = localStorage.getItem('primaryColor');
    
    // If saved mode exists, use it
    if (savedMode) {
      setThemeMode(savedMode);
    } else {
      // Otherwise, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeMode(prefersDark ? 'dark' : 'light');
    }
    
    // If saved color exists, use it
    if (savedColor) {
      setPrimaryColor(savedColor);
    }
  }, []);

  // Apply theme changes to the document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme.mode === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    
    // Apply primary color
    root.style.setProperty('--primary', theme.primaryColor);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setThemeMode,
        setPrimaryColor,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
