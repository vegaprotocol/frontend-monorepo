import { useEffect } from 'react';
import { LocalStorage } from '@vegaprotocol/react-helpers';

export const getCurrentTheme = () => {
  const theme = LocalStorage.getItem('theme');
  if (
    theme === 'dark' ||
    (!theme &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    return 'dark';
  }
  return 'light';
};

export const toggleTheme = () => {
  const theme = document.documentElement.classList.contains('dark')
    ? 'light'
    : 'dark';
  LocalStorage.setItem('theme', theme);
  return theme;
};

export function useThemeSwitcher(theme: 'dark' | 'light') {
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
}
