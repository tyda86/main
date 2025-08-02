import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance } from 'react-native';
import { Theme, getTheme, lightTheme } from '@utils/theme';
import { StorageService } from '@services/storageService';

interface ThemeContextType {
  theme: Theme;
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('system');
  const [theme, setTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    // Load theme preference from storage
    const loadThemePreference = async () => {
      try {
        const settings = await StorageService.getAppSettings();
        setThemeModeState(settings.theme);
        setTheme(getTheme(settings.theme));
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  useEffect(() => {
    // Listen for system theme changes when using 'system' mode
    if (themeMode === 'system') {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setTheme(getTheme('system'));
      });

      return () => subscription?.remove();
    }
  }, [themeMode]);

  const setThemeMode = async (mode: 'light' | 'dark' | 'system') => {
    try {
      setThemeModeState(mode);
      setTheme(getTheme(mode));
      await StorageService.updateTheme(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const isDark = theme.colors.background === '#111827'; // Check if current theme is dark

  const value: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};