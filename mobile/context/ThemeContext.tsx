import { createContext, useContext } from 'react';
import type { useTheme } from '../hooks/useTheme';

type ThemeContextValue = ReturnType<typeof useTheme>;

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used inside ThemeContext.Provider');
  return ctx;
}
