import { useEffect, useState } from 'react';
import { LocalStorage } from '@vegaprotocol/react-helpers';

const darkTheme = 'dark';
const lightTheme = 'light';
type themeVariant = typeof darkTheme | typeof lightTheme;

const darkThemeCssClass = darkTheme;

const getCurrentTheme = () => {
  const theme = LocalStorage.getItem('theme');
  if (
    theme === darkTheme ||
    (!theme &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    return darkTheme;
  }
  return lightTheme;
};

const toggleTheme = () => {
  const theme = document.documentElement.classList.contains(darkThemeCssClass)
    ? lightTheme
    : darkTheme;
  LocalStorage.setItem('theme', theme);
  return theme;
};

export function useThemeSwitcher(): [themeVariant, () => void] {
  const [theme, setTheme] = useState<themeVariant>(getCurrentTheme());
  useEffect(() => {
    if (theme === darkTheme) {
      document.documentElement.classList.add(darkThemeCssClass);
    } else {
      document.documentElement.classList.remove(darkThemeCssClass);
    }
  }, [theme]);
  return [theme, () => setTheme(toggleTheme)];
}
