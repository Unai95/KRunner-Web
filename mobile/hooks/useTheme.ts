import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Theme } from '../constants/colors';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.getTheme().then((saved) => {
      setThemeState((saved === 'light' ? 'light' : 'dark') as Theme);
      setLoaded(true);
    });
  }, []);

  const setTheme = useCallback(async (next: Theme) => {
    setThemeState(next);
    await api.setTheme(next);
  }, []);

  return { theme, setTheme, loaded };
}
